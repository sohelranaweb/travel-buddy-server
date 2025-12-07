export interface CreateSubscriptionInput {
  name: string;
  price: number;
  durationInDays: number;
  features: string[];
  recommended: boolean;
  color: string;
}
