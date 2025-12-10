import { RequestStatus } from "@prisma/client";
import ApiError from "../../errors/ApiError";
import { IAuthUser } from "../../interfaces/common";
import { prisma } from "../../shared/prisma";
import { SendBuddyRequestInput } from "./buddy.interface";
import httpStatus from "http-status";

const sendBuddyRequest = async (
  user: IAuthUser,
  travelPlanId: string,
  message: string
) => {
  console.log({ travelPlanId });
  // Check if travel plan exists
  const travelPlanInfo = await prisma.travelPlan.findUniqueOrThrow({
    where: { id: travelPlanId },
  });

  //   check if Requester is valid
  const requesterInfo = await prisma.traveler.findUnique({
    where: {
      email: user?.email,
      isSubscribed: true,
      isDeleted: false,
    },
  });
  if (!requesterInfo) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "You are not subscribed user");
  }

  const requesterId = requesterInfo.id;
  // Check if user is trying to join their own plan
  if (travelPlanInfo.travelerId === requesterInfo.id) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You cannot send buddy request to your own travel plan"
    );
  }
  // Check if plan is already completed
  if (travelPlanInfo.isCompleted) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Cannot join a completed travel plan"
    );
  }
  // Check if already sent a request
  const existingRequest = await prisma.travelBuddyRequest.findUnique({
    where: {
      travelPlanId_requesterId: {
        travelPlanId,
        requesterId,
      },
    },
  });
  if (existingRequest) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You have already sent a request for this travel plan"
    );
  }

  // Check if already a buddy
  const existingBuddy = await prisma.travelBuddy.findUnique({
    where: {
      travelPlanId_buddyId: {
        travelPlanId,
        buddyId: requesterId,
      },
    },
  });

  if (existingBuddy) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You are already a buddy for this travel plan"
    );
  }
  // Create the buddy request
  const buddyRequest = await prisma.travelBuddyRequest.create({
    data: {
      travelPlanId,
      requesterId,
      message,
      status: RequestStatus.PENDING,
    },
    include: {
      travelPlan: {
        select: {
          id: true,
          destination: true,
          startDate: true,
          endDate: true,
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
      requester: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
        },
      },
    },
  });

  return buddyRequest;
};

// GET MY SENT REQUESTS
const getMySentRequests = async (user: IAuthUser) => {
  const traveler = await prisma.traveler.findUniqueOrThrow({
    where: { email: user?.email },
  });

  const requests = await prisma.travelBuddyRequest.findMany({
    where: { requesterId: traveler.id },
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
    },
    orderBy: { createdAt: "desc" },
  });

  return requests;
};

// ============================================
// GET RECEIVED REQUESTS (for my travel plans)
// ============================================
const getReceivedRequests = async (user: IAuthUser) => {
  const traveler = await prisma.traveler.findUniqueOrThrow({
    where: { email: user?.email },
  });

  const requests = await prisma.travelBuddyRequest.findMany({
    where: {
      travelPlan: {
        travelerId: traveler.id,
      },
    },
    include: {
      requester: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
          bio: true,
          averageRating: true,
          totalReviews: true,
          travelInterests: true,
          visitedCountries: true,
        },
      },
      travelPlan: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return requests;
};

// Get all buddy requests for a travel plan (Plan owner can see)
const getBuddyRequestsByPlan = async (
  user: IAuthUser,
  travelPlanId: string
) => {
  //   check user validation
  const userInfo = await prisma.traveler.findUnique({
    where: {
      email: user?.email,
    },
  });
  const userId = userInfo?.id;
  // Check if user is the owner of the travel plan
  const travelPlan = await prisma.travelPlan.findUnique({
    where: { id: travelPlanId },
  });

  if (!travelPlan) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Travel plan not found");
  }

  if (travelPlan.travelerId !== userId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Unauthorized: Only plan owner can view requests"
    );
  }

  const requests = await prisma.travelBuddyRequest.findMany({
    where: { travelPlanId },
    include: {
      requester: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
          averageRating: true,
          totalReviews: true,
          travelInterests: true,
          visitedCountries: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return requests;
};

// get Buddy request details by Id
const getBuddyRequestById = async (user: IAuthUser, buddyRequestId: string) => {
  // check user validation
  const userInfo = await prisma.traveler.findUnique({
    where: {
      email: user?.email,
    },
  });
  const userId = userInfo?.id;
  const request = await prisma.travelBuddyRequest.findUnique({
    where: { id: buddyRequestId },
    include: {
      travelPlan: {
        select: {
          id: true,
          destination: true,
          startDate: true,
          endDate: true,
          traveler: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      requester: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
        },
      },
    },
  });
  // console.log({ request });
  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, "Buddy request not found");
  }

  // Check authorization
  if (
    request.requesterId !== userId &&
    request.travelPlan.traveler.id !== userId
  ) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Unauthorized to view this request"
    );
  }

  return request;
};

