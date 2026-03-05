import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { getUserStats } from "@/services/user.service"
import { useEffect, useState } from "react"

const Dashboard = () => {

    const [totalMatches, setTotalMatches] = useState(0)
    const [wins, setWins] = useState(0)
    const [losses, setLosses] = useState(0)

  const navigate = useNavigate()

  const { data : userStats, isLoading } = useQuery({
    queryKey: ["userStats"],
    queryFn: getUserStats,
    select: (data) => data,
  })
  console.log("User stats:", userStats)

  const stats = [
    {
      title: "Matches Played",
      value: totalMatches
    },
    {
      title: "Wins",
      value: wins
    },
    {
      title: "Losses",
      value: losses
    }
  ]

  const actions = [
    { title: "Play Match", path: "/play" },
    { title: "Get Subscription", path: "/subscription" },
    { title: "Match History", path: "/history" },
    { title: "Settings", path: "/settings" }
  ]
  useEffect(() => {
    if (userStats) {
        console.log("Fetched user stats:", userStats)
        setTotalMatches(userStats.totalMatches)
        setWins(userStats.wins)
        setLosses(userStats.losses)
    }
    }, [userStats])
  return (

    <DashboardLayout>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-10">

        {stats.map((item) => (

          <Card key={item.title}>

            <CardHeader>
              <CardTitle className="text-sm text-gray-500">
                {item.title}
              </CardTitle>
            </CardHeader>

            <CardContent>

              {isLoading ? (
                <p className="text-lg">Loading...</p>
              ) : (
                <p className="text-3xl font-bold">{item.value}</p>
              )}

            </CardContent>

          </Card>

        ))}

      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-4 gap-6">

        {actions.map((item) => (

          <Card
            key={item.title}
            className="cursor-pointer hover:shadow-lg transition"
            onClick={() => navigate(item.path)}
          >

            <CardContent className="flex items-center justify-center h-24 font-semibold">

              {item.title}

            </CardContent>

          </Card>

        ))}

      </div>

    </DashboardLayout>

  )
}

export default Dashboard