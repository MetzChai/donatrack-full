"use client";

import Link from "next/link";
import React from "react";

interface CampaignCardProps {
  campaign: {
    id: string;
    title: string;
    description: string;
    goalAmount: number;
    collected: number;
    imageUrl?: string;
    isEnded?: boolean;
    isImplemented?: boolean;
    user?: {
      id: string;
      email: string;
      fullName: string;
    };
  };
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign }) => {
  const progress = Math.min((campaign.collected / campaign.goalAmount) * 100, 100);
  const percentage = Math.round(progress);

  return (
    <Link href={`/campaigns/${campaign.id}`}>
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-shadow duration-300 cursor-pointer h-full flex flex-col border border-gray-200 hover:scale-105 transform">
        {campaign.imageUrl && (
          <img
            src={campaign.imageUrl}
            alt={campaign.title}
            className="w-full h-48 object-cover rounded-t-xl"
          />
        )}
        <div className="p-5 flex flex-col flex-1">
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-2 text-gray-800 truncate">{campaign.title}</h2>
            <p className="text-gray-600 text-sm mb-3 line-clamp-3">{campaign.description}</p>
            {campaign.user && (
              <p className="text-gray-500 text-xs mb-2">
                Created by: <span className="font-semibold">{campaign.user.fullName}</span>
              </p>
            )}
          </div>

          <div className="mt-auto">
            <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
              <span>Funded</span>
              <span className="font-semibold text-gray-800">₱{campaign.collected.toFixed(2)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  percentage >= 65 ? "bg-green-500" : "bg-red-500"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Goal: ₱{campaign.goalAmount.toFixed(2)}</span>
              <span
                className={`font-semibold ${
                  percentage >= 65 ? "text-green-600" : "text-red-600"
                }`}
              >
                {percentage}% Funded
              </span>
            </div>
            {campaign.isEnded && (
              <div className="mt-2">
                {campaign.isImplemented ? (
                  <p className="text-green-600 text-xs font-medium">✓ Campaign Implemented</p>
                ) : (
                  <p className="text-yellow-600 text-xs font-medium">• Campaign Ended - Implementation Pending</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CampaignCard;
