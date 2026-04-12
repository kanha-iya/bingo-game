import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { registerUser } from "@/services/auth.service";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      await registerUser(form);
      navigate("/login");
    } catch {
      alert("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col justify-center bg-zinc-950 px-4 py-10 sm:px-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 10% 30%, rgb(16 185 129 / 0.2), transparent 50%), radial-gradient(circle at 90% 10%, rgb(99 102 241 / 0.15), transparent 45%)",
        }}
      />
      <div className="relative mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-emerald-500 text-xl font-black text-zinc-950">
            B
          </div>
          <p className="text-sm font-medium uppercase tracking-widest text-zinc-500">
            Bingo
          </p>
        </div>

        <Card className="border-zinc-200/80 shadow-xl shadow-black/20">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-center text-2xl font-bold text-zinc-900">
              Create account
            </CardTitle>
            <p className="text-center text-sm text-zinc-500">
              Join and start playing in minutes
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="reg-username" className="text-sm font-medium text-zinc-700">
                  Username
                </label>
                <Input
                  id="reg-username"
                  name="username"
                  placeholder="Pick a username"
                  onChange={handleChange}
                  required
                  className="h-11"
                  autoComplete="username"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="reg-email" className="text-sm font-medium text-zinc-700">
                  Email
                </label>
                <Input
                  id="reg-email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  onChange={handleChange}
                  required
                  className="h-11"
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="reg-password" className="text-sm font-medium text-zinc-700">
                  Password
                </label>
                <Input
                  id="reg-password"
                  type="password"
                  name="password"
                  placeholder="At least 6 characters"
                  onChange={handleChange}
                  required
                  className="h-11"
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="reg-confirm"
                  className="text-sm font-medium text-zinc-700"
                >
                  Confirm password
                </label>
                <Input
                  id="reg-confirm"
                  type="password"
                  name="confirmPassword"
                  placeholder="Repeat password"
                  onChange={handleChange}
                  required
                  className="h-11"
                  autoComplete="new-password"
                />
              </div>
              <Button className="h-11 w-full bg-zinc-900 hover:bg-zinc-800" disabled={loading}>
                {loading ? "Creating account…" : "Register"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-zinc-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-emerald-700 underline-offset-4 hover:text-emerald-800 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
