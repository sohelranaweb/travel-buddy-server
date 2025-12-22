import { IAuthUser } from "../../interfaces/common";

import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { BuddyStatus } from "@prisma/client";
import { prisma } from "../../shared/prisma";

// ============================================
// CREATE REVIEW
// ============================================
const createReview = async (
  user: IAuthUser,
  travelBuddyId: string,
  payload: {
    rating: number;
    comment?: string;
  }
) => {
  const reviewer = await prisma.traveler.findUniqueOrThrow({
    where: { email: user?.email },
  });

  // Validate rating
  if (payload.rating < 1 || payload.rating > 5) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Rating must be between 1 and 5"
    );
  }

  // Get the travel buddy relationship with plan details
  const travelBuddy = await prisma.travelBuddy.findUnique({
    where: { id: travelBuddyId },
    include: {
      travelPlan: true,
      buddy: true,
    },
  });

  if (!travelBuddy) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Travel buddy relationship not found"
    );
  }

  // Check if trip is completed
  if (travelBuddy.status !== BuddyStatus.COMPLETED) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You can only review after the trip is completed"
    );
  }

  // Determine reviewee (who is being reviewed)
  let revieweeId: string;
  let revieweeName: string;

  // FIXED LOGIC: Check who the reviewer is
  if (reviewer.id === travelBuddy.travelPlan.travelerId) {
    // ✅ Plan Owner (Mizan) is reviewing the Buddy (Firoj)
    revieweeId = travelBuddy.buddyId;
    revieweeName = travelBuddy.buddy.name;
  } else if (reviewer.id === travelBuddy.buddyId) {
    // ✅ Buddy (Firoj) is reviewing the Plan Owner (Mizan)
    revieweeId = travelBuddy.travelPlan.travelerId;
    revieweeName = "Plan Owner"; // Will be fetched from DB
  } else {
    // ❌ Not part of this relationship
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You are not part of this travel relationship"
    );
  }

  // Check if already reviewed
  const existingReview = await prisma.review.findUnique({
    where: {
      travelBuddyId_reviewerId: {
        travelBuddyId,
        reviewerId: reviewer.id,
      },
    },
  });

  if (existingReview) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You have already reviewed this person for this trip"
    );
  }

  // Create review and update reviewee's rating
  const result = await prisma.$transaction(async (tx) => {
    // Create review
    const review = await tx.review.create({
      data: {
        travelBuddyId,
        reviewerId: reviewer.id,
        revieweeId,
        rating: payload.rating,
        comment: payload.comment,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true,
          },
        },
        reviewee: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true,
            averageRating: true,
            totalReviews: true,
          },
        },
        travelBuddy: {
          include: {
            travelPlan: {
              select: {
                id: true,
                destination: true,
                startDate: true,
                endDate: true,
              },
            },
          },
        },
      },
    });

    // Calculate new average rating for reviewee
    const allReviews = await tx.review.findMany({
      where: { revieweeId },
      select: { rating: true },
    });

    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / allReviews.length;

    // Update reviewee's rating
    await tx.traveler.update({
      where: { id: revieweeId },
      data: {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: allReviews.length,
      },
    });

    return review;
  });

  return result;
};

