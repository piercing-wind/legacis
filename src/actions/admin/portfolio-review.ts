"use server";

import { db } from "@/lib/db";
import { PortfolioReviewStatus } from "@/prisma/generated/client";
import { extractFileKeyFromUrl } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { deleteS3File } from "../aws-s3";
import { sendMail } from "@/emails/sendmail";


// --- Helper Functions ---

async function removeFileFromS3(url?: string) {
  if (!url) return;
  try {
    const fileKey = extractFileKeyFromUrl(url);
    await deleteS3File(fileKey);
  } catch (error) {
    console.error("Error deleting S3 file:", error);
    // Continue even if S3 deletion fails
  }
}

// --- Main Actions ---

export async function updatePortfolioReviewStatus(
  portfolioReviewId: string,
  status: PortfolioReviewStatus
) {
  try {
    const updatedReview = await db.portfolioReview.update({
      where: { id: portfolioReviewId },
      data: { status },
    });
    revalidatePath("/admin/portfolio-reviews");
    return { success: true, data: updatedReview };
  } catch (error) {
    console.error("Error updating portfolio review status:", error);
    return { success: false, error: "Failed to update portfolio review status" };
  }
}



export async function updatePortfolioReviewFile(
  portfolioReviewId: string,
  userPurchasedServiceId: string,
  fileUrl: string,
  fileName: string
) {
  try {
    const updatedReview = await db.$transaction(async (tx) => {
      // Update portfolio review with file info and mark as completed
      const review = await tx.portfolioReview.update({
        where: { id: portfolioReviewId },
        data: {
          reviewedFileUrl: fileUrl,
          reviewedFileName: fileName,
          status: PortfolioReviewStatus.COMPLETED,
        },
      });

      // Mark userPurchasedService as inactive and fetch related info
      const updatedService = await tx.userPurchasedServices.update({
        where: { id: userPurchasedServiceId },
        data: { isActive: false },
        include: {
          user: { select: { email: true, name: true } },
          service: true,
          servicePlan: true
        },
      });

      // Send notification email
      const stocks = (updatedService.servicePlan?.stockLimit);
      // await sendMail({
      //   to: updatedService.user.email,
      //   subject: `Portfolio Review for ${stocks} Stocks is ready`,
      //   template: "serviceUpdate",
      //   context: {
      //     name: updatedService.user.name || updatedService.user.email,
      //     serviceName: updatedService.service?.name || "Service",
      //     dashboardUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
      //     title: `Legacis Capital - Portfolio Review ${stocks} Stocks is ready`,
      //     year: new Date().getFullYear(),
      //   },
      // });
      return review; // <-- return the updated review
    });
   


    revalidatePath("/admin/portfolio-reviews");
    return { success: true, data: updatedReview };
  } catch (error) {
    console.error("Error updating portfolio review file:", error);
    return { 
      success: false, 
      error: "Failed to update portfolio review file" 
    };
  }
}

export async function deleteUserUploadedFile(portfolioReviewId: string) {
  try {
    const portfolioReview = await db.portfolioReview.findUnique({
      where: { id: portfolioReviewId },
    });

    if (!portfolioReview) {
      return { success: false, error: "Portfolio review not found" };
    }

    // Delete file from S3 if it exists
    if (portfolioReview.uploadedFileUrl) {
      try {
        const fileKey = extractFileKeyFromUrl(portfolioReview.uploadedFileUrl);
        await deleteS3File(fileKey);
      } catch (error) {
        console.error("Error deleting S3 file:", error);
        // Continue with DB update even if S3 deletion fails
      }
    }

    // Update database to remove file references
    const updatedReview = await db.portfolioReview.update({
      where: { id: portfolioReviewId },
      data: {
        uploadedFileUrl: null,
        uploadedFileName: null,
        status: PortfolioReviewStatus.PENDING_UPLOAD,
      },
    });

    revalidatePath("/admin/portfolio-reviews");
    return { success: true, data: updatedReview };
  } catch (error) {
    console.error("Error deleting user file:", error);
    return { 
      success: false, 
      error: "Failed to delete user file" 
    };
  }
}

export async function deleteReviewedFile(portfolioReviewId: string) {
  try {
    const portfolioReview = await db.portfolioReview.findUnique({
      where: { id: portfolioReviewId },
    });

    if (!portfolioReview) {
      return { success: false, error: "Portfolio review not found" };
    }

    // Delete file from S3 if it exists
    if (portfolioReview.reviewedFileUrl) {
      try {
        const fileKey = extractFileKeyFromUrl(portfolioReview.reviewedFileUrl);
        await deleteS3File(fileKey);
      } catch (error) {
        console.error("Error deleting S3 file:", error);
        // Continue with DB update even if S3 deletion fails
      }
    }

    // Update database to remove reviewed file references
    const updatedReview = await db.portfolioReview.update({
      where: { id: portfolioReviewId },
      data: {
        reviewedFileUrl: null,
        reviewedFileName: null,
      },
    });

    revalidatePath("/admin/portfolio-reviews");
    return { success: true, data: updatedReview };
  } catch (error) {
    console.error("Error deleting reviewed file:", error);
    return { 
      success: false, 
      error: "Failed to delete reviewed file" 
    };
  }
}