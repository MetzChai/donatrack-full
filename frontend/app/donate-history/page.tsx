"use client";

import { useEffect, useState } from "react";
import { getMyDonations } from "../../lib/api";
import { getToken } from "../../utils/auth";
import Link from "next/link";

export default function DonateHistory() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = getToken();

  useEffect(() => {
    async function load() {
      if (!token) {
        window.location.href = "/auth/login";
        return;
      }
      try {
        const data = await getMyDonations(token);
        setLogs(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  if (loading) {
    return (
      <main className="p-8 min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl">Loading...</p>
      </main>
    );
  }

  const getStatusPercentage = (campaign: any) => {
    return Math.round((campaign.collected / campaign.goalAmount) * 100);
  };

  return (
    <main className="p-8 min-h-screen bg-gray-100 text-gray-900">
      <h1 className="text-3xl font-bold mb-6">Your Recent Donations</h1>
      {logs.length === 0 ? (
        <p className="text-gray-600">No donations yet.</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 text-gray-900">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                    {new Date(d.createdAt).toLocaleDateString("en-US", {
                      month: "2-digit",
                      day: "2-digit",
                      year: "2-digit",
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                    <Link
                      href={`/campaigns/${d.campaignId}`}
                      className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      {d.campaign?.title || "Unknown Campaign"}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                    ${d.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                    {d.campaign ? `${getStatusPercentage(d.campaign)}%` : "-"}
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
