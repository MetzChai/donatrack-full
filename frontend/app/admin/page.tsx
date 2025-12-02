"use client";

import { useEffect, useState } from "react";
import {
  getUsers,
  getAdminStats,
  updateUserRole,
  deleteUser,
  getActiveCampaigns,
  getCampaignHistory,
  deleteCampaign,
  createCampaign,
  updateCampaign,
  endCampaign,
} from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedPage from "@/components/ProtectedPage";

function AdminPageContent() {
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [activeCampaigns, setActiveCampaigns] = useState<any[]>([]);
  const [campaignHistory, setCampaignHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<string>("");
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  const [campaignForm, setCampaignForm] = useState({
    title: "",
    description: "",
    goalAmount: "",
    imageUrl: "",
  });

  const { user: currentUser } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (currentUser?.role === "ADMIN" && token) {
      fetchAllData();
    }
  }, [currentUser]);

  const fetchAllData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const [usersData, statsData, activeData, historyData] = await Promise.all([
        getUsers(token),
        getAdminStats(token),
        getActiveCampaigns(token),
        getCampaignHistory(token),
      ]);
      setUsers(usersData);
      setStats(statsData);
      setActiveCampaigns(activeData);
      setCampaignHistory(historyData);
    } catch (err) {
      console.error("Failed to fetch admin data", err);
      alert("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string) => {
    if (!newRole) {
      alert("Please select a role");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await updateUserRole(userId, newRole, token);
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

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await deleteUser(userId, token);
      setUsers(users.filter((u) => u.id !== userId));
      alert("User deleted successfully");
    } catch (err: any) {
      alert(err.error || "Failed to delete user");
    }
  };

  const handleOpenCampaignModal = (campaign?: any) => {
    if (campaign) {
      setEditingCampaign(campaign);
      setCampaignForm({
        title: campaign.title,
        description: campaign.description,
        goalAmount: campaign.goalAmount.toString(),
        imageUrl: campaign.imageUrl || "",
      });
    } else {
      setEditingCampaign(null);
      setCampaignForm({
        title: "",
        description: "",
        goalAmount: "",
        imageUrl: "",
      });
    }
    setShowCampaignModal(true);
  };

  const handleCloseCampaignModal = () => {
    setShowCampaignModal(false);
    setEditingCampaign(null);
    setCampaignForm({
      title: "",
      description: "",
      goalAmount: "",
      imageUrl: "",
    });
  };

  const handleSaveCampaign = async () => {
    if (!campaignForm.title || !campaignForm.description || !campaignForm.goalAmount) {
      alert("Please fill in all required fields");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      if (editingCampaign) {
        await updateCampaign(
          editingCampaign.id,
          {
            title: campaignForm.title,
            description: campaignForm.description,
            goalAmount: parseFloat(campaignForm.goalAmount),
            imageUrl: campaignForm.imageUrl || undefined,
          },
          token
        );
        alert("Campaign updated successfully");
      } else {
        await createCampaign(
          {
            title: campaignForm.title,
            description: campaignForm.description,
            goalAmount: parseFloat(campaignForm.goalAmount),
            imageUrl: campaignForm.imageUrl || undefined,
          },
          token
        );
        alert("Campaign created successfully");
      }
      handleCloseCampaignModal();
      fetchAllData();
    } catch (err: any) {
      alert(err.error || "Failed to save campaign");
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm("Are you sure you want to delete this active campaign?")) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await deleteCampaign(campaignId, token);
      alert("Campaign deleted successfully");
      fetchAllData();
    } catch (err: any) {
      alert(err.error || "Failed to delete campaign");
    }
  };

  const handleEndCampaign = async (campaignId: string) => {
    if (!confirm("Are you sure you want to end this campaign? This action cannot be undone.")) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await endCampaign(campaignId, token);
      alert("Campaign ended successfully");
      fetchAllData();
    } catch (err: any) {
      alert(err.error || "Failed to end campaign");
    }
  };

  if (loading) {
    return (
      <main className="p-8 min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p className="text-xl">Loading...</p>
      </main>
    );
  }

  return (
    <main className="p-8 min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Stats Section */}
      {stats && (
        <section className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-gray-400 text-sm">Total Donations</h3>
            <p className="text-2xl font-bold">{stats.totalDonations}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-gray-400 text-sm">Total Donors</h3>
            <p className="text-2xl font-bold">{stats.totalDonors || 0}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-gray-400 text-sm">Active Campaigns</h3>
            <p className="text-2xl font-bold">{activeCampaigns.length}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-gray-400 text-sm">Total Donated</h3>
            <p className="text-2xl font-bold">₱{stats.totalDonationAmount?.toFixed(2) || "0.00"}</p>
          </div>
        </section>
      )}

      {/* Active Campaigns Section */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Active Campaigns</h2>
          <button
            onClick={() => handleOpenCampaignModal()}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm font-semibold"
          >
            + Add Campaign
          </button>
        </div>
        {activeCampaigns.length === 0 ? (
          <p className="text-gray-400">No active campaigns found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
              <thead className="bg-gray-900">
                <tr>
                  <th className="p-4 text-left">Title</th>
                  <th className="p-4 text-left">Creator</th>
                  <th className="p-4 text-left">Goal</th>
                  <th className="p-4 text-left">Collected</th>
                  <th className="p-4 text-left">Progress</th>
                  <th className="p-4 text-left">Created</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeCampaigns.map((campaign) => {
                  const progress = Math.min((campaign.collected / campaign.goalAmount) * 100, 100);
                  const goalMet = campaign.collected >= campaign.goalAmount;
                  return (
                    <tr key={campaign.id} className="border-b border-gray-700 hover:bg-gray-750">
                      <td className="p-4 font-semibold">{campaign.title}</td>
                      <td className="p-4">{campaign.user?.fullName || "Unknown"}</td>
                      <td className="p-4">₱{campaign.goalAmount.toFixed(2)}</td>
                      <td className="p-4">₱{campaign.collected.toFixed(2)}</td>
                      <td className="p-4">
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${goalMet ? "bg-green-600" : "bg-blue-600"}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{progress.toFixed(1)}%</span>
                      </td>
                      <td className="p-4">{new Date(campaign.createdAt).toLocaleDateString()}</td>
                      <td className="p-4">
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => handleOpenCampaignModal(campaign)}
                            className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs"
                          >
                            Edit
                          </button>
                          {goalMet && (
                            <button
                              onClick={() => handleEndCampaign(campaign.id)}
                              className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-xs"
                            >
                              End Campaign
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteCampaign(campaign.id)}
                            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Campaign History Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Campaign History</h2>
        {campaignHistory.length === 0 ? (
          <p className="text-gray-400">No campaign history found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
              <thead className="bg-gray-900">
                <tr>
                  <th className="p-4 text-left">Title</th>
                  <th className="p-4 text-left">Creator</th>
                  <th className="p-4 text-left">Goal</th>
                  <th className="p-4 text-left">Collected</th>
                  <th className="p-4 text-left">Progress</th>
                  <th className="p-4 text-left">Ended Date</th>
                </tr>
              </thead>
              <tbody>
                {campaignHistory.map((campaign) => {
                  const progress = Math.min((campaign.collected / campaign.goalAmount) * 100, 100);
                  return (
                    <tr key={campaign.id} className="border-b border-gray-700 hover:bg-gray-750">
                      <td className="p-4 font-semibold">{campaign.title}</td>
                      <td className="p-4">{campaign.user?.fullName || "Unknown"}</td>
                      <td className="p-4">₱{campaign.goalAmount.toFixed(2)}</td>
                      <td className="p-4">₱{campaign.collected.toFixed(2)}</td>
                      <td className="p-4">
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${progress >= 100 ? "bg-green-600" : "bg-gray-500"}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{progress.toFixed(1)}%</span>
                      </td>
                      <td className="p-4">{new Date(campaign.createdAt).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

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

      {/* Campaign Modal */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-2xl w-full mx-4">
            <h3 className="text-xl font-bold mb-4">
              {editingCampaign ? "Edit Campaign" : "Create New Campaign"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input
                  type="text"
                  value={campaignForm.title}
                  onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })}
                  className="w-full bg-gray-700 text-white p-2 rounded"
                  placeholder="Campaign title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea
                  value={campaignForm.description}
                  onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })}
                  className="w-full bg-gray-700 text-white p-2 rounded"
                  rows={4}
                  placeholder="Campaign description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Goal Amount (₱) *</label>
                <input
                  type="number"
                  value={campaignForm.goalAmount}
                  onChange={(e) => setCampaignForm({ ...campaignForm, goalAmount: e.target.value })}
                  className="w-full bg-gray-700 text-white p-2 rounded"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Image URL (Optional)</label>
                <input
                  type="url"
                  value={campaignForm.imageUrl}
                  onChange={(e) => setCampaignForm({ ...campaignForm, imageUrl: e.target.value })}
                  className="w-full bg-gray-700 text-white p-2 rounded"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSaveCampaign}
                className="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded font-semibold"
              >
                {editingCampaign ? "Update" : "Create"}
              </button>
              <button
                onClick={handleCloseCampaignModal}
                className="flex-1 bg-gray-600 hover:bg-gray-700 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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

export default function AdminPage() {
  return (
    <ProtectedPage requiredRole="ADMIN">
      <AdminPageContent />
    </ProtectedPage>
  );
}
