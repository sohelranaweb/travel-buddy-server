import { TravelType } from "@prisma/client";

export type ITravelPlanFilterRequest = {
  searchTerm?: string | undefined;
  startDate?: string | undefined;
  endDate?: string | undefined;
  budgetMin?: string | undefined;
  budgetMax?: string | undefined;
  travelType?: string | undefined;
  isCompleted?: boolean | string;
};

export type ITravelPlan = {
  destination: string; // Country/City
  startDate: string;
  endDate: string;
  budgetMin: string;
  budgetMax: string;
  travelType: string;
  description: string;
};

export interface IUpdateTravelPlan {
  destination?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  budgetMin?: number;
  budgetMax?: number;
  travelType?: TravelType;
  description?: string;
}
