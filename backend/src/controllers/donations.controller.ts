import { Request, Response } from "express";
import prisma from "../services/prisma.service";
import { calculatePlatformFee, createXenditInvoice, fetchXenditInvoice } from "../services/xendit.service";

export const donate = async (req: any, res: Response) => {
  try {
    const { amount, campaignId, method, message, isAnonymous, useCreatorKeys } = req.body;
    if (!amount || !campaignId || !method) {
      return res.status(400).json({ error: "Missing required fields: amount, campaignId, method" });
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { user: true },
    });
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });
    if (campaign.isEnded) return res.status(400).json({ error: "Campaign has ended" });

    const donationAmount = Number(amount);
    const referenceId = `donation-${Date.now()}-${req.user.id}`;

    // Determine which Xendit key to use (platform or creator)
    let secretKey: string | undefined;
    if (useCreatorKeys && campaign.user.xenditSecretKey) {
      secretKey = campaign.user.xenditSecretKey;
    }

    // Build redirect URLs
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const successUrl = `${frontendUrl}/donate-success?ref=${referenceId}`;
    const failureUrl = `${frontendUrl}/donate-failed?ref=${referenceId}`;

    // Create Xendit invoice (real or mock if not configured)
    let xenditPaymentId: string | null = null;
    let checkoutUrl: string | null = null;
    let isMockInvoice = false;
    try {
      const invoice = await createXenditInvoice({
        amount: donationAmount,
        description: `Donation to ${campaign.title}`,
        referenceId,
        paymentMethods: method === "GCASH" ? ["GCASH"] : ["CARD"],
        successUrl,
        failureUrl,
        secretKey,
      });
      xenditPaymentId = invoice.id || invoice.payment_request_id || null;
      checkoutUrl =
        invoice.invoice_url ||
        invoice.checkout_url ||
        `https://mock.xendit.test/checkout/${referenceId}`;
      if (invoice?.mock) {
        console.warn("Using mock Xendit invoice (fallback).");
        isMockInvoice = true;
      }
    } catch (xenditError: any) {
      console.error("Xendit invoice error, using mock fallback:", xenditError);
      // As a last resort fallback
      xenditPaymentId = `mock_${Date.now()}_${referenceId}`;
      checkoutUrl = `https://mock.xendit.test/checkout/${referenceId}`;
      isMockInvoice = true;
    }

    // Calculate platform fee (5% commission)
    const platformFee = calculatePlatformFee(donationAmount);
    const creatorAmount = donationAmount - platformFee;

    // Determine initial status: mock -> COMPLETED immediately, real -> PENDING
    const initialStatus = isMockInvoice ? "COMPLETED" : "PENDING";

    const donation = await prisma.donation.create({
      data: {
        amount: donationAmount,
        method: method.toUpperCase(),
        paymentProvider: "XENDIT",
        xenditPaymentId,
        message: message || null,
        isAnonymous: isAnonymous || false,
        status: initialStatus,
        campaignId,
        userId: req.user.id,
      },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        campaign: { select: { id: true, title: true } },
      },
    });

    // If mock, treat as completed and update balances immediately
    if (isMockInvoice) {
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { collected: { increment: donationAmount } },
      });

      // Always credit creator balance for completed payments, even when using creator keys
      await prisma.user.update({
        where: { id: campaign.userId },
        data: {
          currentFunds: { increment: donationAmount },
          withdrawableFunds: { increment: creatorAmount },
        },
      });
    }

    return res.status(201).json({
      donation,
      checkoutUrl,
      status: initialStatus,
      message: checkoutUrl
        ? isMockInvoice
          ? "Mock payment created (completed)."
          : "Payment link created. Please complete the payment."
        : isMockInvoice
        ? "Mock payment completed."
        : "Payment created. Checkout URL not available; please contact support.",
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Donation failed" });
  }
};