// ============================================
// GET MY REVIEWS (received)
// ============================================
const getMyReviews = async (user: IAuthUser) => {
  const traveler = await prisma.traveler.findUniqueOrThrow({
    where: { email: user?.email },
  });

  const reviews = await prisma.review.findMany({
    where: { revieweeId: traveler.id },
    include: {
      reviewer: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
        },
      },
      travelBuddy: {
        include: {
          travelPlan: {
            select: {
              destination: true,
              startDate: true,
              endDate: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return reviews;
};

// ============================================
// GET REVIEWS I GAVE
// ============================================
const getReviewsIGave = async (user: IAuthUser) => {
  const traveler = await prisma.traveler.findUniqueOrThrow({
    where: { email: user?.email },
  });

  const reviews = await prisma.review.findMany({
    where: { reviewerId: traveler.id },
    include: {
      reviewee: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
        },
      },
      travelBuddy: {
        include: {
          travelPlan: {
            select: {
              destination: true,
              startDate: true,
              endDate: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return reviews;
};

// ============================================
// GET PENDING REVIEWS (trips completed but not reviewed)
// ============================================
const getPendingReviews = async (user: IAuthUser) => {
  const traveler = await prisma.traveler.findUniqueOrThrow({
    where: { email: user?.email },
  });

  // Get all completed travel buddies where user is involved
  const completedBuddies = await prisma.travelBuddy.findMany({
    where: {
      OR: [
        { buddyId: traveler.id },
        { travelPlan: { travelerId: traveler.id } },
      ],
      status: BuddyStatus.COMPLETED,
    },
    include: {
      travelPlan: {
        include: {
          traveler: {
            select: {
              id: true,
              name: true,
              email: true,
              profilePhoto: true,
            },
          },
        },
      },
      buddy: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
        },
      },
      reviews: {
        where: { reviewerId: traveler.id },
      },
    },
  });

  // Filter only those not reviewed yet
  const pendingReviews = completedBuddies.filter(
    (buddy) => buddy.reviews.length === 0
  );

  return pendingReviews;
};

// const getPendingReviewAsHost = async (user: IAuthUser) => {
//   const travelBuddies = await prisma.travelBuddy.findMany({
//     where: {
//       travelPlan: {
//         traveler: {
//           email: user?.email,
//         },
//       },
//     },
//     include: {
//       travelPlan: {
//         include: {
//           traveler: {
//             select: {
//               id: true,
//               name: true,
//               email: true,
//               profilePhoto: true,
//             },
//           },
//         },
//       },
//       buddy: {
//         select: {
//           id: true,
//           name: true,
//           email: true,
//           profilePhoto: true,
//         },
//       },
//       reviews: true,
//     },
//     orderBy: {
//       createdAt: "desc",
//     },
//   });

//   return travelBuddies;
// };

const getPendingReviewAsHost = async (user: IAuthUser) => {
  const reviewer = await prisma.traveler.findUniqueOrThrow({
    where: { email: user?.email },
  });

  const travelBuddies = await prisma.travelBuddy.findMany({
    where: {
      travelPlan: {
        traveler: {
          email: user?.email,
        },
      },
      // Shudhu segulo nao jekhane host (reviewerId) tar buddy ke (revieweeId) review dey ni
      reviews: {
        none: {
          reviewerId: reviewer.id, // current user (host) as reviewer
          revieweeId: {
            not: reviewer.id, // buddy ke review dey ni (reviewee is not the host)
          },
        },
      },
    },
    include: {
      travelPlan: {
        include: {
          traveler: {
            select: {
              id: true,
              name: true,
              email: true,
              profilePhoto: true,
            },
          },
        },
      },
      buddy: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
        },
      },
      reviews: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return travelBuddies;
};

// const getPendingReviewAsBuddy = async (user: IAuthUser) => {
//   const travelBuddies = await prisma.travelBuddy.findMany({
//     where: {
//       buddy: {
//         email: user?.email,
//       },
//     },
//     include: {
//       travelPlan: {
//         include: {
//           traveler: {
//             select: {
//               id: true,
//               name: true,
//               email: true,
//               profilePhoto: true,
//             },
//           },
//         },
//       },
//       buddy: {
//         select: {
//           id: true,
//           name: true,
//           email: true,
//           profilePhoto: true,
//         },
//       },
//       reviews: true,
//     },
//     orderBy: {
//       createdAt: "desc",
//     },
//   });

//   return travelBuddies;
// };

const getPendingReviewAsBuddy = async (user: IAuthUser) => {
  const reviewer = await prisma.traveler.findUniqueOrThrow({
    where: { email: user?.email },
  });
  const travelBuddies = await prisma.travelBuddy.findMany({
    where: {
      buddy: {
        email: user?.email, // Current user as buddy
      },
      // Buddy (current user) host ke review dey ni
      NOT: {
        reviews: {
          some: {
            reviewerId: reviewer.id, // Current user (buddy) as reviewer
            revieweeId: {
              not: reviewer.id, // Reviewing the host (not self)
            },
          },
        },
      },
    },
    include: {
      travelPlan: {
        include: {
          traveler: {
            select: {
              id: true,
              name: true,
              email: true,
              profilePhoto: true,
            },
          },
        },
      },
      buddy: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
        },
      },
      reviews: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return travelBuddies;
};
// reviewee profile update
const createReviewAsHost = async (
  user: IAuthUser,
  travelBuddyId: string,
  payload: {
    rating: number;
    comment?: string;
  }
) => {
  const reviewer = await prisma.traveler.findUniqueOrThrow({
    where: { email: user?.email },
  });

  // Validate rating
  if (payload.rating < 1 || payload.rating > 5) {
    throw new ApiError(400, "Rating must be between 1 and 5");
  }

  // Find the travel buddy relationship
  const travelBuddy = await prisma.travelBuddy.findUnique({
    where: { id: travelBuddyId },
    include: {
      travelPlan: true,
      reviews: true,
    },
  });

  if (!travelBuddy) {
    throw new ApiError(404, "Travel buddy relationship not found");
  }

  // Check if the reviewer is the traveler (host)
  if (travelBuddy.travelPlan.travelerId !== reviewer.id) {
    throw new ApiError(
      403,
      "Only the traveler (host) can review their buddy using this endpoint"
    );
  }

  // Check if travel is completed
  if (travelBuddy.status !== "COMPLETED") {
    throw new ApiError(400, "Reviews can only be created for completed trips");
  }

  // Check if host has already reviewed this buddy
  const existingReview = travelBuddy.reviews.find(
    (review) =>
      review.reviewerId === reviewer.id &&
      review.revieweeId === travelBuddy.buddyId
  );

  if (existingReview) {
    throw new ApiError(
      409,
      "You have already reviewed this buddy for this trip"
    );
  }

  // Create review and update reviewee profile in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // 1. Create the review (Host reviewing Buddy)
    const review = await tx.review.create({
      data: {
        travelBuddyId: travelBuddyId,
        reviewerId: reviewer.id, // Host (Buty)
        revieweeId: travelBuddy.buddyId, // Buddy (Miza)
        rating: payload.rating,
        comment: payload.comment || "",
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true,
          },
        },
        reviewee: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true,
          },
        },
      },
    });

    // 2. Calculate new average rating and total reviews for the reviewee (Buddy)
    const stats = await tx.review.aggregate({
      where: {
        revieweeId: travelBuddy.buddyId, // Buddy যাকে review দেওয়া হয়েছে
      },
      _avg: {
        rating: true,
      },
      _count: {
        id: true,
      },
    });

    // 3. Update reviewee's (Buddy's) profile
    await tx.traveler.update({
      where: {
        id: travelBuddy.buddyId,
      },
      data: {
        totalReviews: stats._count.id,
        averageRating: Math.round((stats._avg.rating || 0) * 10) / 10, // 1 decimal place
      },
    });

    return review;
  });

  return result;
};

// const createReviewAsHost = async (
//   user: IAuthUser,
//   travelBuddyId: string,
//   payload: {
//     rating: number;
//     comment?: string;
//   }
// ) => {
//   const reviewer = await prisma.traveler.findUniqueOrThrow({
//     where: { email: user?.email },
//   });

//   // Validate rating
//   if (payload.rating < 1 || payload.rating > 5) {
//     throw new ApiError(400, "Rating must be between 1 and 5");
//   }

//   // Find the travel buddy relationship
//   const travelBuddy = await prisma.travelBuddy.findUnique({
//     where: { id: travelBuddyId },
//     include: {
//       travelPlan: true,
//       reviews: true,
//     },
//   });

//   if (!travelBuddy) {
//     throw new ApiError(404, "Travel buddy relationship not found");
//   }

//   // Check if the reviewer is the traveler (host)
//   if (travelBuddy.travelPlan.travelerId !== reviewer.id) {
//     throw new ApiError(
//       403,
//       "Only the traveler (host) can review their buddy using this endpoint"
//     );
//   }

//   // Check if travel is completed
//   if (travelBuddy.status !== "COMPLETED") {
//     throw new ApiError(400, "Reviews can only be created for completed trips");
//   }

//   // Check if host has already reviewed this buddy
//   const existingReview = travelBuddy.reviews.find(
//     (review) =>
//       review.reviewerId === reviewer.id &&
//       review.revieweeId === travelBuddy.buddyId
//   );

//   if (existingReview) {
//     throw new ApiError(
//       409,
//       "You have already reviewed this buddy for this trip"
//     );
//   }

//   // Create the review (Host reviewing Buddy)
//   const review = await prisma.review.create({
//     data: {
//       travelBuddyId: travelBuddyId,
//       reviewerId: reviewer.id, // Host (Buty)
//       revieweeId: travelBuddy.buddyId, // Buddy (Miza)
//       rating: payload.rating,
//       comment: payload.comment || "",
//     },
//     include: {
//       reviewer: {
//         select: {
//           id: true,
//           name: true,
//           email: true,
//           profilePhoto: true,
//         },
//       },
//       reviewee: {
//         select: {
//           id: true,
//           name: true,
//           email: true,
//           profilePhoto: true,
//         },
//       },
//     },
//   });
//   return review;
// };

// reviewee profile update
const createReviewAsBuddy = async (
  user: IAuthUser,
  travelBuddyId: string,
  payload: {
    rating: number;
    comment?: string;
  }
) => {
  const reviewer = await prisma.traveler.findUniqueOrThrow({
    where: { email: user?.email },
  });

  // Validate rating
  if (payload.rating < 1 || payload.rating > 5) {
    throw new ApiError(400, "Rating must be between 1 and 5");
  }

  // Find the travel buddy relationship
  const travelBuddy = await prisma.travelBuddy.findUnique({
    where: { id: travelBuddyId },
    include: {
      travelPlan: true,
      reviews: true,
    },
  });

  if (!travelBuddy) {
    throw new ApiError(404, "Travel buddy relationship not found");
  }

  // Check if the reviewer is the buddy
  if (travelBuddy.buddyId !== reviewer.id) {
    throw new ApiError(
      403,
      "Only the buddy can review the host using this endpoint"
    );
  }

  // Check if travel is completed
  if (travelBuddy.status !== "COMPLETED") {
    throw new ApiError(400, "Reviews can only be created for completed trips");
  }

  // Check if buddy has already reviewed this host
  const existingReview = travelBuddy.reviews.find(
    (review) =>
      review.reviewerId === reviewer.id &&
      review.revieweeId === travelBuddy.travelPlan.travelerId
  );

  if (existingReview) {
    throw new ApiError(
      409,
      "You have already reviewed this host for this trip"
    );
  }

  // Create review and update reviewee (Host) profile in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // 1. Create the review (Buddy reviewing Host)
    const review = await tx.review.create({
      data: {
        travelBuddyId: travelBuddyId,
        reviewerId: reviewer.id, // Buddy (Miza)
        revieweeId: travelBuddy.travelPlan.travelerId, // Host (Buty)
        rating: payload.rating,
        comment: payload.comment || "",
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true,
          },
        },
        reviewee: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true,
          },
        },
      },
    });

    // 2. Calculate new average rating and total reviews for the reviewee (Host)
    const stats = await tx.review.aggregate({
      where: {
        revieweeId: travelBuddy.travelPlan.travelerId, // Host যাকে review দেওয়া হয়েছে
      },
      _avg: {
        rating: true,
      },
      _count: {
        id: true,
      },
    });

    // 3. Update reviewee's (Host's) profile
    await tx.traveler.update({
      where: {
        id: travelBuddy.travelPlan.travelerId,
      },
      data: {
        totalReviews: stats._count.id,
        averageRating: Math.round((stats._avg.rating || 0) * 10) / 10, // 1 decimal place
      },
    });

    return review;
  });

  return result;
};

