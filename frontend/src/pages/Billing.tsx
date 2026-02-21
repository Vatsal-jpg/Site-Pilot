import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { planLimits } from "@/data/mockData";

const plans = [
  { key: "starter", name: "Starter", price: "Free", features: ["1 website", "3 pages/site", "500MB storage", "50 AI credits"] },
  { key: "pro", name: "Pro", price: "$29/mo", features: ["5 websites", "Unlimited pages", "5GB storage", "500 AI credits"], highlighted: true },
  { key: "enterprise", name: "Enterprise", price: "$99/mo", features: ["Unlimited websites", "Unlimited pages", "50GB storage", "Unlimited AI"] },
];

const Billing = () => {
  const { user } = useAuth();
  const currentPlan = user?.plan || "starter";
  const limits = planLimits[currentPlan];

  const usage = [
    { label: "Websites", used: 3, total: limits.websites, unit: "" },
    { label: "Storage", used: 1.2, total: limits.storage, unit: "GB" },
    { label: "AI Credits", used: 23, total: limits.aiCredits, unit: "" },
  ];

  return (
    <DashboardLayout>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Billing</h1>

      {/* Current Plan */}
      <Card className="mb-6 rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Current Plan</CardTitle>
          <CardDescription>You are on the <strong className="capitalize">{currentPlan}</strong> plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {usage.map((u) => (
              <div key={u.label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-muted-foreground">{u.label}</span>
                  <span className="font-medium text-foreground">
                    {u.used}{u.unit} / {u.total === Infinity ? "∞" : `${u.total}${u.unit}`}
                  </span>
                </div>
                <Progress value={u.total === Infinity ? 5 : (u.used / u.total) * 100} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <h2 className="mb-4 text-lg font-semibold text-foreground">Compare Plans</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.key} className={`rounded-xl shadow-sm ${plan.highlighted ? "border-2 border-primary" : ""}`}>
            <CardHeader>
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              <CardDescription className="text-xl font-bold text-foreground">{plan.price}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary" /> {f}
                  </li>
                ))}
              </ul>
              {currentPlan === plan.key ? (
                <Badge variant="secondary" className="w-full justify-center py-2">Current Plan</Badge>
              ) : (
                <Button variant={plan.highlighted ? "default" : "outline"} className="w-full">
                  Upgrade
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Billing;
