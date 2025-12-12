"use client";

import { useEffect, useState } from "react";
import CampaignCard from "@/components/CampaignCard";
import { getCampaigns } from "@/lib/api";
import Link from "next/link";
import { getToken, getUser } from "@/utils/auth";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const token = getToken();

  useEffect(() => {
    setCurrentUser(getUser());
    async function fetchCampaigns() {
      try {
        const data = await getCampaigns();
        setCampaigns(data);
      } catch (err) {
        console.error("Failed to fetch campaigns:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCampaigns();
  }, []);

  if (loading) {
    return (
      <main className="p-8 min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading campaigns...</p>
      </main>
    );
  }

  return (
    <main className="p-8 min-h-screen bg-gray-900 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Browse Campaigns</h1>
        {(currentUser?.role === "ADMIN" || currentUser?.role === "CREATOR") && (
          <Link
            href="/campaigns/new"
            className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-semibold"
          >
            Create Campaign
          </Link>
        )}
      </div>
      {campaigns.length === 0 ? (
        <p className="text-gray-400">No campaigns available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign: any) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}
    </main>
  );
}
