import { Badge } from "@/components/ui/badge";

const planLabels: Record<string, string> = {
  starter: "Starter",
  pro: "Pro",
  enterprise: "Enterprise",
};

const PlanBadge = ({ plan }: { plan: string }) => {
  return (
    <Badge
      variant="secondary"
      className="text-xs font-semibold uppercase tracking-wider"
    >
      {planLabels[plan] || plan}
    </Badge>
  );
};

export default PlanBadge;
