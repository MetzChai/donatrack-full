"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function DonateFailedContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  return (
    <main className="min-h-screen bg-[#0A0F1E] text-white flex items-center justify-center px-4">
      <div className="max-w-xl w-full bg-white/10 border border-white/10 rounded-2xl p-8 shadow-2xl text-center space-y-4 backdrop-blur">
        <div className="text-4xl">⚠️</div>
        <h1 className="text-3xl font-bold">Payment not completed</h1>
        <p className="text-gray-200">
          The payment was cancelled or failed. You can retry the donation or pick another campaign.
        </p>
        {ref && (
          <p className="text-sm text-gray-400">
            Reference: <span className="font-mono text-emerald-200">{ref}</span>
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/campaigns"
            className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition"
          >
            Back to Campaigns
          </Link>
          <Link
            href="/"
            className="px-5 py-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 text-white font-semibold transition"
          >
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function DonateFailedPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#0A0F1E] text-white flex items-center justify-center px-4">
        <div className="max-w-xl w-full bg-white/10 border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-200">Loading...</p>
        </div>
      </main>
    }>
      <DonateFailedContent />
    </Suspense>
  );
}

