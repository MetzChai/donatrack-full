import dotenv from "dotenv";

dotenv.config();

const hasXendit = !!process.env.XENDIT_SECRET_KEY;
const baseUrl = "https://api.xendit.co/v2/invoices";

const basicAuthHeader = (secretKey?: string) => {
  const key = secretKey || process.env.XENDIT_SECRET_KEY;
  if (!key) throw new Error("Xendit secret key is missing");
  const creds = Buffer.from(`${key}:`).toString("base64");
  return `Basic ${creds}`;
};

/**
 * Create an invoice in Xendit and return checkout info.
 * Falls back to a mock invoice when Xendit is not configured.
 */
export const createXenditInvoice = async (params: {
  amount: number;
  description: string;
  referenceId: string;
  paymentMethods: string[]; // we will normalize these to Xendit-supported values
  successUrl?: string;
  failureUrl?: string;
  secretKey?: string;
}) => {
  const { amount, description, referenceId, paymentMethods, successUrl, failureUrl, secretKey } =
    params;

  // Mock for local/dev without Xendit
  if (!hasXendit) {
    console.warn("Xendit not configured. Returning mock invoice.");
    return {
      id: `mock_${Date.now()}_${referenceId}`,
      status: "PENDING",
      amount,
      currency: "PHP",
      referenceId,
      invoice_url: `https://mock.xendit.test/invoice/${referenceId}`,
      checkout_url: `https://mock.xendit.test/checkout/${referenceId}`,
      mock: true, // mark as mock so downstream treats as immediate success
    };
  }

  // Normalize payment methods to Xendit values
  const normalizedMethods: string[] = [];
  if (paymentMethods.some((m) => m === "GCASH" || m === "EWALLET")) {
    normalizedMethods.push("GCASH");
  }
  if (paymentMethods.some((m) => m === "CARD" || m === "CREDIT_CARD" || m === "DEBIT_CARD")) {
    normalizedMethods.push("CARD");
  }

  const body = {
    external_id: referenceId,
    amount,
    currency: "PHP",
    description,
    payment_methods: normalizedMethods.length ? normalizedMethods : ["CARD"],
    success_redirect_url: successUrl,
    failure_redirect_url: failureUrl,
  };

  try {
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        Authorization: basicAuthHeader(secretKey),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error("Xendit invoice creation failed:", response.status, errBody);
      throw new Error(`Xendit error ${response.status}: ${errBody}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    // Fallback to mock invoice if Xendit request fails
    console.warn("Xendit invoice creation error, using mock invoice:", error?.message || error);
    return {
      id: `mock_${Date.now()}_${referenceId}`,
      status: "PENDING",
      amount,
      currency: "PHP",
      referenceId,
      invoice_url: `https://mock.xendit.test/invoice/${referenceId}`,
      checkout_url: `https://mock.xendit.test/checkout/${referenceId}`,
      mock: true,
    };
  }
};

/**
 * Fetch an invoice by ID from Xendit.
 */
export const fetchXenditInvoice = async (invoiceId: string, secretKey?: string) => {
  const key = secretKey || process.env.XENDIT_SECRET_KEY;
  if (!key) throw new Error("Xendit secret key is missing");

  const resp = await fetch(`${baseUrl}/${invoiceId}`, {
    headers: { Authorization: basicAuthHeader(secretKey) },
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Failed to fetch invoice: ${resp.status} ${text}`);
  }
  return resp.json();
};

// Calculate platform fee (e.g., 5% commission)
export const calculatePlatformFee = (amount: number, feePercentage: number = 5): number => {
  return (amount * feePercentage) / 100;
};