// const createReviewAsBuddy = async (
//   user: IAuthUser,
//   travelBuddyId: string,
//   payload: {
//     rating: number;
//     comment?: string;
//   }
// ) => {
//   const reviewer = await prisma.traveler.findUniqueOrThrow({
//     where: { email: user?.email },
//   });

//   // Validate rating
//   if (payload.rating < 1 || payload.rating > 5) {
//     throw new ApiError(400, "Rating must be between 1 and 5");
//   }

//   // Find the travel buddy relationship
//   const travelBuddy = await prisma.travelBuddy.findUnique({
//     where: { id: travelBuddyId },
//     include: {
//       travelPlan: true,
//       reviews: true,
//     },
//   });

//   if (!travelBuddy) {
//     throw new ApiError(404, "Travel buddy relationship not found");
//   }

//   // Check if the reviewer is the traveler (host)
//   if (travelBuddy.buddyId !== reviewer.id) {
//     throw new ApiError(
//       403,
//       "Only the buddy can review the host using this endpoint"
//     );
//   }

//   // Check if travel is completed
//   if (travelBuddy.status !== "COMPLETED") {
//     throw new ApiError(400, "Reviews can only be created for completed trips");
//   }

//   // Check if host has already reviewed this buddy
//   const existingReview = travelBuddy.reviews.find(
//     (review) =>
//       review.reviewerId === reviewer.id &&
//       review.revieweeId === travelBuddy.travelPlan.travelerId
//   );

//   if (existingReview) {
//     throw new ApiError(
//       409,
//       "You have already reviewed this host for this trip"
//     );
//   }

//   // Create the review (Buddy reviewing Host)
//   const review = await prisma.review.create({
//     data: {
//       travelBuddyId: travelBuddyId,
//       reviewerId: reviewer.id, // Buddy (Miza)
//       revieweeId: travelBuddy.travelPlan.travelerId, // Host (Buty)
//       rating: payload.rating,
//       comment: payload.comment || "",
//     },
//     include: {
//       reviewer: {
//         select: {
//           id: true,
//           name: true,
//           email: true,
//           profilePhoto: true,
//         },
//       },
//       reviewee: {
//         select: {
//           id: true,
//           name: true,
//           email: true,
//           profilePhoto: true,
//         },
//       },
//     },
//   });

//   return review;
// };

export const ReviewService = {
  createReview,
  createReviewAsHost,
  createReviewAsBuddy,
  getMyReviews,
  getReviewsIGave,
  getPendingReviews,
  getPendingReviewAsHost,
  getPendingReviewAsBuddy,
};
