import { useState } from "react";
import { donateToCampaign } from "../lib/api";
import { getToken, getUser } from "../utils/auth";

export default function DonationForm({ campaignId }: { campaignId: string }) {
  const [amount, setAmount] = useState(0);
  const [msg, setMsg] = useState("");

  const handleDonate = async () => {
    const token = getToken();
    const user = getUser();

    if (!token) {
      return setMsg("Login required to donate");
    }

    if (user?.role === "ADMIN") {
      return setMsg("Admins manage campaigns and cannot donate.");
    }

    try {
      await donateToCampaign({ amount, campaignId }, token);
      setMsg("Donation successful!");
    } catch {
      setMsg("Donation failed");
    }
  };

  const user = getUser();
  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-sm mx-auto">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Support this Campaign</h3>
      <input
        type="number"
        value={amount}
        onChange={e => setAmount(Number(e.target.value))}
        placeholder="Enter amount (PHP)"
        className="w-full mb-4 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleDonate}
        disabled={isAdmin}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded font-semibold transition-colors"
      >
        {isAdmin ? "Admins cannot donate" : "Donate"}
      </button>
      {msg && (
        <p className={`mt-4 text-sm font-medium ${msg.includes("successful") ? "text-green-600" : "text-red-600"}`}>
          {msg}
        </p>
      )}
    </div>
  );
}
