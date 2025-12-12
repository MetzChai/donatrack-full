import axios from "axios";

/**
 * Get the base URL for API requests
 * 
 * Priority:
 * 1. NEXT_PUBLIC_API_URL environment variable (set in Vercel)
 * 2. In production without env var, throw error (must be configured)
 * 3. In development, default to localhost
 */
const getBaseURL = (): string => {
  // Check if NEXT_PUBLIC_API_URL is set (required for production)
  if (process.env.NEXT_PUBLIC_API_URL) {
    const url = process.env.NEXT_PUBLIC_API_URL.trim();
    // Remove trailing slash if present
    return url.endsWith('/') ? url.slice(0, -1) : url;
  }
  
  // In production, NEXT_PUBLIC_API_URL must be set
  if (process.env.NODE_ENV === 'production') {
    console.error(
      '❌ NEXT_PUBLIC_API_URL is not set! ' +
      'Please set this environment variable in Vercel to your backend API URL.'
    );
    // Fallback to empty string to prevent crashes, but requests will fail
    return '';
  }
  
  // Development default
  return 'http://localhost:4000';
};

export const API = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000, // 30 second timeout
});

// Add request interceptor for debugging
API.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      if (error.response.status === 404) {
        console.error(
          `❌ NOT_FOUND Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}\n` +
          `This usually means:\n` +
          `1. The backend API is not running or not accessible\n` +
          `2. NEXT_PUBLIC_API_URL is incorrect (current: ${getBaseURL()})\n` +
          `3. The API route doesn't exist on the backend`
        );
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error(
        `❌ Network Error: Could not reach backend API at ${getBaseURL()}\n` +
        `Please check:\n` +
        `1. Is the backend server running?\n` +
        `2. Is NEXT_PUBLIC_API_URL set correctly?\n` +
        `3. Are CORS settings configured on the backend?`
      );
    }
    return Promise.reject(error);
  }
);

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

export const getEndedCampaigns = async () => {
  try {
    console.log("Fetching ended campaigns from:", API.defaults.baseURL + "/campaigns/ended");
    const res = await API.get("/campaigns/ended");
    console.log("✓ Ended campaigns API response received");
    console.log("Response status:", res.status);
    console.log("Ended campaigns fetched:", res.data?.length || 0, "items");
    if (res.data && Array.isArray(res.data) && res.data.length > 0) {
      console.log("Sample ended campaign:", res.data[0]);
    } else if (res.data && !Array.isArray(res.data)) {
      console.warn("⚠ Response data is not an array:", typeof res.data, res.data);
    }
    return Array.isArray(res.data) ? res.data : [];
  } catch (err: any) {
    console.error("✗ Failed to fetch ended campaigns:", err);
    console.error("Error message:", err.message);
    console.error("Error response:", err.response?.data);
    console.error("Error status:", err.response?.status);
    return [];
  }
};

export const markCampaignAsImplemented = async (campaignId: string, token: string) => {
  try {
    const res = await API.patch(`/campaigns/${campaignId}/implemented`, {}, getAuthHeaders(token));
    return res.data;
  } catch (err: any) {
    console.error("Failed to mark campaign as implemented:", err);
    throw err.response?.data || err;
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

export const withdrawFunds = async (amount: number, token: string, campaignId?: string) => {
  try {
    const res = await API.post("/funds/withdraw", { amount, campaignId }, getAuthHeaders(token));
    return res.data;
  } catch (err: any) {
    console.error("Withdrawal failed:", err);
    // Extract error message from axios error response
    const errorData = err.response?.data || err;
    console.error("Error details:", errorData);
    throw errorData;
  }
};

export const getWithdrawals = async (token: string) => {
  try {
    const res = await API.get("/funds/withdrawals", getAuthHeaders(token));
    return res.data || [];
  } catch (err) {
    console.error("Failed to fetch withdrawals:", err);
    return [];
  }
};

export const getMyWithdrawals = async (token: string) => {
  try {
    const res = await API.get("/funds/withdrawals/my", getAuthHeaders(token));
    return res.data || [];
  } catch (err) {
    console.error("Failed to fetch my withdrawals:", err);
    return [];
  }
};

export const updateWithdrawalStatus = async (id: string, status: string, token: string) => {
  try {
    const res = await API.patch(`/funds/withdrawals/${id}/status`, { status }, getAuthHeaders(token));
    return res.data;
  } catch (err: any) {
    console.error("Failed to update withdrawal status:", err);
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

// Proof/Transparency APIs
export const getAllProofs = async () => {
  try {
    console.log("Fetching proofs from:", API.defaults.baseURL + "/proofs");
    const res = await API.get("/proofs");
    console.log("✓ Proofs API response received");
    console.log("Response status:", res.status);
    console.log("Proofs fetched:", res.data?.length || 0, "items");
    if (res.data && Array.isArray(res.data) && res.data.length > 0) {
      console.log("Sample proof:", res.data[0]);
    } else if (res.data && !Array.isArray(res.data)) {
      console.warn("⚠ Response data is not an array:", typeof res.data, res.data);
    }
    return Array.isArray(res.data) ? res.data : [];
  } catch (err: any) {
    console.error("✗ Failed to fetch proofs:", err);
    console.error("Error message:", err.message);
    console.error("Error response:", err.response?.data);
    console.error("Error status:", err.response?.status);
    console.error("Full error:", err);
    return [];
  }
};

export const getProofsByCampaign = async (campaignId: string) => {
  try {
    const res = await API.get(`/proofs/campaign/${campaignId}`);
    return res.data || [];
  } catch (err) {
    console.error("Failed to fetch proofs by campaign:", err);
    return [];
  }
};

export const createProof = async (data: any, token: string) => {
  try {
    console.log("Creating proof with data:", data);
    console.log("Using token:", token ? "Token present" : "No token");
    const res = await API.post("/proofs", data, getAuthHeaders(token));
    console.log("Proof created successfully:", res.data);
    return res.data;
  } catch (err: any) {
    console.error("Failed to create proof - Full error:", err);
    console.error("Error response:", err.response);
    console.error("Error data:", err.response?.data);
    throw err.response?.data || { error: err.message || "Failed to create proof" };
  }
};

export const updateProof = async (id: string, data: any, token: string) => {
  try {
    const res = await API.put(`/proofs/${id}`, data, getAuthHeaders(token));
    return res.data;
  } catch (err: any) {
    console.error("Failed to update proof:", err);
    throw err.response?.data || err;
  }
};

export const deleteProof = async (id: string, token: string) => {
  try {
    const res = await API.delete(`/proofs/${id}`, getAuthHeaders(token));
    return res.data;
  } catch (err: any) {
    console.error("Failed to delete proof:", err);
    throw err.response?.data || err;
  }
};
