"use client";

import { useEffect, useState } from "react";
import { getCampaignById, getDonationLogs } from "@/lib/api";
import { getToken, getUser } from "@/utils/auth";
import DonateModal from "@/components/DonateModal";
import Link from "next/link";

export default function CampaignDetail({ params }: { params: { id: string } }) {
  const [campaign, setCampaign] = useState<any>(null);
  const [donationLogs, setDonationLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const token = getToken();
  const user = getUser();

  useEffect(() => {
    async function fetchData() {
      try {
        const [campaignData, logsData] = await Promise.all([
          getCampaignById(params.id),
          getDonationLogs(params.id),
        ]);
        setCampaign(campaignData);
        setDonationLogs(logsData);
      } catch (err) {
        console.error("Failed to fetch campaign data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params.id]);

  if (loading) {
    return (
      <main className="p-8 min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </main>
    );
  }

  if (!campaign) {
    return (
      <main className="p-8 min-h-screen">
        <p className="text-red-500">Campaign not found.</p>
      </main>
    );
  }

  const progressPercentage = Math.min((campaign.collected / campaign.goalAmount) * 100, 100);
  const isEnded = campaign.isEnded;

  return (
    <main className="p-8 min-h-screen bg-gray-900 text-white">
      {/* Campaign Header */}
      <div className="mb-8">
        <Link href="/campaigns" className="text-blue-400 hover:underline mb-4 inline-block">
          ← Back to Campaigns
        </Link>
        <h1 className="text-4xl font-bold mb-4">{campaign.title}</h1>

        {/* Creator Info */}
        {campaign.user && (
          <div className="mb-4 p-4 bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-400 mb-1">Campaign Created By</p>
            <p className="text-lg font-semibold">{campaign.user.fullName}</p>
            <p className="text-sm text-gray-400">{campaign.user.email}</p>
          </div>
        )}

        {/* Campaign Image */}
        {campaign.imageUrl && (
          <img
            src={campaign.imageUrl}
            alt={campaign.title}
            className="w-full h-64 object-cover rounded-lg mb-4"
          />
        )}

        {/* Progress Section */}
        <div className="bg-gray-800 p-6 rounded-lg mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-2xl font-bold">₱{campaign.collected.toFixed(2)}</span>
            <span className="text-gray-400">of ₱{campaign.goalAmount.toFixed(2)} goal</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
            <div
              className={`h-4 rounded-full ${
                progressPercentage >= 100 ? "bg-green-500" : "bg-green-600"
              }`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-400">
            {progressPercentage.toFixed(1)}% funded
            {isEnded && <span className="ml-2 text-red-400">• Campaign Ended</span>}
          </p>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">About This Campaign</h2>
          <p className="text-gray-300 whitespace-pre-wrap">{campaign.description}</p>
        </div>

        {/* Donate Button */}
        {!isEnded && (
          <button
            onClick={() => setShowDonateModal(true)}
            disabled={!token}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-8 py-3 rounded-lg text-lg font-semibold mb-8"
          >
            {token ? "Donate Now" : "Login to Donate"}
          </button>
        )}
      </div>

      {/* Donation Logs Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Donation Logs</h2>
        {donationLogs.length === 0 ? (
          <p className="text-gray-400">No donations yet. Be the first to donate!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
              <thead className="bg-gray-900">
                <tr>
                  <th className="p-4 text-left">Donor</th>
                  <th className="p-4 text-left">Amount</th>
                  <th className="p-4 text-left">Payment Method</th>
                  <th className="p-4 text-left">Date</th>
                  <th className="p-4 text-left">Message</th>
                </tr>
              </thead>
              <tbody>
                {donationLogs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-700">
                    <td className="p-4">
                      {log.isAnonymous ? (
                        <span className="text-gray-400">Anonymous Donor</span>
                      ) : (
                        <span>{log.user?.fullName || "Unknown"}</span>
                      )}
                    </td>
                    <td className="p-4 font-semibold">₱{log.amount.toFixed(2)}</td>
                    <td className="p-4">{log.method}</td>
                    <td className="p-4 text-sm text-gray-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-sm text-gray-400">
                      {log.message || <span className="text-gray-600">-</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Donate Modal */}
      {showDonateModal && (
        <DonateModal
          campaignId={params.id}
          campaign={campaign}
          onClose={() => {
            setShowDonateModal(false);
            // Refresh data after donation
            getCampaignById(params.id).then(setCampaign);
            getDonationLogs(params.id).then(setDonationLogs);
          }}
        />
      )}
    </main>
  );
}
