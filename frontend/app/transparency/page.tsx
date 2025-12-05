"use client";

import { useEffect, useState } from "react";
import { getAllProofs, getCampaigns } from "@/lib/api";
import Link from "next/link";

export default function TransparencyPage() {
  const [proofs, setProofs] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<string>("all");

  useEffect(() => {
    async function fetchData() {
      try {
        const [proofsData, campaignsData] = await Promise.all([
          getAllProofs(),
          getCampaigns(),
        ]);
        setProofs(proofsData);
        setCampaigns(campaignsData);
      } catch (err) {
        console.error("Failed to fetch transparency data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredProofs =
    selectedCampaign === "all"
      ? proofs
      : proofs.filter((proof) => (proof.campaignId || proof.campaign?.id) === selectedCampaign);

  if (loading) {
    return (
      <main className="p-8 min-h-screen flex items-center justify-center bg-gradient-to-b from-[#071020] to-[#04050a] text-white">
        <p className="text-xl">Loading transparency reports...</p>
      </main>
    );
  }

  return (
    <main className="p-8 min-h-screen bg-gradient-to-b from-[#071020] to-[#04050a] text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-300">
            Transparency & Impact
          </h1>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            See how your donations are making a real difference. We believe in complete transparency
            and accountability for every contribution.
          </p>
        </div>

        {/* Campaign Filter */}
        {campaigns.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => setSelectedCampaign("all")}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                selectedCampaign === "all"
                  ? "bg-gradient-to-r from-emerald-500 to-green-400 text-white"
                  : "bg-white/10 hover:bg-white/20 text-gray-300"
              }`}
            >
              All Campaigns
            </button>
            {campaigns.map((campaign) => (
              <button
                key={campaign.id}
                onClick={() => setSelectedCampaign(campaign.id)}
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  selectedCampaign === campaign.id
                    ? "bg-gradient-to-r from-emerald-500 to-green-400 text-white"
                    : "bg-white/10 hover:bg-white/20 text-gray-300"
                }`}
              >
                {campaign.title}
              </button>
            ))}
          </div>
        )}

        {/* Proofs Grid */}
        {filteredProofs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-xl mb-4">
              {selectedCampaign === "all"
                ? "No transparency reports available yet."
                : "No transparency reports for this campaign yet."}
            </p>
            <p className="text-gray-500">
              Check back soon to see how donations are being used!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProofs.map((proof) => (
              <div
                key={proof.id}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:bg-white/8 transition-all duration-300"
              >
                {/* Proof Image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={proof.imageUrl}
                    alt={proof.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/400x300?text=Proof+Image";
                    }}
                  />
                  <div className="absolute top-4 right-4 bg-emerald-500/90 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Verified
                  </div>
                </div>

                {/* Proof Content */}
                <div className="p-6">
                  <div className="mb-3">
                    <Link
                      href={`/campaigns/${proof.campaignId || proof.campaign?.id}`}
                      className="text-emerald-400 hover:text-emerald-300 text-sm font-semibold"
                    >
                      {proof.campaign?.title || "Campaign"}
                    </Link>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">{proof.title}</h3>
                  <p className="text-gray-300 text-sm mb-4 line-clamp-3">{proof.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>
                      {new Date(proof.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <Link
                      href={`/campaigns/${proof.campaignId || proof.campaign?.id}`}
                      className="text-emerald-400 hover:text-emerald-300 font-semibold"
                    >
                      View Campaign →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

