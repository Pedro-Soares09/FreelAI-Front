export type User = {
  id: string;
  name: string;
  email: string;
  verified: boolean;
};

export type Job = {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: string;
  status?: string;
};

export type Conversation = {
  id: string;
  participantIds: string[];
  lastMessage?: string;
};

export type Payment = {
  id: string;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "failed";
};
