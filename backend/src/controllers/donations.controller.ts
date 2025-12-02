import { Request, Response } from "express";
import prisma from "../services/prisma.service";
import { createPayment, calculatePlatformFee } from "../services/xendit.service";

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

    // Determine which Xendit keys to use
    let secretKey: string | undefined;
    if (useCreatorKeys && campaign.user.xenditSecretKey) {
      secretKey = campaign.user.xenditSecretKey;
    }

    // Create Xendit payment
    let xenditPaymentId: string | null = null;
    try {
      const payment = await createPayment(
        donationAmount,
        method,
        referenceId,
        `Donation to ${campaign.title}`,
        secretKey
      );
      xenditPaymentId = payment.id;
    } catch (xenditError: any) {
      console.error("Xendit payment error:", xenditError);
      return res.status(400).json({ error: `Payment processing failed: ${xenditError.message}` });
    }

    // Calculate platform fee (5% commission)
    const platformFee = calculatePlatformFee(donationAmount);
    const creatorAmount = donationAmount - platformFee;

    // Create donation record
    const donation = await prisma.donation.create({
      data: {
        amount: donationAmount,
        method: method.toUpperCase(),
        paymentProvider: "XENDIT",
        xenditPaymentId,
        message: message || null,
        isAnonymous: isAnonymous || false,
        status: "COMPLETED",
        campaignId,
        userId: req.user.id,
      },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        campaign: { select: { id: true, title: true } },
      },
    });

    // Update campaign collected amount
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { collected: { increment: donationAmount } },
    });

    // Handle fund distribution based on payment method
    if (useCreatorKeys && campaign.user.xenditSecretKey) {
      // Option 1: Creator's own Xendit keys - funds go directly to creator
      // Platform fee is deducted automatically via Xendit
    } else {
      // Option 2: Platform-handled funds
      // Add to creator's current funds (withdrawable after platform fee)
      await prisma.user.update({
        where: { id: campaign.userId },
        data: {
          currentFunds: { increment: donationAmount },
          withdrawableFunds: { increment: creatorAmount },
        },
      });
    }

    return res.status(201).json(donation);
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
