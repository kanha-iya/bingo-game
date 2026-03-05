import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"

import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { getMatchLobby } from "@/services/match.service"

const MatchLobby = () => {

  const { roomId } = useParams()

  const { data, isLoading } = useQuery({
    queryKey: ["matchLobby", roomId],
    queryFn: () => getMatchLobby(roomId!),
    refetchInterval: 2000
  })

  if (isLoading) {
    return <DashboardLayout>Loading lobby...</DashboardLayout>
  }

  const lobby = data

  return (

    <DashboardLayout>

      <h1 className="text-3xl font-bold mb-6">
        Match Lobby
      </h1>

      {/* Room Info */}
      <Card className="mb-6">

        <CardHeader>
          <CardTitle>
            Room Code: {lobby.code}
          </CardTitle>
        </CardHeader>

        <CardContent>

          <Button
            onClick={() => navigator.clipboard.writeText(lobby.code)}
          >
            Copy Room Code
          </Button>

        </CardContent>

      </Card>

      {/* Players */}
      <Card>

        <CardHeader>
          <CardTitle>Players</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">

          {lobby.players.map((player: any) => (

            <div
              key={player._id}
              className="p-3 bg-gray-100 rounded-lg"
            >
              {player.name}
            </div>

          ))}

        </CardContent>

      </Card>

      {/* Start Game */}
      {lobby.isHost && (

        <div className="mt-6">

          <Button className="w-full">
            Start Match
          </Button>

        </div>

      )}

    </DashboardLayout>
  )
}

export default MatchLobby