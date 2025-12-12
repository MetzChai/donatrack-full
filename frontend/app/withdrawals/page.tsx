"use client";

import { useEffect, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import { getMyWithdrawals, getWithdrawals, updateWithdrawalStatus } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function WithdrawalsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [myWithdrawals, setMyWithdrawals] = useState<any[]>([]);
  const [allWithdrawals, setAllWithdrawals] = useState<any[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !user) return;

    // TypeScript guard: token is confirmed to be string at this point
    const authToken: string = token;

    async function fetchData() {
      try {
        const [mine, all] = await Promise.all([
          getMyWithdrawals(authToken),
          getWithdrawals(authToken), // now visible to all authenticated users
        ]);
        setMyWithdrawals(mine || []);
        setAllWithdrawals(all || []);
      } catch (err) {
        console.error("Failed to fetch withdrawals", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  const handleStatusUpdate = async (id: string, status: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    // TypeScript guard: token is confirmed to be string at this point
    const authToken: string = token;
    
    try {
      setUpdatingId(id);
      await updateWithdrawalStatus(id, status, authToken);
      const [mine, all] = await Promise.all([
        getMyWithdrawals(authToken),
        getWithdrawals(authToken),
      ]);
      setMyWithdrawals(mine || []);
      setAllWithdrawals(all || []);
    } catch (err) {
      alert("Failed to update withdrawal status");
    } finally {
      setUpdatingId(null);
    }
  };

  const renderTable = (rows: any[], showUser: boolean, allowActions: boolean) => {
    if (!rows.length) return <p className="text-gray-600">No withdrawals found.</p>;
    return (
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th>
              {showUser && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              {allowActions && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-900">
            {rows.map((w) => (
              <tr key={w.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold">₱{w.amount.toFixed(2)}</td>
                <td className="px-6 py-4">
                  {w.campaign ? (
                    <Link href={`/campaigns/${w.campaign.id}`} className="text-blue-600 hover:text-blue-800">
                      {w.campaign.title}
                    </Link>
                  ) : (
                    <span className="text-gray-500">General withdrawal</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {showUser ? (
                    w.user ? (
                      <>
                        <span className="font-medium">{w.user.fullName || "Unknown"}</span>
                        <span className="text-sm text-gray-500 block">{w.user.email}</span>
                      </>
                    ) : (
                      <span className="text-gray-500">Unknown</span>
                    )
                  ) : (
                    <span className="text-gray-500">You</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      w.status === "COMPLETED"
                        ? "bg-green-100 text-green-800"
                        : w.status === "FAILED"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {w.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{new Date(w.createdAt).toLocaleString()}</td>
                {allowActions && (
                  <td className="px-6 py-4 text-sm text-gray-600 space-x-2">
                    <button
                      disabled={updatingId === w.id || w.status === "COMPLETED"}
                      onClick={() => handleStatusUpdate(w.id, "COMPLETED")}
                      className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-1 rounded"
                    >
                      Mark Paid
                    </button>
                    <button
                      disabled={updatingId === w.id || w.status === "FAILED"}
                      onClick={() => handleStatusUpdate(w.id, "FAILED")}
                      className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-3 py-1 rounded"
                    >
                      Mark Failed
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return (
      <ProtectedPage>
        <main className="p-8 min-h-screen flex items-center justify-center bg-gray-100">
          <p className="text-xl text-gray-800">Loading...</p>
        </main>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage>
      <main className="p-8 min-h-screen bg-gray-100 text-gray-900">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Withdrawal History</h1>
            <p className="text-gray-600">Review all withdrawals and campaign-specific deductions.</p>
          </div>
        </div>

        <section className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-2xl font-semibold">All Withdrawals</h2>
            <span className="text-sm text-gray-600">
              Visible to all users. Only admins can update statuses.
            </span>
          </div>
          {renderTable(allWithdrawals, true, user?.role === "ADMIN")}
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-2xl font-semibold">My Withdrawals</h2>
            <span className="text-sm text-gray-600">Visible to you</span>
          </div>
          {renderTable(
            myWithdrawals.map((w) => ({
              ...w,
              user: null, // simplify display for self
            })),
            false,
            false
          )}
        </section>
      </main>
    </ProtectedPage>
  );
}

