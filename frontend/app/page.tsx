"use client";

import { useEffect, useState, useRef } from "react";
import { getCampaigns } from "../lib/api";
import CampaignCard from "../components/CampaignCard";
import Link from "next/link";
import { getToken } from "../utils/auth";

export default function HomePage() {
  const [featuredCampaigns, setFeaturedCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const token = getToken();

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const campaigns = await getCampaigns();
        // Show all campaigns (not just first 3)
        setFeaturedCampaigns(campaigns);
      } catch (err) {
        console.error("Failed to fetch campaigns:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCampaigns();
  }, []);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.querySelector('.campaign-card')?.clientWidth || 320;
      const gap = 32; // gap-8 = 2rem = 32px
      const scrollAmount = cardWidth + gap;
      scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.querySelector('.campaign-card')?.clientWidth || 320;
      const gap = 32; // gap-8 = 2rem = 32px
      const scrollAmount = cardWidth + gap;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

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
          <div className="relative">
            {/* Left Arrow */}
            {featuredCampaigns.length > 3 && (
              <button
                onClick={scrollLeft}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all duration-200 hover:scale-110"
                aria-label="Scroll left"
              >
                <svg
                  className="w-6 h-6 text-gray-800"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}

            {/* Scrollable Campaigns Container */}
            <div
              ref={scrollContainerRef}
              className="flex gap-8 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {featuredCampaigns.map((campaign: any) => (
                <div
                  key={campaign.id}
                  className="campaign-card flex-shrink-0 w-full sm:w-80 lg:w-96 transform hover:scale-105 transition-transform duration-300"
                >
                  <CampaignCard campaign={campaign} />
                </div>
              ))}
            </div>

            {/* Right Arrow */}
            {featuredCampaigns.length > 3 && (
              <button
                onClick={scrollRight}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all duration-200 hover:scale-110"
                aria-label="Scroll right"
              >
                <svg
                  className="w-6 h-6 text-gray-800"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