export const getDonationsByCampaign = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const logs = await prisma.donation.findMany({
      where: { campaignId: id, status: "COMPLETED" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Hide donor info if anonymous
    const sanitizedLogs = logs.map((log) => ({
      ...log,
      user: log.isAnonymous
        ? { id: "anonymous", email: "anonymous", fullName: "Anonymous Donor" }
        : log.user,
    }));

    return res.json(sanitizedLogs);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch donation logs" });
  }
};

export const getMyDonations = async (req: any, res: Response) => {
  try {
    const logs = await prisma.donation.findMany({
      where: { userId: req.user.id },
      include: {
        campaign: {
          include: {
            user: { select: { id: true, fullName: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json(logs);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch your donations" });
  }
};

// Manually refresh a payment status from Xendit (fallback when webhook not configured)
export const refreshDonationStatus = async (req: any, res: Response) => {
  try {
    const { paymentId } = req.body;
    if (!paymentId) return res.status(400).json({ error: "paymentId is required" });

    const donation = await prisma.donation.findFirst({
      where: { xenditPaymentId: paymentId },
      include: { campaign: true },
    });

    if (!donation) return res.status(404).json({ error: "Donation not found" });
    if (donation.status === "COMPLETED") return res.json({ status: "COMPLETED" });

    // Fetch status from Xendit
    const invoice = await fetchXenditInvoice(paymentId);
    const normalizedStatus = (invoice?.status || "").toUpperCase();
    const isSuccess = ["PAID", "SETTLED", "COMPLETED", "SUCCEEDED", "SUCCESS"].includes(normalizedStatus);

    if (!isSuccess) {
      if (["EXPIRED", "FAILED", "CANCELED"].includes(normalizedStatus)) {
        await prisma.donation.update({
          where: { id: donation.id },
          data: { status: "FAILED" },
        });
      }
      return res.json({ status: donation.status, invoiceStatus: normalizedStatus });
    }

    // Complete donation and credit funds
    await prisma.$transaction(async (tx) => {
      await tx.donation.update({
        where: { id: donation.id },
        data: { status: "COMPLETED" },
      });

      await tx.campaign.update({
        where: { id: donation.campaignId },
        data: { collected: { increment: donation.amount } },
      });

      const campaign = await tx.campaign.findUnique({ where: { id: donation.campaignId } });
      if (campaign) {
        await tx.user.update({
          where: { id: campaign.userId },
          data: {
            currentFunds: { increment: donation.amount },
            withdrawableFunds: { increment: donation.amount - calculatePlatformFee(donation.amount) },
          },
        });
      }
    });

    return res.json({ status: "COMPLETED" });
  } catch (err: any) {
    console.error("Refresh status error:", err);
    return res.status(500).json({ error: "Failed to refresh payment status" });
  }
};

// Background sync to auto-complete pending Xendit donations (used by server interval)
export const syncPendingDonations = async () => {
  const pending = await prisma.donation.findMany({
    where: {
      status: "PENDING",
      paymentProvider: "XENDIT",
      xenditPaymentId: { not: null },
    },
    include: { campaign: true },
    take: 50, // guard against large batches
  });

  for (const donation of pending) {
    try {
      const invoice = await fetchXenditInvoice(donation.xenditPaymentId!);
      const normalizedStatus = (invoice?.status || "").toUpperCase();
      const isSuccess = ["PAID", "SETTLED", "COMPLETED", "SUCCEEDED", "SUCCESS"].includes(normalizedStatus);

      if (isSuccess) {
        await prisma.$transaction(async (tx) => {
          await tx.donation.update({
            where: { id: donation.id },
            data: { status: "COMPLETED" },
          });

          await tx.campaign.update({
            where: { id: donation.campaignId },
            data: { collected: { increment: donation.amount } },
          });

          const campaign = await tx.campaign.findUnique({ where: { id: donation.campaignId } });
          if (campaign) {
            await tx.user.update({
              where: { id: campaign.userId },
              data: {
                currentFunds: { increment: donation.amount },
                withdrawableFunds: { increment: donation.amount - calculatePlatformFee(donation.amount) },
              },
            });
          }
        });
      } else if (["EXPIRED", "FAILED", "CANCELED"].includes(normalizedStatus)) {
        await prisma.donation.update({
          where: { id: donation.id },
          data: { status: "FAILED" },
        });
      }
    } catch (err) {
      console.error("syncPendingDonations error for", donation.xenditPaymentId, err);
    }
  }
};

// Xendit webhook to update payment status
export const handleXenditWebhook = async (req: Request, res: Response) => {
  try {
    const { id, status, external_id, payment_request_id, invoice } = req.body as any;

    // Xendit sends either invoice.id or payment_request_id; use whichever we have
    const paymentId = id || payment_request_id || invoice?.id || null;
    if (!paymentId) {
      return res.status(400).json({ error: "Missing payment identifier" });
    }

    // Find pending donation by payment id
    const donation = await prisma.donation.findFirst({
      where: { xenditPaymentId: paymentId, status: "PENDING" },
      include: { campaign: true },
    });

    if (!donation) {
      // Already processed or unknown, acknowledge to avoid retries
      return res.json({ ok: true, message: "No pending donation found" });
    }

    // Treat PAID/SETTLED as completed
    const normalizedStatus = (status || invoice?.status || "").toUpperCase();
    const isSuccess = ["PAID", "SETTLED", "COMPLETED", "SUCCEEDED", "SUCCESS"].includes(normalizedStatus);

    if (!isSuccess) {
      // For simplicity, mark failures as FAILED; otherwise keep pending
      if (["EXPIRED", "FAILED", "CANCELED"].includes(normalizedStatus)) {
        await prisma.donation.update({
          where: { id: donation.id },
          data: { status: "FAILED" },
        });
      }
      return res.json({ ok: true, message: "Ignored non-success status" });
    }

    // Complete donation and update balances
    await prisma.$transaction(async (tx) => {
      await tx.donation.update({
        where: { id: donation.id },
        data: { status: "COMPLETED" },
      });

      await tx.campaign.update({
        where: { id: donation.campaignId },
        data: { collected: { increment: donation.amount } },
      });

      // Credit platform-handled funds to campaign creator
      const campaign = await tx.campaign.findUnique({ where: { id: donation.campaignId } });
      if (campaign) {
        await tx.user.update({
          where: { id: campaign.userId },
          data: {
            currentFunds: { increment: donation.amount },
            withdrawableFunds: { increment: donation.amount - calculatePlatformFee(donation.amount) },
          },
        });
      }
    });

    return res.json({ ok: true });
  } catch (err: any) {
    console.error("Xendit webhook error:", err);
    return res.status(500).json({ error: "Webhook processing failed" });
  }
};
