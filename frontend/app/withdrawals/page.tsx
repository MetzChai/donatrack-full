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

    const authToken: string = token;

    async function fetchData() {
      try {
        const [mine, all] = await Promise.all([
          getMyWithdrawals(authToken),
          getWithdrawals(authToken),
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
    if (!rows.length)
      return <p className="text-white text-center py-4">No withdrawals found.</p>;

    return (
      <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-gray-200 transition hover:shadow-lg">
        <table className="min-w-full divide-y divide-gray-200 text-gray-900">
          <thead className="bg-gray-300">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">
                Campaign
              </th>
              {showUser && (
                <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">
                  User
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">
                Date
              </th>
              {allowActions && (
                <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {rows.map((w) => (
              <tr key={w.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-semibold text-black">₱{w.amount.toFixed(2)}</td>

                <td className="px-6 py-4">
                  {w.campaign ? (
                    <Link
                      href={`/campaigns/${w.campaign.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
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
                        <span className="font-medium text-gray-900">
                          {w.user.fullName || "Unknown"}
                        </span>
                        <span className="text-sm text-black block">{w.user.email}</span>
                      </>
                    ) : (
                      <span className="text-black">Unknown</span>
                    )
                  ) : (
                    <span className="text-black">You</span>
                  )}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
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

                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(w.createdAt).toLocaleString()}
                </td>

                {allowActions && (
                  <td className="px-6 py-4 space-x-2">
                    <button
                      disabled={updatingId === w.id || w.status === "COMPLETED"}
                      onClick={() => handleStatusUpdate(w.id, "COMPLETED")}
                      className="bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white px-3 py-1 rounded-md text-sm shadow"
                    >
                      Mark Paid
                    </button>

                    <button
                      disabled={updatingId === w.id || w.status === "FAILED"}
                      onClick={() => handleStatusUpdate(w.id, "FAILED")}
                      className="bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white px-3 py-1 rounded-md text-sm shadow"
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
          <p className="text-xl text-gray-800 animate-pulse">Loading...</p>
        </main>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage>
      <main className="bg-gray-900 min-h-screen py-12">
        {/* ⭐ Added container */}
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-black-900">
          <div className="mb-10">
            <h1 className="text-[#73E6CB] text-4xl font-bold tracking-tight mb-2">Withdrawal History</h1>
            <p className="text-white text-lg">
              Review all withdrawals and campaign-specific deductions.
            </p>
          </div>

          {/* ALL WITHDRAWALS */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[#73E6CB] text-2xl font-semibold">All Withdrawals</h2>
              <span className="text-sm text-white">
                Visible to all users. Only admins can update statuses.
              </span>
            </div>

            {renderTable(allWithdrawals, true, user?.role === "ADMIN")}
          </section>

          {/* MY WITHDRAWALS */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[#73E6CB] text-2xl font-semibold">My Withdrawals</h2>
              <span className="text-sm text-white">Visible to you</span>
            </div>

            {renderTable(
              myWithdrawals.map((w) => ({
                ...w,
                user: null,
              })),
              false,
              false
            )}
          </section>
        </div>
      </main>
    </ProtectedPage>
  );
}
