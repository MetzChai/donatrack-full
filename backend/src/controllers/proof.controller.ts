import { Request, Response } from "express";
import prisma from "../services/prisma.service";

// Test function to verify Proof model is accessible
const testProofModel = async () => {
  try {
    const count = await prisma.proof.count();
    console.log("Proof model is accessible. Current count:", count);
    return { accessible: true, count };
  } catch (err: any) {
    console.error("Proof model test failed:", err);
    console.error("Error code:", err.code);
    console.error("Error message:", err.message);
    return { accessible: false, error: err.message, code: err.code };
  }
};

// Get all proofs (public)
export const getAllProofs = async (_req: Request, res: Response) => {
  try {
    console.log("=== getAllProofs called ===");
    let proofs: any[] = [];
    
    // First, check if Proof table exists and get count
    try {
      const count = await prisma.proof.count();
      console.log(`Proof table exists. Total proofs in database: ${count}`);
      
      if (count === 0) {
        console.log("No proofs found in database. Returning empty array.");
        return res.json([]);
      }
    } catch (countError: any) {
      console.error("Error counting proofs:", countError);
      // Continue to try fetching anyway
    }
    
    // Check if imageUrls column exists before attempting Prisma query
    let hasImageUrlsColumn = false;
    try {
      const columnCheck = await prisma.$queryRawUnsafe<any[]>(
        `SELECT column_name 
         FROM information_schema.columns 
         WHERE table_name = 'Proof' AND column_name = 'imageUrls'`
      );
      hasImageUrlsColumn = columnCheck && columnCheck.length > 0;
    } catch (checkError: any) {
      // If check fails, assume old schema and use raw SQL
      console.log("Could not check column existence, using raw SQL");
    }
    
    try {
      // Only try Prisma query if schema matches (imageUrls column exists)
      if (hasImageUrlsColumn) {
        proofs = await prisma.proof.findMany({
          include: {
            campaign: {
              select: {
                id: true,
                title: true,
                description: true,
                imageUrl: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        });
        console.log(`✓ Fetched ${proofs.length} proofs using Prisma query`);
      } else {
        // Schema mismatch - skip Prisma query and use raw SQL directly
        throw new Error("Schema mismatch - using raw SQL");
      }
    } catch (prismaError: any) {
      // If Prisma query fails or schema doesn't match, use raw SQL
      if (!hasImageUrlsColumn) {
        console.log("Using raw SQL due to schema mismatch (imageUrl vs imageUrls)");
      } else {
        console.warn("✗ Prisma query failed, trying raw SQL:", prismaError.message);
      }
      
      try {
        // Check which column exists and use appropriate query
        let rawProofs: any[];
        if (hasImageUrlsColumn) {
          // New schema: use imageUrls column
          rawProofs = await prisma.$queryRawUnsafe<any[]>(`
            SELECT 
              p.id,
              p.title,
              p.description,
              p."createdAt",
              p."updatedAt",
              p."campaignId",
              COALESCE(p."imageUrls", ARRAY[]::TEXT[]) as "imageUrls",
              c.id as "campaign_id",
              c.title as "campaign_title",
              c.description as "campaign_description",
              c."imageUrl" as "campaign_imageUrl"
            FROM "Proof" p
            LEFT JOIN "Campaign" c ON p."campaignId" = c.id
            ORDER BY p."createdAt" DESC
          `);
          console.log(`Raw SQL (imageUrls) returned ${rawProofs?.length || 0} rows`);
        } else {
          // Old schema: use imageUrl column and convert to array
          rawProofs = await prisma.$queryRawUnsafe<any[]>(`
            SELECT 
              p.id,
              p.title,
              p.description,
              p."createdAt",
              p."updatedAt",
              p."campaignId",
              CASE 
                WHEN p."imageUrl" IS NOT NULL THEN ARRAY[p."imageUrl"]
                ELSE ARRAY[]::TEXT[]
              END as "imageUrls",
              c.id as "campaign_id",
              c.title as "campaign_title",
              c.description as "campaign_description",
              c."imageUrl" as "campaign_imageUrl"
            FROM "Proof" p
            LEFT JOIN "Campaign" c ON p."campaignId" = c.id
            ORDER BY p."createdAt" DESC
          `);
          console.log(`Raw SQL (imageUrl) returned ${rawProofs?.length || 0} rows`);
        }
        
        proofs = (rawProofs || []).map((row: any) => ({
          id: row.id,
          title: row.title,
          description: row.description,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          campaignId: row.campaignId,
          // Handle both imageUrls (array) and imageUrl (string) formats
          imageUrls: row.imageUrls && Array.isArray(row.imageUrls) 
            ? row.imageUrls 
            : (row.imageUrl ? [row.imageUrl] : []),
          campaign: row.campaign_id ? {
            id: row.campaign_id,
            title: row.campaign_title,
            description: row.campaign_description,
            imageUrl: row.campaign_imageUrl,
          } : null,
        }));
        console.log(`✓ Fetched ${proofs.length} proofs using raw SQL`);
      } catch (sqlError: any) {
        console.error("✗ Raw SQL also failed:", sqlError.message);
        throw sqlError;
      }
    }
    
    // Transform proofs to ensure imageUrls format (backward compatibility)
    const transformedProofs = proofs.map((proof: any) => {
      if (proof.imageUrls && Array.isArray(proof.imageUrls)) {
        return proof; // Already in new format
      }
      // Legacy format - convert imageUrl to imageUrls array
      if (proof.imageUrl) {
        return { ...proof, imageUrls: [proof.imageUrl] };
      }
      return { ...proof, imageUrls: [] };
    });
    
    console.log(`✓ Returning ${transformedProofs.length} transformed proofs`);
    console.log("=== getAllProofs completed ===");
    return res.json(transformedProofs);
  } catch (err: any) {
    console.error("✗✗✗ Error fetching proofs:", err);
    console.error("Error details:", err.message, err.code, err.stack);
    return res.status(500).json({ 
      error: "Failed to fetch proofs",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
      count: 0
    });
  }
};

// Get proofs by campaign
export const getProofsByCampaign = async (req: Request, res: Response) => {
  try {
    const { campaignId } = req.params;
    const proofs = await prisma.proof.findMany({
      where: { campaignId },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    
    // Transform proofs to ensure imageUrls format (backward compatibility)
    const transformedProofs = proofs.map((proof: any) => {
      if (proof.imageUrls && Array.isArray(proof.imageUrls)) {
        return proof; // Already in new format
      }
      // Legacy format - convert imageUrl to imageUrls array
      if (proof.imageUrl) {
        return { ...proof, imageUrls: [proof.imageUrl] };
      }
      return { ...proof, imageUrls: [] };
    });
    
    return res.json(transformedProofs);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch proofs" });
  }
};

// Create proof (Admin only)
export const createProof = async (req: any, res: Response) => {
  try {
    // Test if Proof model is accessible
    const modelTest = await testProofModel();
    if (!modelTest.accessible) {
      return res.status(500).json({ 
        error: "Proof model is not accessible. Database may not be properly configured.",
        details: modelTest.error,
        code: modelTest.code,
        hint: "Run 'npx prisma migrate deploy' or 'npx prisma db push' to ensure the Proof table exists."
      });
    }

    console.log("Create proof request received:", req.body);
    console.log("User making request:", req.user);
    
    const { title, description, imageUrls, campaignId } = req.body;
    
    // Normalize imageUrls: accept string, string[], or undefined/null
    let normalizedImageUrls: string[] = [];
    if (imageUrls) {
      if (Array.isArray(imageUrls)) {
        normalizedImageUrls = imageUrls.filter(url => url && url.trim());
      } else if (typeof imageUrls === 'string') {
        normalizedImageUrls = imageUrls.split(',').map(url => url.trim()).filter(url => url);
      }
    }
    
    // Validate all required fields
    if (!title || !description || !campaignId) {
      console.log("Validation failed - missing fields:", { title: !!title, description: !!description, campaignId: !!campaignId });
      return res.status(400).json({ 
        error: "Missing required fields",
        missing: {
          title: !title,
          description: !description,
          campaignId: !campaignId
        }
      });
    }
    
    // Ensure at least one image URL is provided
    if (normalizedImageUrls.length === 0) {
      return res.status(400).json({ 
        error: "At least one image URL is required"
      });
    }

    // Verify campaign exists
    console.log("Checking campaign exists:", campaignId);
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });
    if (!campaign) {
      console.log("Campaign not found:", campaignId);
      return res.status(404).json({ error: "Campaign not found" });
    }
    console.log("Campaign found:", campaign.title);

    // Create proof
    console.log("Creating proof with data:", { title, description, imageUrls: normalizedImageUrls, campaignId });
    
    // Try creating with imageUrls first (new schema), fall back to imageUrl if needed
    let proof: any;
    try {
      proof = await prisma.proof.create({
        data: {
          title,
          description,
          imageUrls: normalizedImageUrls,
          campaignId,
        },
        include: {
          campaign: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });
    } catch (error: any) {
      // Check if it's a database column error or validation error
      const isColumnError = error.code === 'P2022' || 
                           error.message?.includes('imageUrls') || 
                           error.message?.includes('column') || 
                           error.message?.includes('does not exist') ||
                           error.message?.includes('Unknown argument');
      
      if (isColumnError) {
        console.warn("Database schema mismatch detected, using raw SQL with legacy imageUrl format");
        if (normalizedImageUrls.length === 0) {
          throw new Error("At least one image URL is required");
        }
        // Use raw SQL to insert with old imageUrl column
        // Generate a proper CUID-like ID
        const proofId = `proof_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        console.log("Attempting raw SQL insert with proofId:", proofId);
        
        try {
          // First, try with imageUrl column (old schema)
          await prisma.$executeRawUnsafe(
            `INSERT INTO "Proof" (id, title, description, "imageUrl", "campaignId", "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
            proofId,
            title,
            description,
            normalizedImageUrls[0],
            campaignId
          );
          console.log("Raw SQL insert successful with imageUrl column");
        } catch (sqlError: any) {
          console.error("Raw SQL insert with imageUrl failed:", sqlError);
          // Try with imageUrls column (new schema) - convert array to PostgreSQL array format
          try {
            const imageUrlsArray = `{${normalizedImageUrls.map(url => `"${url.replace(/"/g, '\\"')}"`).join(',')}}`;
            await prisma.$executeRawUnsafe(
              `INSERT INTO "Proof" (id, title, description, "imageUrls", "campaignId", "createdAt", "updatedAt")
               VALUES ($1, $2, $3, $4::text[], $5, NOW(), NOW())`,
              proofId,
              title,
              description,
              imageUrlsArray,
              campaignId
            );
            console.log("Raw SQL insert successful with imageUrls column");
          } catch (sqlError2: any) {
            console.error("Raw SQL insert with imageUrls also failed:", sqlError2);
            throw new Error(`Failed to create proof. Database schema issue: ${sqlError2.message}`);
          }
        }
        
        // Fetch the created proof with campaign info using raw query to avoid schema issues
        try {
          const fetchedProofs = await prisma.$queryRawUnsafe<any[]>(
            `SELECT p.*, c.id as "campaign_id", c.title as "campaign_title"
             FROM "Proof" p
             LEFT JOIN "Campaign" c ON p."campaignId" = c.id
             WHERE p.id = $1`,
            proofId
          );
          
          console.log("Fetched proofs:", fetchedProofs);
          
          if (fetchedProofs && fetchedProofs.length > 0) {
            const fetched = fetchedProofs[0];
            // Handle both imageUrl and imageUrls formats
            let imageUrlsArray = normalizedImageUrls;
            if (fetched.imageUrls && Array.isArray(fetched.imageUrls)) {
              imageUrlsArray = fetched.imageUrls;
            } else if (fetched.imageUrl) {
              imageUrlsArray = [fetched.imageUrl];
            }
            
            proof = {
              id: fetched.id,
              title: fetched.title,
              description: fetched.description,
              imageUrls: imageUrlsArray,
              campaignId: fetched.campaignId,
              createdAt: fetched.createdAt,
              updatedAt: fetched.updatedAt,
              campaign: fetched.campaign_id ? {
                id: fetched.campaign_id,
                title: fetched.campaign_title,
              } : null,
            };
            console.log("Proof constructed successfully:", proof.id);
          } else {
            throw new Error("Proof was created but could not be retrieved");
          }
        } catch (fetchError: any) {
          console.error("Error fetching created proof:", fetchError);
          throw new Error(`Proof may have been created but could not be retrieved: ${fetchError.message}`);
        }
      } else {
        throw error;
      }
    }
    
    // Ensure response includes campaign info if missing
    if (!proof) {
      throw new Error("Failed to create proof - proof object is null");
    }
    
    if (!proof.campaign) {
      console.log("Proof created but campaign info missing, fetching...");
      try {
        const fetchedProof = await prisma.proof.findUnique({
          where: { id: proof.id },
          include: {
            campaign: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        });
        if (fetchedProof) {
          proof = fetchedProof;
          // Ensure imageUrls is set
          if (!proof.imageUrls || !Array.isArray(proof.imageUrls)) {
            proof = { ...proof, imageUrls: (proof as any).imageUrl ? [(proof as any).imageUrl] : normalizedImageUrls };
          }
        }
      } catch (fetchErr: any) {
        console.warn("Could not fetch proof with campaign info, using raw query:", fetchErr.message);
        // Try raw query as fallback
        try {
          const rawProofs = await prisma.$queryRawUnsafe<any[]>(
            `SELECT p.*, c.id as "campaign_id", c.title as "campaign_title"
             FROM "Proof" p
             LEFT JOIN "Campaign" c ON p."campaignId" = c.id
             WHERE p.id = $1`,
            proof.id
          );
          if (rawProofs && rawProofs.length > 0) {
            const raw = rawProofs[0];
            proof = {
              ...proof,
              campaign: raw.campaign_id ? {
                id: raw.campaign_id,
                title: raw.campaign_title,
              } : null,
            };
          }
        } catch (rawErr) {
          console.error("Raw query also failed:", rawErr);
        }
      }
    }
    
    // Final validation
    if (!proof || !proof.id) {
      throw new Error("Failed to create proof - invalid proof object");
    }
    
    // Ensure imageUrls is always an array
    if (!proof.imageUrls || !Array.isArray(proof.imageUrls)) {
      proof = { ...proof, imageUrls: (proof as any).imageUrl ? [(proof as any).imageUrl] : normalizedImageUrls };
    }

    console.log("Proof created successfully:", proof.id, "with", proof.imageUrls?.length || 0, "images");
    return res.status(201).json(proof);
  } catch (err: any) {
    console.error("Error creating proof - Full error:", err);
    console.error("Error code:", err.code);
    console.error("Error meta:", err.meta);
    
    // Handle specific Prisma errors
    if (err.code === 'P2003') {
      return res.status(400).json({ 
        error: "Invalid campaign ID. Campaign does not exist.",
        details: err.meta
      });
    }
    
    if (err.code === 'P2025') {
      return res.status(404).json({ 
        error: "Record not found",
        details: err.meta
      });
    }

    // Return more detailed error message
    const errorMessage = err.message || "Failed to create proof";
    return res.status(500).json({ 
      error: errorMessage,
      code: err.code,
      details: process.env.NODE_ENV === "development" ? err.stack : undefined,
      meta: err.meta
    });
  }
};

// Update proof (Admin only)
export const updateProof = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, imageUrls, campaignId } = req.body;

    // Try to find proof using Prisma, fallback to raw SQL if needed
    let proof: any;
    try {
      proof = await prisma.proof.findUnique({ where: { id } });
    } catch (prismaError: any) {
      if (prismaError.code === 'P2022' || prismaError.message?.includes('imageUrls') || prismaError.message?.includes('column')) {
        // Use raw SQL to find proof (old schema with imageUrl)
        try {
          const rawProofs = await prisma.$queryRawUnsafe<any[]>(
            `SELECT * FROM "Proof" WHERE id = $1`,
            id
          );
          if (rawProofs && rawProofs.length > 0) {
            proof = rawProofs[0];
          } else {
            return res.status(404).json({ error: "Proof not found" });
          }
        } catch (sqlError: any) {
          console.error("Raw SQL find failed:", sqlError);
          return res.status(404).json({ error: "Proof not found" });
        }
      } else {
        throw prismaError;
      }
    }
    
    if (!proof) {
      return res.status(404).json({ error: "Proof not found" });
    }

    const updateData: any = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (imageUrls !== undefined) {
      // Normalize imageUrls: accept string, string[], or undefined/null
      let normalizedImageUrls: string[] = [];
      if (imageUrls) {
        if (Array.isArray(imageUrls)) {
          normalizedImageUrls = imageUrls.filter(url => url && url.trim());
        } else if (typeof imageUrls === 'string') {
          normalizedImageUrls = imageUrls.split(',').map(url => url.trim()).filter(url => url);
        }
      }
      if (normalizedImageUrls.length > 0) {
        updateData.imageUrls = normalizedImageUrls;
      } else {
        return res.status(400).json({ error: "At least one image URL is required" });
      }
    }
    if (campaignId) {
      // Verify campaign exists
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
      });
      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      updateData.campaignId = campaignId;
    }

    let updated: any;
    try {
      updated = await prisma.proof.update({
        where: { id },
        data: updateData,
        include: {
          campaign: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });
    } catch (error: any) {
      // If imageUrls column doesn't exist yet, use raw SQL
      if (error.code === 'P2022' || error.message?.includes('imageUrls') || error.message?.includes('column') || error.message?.includes('does not exist')) {
        console.warn("imageUrls column not found, using raw SQL with legacy imageUrl format");
        const legacyUpdateData: any = { ...updateData };
        let imageUrlValue = null;
        if (updateData.imageUrls && updateData.imageUrls.length > 0) {
          imageUrlValue = updateData.imageUrls[0];
        }
        
        // Build raw SQL update
        const updateFields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;
        
        if (legacyUpdateData.title !== undefined) {
          updateFields.push(`title = $${paramIndex}`);
          values.push(legacyUpdateData.title);
          paramIndex++;
        }
        if (legacyUpdateData.description !== undefined) {
          updateFields.push(`description = $${paramIndex}`);
          values.push(legacyUpdateData.description);
          paramIndex++;
        }
        if (imageUrlValue !== null) {
          updateFields.push(`"imageUrl" = $${paramIndex}`);
          values.push(imageUrlValue);
          paramIndex++;
        }
        if (legacyUpdateData.campaignId !== undefined) {
          updateFields.push(`"campaignId" = $${paramIndex}`);
          values.push(legacyUpdateData.campaignId);
          paramIndex++;
        }
        updateFields.push(`"updatedAt" = NOW()`);
        values.push(id);
        
        if (updateFields.length > 0) {
          const sql = `UPDATE "Proof" SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`;
          await prisma.$executeRawUnsafe(sql, ...values);
        }
        
        // Fetch the updated proof using raw SQL
        try {
          const fetchedProofs = await prisma.$queryRawUnsafe<any[]>(
            `SELECT p.*, c.id as "campaign_id", c.title as "campaign_title"
             FROM "Proof" p
             LEFT JOIN "Campaign" c ON p."campaignId" = c.id
             WHERE p.id = $1`,
            id
          );
          
          if (fetchedProofs && fetchedProofs.length > 0) {
            const fetched = fetchedProofs[0];
            updated = {
              id: fetched.id,
              title: fetched.title,
              description: fetched.description,
              createdAt: fetched.createdAt,
              updatedAt: fetched.updatedAt,
              campaignId: fetched.campaignId,
              imageUrls: fetched.imageUrl ? [fetched.imageUrl] : (updateData.imageUrls || []),
              campaign: fetched.campaign_id ? {
                id: fetched.campaign_id,
                title: fetched.campaign_title,
              } : null,
            };
          }
        } catch (fetchError: any) {
          console.error("Error fetching updated proof:", fetchError);
          // Return basic update confirmation even if fetch fails
          updated = {
            id,
            title: updateData.title || title,
            description: updateData.description || description,
            imageUrls: imageUrlValue ? [imageUrlValue] : (updateData.imageUrls || []),
            campaignId: updateData.campaignId || campaignId,
          } as any;
        }
      } else {
        throw error;
      }
    }
    
    // Ensure response has imageUrls format (backward compatibility)
    if (!updated.imageUrls || !Array.isArray(updated.imageUrls)) {
      const legacyImageUrl = (updated as any).imageUrl;
      updated = { ...updated, imageUrls: legacyImageUrl ? [legacyImageUrl] : [] };
    }

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update proof" });
  }
};

