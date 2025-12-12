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
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const formatCardNumber = (value: string) => {
    return value
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 4);
    if (cleaned.length < 3) return cleaned;
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  };
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

    // Basic per-method validation to mimic real payment forms
    if (paymentMethod === "GCASH") {
      if (!mobileNumber || !confirmMobileNumber) {
        alert("Please enter and confirm your GCash mobile number.");
        return;
      }
      if (mobileNumber !== confirmMobileNumber) {
        alert("GCash numbers do not match.");
        return;
      }
      if (mobileNumber.length < 10) {
        alert("Please enter a valid GCash mobile number.");
        return;
      }
    } else if (paymentMethod === "CARD") {
      if (!cardName || !cardNumber || !cardExpiry || !cardCvv) {
        alert("Please complete the card details.");
        return;
      }
      const digits = cardNumber.replace(/\s+/g, "");
      if (digits.length < 15) {
        alert("Please enter a valid card number.");
        return;
      }
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        alert("Expiry should be MM/YY.");
        return;
      }
      const [mm, yy] = cardExpiry.split("/").map((p) => parseInt(p, 10));
      if (mm < 1 || mm > 12) {
        alert("Expiry month must be 01-12.");
        return;
      }
      if (cardCvv.length < 3 || cardCvv.length > 4) {
        alert("Please enter a valid CVV.");
        return;
      }
    }

    setLoading(true);
    try {
      const res = await donateToCampaign(
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

      // If a checkout URL is returned, redirect to payment gateway
      if (res?.checkoutUrl) {
        // Check if it's a mock checkout URL - redirect directly to success for mock payments
        if (res.checkoutUrl.includes("mock.xendit.test")) {
          const ref = res.donation?.id || `donation-${Date.now()}`;
          // Redirect to success page for mock payments
          window.location.href = `/donate-success?ref=${ref}`;
          return;
        }
        
        // Real Xendit checkout URL - redirect to payment gateway
        // Xendit will redirect back to success/failure URLs after payment
        window.location.href = res.checkoutUrl;
        return;
      }

      // If donation is completed immediately (no checkout URL needed)
      if (res?.status === "COMPLETED") {
        const ref = res.donation?.id || `donation-${Date.now()}`;
        window.location.href = `/donate-success?ref=${ref}`;
        return;
      }

      // Fallback: donation created but no checkout URL
      alert("Donation created! Status: " + (res?.status || "PENDING"));
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
                <option value="CARD">Card</option>
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
              {paymentMethod === "CARD" && (
                <div className="space-y-3 bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">Secure card payment</p>
                  <input
                    type="text"
                    placeholder="Name on Card"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                  <input
                    type="text"
                    placeholder="Card Number"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                    <input
                      type="text"
                      placeholder="CVV"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    We do not store card details. Payments are processed by the provider.
                  </p>
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
