"use client";

import { useEffect, useState } from "react";
import { getMyDonations, getAllDonationsAdmin } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import ProtectedPage from "../../components/ProtectedPage";
import Link from "next/link";

function DonateHistoryContent() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        let data;
        if (user?.role === "ADMIN") {
          // Admins see all user donations
          data = await getAllDonationsAdmin(token);
        } else {
          // Regular users see only their own donations
          data = await getMyDonations(token);
        }
        setLogs(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (user) {
      load();
    }
  }, [user]);

  if (loading) {
    return (
      <main className="p-8 min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-700 animate-pulse">Loading...</p>
      </main>
    );
  }

  const getStatusPercentage = (campaign: any) => {
    return Math.round((campaign.collected / campaign.goalAmount) * 100);
  };

  const isAdmin = user?.role === "ADMIN";

  return (
    <main className="p-8 min-h-screen bg-gray-100 text-gray-900">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">
        {isAdmin ? "All User Donations" : "Your Recent Donations"}
      </h1>
      {logs.length === 0 ? (
        <p className="text-gray-600 text-lg">
          {isAdmin ? "No donations recorded yet." : "No donations yet."}
        </p>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-gray-900">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm md:text-base font-semibold text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                {isAdmin && (
                  <th className="px-6 py-4 text-left text-sm md:text-base font-semibold text-gray-500 uppercase tracking-wider">
                    Donor
                  </th>
                )}
                <th className="px-6 py-4 text-left text-sm md:text-base font-semibold text-gray-500 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-4 text-left text-sm md:text-base font-semibold text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-sm md:text-base font-semibold text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-4 text-left text-sm md:text-base font-semibold text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-6 py-4 text-left text-sm md:text-base font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((d) => (
                <tr
                  key={d.id}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm md:text-base font-medium text-gray-700">
                    {new Date(d.createdAt).toLocaleDateString("en-US", {
                      month: "2-digit",
                      day: "2-digit",
                      year: "2-digit",
                    })}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm md:text-base font-medium text-gray-800">
                      {d.user?.fullName || d.user?.email || "Unknown Donor"}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm md:text-base font-medium">
                    <Link
                      href={`/campaigns/${d.campaignId || d.campaign?.id}`}
                      className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      {d.campaign?.title || (d as any).campaignTitle || "Unknown Campaign"}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm md:text-base font-medium text-gray-800">
                    ₱{d.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm md:text-base font-medium text-gray-800">
                    {d.method}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm md:text-base font-medium text-gray-800">
                    {d.message || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm md:text-base font-medium text-gray-800">
                    {d.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

export default function DonateHistory() {
  return (
    <ProtectedPage>
      <DonateHistoryContent />
    </ProtectedPage>
  );
}
