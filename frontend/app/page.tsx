"use client";

import { useEffect, useState } from "react";
import { getCampaigns } from "../lib/api";
import CampaignCard from "../components/CampaignCard";
import Link from "next/link";
import { getToken } from "../utils/auth";

export default function HomePage() {
  const [featuredCampaigns, setFeaturedCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = getToken();

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const campaigns = await getCampaigns();
        // Get top 3 campaigns (or first 3)
        setFeaturedCampaigns(campaigns.slice(0, 3));
      } catch (err) {
        console.error("Failed to fetch campaigns:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCampaigns();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            See Your Impact. Know Your Money's Journey.
          </h1>
          <Link
            href="/campaigns"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-lg mt-4"
          >
            Make Change
          </Link>
        </div>
        {/* Hero Image Background */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1200')",
          }}
        ></div>
      </section>

      {/* Featured Campaigns Section */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">Featured Campaigns</h2>
        {loading ? (
          <p className="text-gray-600">Loading campaigns...</p>
        ) : featuredCampaigns.length === 0 ? (
          <p className="text-gray-600">No featured campaigns available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredCampaigns.map((campaign: any) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
