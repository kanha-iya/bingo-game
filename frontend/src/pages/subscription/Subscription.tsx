import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { createSubscription } from "@/services/subscription.service"
import { useAuth } from "@/context/AuthContext"

const features = [
  "Swap 2 numbers on your board per match",
  "Priority matchmaking",
  "Exclusive subscriber badge",
  "Match history & stats",
]

const Subscription = () => {
  const navigate = useNavigate()
  const { user } = useAuth() // provides user.name, user.email etc.

  const subscriptionMutation = useMutation({
    mutationFn: () =>
      createSubscription({
        email: user?.email,
      }),
    onSuccess: () => {
      navigate("/dashboard", {
        state: { toast: "Subscription activated! You can now swap 2 numbers per match." },
      })
    },
    onError: (err: Error) => {
      // Don't show an alert if user just closed the popup
      if (err.message === "Payment cancelled by user") return
      alert(err.message || "Something went wrong. Please try again.")
    },
  })

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto py-8">

        <h1 className="text-3xl font-bold mb-8">Subscription</h1>

        <Card className="border-2 border-black shadow-lg mb-6">
          <CardHeader className="bg-black text-white rounded-t-lg pb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Pro Plan</p>
                <CardTitle className="text-4xl font-bold text-white">
                  ₹99
                  <span className="text-base font-normal text-gray-400 ml-1">/ month</span>
                </CardTitle>
              </div>
              <div className="bg-white text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                Best Value
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <ul className="space-y-3 mb-8">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm">
                  <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-xs flex-shrink-0">
                    ✓
                  </span>
                  <span className={feature.includes("Swap 2") ? "font-semibold text-black" : "text-gray-600"}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Power Feature</p>
              <p className="font-bold text-black text-sm">Number Swap</p>
              <p className="text-gray-500 text-xs mt-1">
                Once per match, swap any 2 numbers on your bingo board to turn the game in your favour.
              </p>
            </div>

            <Button
              className="w-full"
              onClick={() => subscriptionMutation.mutate()}
              disabled={subscriptionMutation.isPending}
            >
              {subscriptionMutation.isPending ? "Processing..." : "Subscribe Now — ₹99/month"}
            </Button>

            <p className="text-center text-xs text-gray-400 mt-3">
              Secured by Razorpay · Cancel anytime
            </p>
          </CardContent>
        </Card>

        <div className="text-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm text-gray-500 hover:text-black transition underline underline-offset-2"
          >
            Back to Dashboard
          </button>
        </div>

      </div>
    </DashboardLayout>
  )
}

export default Subscription