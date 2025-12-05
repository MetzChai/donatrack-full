import axios from "axios";

export const API = axios.create({
  baseURL: "http://localhost:4000", // backend URL
});

// Add token to requests
const getAuthHeaders = (token?: string) => {
  if (token) {
    return { headers: { Authorization: `Bearer ${token}` } };
  }
  return {};
};

// Auth APIs
export const registerUser = async (data: any) => {
  try {
    const res = await API.post("/api/auth/v1/register", data);
    return res.data;
  } catch (err: any) {
    console.error("Registration failed:", err);
    throw err.response?.data || err;
  }
};

export const loginUser = async (data: any) => {
  try {
    const res = await API.post("/api/auth/v1/login", data);
    return res.data;
  } catch (err: any) {
    console.error("Login failed:", err);
    throw err.response?.data || err;
  }
};

export const forgotPassword = async (email: string) => {
  try {
    const res = await API.post("/api/auth/v1/forgot-password", { email });
    return res.data;
  } catch (err: any) {
    console.error("Forgot password failed:", err);
    throw err.response?.data || err;
  }
};

export const resetPassword = async (token: string, password: string) => {
  try {
    const res = await API.post("/api/auth/v1/reset-password", { token, password });
    return res.data;
  } catch (err: any) {
    console.error("Reset password failed:", err);
    throw err.response?.data || err;
  }
};

export const getCurrentUser = async (token: string) => {
  try {
    const res = await API.get("/api/auth/v1/me", getAuthHeaders(token));
    return res.data;
  } catch (err: any) {
    console.error("Failed to fetch current user:", err);
    throw err.response?.data || err;
  }
};

// Campaign APIs
export const getCampaigns = async () => {
  try {
    const res = await API.get("/campaigns");
    return res.data || [];
  } catch (err) {
    console.error("Failed to fetch campaigns:", err);
    return [];
  }
};

export const getCampaignById = async (id: string) => {
  try {
    const res = await API.get(`/campaigns/${id}`);
    return res.data;
  } catch (err) {
    console.error("Failed to fetch campaign:", err);
    return null;
  }
};

export const getMyCampaigns = async (token: string) => {
  try {
    const res = await API.get("/campaigns/my", getAuthHeaders(token));
    return res.data || [];
  } catch (err) {
    console.error("Failed to fetch my campaigns:", err);
    return [];
  }
};

export const createCampaign = async (data: any, token: string) => {
  try {
    const res = await API.post("/campaigns", data, getAuthHeaders(token));
    return res.data;
  } catch (err: any) {
    console.error("Failed to create campaign:", err);
    throw err.response?.data || err;
  }
};

export const updateCampaign = async (id: string, data: any, token: string) => {
  try {
    const res = await API.put(`/campaigns/${id}`, data, getAuthHeaders(token));
    return res.data;
  } catch (err: any) {
    console.error("Failed to update campaign:", err);
    throw err.response?.data || err;
  }
};

export const endCampaign = async (id: string, token: string) => {
  try {
    const res = await API.patch(`/campaigns/${id}/end`, {}, getAuthHeaders(token));
    return res.data;
  } catch (err: any) {
    console.error("Failed to end campaign:", err);
    throw err.response?.data || err;
  }
};

// Donation APIs
export const donateToCampaign = async (data: any, token: string) => {
  try {
    const res = await API.post("/donations", data, getAuthHeaders(token));
    return res.data;
  } catch (err: any) {
    console.error("Donation failed:", err);
    throw err.response?.data || err;
  }
};

export const getDonationLogs = async (campaignId: string) => {
  try {
    const res = await API.get(`/donations/campaign/${campaignId}`);
    return res.data || [];
  } catch (err) {
    console.error("Failed to fetch donation logs:", err);
    return [];
  }
};

export const getMyDonations = async (token: string) => {
  try {
    const res = await API.get("/donations/history", getAuthHeaders(token));
    return res.data || [];
  } catch (err) {
    console.error("Failed to fetch my donations:", err);
    return [];
  }
};

// Fund APIs
export const getMyFunds = async (token: string) => {
  try {
    const res = await API.get("/funds", getAuthHeaders(token));
    return res.data;
  } catch (err) {
    console.error("Failed to fetch funds:", err);
    return null;
  }
};

export const withdrawFunds = async (amount: number, token: string) => {
  try {
    const res = await API.post("/funds/withdraw", { amount }, getAuthHeaders(token));
    return res.data;
  } catch (err: any) {
    console.error("Withdrawal failed:", err);
    throw err.response?.data || err;
  }
};

export const updateXenditKeys = async (keys: any, token: string) => {
  try {
    const res = await API.put("/funds/xendit-keys", keys, getAuthHeaders(token));
    return res.data;
  } catch (err: any) {
    console.error("Failed to update Xendit keys:", err);
    throw err.response?.data || err;
  }
};

// Admin APIs
export const getUsers = async (token: string) => {
  try {
    const res = await API.get("/admin/users", getAuthHeaders(token));
    return res.data || [];
  } catch (err) {
    console.error("Failed to fetch users:", err);
    return [];
  }
};

export const getAdminStats = async (token: string) => {
  try {
    const res = await API.get("/admin/stats", getAuthHeaders(token));
    return res.data;
  } catch (err) {
    console.error("Failed to fetch admin stats:", err);
    return null;
  }
};

export const updateUserRole = async (userId: string, role: string, token: string) => {
  try {
    const res = await API.patch(`/admin/users/${userId}/role`, { role }, getAuthHeaders(token));
    return res.data;
  } catch (err: any) {
    console.error("Failed to update user role:", err);
    throw err.response?.data || err;
  }
};

export const deleteUser = async (userId: string, token: string) => {
  try {
    const res = await API.delete(`/admin/users/${userId}`, getAuthHeaders(token));
    return res.data;
  } catch (err: any) {
    console.error("Failed to delete user:", err);
    throw err.response?.data || err;
  }
};

export const getAllDonationsAdmin = async (_token: string) => {
  try {
    // For admins, aggregate donations across all campaigns using existing public endpoints.
    const campaigns = await getCampaigns();
    if (!campaigns.length) return [];

    const logsPerCampaign = await Promise.all(
      campaigns.map((c: any) => getDonationLogs(c.id))
    );

    const allLogs = logsPerCampaign.flat().map((log) => {
      const campaign = campaigns.find((c: any) => c.id === log.campaignId);
      return {
        ...log,
        campaignTitle: campaign?.title || "Unknown Campaign",
      };
    });

    return allLogs;
  } catch (err) {
    console.error("Failed to fetch all donations for admin:", err);
    return [];
  }
};

// Admin Campaign APIs
export const getActiveCampaigns = async (token: string) => {
  try {
    const res = await API.get("/admin/campaigns/active", getAuthHeaders(token));
    return res.data || [];
  } catch (err) {
    console.error("Failed to fetch active campaigns:", err);
    return [];
  }
};

export const getCampaignHistory = async (token: string) => {
  try {
    const res = await API.get("/admin/campaigns/history", getAuthHeaders(token));
    return res.data || [];
  } catch (err) {
    console.error("Failed to fetch campaign history:", err);
    return [];
  }
};

export const deleteCampaign = async (campaignId: string, token: string) => {
  try {
    const res = await API.delete(`/admin/campaigns/${campaignId}`, getAuthHeaders(token));
    return res.data;
  } catch (err: any) {
    console.error("Failed to delete campaign:", err);
    throw err.response?.data || err;
  }
};
