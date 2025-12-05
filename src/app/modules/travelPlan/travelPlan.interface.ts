interface CreateTravelPlanPayload {
  destination: string;
  startDate: Date;
  endDate: Date;
  budgetMin?: number;
  budgetMax?: number;
  travelType: "SOLO" | "FAMILY" | "FRIENDS";
  description?: string;
}
