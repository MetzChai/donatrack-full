import { useState } from "react";
import { donateToCampaign } from "../lib/api";
import { getToken } from "../utils/auth";

export default function DonationForm({ campaignId }: { campaignId: string }) {
  const [amount, setAmount] = useState(0);
  const [msg, setMsg] = useState("");

  const handleDonate = async () => {
    const token = getToken();
    if (!token) return setMsg("Login required to donate");

    try {
      await donateToCampaign({ amount, campaignId }, token);
      setMsg("Donation successful!");
    } catch {
      setMsg("Donation failed");
    }
  };

  return (
    <div>
      <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} />
      <button onClick={handleDonate}>Donate</button>
      {msg && <p>{msg}</p>}
    </div>
  );
}
