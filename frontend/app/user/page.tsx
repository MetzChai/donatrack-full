"use client";

import { useEffect, useState } from "react";
import {
  getMyCampaigns,
  getMyDonations,
  getMyFunds,
  withdrawFunds,
  updateXenditKeys,
  endCampaign,
  markCampaignAsImplemented,
} from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedPage from "@/components/ProtectedPage";
import Link from "next/link";

function UserDashboardContent() {
  const [donations, setDonations] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [funds, setFunds] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [showXenditKeys, setShowXenditKeys] = useState(false);
  const [xenditKeys, setXenditKeys] = useState({
    xenditApiKey: "",
    xenditSecretKey: "",
    xenditClientKey: "",
  });

  const { user: currentUser } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !currentUser) return;

    async function fetchData() {
      try {
        const donationsData = await getMyDonations(token);
        setDonations(donationsData);

        if (currentUser.role === "ADMIN" || currentUser.role === "CREATOR") {
          const [campaignsData, fundsData] = await Promise.all([
            getMyCampaigns(token),
            getMyFunds(token),
          ]);
          setCampaigns(campaignsData);
          setFunds(fundsData);
        } else {
          setCampaigns([]);
          setFunds(null);
        }
      } catch (err) {
        console.error("Failed to fetch user data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [currentUser]);

  const handleWithdraw = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (funds && amount > funds.withdrawableFunds) {
      alert("Insufficient withdrawable funds");
      return;
    }

    // If campaign is selected, validate campaign has enough funds
    if (selectedCampaignId) {
      const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId);
      if (selectedCampaign && amount > selectedCampaign.collected) {
        alert("Insufficient campaign funds. Campaign collected amount is less than withdrawal amount");
        return;
      }
    }

    try {
      await withdrawFunds(amount, token, selectedCampaignId || undefined);
      const [updatedFunds, updatedCampaigns] = await Promise.all([
        getMyFunds(token),
        getMyCampaigns(token),
      ]);
      setFunds(updatedFunds);
      setCampaigns(updatedCampaigns);
      setWithdrawAmount("");
      setSelectedCampaignId("");
      alert("Withdrawal request processed successfully");
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.error || err.message || "Withdrawal failed. Please check your balance and try again.";
      alert(errorMsg);
      console.error("Withdrawal error details:", err);
    }
  };

  const handleUpdateXenditKeys = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await updateXenditKeys(xenditKeys, token);
      setShowXenditKeys(false);
      setXenditKeys({ xenditApiKey: "", xenditSecretKey: "", xenditClientKey: "" });
      alert("Xendit keys updated successfully");
    } catch (err: any) {
      alert(err.error || "Failed to update Xendit keys");
    }
  };

  const handleEndCampaign = async (campaignId: string) => {
    if (!confirm("Are you sure you want to end this campaign? It will stop receiving donations.")) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await endCampaign(campaignId, token);
      const updatedCampaigns = await getMyCampaigns(token);
      setCampaigns(updatedCampaigns);
      alert("Campaign ended successfully");
    } catch (err: any) {
      alert(err.error || "Failed to end campaign");
    }
  };

  const handleMarkAsImplemented = async (campaignId: string) => {
    if (!confirm("Mark this campaign as implemented? This will preserve the collected amount and prevent further withdrawals from this campaign.")) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await markCampaignAsImplemented(campaignId, token);
      const updatedCampaigns = await getMyCampaigns(token);
      setCampaigns(updatedCampaigns);
      alert("Campaign marked as implemented successfully");
    } catch (err: any) {
      alert(err.error || "Failed to mark campaign as implemented");
    }
  };

  if (loading) {
    return (
      <main className="p-8 min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-800">Loading...</p>
      </main>
    );
  }

  const isAdmin = currentUser?.role === "ADMIN";
  const isCreator = currentUser?.role === "CREATOR";
  const canManageFunds = isAdmin || isCreator;

  return (
    <main className="p-8 min-h-screen bg-gray-100 text-gray-900">
      <h1 className="text-3xl font-bold mb-2">
        {isCreator ? "Creator Dashboard" : isAdmin ? "Admin Dashboard" : "My Dashboard"}
      </h1>
      {isCreator && (
        <p className="text-gray-600 mb-6">
          Manage your campaigns, track donations, and withdraw funds from your campaigns.
        </p>
      )}

      {canManageFunds ? (
        <section className="mb-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Funds Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <h3 className="text-gray-500 text-sm">Current Funds</h3>
              <p className="text-2xl font-bold">₱{funds?.currentFunds?.toFixed(2) || "0.00"}</p>
            </div>
            <div>
              <h3 className="text-gray-500 text-sm">Withdrawable Funds</h3>
              <p className="text-2xl font-bold text-green-600">
                ₱{funds?.withdrawableFunds?.toFixed(2) || "0.00"}
              </p>
            </div>
            <div>
              <h3 className="text-gray-500 text-sm">Total Campaigns</h3>
              <p className="text-2xl font-bold">{funds?.campaigns?.length || 0}</p>
            </div>
          </div>

          <div className="space-y-4 mb-4">
            {campaigns.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Campaign (Optional - for campaign-specific withdrawal)
                </label>
                <select
                  value={selectedCampaignId}
                  onChange={(e) => setSelectedCampaignId(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded"
                >
                  <option value="">No specific campaign (general withdrawal)</option>
                  {campaigns
                    .filter((c) => c.collected > 0)
                    .map((campaign) => (
                      <option key={campaign.id} value={campaign.id}>
                        {campaign.title} - ₱{campaign.collected.toFixed(2)} collected {campaign.isEnded ? "(Ended)" : "(Active)"}
                      </option>
                    ))}
                </select>
                {selectedCampaignId && (
                  <p className="text-sm text-gray-600 mt-1">
                    Withdrawing from this campaign will reduce its collected amount
                  </p>
                )}
              </div>
            )}
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Withdrawal amount"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded"
                />
              </div>
              <button
                onClick={handleWithdraw}
                disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded disabled:opacity-50"
              >
                Withdraw
              </button>
            </div>
          </div>

          <button
            onClick={() => setShowXenditKeys(!showXenditKeys)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
          >
            {showXenditKeys ? "Hide" : "Configure"} Xendit API Keys (Option 1)
          </button>

          {showXenditKeys && (
            <div className="mt-4 space-y-2">
              <input
                type="text"
                placeholder="Xendit API Key"
                value={xenditKeys.xenditApiKey}
                onChange={(e) => setXenditKeys({ ...xenditKeys, xenditApiKey: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded"
              />
              <input
                type="password"
                placeholder="Xendit Secret Key"
                value={xenditKeys.xenditSecretKey}
                onChange={(e) => setXenditKeys({ ...xenditKeys, xenditSecretKey: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded"
              />
              <input
                type="text"
                placeholder="Xendit Client Key"
                value={xenditKeys.xenditClientKey}
                onChange={(e) => setXenditKeys({ ...xenditKeys, xenditClientKey: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded"
              />
              <button
                onClick={handleUpdateXenditKeys}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Save Keys
              </button>
            </div>
          )}
        </section>
      ) : (
        <section className="mb-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-2">Welcome!</h2>
          <p className="text-gray-600 mb-4">
            As a regular user, you can browse and donate to campaigns. Review all your contributions below.
          </p>
          <Link
            href="/campaigns"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded"
          >
            Browse Campaigns
          </Link>
        </section>
      )}

      {canManageFunds && (
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">
              {isCreator ? "My Campaigns" : "Managed Campaigns"}
            </h2>
            <Link
              href="/campaigns/new"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Create Campaign
            </Link>
          </div>
          {campaigns.length === 0 ? (
            <p className="text-gray-600">No campaigns created yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-bold text-lg mb-2">{campaign.title}</h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{campaign.description}</p>
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Raised:</span>
                      <span className="font-semibold">
                        ₱{campaign.collected.toFixed(2)} / ₱{campaign.goalAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min((campaign.collected / campaign.goalAmount) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm mb-2">
                    Status:{" "}
                    {campaign.isEnded ? (
                      campaign.isImplemented ? (
                        <span className="text-green-600 font-semibold">✓ Implemented</span>
                      ) : (
                        <span className="text-yellow-600">Ended - Pending Implementation</span>
                      )
                    ) : (
                      <span className="text-green-600">Active</span>
                    )}
                  </p>
                  <p className="text-gray-500 text-xs mb-2">
                    Donations: {campaign.donations?.length || 0}
                  </p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <Link
                      href={`/campaigns/${campaign.id}`}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-center text-sm"
                    >
                      View
                    </Link>
                    {!campaign.isEnded && (
                      <button
                        onClick={() => handleEndCampaign(campaign.id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm"
                      >
                        End Campaign
                      </button>
                    )}
                    {campaign.isEnded && !campaign.isImplemented && (
                      <button
                        onClick={() => handleMarkAsImplemented(campaign.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded text-sm"
                      >
                        Mark Implemented
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <section>
        <h2 className="text-2xl font-semibold mb-4">My Donations</h2>
        {donations.length === 0 ? (
          <p>You have not donated to any campaigns yet.</p>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-900">
                {donations.map((donation) => (
                  <tr key={donation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link
                        href={`/campaigns/${donation.campaignId}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {donation.campaign?.title || "Unknown Campaign"}
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-semibold">₱{donation.amount.toFixed(2)}</td>
                    <td className="px-6 py-4">{donation.method}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          donation.status === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : donation.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {donation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(donation.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default function UserDashboard() {
  return (
    <ProtectedPage>
      <UserDashboardContent />
    </ProtectedPage>
  );
}
