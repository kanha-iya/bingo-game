import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { createSubscription } from "@/services/subscription.service";
import { useAuth } from "@/context/AuthContext";
import { Check } from "lucide-react";

const features = [
  "Swap 2 numbers on your board per match",
  "Priority matchmaking",
  "Exclusive subscriber badge",
  "Match history & stats",
];

const Subscription = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const subscriptionMutation = useMutation({
    mutationFn: () =>
      createSubscription({
        email: user?.email,
      }),
    onSuccess: () => {
      navigate("/dashboard", {
        state: {
          toast:
            "Subscription activated! You can now swap 2 numbers per match.",
        },
      });
    },
    onError: (err: Error) => {
      if (err.message === "Payment cancelled by user") return;
      alert(err.message || "Something went wrong. Please try again.");
    },
  });

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            Subscription
          </h2>
          <p className="mt-1 text-sm text-zinc-600 sm:text-base">
            Upgrade for number swap and more.
          </p>
        </div>

        <Card className="overflow-hidden border-2 border-zinc-900 shadow-lg">
          <CardHeader className="space-y-4 bg-zinc-950 px-5 py-6 text-white sm:px-8 sm:py-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">
                  Pro plan
                </p>
                <CardTitle className="mt-2 text-3xl font-bold sm:text-4xl">
                  ₹99
                  <span className="text-base font-normal text-zinc-400 sm:text-lg">
                    {" "}
                    / month
                  </span>
                </CardTitle>
              </div>
              <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-zinc-950">
                Best value
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 px-5 py-6 sm:px-8 sm:py-8">
            <ul className="space-y-3">
              {features.map((feature) => (
                <li key={feature} className="flex gap-3 text-sm sm:text-base">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white">
                    <Check className="size-3.5" strokeWidth={3} aria-hidden />
                  </span>
                  <span
                    className={
                      feature.includes("Swap 2")
                        ? "font-semibold text-zinc-900"
                        : "text-zinc-600"
                    }
                  >
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 sm:p-5">
              <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">
                Power feature
              </p>
              <p className="mt-1 font-bold text-zinc-900">Number swap</p>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600 sm:text-sm">
                Once per match, swap two numbers on your bingo board to shift
                the odds in your favour.
              </p>
            </div>

            <Button
              className="h-12 w-full bg-zinc-900 text-base hover:bg-zinc-800 sm:h-11"
              onClick={() => subscriptionMutation.mutate()}
              disabled={subscriptionMutation.isPending}
            >
              {subscriptionMutation.isPending
                ? "Processing…"
                : "Subscribe — ₹99/month"}
            </Button>

            <p className="text-center text-xs text-zinc-400">
              Secured by Razorpay · Cancel anytime
            </p>
          </CardContent>
        </Card>

        <div className="text-center">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="text-sm text-zinc-500 underline-offset-4 transition hover:text-zinc-900 hover:underline"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Subscription;
