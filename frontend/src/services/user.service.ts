import api from "./api";

export const getUserStats = async () => {
  const res = await api.get("/user/match-stats");

  return res.data.data;
};