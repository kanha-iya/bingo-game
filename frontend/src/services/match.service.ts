import api from "./api"

export const createMatch = async () => {
  const res = await api.post("/game/create")

  return res.data.data
}

export const joinMatch = async (roomId: string) => {
  const res = await api.post(`/game/join/${roomId}`)

  return res.data.data
}

export const getMatchLobby = async (roomId: string) => {

  const res = await api.get(`/match/lobby/${roomId}`)

  return res.data.data
}