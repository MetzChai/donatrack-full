"use client";

import { useEffect, useState } from "react";
import { getUsers, getAdminStats, updateUserRole, deleteUser } from "@/lib/api";
import { getToken, getUser } from "@/utils/auth";

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<string>("");

  const token = getToken();
  const currentUser = getUser();

  useEffect(() => {
    if (!token || currentUser?.role !== "ADMIN") {
      window.location.href = "/auth/login";
      return;
    }

    async function fetchData() {
      try {
        const [usersData, statsData] = await Promise.all([
          getUsers(token!),
          getAdminStats(token!),
        ]);
        setUsers(usersData);
        setStats(statsData);
      } catch (err) {
        console.error("Failed to fetch admin data", err);
        alert("Failed to load admin data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [token, currentUser]);

  const handleUpdateRole = async (userId: string) => {
    if (!newRole) {
      alert("Please select a role");
      return;
    }

    try {
      await updateUserRole(userId, newRole, token!);
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      setSelectedUser(null);
      setNewRole("");
      alert("User role updated successfully");
    } catch (err: any) {
      alert(err.error || "Failed to update user role");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await deleteUser(userId, token!);
      setUsers(users.filter((u) => u.id !== userId));
      alert("User deleted successfully");
    } catch (err: any) {
      alert(err.error || "Failed to delete user");
    }
  };

  if (loading) {
    return (
      <main className="p-8 min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </main>
    );
  }

  return (
    <main className="p-8 min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Stats Section */}
      {stats && (
        <section className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-gray-400 text-sm">Total Users</h3>
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-gray-400 text-sm">Total Campaigns</h3>
            <p className="text-2xl font-bold">{stats.totalCampaigns}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-gray-400 text-sm">Total Donations</h3>
            <p className="text-2xl font-bold">{stats.totalDonations}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-gray-400 text-sm">Total Funds</h3>
            <p className="text-2xl font-bold">₱{stats.totalFunds.toFixed(2)}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-gray-400 text-sm">Total Donated</h3>
            <p className="text-2xl font-bold">₱{stats.totalDonationAmount.toFixed(2)}</p>
          </div>
        </section>
      )}

      {/* Users Management Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">User Management</h2>
        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
              <thead className="bg-gray-900">
                <tr>
                  <th className="p-4 text-left">Name</th>
                  <th className="p-4 text-left">Email</th>
                  <th className="p-4 text-left">Role</th>
                  <th className="p-4 text-left">Campaigns</th>
                  <th className="p-4 text-left">Donations</th>
                  <th className="p-4 text-left">Funds</th>
                  <th className="p-4 text-left">Joined</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="p-4">{user.fullName}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          user.role === "ADMIN"
                            ? "bg-purple-600"
                            : user.role === "CREATOR"
                            ? "bg-blue-600"
                            : "bg-gray-600"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">{user._count?.campaigns || 0}</td>
                    <td className="p-4">{user._count?.donations || 0}</td>
                    <td className="p-4">₱{user.currentFunds?.toFixed(2) || "0.00"}</td>
                    <td className="p-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user.id);
                            setNewRole(user.role);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
                        >
                          Change Role
                        </button>
                        {user.id !== currentUser?.id && (
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Role Update Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Update User Role</h3>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full bg-gray-700 text-white p-2 rounded mb-4"
            >
              <option value="USER">USER</option>
              <option value="CREATOR">CREATOR</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => handleUpdateRole(selectedUser)}
                className="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded"
              >
                Update
              </button>
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setNewRole("");
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
