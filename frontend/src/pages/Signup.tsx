import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const plans = [
  { value: "starter", label: "Starter", desc: "Free — 1 site, 3 pages" },
  { value: "pro", label: "Pro", desc: "$29/mo — 5 sites, unlimited pages" },
  {
    value: "enterprise",
    label: "Enterprise",
    desc: "$99/mo — Unlimited everything",
  },
];

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("starter");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const fd = new FormData(e.currentTarget);
    const password = fd.get("password") as string;
    const confirmPassword = fd.get("confirmPassword") as string;

    // Client-side validation
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      await signup({
        name: fd.get("name") as string,
        email: fd.get("email") as string,
        orgName: fd.get("orgName") as string,
        plan: selectedPlan,
        password,
      });
      navigate("/dashboard");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Sign up failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-lg rounded-xl shadow-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            S
          </div>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>Start building your website today</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="orgName">Organization Name</Label>
              <Input
                id="orgName"
                name="orgName"
                required
                placeholder="Acme Corp"
                autoComplete="organization"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="John Smith"
                autoComplete="name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="john@acme.com"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                autoComplete="new-password"
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-3">
              <Label>Select Plan</Label>
              <div className="grid gap-3">
                {plans.map((plan) => (
                  <button
                    key={plan.value}
                    type="button"
                    onClick={() => setSelectedPlan(plan.value)}
                    className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${selectedPlan === plan.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                      }`}
                  >
                    <div
                      className={`h-4 w-4 rounded-full border-2 ${selectedPlan === plan.value
                          ? "border-primary bg-primary"
                          : "border-muted-foreground"
                        }`}
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {plan.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {plan.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account…" : "Create Account"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
