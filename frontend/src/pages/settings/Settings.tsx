import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getProfile, updateProfile } from "@/services/user.service";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [username, setUsername] = useState("");

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  useEffect(() => {
    if (profile?.username != null) {
      setUsername(profile.username);
    }
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: () => updateProfile({ username: username.trim() }),
    onSuccess: (data) => {
      queryClient.setQueryData(["profile"], data);
      updateUser({
        id: user?.id ?? data._id,
        email: data.email,
        username: data.username,
      });
    },
    onError: (err: Error) => {
      alert(err.message || "Could not save profile.");
    },
  });

  const subscriptionActive =
    profile?.isSubscribed &&
    (!profile.subscriptionExpiry ||
      new Date(profile.subscriptionExpiry) > new Date());

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            Settings
          </h2>
          <p className="mt-1 text-sm text-zinc-600 sm:text-base">
            Account details and subscription status.
          </p>
        </div>

        {isLoading && (
          <p className="text-sm text-zinc-600">Loading your settings…</p>
        )}

        {isError && (
          <p className="text-sm text-red-600">
            Something went wrong loading your profile. Try refreshing the page.
          </p>
        )}

        {profile && (
          <div className="space-y-6">
            <Card className="border-zinc-200/80 shadow-sm">
              <CardHeader className="border-b border-zinc-100 bg-zinc-50/50">
                <CardTitle className="text-lg">Account</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <label
                    htmlFor="settings-email"
                    className="mb-1 block text-sm font-medium text-zinc-700"
                  >
                    Email
                  </label>
                  <Input
                    id="settings-email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="bg-zinc-100 text-zinc-600"
                  />
                  <p className="mt-1 text-xs text-zinc-500">
                    Email cannot be changed here.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="settings-username"
                    className="mb-1 block text-sm font-medium text-zinc-700"
                  >
                    Display name
                  </label>
                  <Input
                    id="settings-username"
                    name="username"
                    autoComplete="username"
                    placeholder="Your name or nickname"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                <Button
                  type="button"
                  disabled={saveMutation.isPending}
                  onClick={() => saveMutation.mutate()}
                  className="bg-black text-white hover:bg-black/90"
                >
                  {saveMutation.isPending ? "Saving…" : "Save changes"}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-zinc-200/80 shadow-sm">
              <CardHeader className="border-b border-zinc-100 bg-zinc-50/50">
                <CardTitle className="text-lg">Subscription</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <p className="text-sm text-zinc-700">
                  {subscriptionActive ? (
                    <span>
                      You have an active subscription
                      {profile.subscriptionExpiry
                        ? ` until ${new Intl.DateTimeFormat(undefined, {
                            dateStyle: "medium",
                          }).format(new Date(profile.subscriptionExpiry))}`
                        : ""}
                      .
                    </span>
                  ) : (
                    "You are on the free plan. Upgrade to unlock number swap and other perks."
                  )}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="border-zinc-900"
                  onClick={() => navigate("/subscription")}
                >
                  {subscriptionActive ? "Manage subscription" : "View plans"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Settings;
