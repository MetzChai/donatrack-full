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
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-96 md:h-[28rem] lg:h-[32rem] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center blur-sm"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1200')",
          }}
        ></div>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center px-4 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-4">
            See Your Impact. Know Your Money's Journey.
          </h1>
          <p className="text-white/90 mb-6 text-lg md:text-xl">
            Empower meaningful change by supporting verified campaigns around the world.
          </p>
          <Link
            href="/campaigns"
            className="inline-block bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white px-8 py-3 rounded-lg font-semibold text-lg shadow-lg transition-all"
          >
            Make Change
          </Link>
        </div>
      </section>

      {/* Featured Campaigns Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">Featured Campaigns</h2>
        {loading ? (
          <p className="text-gray-500 text-center">Loading campaigns...</p>
        ) : featuredCampaigns.length === 0 ? (
          <p className="text-gray-500 text-center">No featured campaigns available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCampaigns.map((campaign: any) => (
              <div
                key={campaign.id}
                className="transform hover:scale-105 transition-transform duration-300"
              >
                <CampaignCard campaign={campaign} />
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
