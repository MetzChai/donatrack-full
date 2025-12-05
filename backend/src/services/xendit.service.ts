import dotenv from "dotenv";

dotenv.config();

// Try to import Xendit SDK, but make it optional for local/dev without payments
let Xendit: any;
try {
  Xendit = require("xendit-node").default || require("xendit-node");
} catch (e) {
  console.warn("Xendit package not installed. Payment processing will be mocked.");
  Xendit = null;
}

// Initialize Xendit with platform keys (for Option 2 - Platform-handled)
let xenditClient: any = null;
if (Xendit && process.env.XENDIT_SECRET_KEY) {
  try {
    xenditClient = new Xendit({
      secretKey: process.env.XENDIT_SECRET_KEY,
    });
  } catch (e) {
    console.warn("Failed to initialize Xendit client:", e);
  }
}

// For Option 1 - Campaign creator's own Xendit keys
export const createXenditClient = (secretKey: string) => {
  if (!Xendit) {
    throw new Error("Xendit package not installed");
  }
  return new Xendit({ secretKey });
};

// Create payment using Xendit
export const createPayment = async (
  amount: number,
  paymentMethod: string,
  referenceId: string,
  description: string,
  secretKey?: string
) => {
  // If Xendit is not available, return a mock payment response
  if (!Xendit) {
    console.warn("Xendit not configured. Returning mock payment response.");
    return {
      id: `mock_${Date.now()}_${referenceId}`,
      status: "PENDING",
      amount,
      currency: "PHP",
      referenceId,
    };
  }

  try {
    const client = secretKey ? createXenditClient(secretKey) : xenditClient;
    if (!client) {
      throw new Error("Xendit client not initialized");
    }

    const { PaymentRequest } = client;

    const paymentRequest = await PaymentRequest.create({
      data: {
        amount,
        currency: "PHP",
        paymentMethod: {
          type: paymentMethod === "GCASH" ? "EWALLET" : "CREDIT_CARD",
          ewallet: paymentMethod === "GCASH" ? { channelCode: "GCASH" } : undefined,
        },
        referenceId,
        description,
        metadata: {
          referenceId,
        },
      },
    });

    return paymentRequest;
  } catch (error: any) {
    console.error("Xendit payment creation error:", error);
    throw new Error(error.message || "Payment creation failed");
  }
};

// Verify payment status
export const verifyPayment = async (paymentId: string, secretKey?: string) => {
  // If Xendit is not available, return a mock payment response
  if (!Xendit) {
    console.warn("Xendit not configured. Returning mock payment verification.");
    return {
      id: paymentId,
      status: "COMPLETED",
    };
  }

  try {
    const client = secretKey ? createXenditClient(secretKey) : xenditClient;
    if (!client) {
      throw new Error("Xendit client not initialized");
    }

    const { PaymentRequest } = client;

    const payment = await PaymentRequest.getById({ paymentRequestId: paymentId });
    return payment;
  } catch (error: any) {
    console.error("Xendit payment verification error:", error);
    throw new Error(error.message || "Payment verification failed");
  }
};

// Calculate platform fee (e.g., 5% commission)
export const calculatePlatformFee = (amount: number, feePercentage: number = 5): number => {
  return (amount * feePercentage) / 100;
};


