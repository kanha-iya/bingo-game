import api from "./api";

export type UserProfile = {
  _id: string;
  email: string;
  username?: string;
  isSubscribed?: boolean;
  subscriptionExpiry?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export const getProfile = async (): Promise<UserProfile> => {
  const res = await api.get("/user/profile");
  return res.data;
};

export const updateProfile = async (
  payload: Partial<Pick<UserProfile, "username">>
): Promise<UserProfile> => {
  const res = await api.put("/user/profile", payload);
  return res.data;
};

export const getUserStats = async () => {
  const res = await api.get("/user/match-stats");

  return res.data.data;
};

export type MatchHistoryEntry = {
  gameId: string;
  status: string;
  result: string;
  createdAt: string;
  updatedAt: string;
  winner: { email?: string; username?: string } | null;
  opponents: { email?: string; username?: string }[];
  calledNumbers: number[];
};

export const getMatchHistory = async (): Promise<MatchHistoryEntry[]> => {
  const res = await api.get("/user/match-history");

  return res.data.data;
};