// Accept Buddy Request
const acceptBuddyRequest = async (
  user: IAuthUser,
  buddyRequestId: string,
  status: RequestStatus
) => {
  // check user validation
  const userInfo = await prisma.traveler.findUnique({
    where: {
      email: user?.email,
    },
  });
  if (!userInfo) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User not found");
  }
  const userId = userInfo?.id;

  // Find the request with related data
  const request = await prisma.travelBuddyRequest.findUnique({
    where: { id: buddyRequestId },
    include: {
      travelPlan: {
        include: {
          traveler: true,
        },
      },
      requester: true,
    },
  });

  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, "Buddy request not found");
  }
  // Check if user is the owner of the travel plan
  if (request.travelPlan.travelerId !== userId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Only plan owner can update request status"
    );
  }

  // Check if request is already processed
  if (request.status !== RequestStatus.PENDING) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Request is already ${request.status.toLowerCase()}`
    );
  }
  // If accepting, check if plan is already completed
  if (status === RequestStatus.ACCEPTED && request.travelPlan.isCompleted) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Cannot accept requests for completed travel plans"
    );
  }
  let result: any;
  let rejectedCount = 0;

  // Start transaction
  await prisma.$transaction(async (tx) => {
    // Update the request status
    const updatedRequest = await tx.travelBuddyRequest.update({
      where: { id: buddyRequestId },
      data: { status },
      include: {
        travelPlan: true,
        requester: true,
      },
    });

    // If accepted, create travel buddy record
    if (status === RequestStatus.ACCEPTED) {
      // Create travel buddy record
      const travelBuddy = await tx.travelBuddy.create({
        data: {
          travelPlanId: request.travelPlanId,
          buddyId: request.requesterId,
          status: "ACTIVE",
          joinedAt: new Date(),
        },
        include: {
          buddy: {
            select: {
              id: true,
              name: true,
              email: true,
              profilePhoto: true,
              bio: true,
              averageRating: true,
            },
          },
          travelPlan: true,
        },
      });

      // Reject ALL OTHER pending requests for this plan
      const rejectionResult = await tx.travelBuddyRequest.updateMany({
        where: {
          travelPlanId: request.travelPlanId,
          id: { not: buddyRequestId },
          status: RequestStatus.PENDING,
        },
        data: { status: RequestStatus.REJECTED },
      });

      rejectedCount = rejectionResult.count;

      // Get details of rejected requests
      const rejectedRequests = await tx.travelBuddyRequest.findMany({
        where: {
          travelPlanId: request.travelPlanId,
          id: { not: buddyRequestId },
          status: RequestStatus.REJECTED,
        },
        include: {
          requester: {
            select: {
              id: true,
              name: true,
              email: true,
              profilePhoto: true,
              bio: true,
              averageRating: true,
            },
          },
        },
      });

      result = {
        acceptedRequest: updatedRequest,
        travelBuddy,
        rejected: {
          count: rejectedCount,
          requests: rejectedRequests.map((req) => ({
            id: req.id,
            user: req.requester,
            message: req.message,
          })),
        },
        message: `Accepted ${updatedRequest.requester.name}. Rejected ${rejectedCount} other pending request(s).`,
      };
    } else {
      result = {
        updatedRequest,
        message: `Request status updated to ${status}`,
      };
    }

    return result;
  });

  // Send notifications
  //   if (status === RequestStatus.ACCEPTED && result) {
  //     // ... notification code as above ...
  //   }

  return result;
};

export const BuddyRequestService = {
  sendBuddyRequest,
  getMySentRequests,
  getReceivedRequests,
  getBuddyRequestsByPlan,
  getBuddyRequestById,
  acceptBuddyRequest,
};
