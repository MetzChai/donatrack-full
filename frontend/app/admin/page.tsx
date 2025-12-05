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
  getAllProofs,
  createProof,
  updateProof,
  deleteProof,
  getCampaigns,
} from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedPage from "@/components/ProtectedPage";

function AdminPageContent() {
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [activeCampaigns, setActiveCampaigns] = useState<any[]>([]);
  const [campaignHistory, setCampaignHistory] = useState<any[]>([]);
  const [proofs, setProofs] = useState<any[]>([]);
  const [allCampaigns, setAllCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<string>("");
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  const [showProofModal, setShowProofModal] = useState(false);
  const [editingProof, setEditingProof] = useState<any>(null);
  const [campaignForm, setCampaignForm] = useState({
    title: "",
    description: "",
    goalAmount: "",
    imageUrl: "",
  });
  const [proofForm, setProofForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    campaignId: "",
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
      const [usersData, statsData, activeData, historyData, proofsData, campaignsData] = await Promise.all([
        getUsers(token),
        getAdminStats(token),
        getActiveCampaigns(token),
        getCampaignHistory(token),
        getAllProofs(),
        getCampaigns(),
      ]);
      setUsers(usersData);
      setStats(statsData);
      setActiveCampaigns(activeData);
      setCampaignHistory(historyData);
      setProofs(proofsData);
      setAllCampaigns(campaignsData);
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

  const handleOpenProofModal = (proof?: any) => {
    if (proof) {
      setEditingProof(proof);
      setProofForm({
        title: proof.title,
        description: proof.description,
        imageUrl: proof.imageUrl,
        campaignId: proof.campaignId,
      });
    } else {
      setEditingProof(null);
      setProofForm({
        title: "",
        description: "",
        imageUrl: "",
        campaignId: "",
      });
    }
    setShowProofModal(true);
  };

  const handleCloseProofModal = () => {
    setShowProofModal(false);
    setEditingProof(null);
    setProofForm({
      title: "",
      description: "",
      imageUrl: "",
      campaignId: "",
    });
  };

  const handleSaveProof = async () => {
    if (!proofForm.title || !proofForm.description || !proofForm.imageUrl || !proofForm.campaignId) {
      alert("Please fill in all required fields");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("No authentication token found. Please log in again.");
      return;
    }

    try {
      console.log("Saving proof:", proofForm);
      if (editingProof) {
        await updateProof(editingProof.id, proofForm, token);
        alert("Proof updated successfully");
      } else {
        await createProof(proofForm, token);
        alert("Proof created successfully");
      }
      handleCloseProofModal();
      fetchAllData();
    } catch (err: any) {
      console.error("Error saving proof:", err);
      const errorMessage = err?.error || err?.message || err?.details || "Failed to save proof. Please check the console for details.";
      alert(`Error: ${errorMessage}${err?.code ? ` (Code: ${err.code})` : ""}`);
    }
  };

  const handleDeleteProof = async (proofId: string) => {
    if (!confirm("Are you sure you want to delete this proof?")) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await deleteProof(proofId, token);
      alert("Proof deleted successfully");
      fetchAllData();
    } catch (err: any) {
      alert(err.error || "Failed to delete proof");
    }
  };

  if (loading) {
    return (
      <main className="p-8 min-h-screen flex items-center justify-center bg-gradient-to-b from-[#05060a] to-[#071020] text-white">
        <p className="text-xl">Loading...</p>
      </main>
    );
  }

  return (
    <main className="p-8 min-h-screen bg-gradient-to-b from-[#071020] to-[#04050a] text-white">
      <h1 className="text-4xl font-extrabold mb-8 tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-300">
        Admin Dashboard
      </h1>

      {/* Stats Section */}
      {stats && (
        <section className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/6 backdrop-blur-md border border-white/6 p-5 rounded-2xl shadow-xl">
            <h3 className="text-gray-300 text-xs uppercase tracking-wide">Total Donations</h3>
            <p className="text-3xl font-bold mt-2 text-emerald-300">{stats.totalDonations}</p>
          </div>
          <div className="bg-white/6 backdrop-blur-md border border-white/6 p-5 rounded-2xl shadow-xl">
            <h3 className="text-gray-300 text-xs uppercase tracking-wide">Total Donors</h3>
            <p className="text-3xl font-bold mt-2 text-emerald-300">{stats.totalDonors || 0}</p>
          </div>
          <div className="bg-white/6 backdrop-blur-md border border-white/6 p-5 rounded-2xl shadow-xl">
            <h3 className="text-gray-300 text-xs uppercase tracking-wide">Active Campaigns</h3>
            <p className="text-3xl font-bold mt-2 text-emerald-300">{activeCampaigns.length}</p>
          </div>
          <div className="bg-white/6 backdrop-blur-md border border-white/6 p-5 rounded-2xl shadow-xl">
            <h3 className="text-gray-300 text-xs uppercase tracking-wide">Total Donated</h3>
            <p className="text-3xl font-bold mt-2 text-emerald-300">
              ₱{stats.totalDonationAmount?.toFixed(2) || "0.00"}
            </p>
          </div>
        </section>
      )}

      {/* Active Campaigns Section */}
      <section className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
          <h2 className="text-2xl font-semibold">Active Campaigns</h2>
          <div className="flex gap-2">
            <button
              onClick={() => handleOpenCampaignModal()}
              className="bg-gradient-to-r from-emerald-500 to-green-400 hover:opacity-90 transition px-4 py-2 rounded-lg text-sm font-semibold shadow"
            >
              + Add Campaign
            </button>
          </div>
        </div>
        {activeCampaigns.length === 0 ? (
          <p className="text-gray-400">No active campaigns found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white/5 backdrop-blur-sm border border-white/6 rounded-2xl overflow-hidden shadow-xl">
              <thead className="bg-white/8 text-gray-300 text-sm uppercase tracking-wide">
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
                    <tr key={campaign.id} className="border-b border-white/6 hover:bg-white/8 transition">
                      <td className="p-4 font-semibold">{campaign.title}</td>
                      <td className="p-4">{campaign.user?.fullName || "Unknown"}</td>
                      <td className="p-4">₱{campaign.goalAmount.toFixed(2)}</td>
                      <td className="p-4">₱{campaign.collected.toFixed(2)}</td>
                      <td className="p-4 w-48">
                        <div className="w-full bg-white/8 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-2 transition-all duration-700 ${
                              goalMet ? "bg-emerald-400" : "bg-cyan-400"
                            }`}
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
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:opacity-90 transition px-3 py-1 rounded text-xs font-semibold shadow"
                          >
                            Edit
                          </button>
                          {goalMet && (
                            <button
                              onClick={() => handleEndCampaign(campaign.id)}
                              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 transition px-3 py-1 rounded text-xs font-semibold shadow"
                            >
                              End Campaign
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteCampaign(campaign.id)}
                            className="bg-gradient-to-r from-rose-500 to-red-500 hover:opacity-90 transition px-3 py-1 rounded text-xs font-semibold shadow"
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
            <table className="min-w-full bg-white/5 backdrop-blur-sm border border-white/6 rounded-2xl overflow-hidden shadow-xl">
              <thead className="bg-white/8 text-gray-300 text-sm uppercase tracking-wide">
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
                    <tr key={campaign.id} className="border-b border-white/6 hover:bg-white/8 transition">
                      <td className="p-4 font-semibold">{campaign.title}</td>
                      <td className="p-4">{campaign.user?.fullName || "Unknown"}</td>
                      <td className="p-4">₱{campaign.goalAmount.toFixed(2)}</td>
                      <td className="p-4">₱{campaign.collected.toFixed(2)}</td>
                      <td className="p-4">
                        <div className="w-full bg-white/8 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-2 transition-all duration-700 ${progress >= 100 ? "bg-emerald-400" : "bg-gray-500"}`}
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

      {/* Proof/Transparency Management Section */}
      <section className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
          <h2 className="text-2xl font-semibold">Transparency & Proof Management</h2>
          <button
            onClick={() => handleOpenProofModal()}
            className="bg-gradient-to-r from-emerald-500 to-green-400 hover:opacity-90 transition px-4 py-2 rounded-lg text-sm font-semibold shadow"
          >
            + Add Proof
          </button>
        </div>
        {proofs.length === 0 ? (
          <p className="text-gray-400">No proof records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white/5 backdrop-blur-sm border border-white/6 rounded-2xl overflow-hidden shadow-xl">
              <thead className="bg-white/20 text-gray-300 text-sm uppercase tracking-wide">
                <tr>
                  <th className="p-4 text-left">Image</th>
                  <th className="p-4 text-left">Title</th>
                  <th className="p-4 text-left">Campaign</th>
                  <th className="p-4 text-left">Description</th>
                  <th className="p-4 text-left">Created</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {proofs.map((proof) => (
                  <tr key={proof.id} className="border-b border-white/10 hover:bg-white/8 transition">
                    <td className="p-4">
                      <img
                        src={proof.imageUrl}
                        alt={proof.title}
                        className="w-20 h-20 object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://via.placeholder.com/80x80?text=Image";
                        }}
                      />
                    </td>
                    <td className="p-4 font-semibold">{proof.title}</td>
                    <td className="p-4">{proof.campaign?.title || "Unknown"}</td>
                    <td className="p-4 text-sm text-gray-300 max-w-xs truncate">
                      {proof.description}
                    </td>
                    <td className="p-4 text-sm text-gray-400">
                      {new Date(proof.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenProofModal(proof)}
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:opacity-90 transition px-3 py-1 rounded text-xs font-semibold shadow"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProof(proof.id)}
                          className="bg-gradient-to-r from-rose-500 to-red-500 hover:opacity-90 transition px-3 py-1 rounded text-xs font-semibold shadow"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
            <table className="min-w-full bg-white/5 backdrop-blur-sm border border-white/6 rounded-2xl overflow-hidden shadow-xl">
              <thead className="bg-white/8">
                <tr className="text-gray-300 text-sm uppercase tracking-wide">
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
                  <tr key={user.id} className="border-b border-white/6 hover:bg-white/8 transition">
                    <td className="p-4">{user.fullName}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          user.role === "ADMIN"
                            ? "bg-gradient-to-r from-purple-500 to-pink-500"
                            : user.role === "CREATOR"
                            ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                            : "bg-gradient-to-r from-gray-600 to-gray-500"
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
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:opacity-90 transition px-3 py-1 rounded text-sm font-semibold shadow"
                        >
                          Change Role
                        </button>
                        {user.id !== currentUser?.id && (
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="bg-gradient-to-r from-rose-500 to-red-500 hover:opacity-90 transition px-3 py-1 rounded text-sm font-semibold shadow"
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0b1220] border border-white/8 p-6 rounded-2xl max-w-2xl w-full mx-4 shadow-2xl">
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
                  className="w-full bg-white/20 border border-white/6 text-white p-3 rounded-lg focus:outline-none focus:border-emerald-400 transition"
                  placeholder="Campaign title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea
                  value={campaignForm.description}
                  onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })}
                  className="w-full bg-white/20 border border-white/6 text-white p-3 rounded-lg focus:outline-none focus:border-emerald-400 transition"
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
                  className="w-full bg-white/20 border border-white/6 text-white p-3 rounded-lg focus:outline-none focus:border-emerald-400 transition"
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
                  className="w-full bg-white/20 border border-white/6 text-white p-3 rounded-lg focus:outline-none focus:border-emerald-400 transition"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSaveCampaign}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-green-400 hover:opacity-90 py-2 rounded-lg font-semibold shadow"
              >
                {editingCampaign ? "Update" : "Create"}
              </button>
              <button
                onClick={handleCloseCampaignModal}
                className="flex-1 bg-white/6 hover:opacity-90 py-2 rounded-lg shadow"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Update Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0b1220] border border-white/8 p-6 rounded-2xl max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Update User Role</h3>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full bg-white/6 border border-white/6 text-black p-3 rounded-lg mb-4 focus:outline-none focus:border-emerald-400 transition"
            >
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => handleUpdateRole(selectedUser)}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-green-400 hover:opacity-90 py-2 rounded-lg font-semibold shadow"
              >
                Update
              </button>
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setNewRole("");
                }}
                className="flex-1 bg-white/6 hover:opacity-90 py-2 rounded-lg shadow"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Proof Modal */}
      {showProofModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0b1220] border border-white/8 p-6 rounded-2xl max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingProof ? "Edit Proof" : "Create New Proof"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Campaign *</label>
                <select
                  value={proofForm.campaignId}
                  onChange={(e) => setProofForm({ ...proofForm, campaignId: e.target.value })}
                  className="w-full bg-white/20 border border-white/6 text-black placeholder:text-white/70 p-3 rounded-lg focus:outline-none focus:border-emerald-300 focus:bg-white/10 transition"
                >
                  <option value="">Select a campaign</option>
                  {allCampaigns.map((campaign) => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input
                  type="text"
                  value={proofForm.title}
                  onChange={(e) => setProofForm({ ...proofForm, title: e.target.value })}
                  className="w-full bg-white/5 border border-white/30 text-white placeholder:text-white/70 p-3 rounded-lg focus:outline-none focus:border-emerald-300 focus:bg-white/10 transition"
                  placeholder="Proof title (e.g., 'Food Distribution Event')"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea
                  value={proofForm.description}
                  onChange={(e) => setProofForm({ ...proofForm, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/30 text-white placeholder:text-white/70 p-3 rounded-lg focus:outline-none focus:border-emerald-300 focus:bg-white/10 transition"
                  rows={4}
                  placeholder="Describe how the donations were used..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Image URL *</label>
                <input
                  type="url"
                  value={proofForm.imageUrl}
                  onChange={(e) => setProofForm({ ...proofForm, imageUrl: e.target.value })}
                  className="w-full bg-white/5 border border-white/30 text-white placeholder:text-white/70 p-3 rounded-lg focus:outline-none focus:border-emerald-300 focus:bg-white/10 transition"
                  placeholder="https://example.com/proof-image.jpg"
                />
                {proofForm.imageUrl && (
                  <img
                    src={proofForm.imageUrl}
                    alt="Preview"
                    className="mt-2 w-full h-48 object-cover rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSaveProof}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-green-400 hover:opacity-90 py-2 rounded-lg font-semibold shadow"
              >
                {editingProof ? "Update" : "Create"}
              </button>
              <button
                onClick={handleCloseProofModal}
                className="flex-1 bg-white/6 hover:opacity-90 py-2 rounded-lg shadow"
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
