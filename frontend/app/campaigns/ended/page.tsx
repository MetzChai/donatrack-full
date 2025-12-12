"use client";

import { useEffect, useState } from "react";
import CampaignCard from "@/components/CampaignCard";
import { getEndedCampaigns } from "@/lib/api";
import Link from "next/link";

export default function EndedCampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "implemented" | "not-implemented">("all");

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const data = await getEndedCampaigns();
        setCampaigns(data || []);
      } catch (err) {
        console.error("Failed to fetch ended campaigns:", err);
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCampaigns();
  }, []);

  const filteredCampaigns = campaigns.filter((campaign) => {
    if (filter === "implemented") return campaign.isImplemented;
    if (filter === "not-implemented") return !campaign.isImplemented;
    return true;
  });

  if (loading) {
    return (
      <main className="p-8 min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-800 animate-pulse">Loading campaign history...</p>
      </main>
    );
  }

  return (
    <main className="p-8 min-h-screen bg-gray-900">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-10">
          <h1 className="text-5xl font-extrabold mb-4 text-[#73E6CB] tracking-tight">
            Campaign History
          </h1>
          <p className="text-white text-lg max-w-3xl">
            Browse all completed campaigns and see how donations were used to make a difference.
            Goal and collected amounts are preserved for transparency.
          </p>

          {/* Filter buttons */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setFilter("all")}
              className={`px-6 py-2 rounded-xl font-semibold transition shadow-sm ${
                filter === "all"
                  ? "bg-purple-600 text-white shadow-md scale-105"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
              }`}
            >
              All Campaigns ({campaigns.length})
            </button>

            <button
              onClick={() => setFilter("implemented")}
              className={`px-6 py-2 rounded-xl font-semibold transition shadow-sm ${
                filter === "implemented"
                  ? "bg-green-600 text-white shadow-md scale-105"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
              }`}
            >
              Implemented ({campaigns.filter((c) => c.isImplemented).length})
            </button>

            <button
              onClick={() => setFilter("not-implemented")}
              className={`px-6 py-2 rounded-xl font-semibold transition shadow-sm ${
                filter === "not-implemented"
                  ? "bg-yellow-600 text-white shadow-md scale-105"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
              }`}
            >
              Pending ({campaigns.filter((c) => !c.isImplemented).length})
            </button>
          </div>
        </div>

        {/* No Campaigns */}
        {filteredCampaigns.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <p className="text-gray-500 text-lg mb-4">
              {filter === "all"
                ? "No completed campaigns yet."
                : filter === "implemented"
                ? "No implemented campaigns yet."
                : "No campaigns pending implementation."}
            </p>
            <Link
              href="/campaigns"
              className="text-purple-600 hover:text-purple-800 font-semibold"
            >
              Browse active campaigns →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCampaigns.map((campaign: any) => (
              <div
                key={campaign.id}
                className="relative transform transition duration-300 hover:scale-[1.02]"
              >
                <CampaignCard campaign={campaign} />

                {campaign.isImplemented && (
                  <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    ✓ Implemented
                  </div>
                )}

                {campaign.isEnded && !campaign.isImplemented && (
                  <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    Pending
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