// Delete proof (Admin only)
export const deleteProof = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    // Try to find proof using Prisma, fallback to raw SQL if needed
    let proof: any;
    try {
      proof = await prisma.proof.findUnique({ where: { id } });
    } catch (prismaError: any) {
      if (prismaError.code === 'P2022' || prismaError.message?.includes('imageUrls') || prismaError.message?.includes('column')) {
        // Use raw SQL to check if proof exists (old schema with imageUrl)
        try {
          const rawProofs = await prisma.$queryRawUnsafe<any[]>(
            `SELECT id FROM "Proof" WHERE id = $1`,
            id
          );
          if (rawProofs && rawProofs.length > 0) {
            proof = rawProofs[0];
          } else {
            return res.status(404).json({ error: "Proof not found" });
          }
        } catch (sqlError: any) {
          console.error("Raw SQL find failed:", sqlError);
          return res.status(404).json({ error: "Proof not found" });
        }
      } else {
        throw prismaError;
      }
    }
    
    if (!proof) {
      return res.status(404).json({ error: "Proof not found" });
    }

    // Try to delete using Prisma, fallback to raw SQL if needed
    try {
      await prisma.proof.delete({ where: { id } });
    } catch (deleteError: any) {
      if (deleteError.code === 'P2022' || deleteError.message?.includes('imageUrls') || deleteError.message?.includes('column')) {
        // Use raw SQL to delete (old schema)
        await prisma.$executeRawUnsafe(
          `DELETE FROM "Proof" WHERE id = $1`,
          id
        );
      } else {
        throw deleteError;
      }
    }

    return res.json({ message: "Proof deleted successfully" });
  } catch (err: any) {
    console.error("Error deleting proof:", err);
    return res.status(500).json({ 
      error: "Failed to delete proof",
      details: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};

