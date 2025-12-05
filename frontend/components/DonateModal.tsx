"use client";

import { useState, useEffect } from "react";
import { donateToCampaign, getCampaigns } from "../lib/api";
import { getToken, getUser } from "../utils/auth";
import Link from "next/link";

export default function DonateModal({
  campaignId,
  campaign,
  onClose,
}: {
  campaignId: string;
  campaign?: any;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("GCASH");
  const [useCreatorKeys, setUseCreatorKeys] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState(campaignId);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [mobileNumber, setMobileNumber] = useState("");
  const [confirmMobileNumber, setConfirmMobileNumber] = useState("");
  const user = getUser();

  useEffect(() => {
    getCampaigns().then(setCampaigns);
  }, []);

  const handleDonate = async () => {
    const token = getToken();
    if (!token) {
      alert("Please login to donate");
      return;
    }

    // Prevent admins / campaign creators from donating
    const isAdmin = user?.role === "ADMIN";
    const isCreator = user && (campaign?.userId === user.id || campaign?.user?.id === user.id);
    if (isAdmin || isCreator) {
      alert("Admins and campaign creators manage campaigns and cannot donate.");
      return;
    }

    const donationAmount = parseFloat(amount);
    if (!donationAmount || donationAmount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (!paymentMethod) {
      alert("Please select a payment method");
      return;
    }

    setLoading(true);
    try {
      await donateToCampaign(
        {
          amount: donationAmount,
          campaignId: selectedCampaign,
          method: paymentMethod,
          message: message || undefined,
          isAnonymous,
          useCreatorKeys,
        },
        token
      );
      alert("Donation successful! Thank you for your contribution.");
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.error || err.message || "Donation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const presetAmounts = [10, 25, 50, 100];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl my-8 text-gray-900">
        <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            MAKE YOUR IMPACT - GIVE TODAY!
          </h2>
          <div className="flex items-center gap-2 md:gap-4">
            <Link
              href="/donate-history"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
            >
              VIEW DONATION HISTORY
            </Link>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 text-3xl md:text-2xl font-bold leading-none"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
                <span className="text-2xl">👤</span> Donor Information
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
                <input
                  type="email"
                  placeholder="Email (Optional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
                <input
                  type="text"
                  placeholder="Details (Optional)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
                <label className="flex items-center gap-2 cursor-pointer text-gray-900">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>Donate Anonymously</span>
                </label>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
                <span className="text-2xl">💰</span> Donation Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Select Campaign
                  </label>
                  <select
                    value={selectedCampaign}
                    onChange={(e) => setSelectedCampaign(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    {campaigns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Amount</label>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-gray-900">₱</span>
                    <input
                      type="number"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      min="1"
                      step="0.01"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {presetAmounts.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setAmount(preset.toString())}
                        className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded text-sm font-medium text-gray-900 transition"
                      >
                        ₱{preset}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Add a short message of support (Optional)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Your message here..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
              <span className="text-2xl">💳</span> Payment Method
            </h3>
            <div className="space-y-4">
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option value="GCASH">GCash</option>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="DEBIT_CARD">Debit Card</option>
              </select>
              {campaign?.user?.xenditSecretKey && (
                <label className="flex items-center gap-2 cursor-pointer text-gray-900">
                  <input
                    type="checkbox"
                    checked={useCreatorKeys}
                    onChange={(e) => setUseCreatorKeys(e.target.checked)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>Use campaign creator's Xendit account (Option 1)</span>
                </label>
              )}
              {paymentMethod === "GCASH" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="tel"
                    placeholder="Smart Mobile Number"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                  <input
                    type="tel"
                    placeholder="Confirm Smart Mobile Number"
                    value={confirmMobileNumber}
                    onChange={(e) => setConfirmMobileNumber(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Donate Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleDonate}
              disabled={loading || !amount || parseFloat(amount) <= 0 || user?.role === "ADMIN"}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-semibold transition"
            >
              {user?.role === "ADMIN"
                ? "Admins cannot donate"
                : loading
                ? "Processing..."
                : "DONATE NOW"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
