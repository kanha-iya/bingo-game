import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { useMutation } from "@tanstack/react-query"

import { createMatch, joinMatch } from "@/services/match.service"

const PlayMatch = () => {

  const navigate = useNavigate()

  const [roomCode, setRoomCode] = useState("")

  const createMutation = useMutation({
    mutationFn: createMatch,
    onSuccess: (data) => {

      navigate(`/lobby/${data.roomId}`)

    }
  })

  const joinMutation = useMutation({
    mutationFn: joinMatch,
    onSuccess: (data) => {

      navigate(`/lobby/${data.roomId}`)

    }
  })

  const handleCreateMatch = () => {

    createMutation.mutate()

  }

  const handleJoinMatch = () => {

    if (!roomCode) return

    joinMutation.mutate(roomCode)

  }

  return (

    <DashboardLayout>

      <h1 className="text-3xl font-bold mb-8">
        Play Match
      </h1>

      <div className="grid grid-cols-2 gap-8">

        {/* Create Match */}
        <Card>

          <CardHeader>
            <CardTitle>Create New Match</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">

            <p className="text-sm text-gray-500">
              Start a new Bingo match and invite friends.
            </p>

            <Button
              className="w-full"
              onClick={handleCreateMatch}
              disabled={createMutation.isPending}
            >

              {createMutation.isPending ? "Creating..." : "Create Match"}

            </Button>

          </CardContent>

        </Card>

        {/* Join Match */}
        <Card>

          <CardHeader>
            <CardTitle>Join Match</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">

            <Input
              placeholder="Enter Room Code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
            />

            <Button
              className="w-full"
              onClick={handleJoinMatch}
              disabled={joinMutation.isPending}
            >

              {joinMutation.isPending ? "Joining..." : "Join Match"}

            </Button>

          </CardContent>

        </Card>

      </div>

    </DashboardLayout>
  )
}

export default PlayMatch