import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { mockProjects, planLimits } from "@/data/mockData";
import { Link } from "react-router-dom";
import {
  Plus,
  ExternalLink,
  Pencil,
  Eye,
  FolderOpen,
  FileText,
  HardDrive,
  Sparkles,
  Calendar,
  ChevronDown,
  Users,
  Rocket,
} from "lucide-react";

// ── Types for future backend integration ──────────────────────────────

interface DashboardStats {
  projects: { current: number; limit: number; trend: number };
  pages: { total: number; newCount: number };
  storage: { usedGB: number; limitGB: number; percentUsed: number };
  aiCredits: { used: number; limit: number; resetDays: number };
}

interface ActivityItem {
  id: string;
  type: "published" | "team" | "ai";
  title: string;
  subtitle: string;
  time: string;
  avatar?: string;
}

// ── Mock data (replace with API calls later) ──────────────────────────

const getStats = (plan: string): DashboardStats => {
  const limits = planLimits[plan as keyof typeof planLimits] || planLimits.starter;
  return {
    projects: { current: mockProjects.length, limit: limits.websites === Infinity ? 999 : limits.websites, trend: 12 },
    pages: { total: 15, newCount: 5 },
    storage: { usedGB: 1.2, limitGB: limits.storage, percentUsed: 20 },
    aiCredits: { used: 23, limit: limits.aiCredits === Infinity ? 999 : limits.aiCredits, resetDays: 18 },
  };
};

const recentActivity: ActivityItem[] = [
  { id: "1", type: "published", title: "Project Published", subtitle: "Acme Landing Page", time: "2h ago" },
  { id: "2", type: "team", title: "New Team Member", subtitle: "Sarah Jones", time: "1d ago", avatar: "S" },
  { id: "3", type: "ai", title: "AI Credits Used", subtitle: "5 credits", time: "2d ago" },
];

// ── Mini Chart Components ─────────────────────────────────────────────

const MiniBarChart = () => (
  <div className="flex items-end gap-1 h-10">
    {[40, 65, 50, 80, 55, 72, 90].map((h, i) => (
      <div
        key={i}
        className="w-3 rounded-sm bg-primary/20 transition-all"
        style={{ height: `${h}%` }}
      >
        <div
          className="w-full rounded-sm bg-primary transition-all"
          style={{ height: `${Math.min(h + 10, 100)}%` }}
        />
      </div>
    ))}
  </div>
);

const MiniAreaChart = () => (
  <svg viewBox="0 0 120 40" className="h-10 w-24">
    <defs>
      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.02" />
      </linearGradient>
    </defs>
    <path d="M0,35 L20,28 L40,30 L60,18 L80,22 L100,10 L120,5 L120,40 L0,40Z" fill="url(#areaGrad)" />
    <path d="M0,35 L20,28 L40,30 L60,18 L80,22 L100,10 L120,5" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" />
  </svg>
);

const DonutChart = ({ used, total }: { used: number; total: number }) => {
  const pct = Math.min((used / total) * 100, 100);
  const r = 30;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <svg viewBox="0 0 80 80" className="h-20 w-20">
      <circle cx="40" cy="40" r={r} fill="none" stroke="hsl(var(--primary)/0.12)" strokeWidth="6" />
      <circle
        cx="40" cy="40" r={r} fill="none"
        stroke="hsl(var(--primary))" strokeWidth="6"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 40 40)"
        className="transition-all duration-700"
      />
    </svg>
  );
};

// ── Activity Icon ─────────────────────────────────────────────────────

const ActivityIcon = ({ type, avatar }: { type: string; avatar?: string }) => {
  if (type === "published") {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
        <Rocket className="h-4 w-4 text-green-600" />
      </div>
    );
  }
  if (type === "team") {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
        <span className="text-sm font-bold text-blue-600">{avatar || "?"}</span>
      </div>
    );
  }
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100">
      <Sparkles className="h-4 w-4 text-purple-600" />
    </div>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────────

const Dashboard = () => {
  const { user } = useAuth();
  const stats = getStats(user?.plan || "starter");

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="h-4 w-4" />
            Last 30 days
            <ChevronDown className="h-3 w-3" />
          </Button>
          <Button asChild size="sm" className="gap-2">
            <Link to="/projects/new">
              <Rocket className="h-4 w-4" />
              Launch Site Builder
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats + Recent Activity Row */}
      <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Projects Card */}
          <Card className="rounded-xl border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <FolderOpen className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">Projects</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">
                    {stats.projects.current}
                    <span className="text-base font-normal text-muted-foreground ml-1">
                      of {stats.projects.limit}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-green-600 font-medium">
                    ↑ {stats.projects.trend}% last week
                  </p>
                </div>
                <MiniBarChart />
              </div>
            </CardContent>
          </Card>

          {/* Pages Card */}
          <Card className="rounded-xl border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">Pages</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">
                    {stats.pages.total}
                    <span className="text-base font-normal text-muted-foreground ml-1">Total</span>
                  </p>
                  <p className="mt-1 text-xs text-green-600 font-medium">
                    ↑ {stats.pages.newCount} new
                  </p>
                </div>
                <MiniAreaChart />
              </div>
            </CardContent>
          </Card>

          {/* Storage Card */}
          <Card className="rounded-xl border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <HardDrive className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Storage</span>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {stats.storage.usedGB}
                <span className="text-base font-normal text-muted-foreground ml-1">
                  GB of {stats.storage.limitGB} GB
                </span>
              </p>
              <Progress value={stats.storage.percentUsed} className="mt-3 h-2" />
              <p className="mt-1 text-xs text-green-600 font-medium">
                ↑ {stats.storage.percentUsed}% used
              </p>
            </CardContent>
          </Card>

          {/* AI Credits Card */}
          <Card className="rounded-xl border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">AI Credits</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">
                    {stats.aiCredits.used}
                    <span className="text-base font-normal text-muted-foreground ml-1">
                      of {stats.aiCredits.limit}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Resets in {stats.aiCredits.resetDays} days
                  </p>
                </div>
                <DonutChart used={stats.aiCredits.used} total={stats.aiCredits.limit} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="rounded-xl border shadow-sm">
          <CardContent className="p-5">
            <h3 className="text-base font-semibold text-foreground mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <ActivityIcon type={item.type} avatar={item.avatar} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Start + Recent Projects Row */}
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Quick Start */}
        <div>
          <h3 className="text-base font-semibold text-foreground mb-4">Quick Start</h3>
          <div className="space-y-3">
            <Card className="rounded-xl border shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-foreground">Create New Site</p>
                  <div className="flex h-14 w-14 items-center justify-center">
                    <svg viewBox="0 0 60 60" className="h-14 w-14">
                      <rect x="10" y="8" width="40" height="30" rx="3" fill="hsl(var(--primary)/0.08)" stroke="hsl(var(--primary)/0.2)" strokeWidth="1" />
                      <rect x="14" y="14" width="12" height="3" rx="1" fill="hsl(var(--primary)/0.25)" />
                      <rect x="14" y="20" width="32" height="2" rx="1" fill="hsl(var(--primary)/0.12)" />
                      <rect x="14" y="25" width="28" height="2" rx="1" fill="hsl(var(--primary)/0.12)" />
                      <rect x="14" y="30" width="20" height="2" rx="1" fill="hsl(var(--primary)/0.12)" />
                      <rect x="10" y="42" width="18" height="12" rx="2" fill="hsl(var(--primary)/0.06)" stroke="hsl(var(--primary)/0.15)" strokeWidth="1" />
                      <rect x="32" y="42" width="18" height="12" rx="2" fill="hsl(var(--primary)/0.06)" stroke="hsl(var(--primary)/0.15)" strokeWidth="1" />
                    </svg>
                  </div>
                </div>
                <Button asChild size="sm" variant="default" className="h-8 w-8 rounded-full p-0 group-hover:scale-110 transition-transform">
                  <Link to="/projects/new">
                    <Plus className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-xl border shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-foreground">Invite Team</p>
                  <div className="flex h-14 w-14 items-center justify-center">
                    <svg viewBox="0 0 60 60" className="h-14 w-14">
                      <circle cx="20" cy="24" r="8" fill="hsl(var(--primary)/0.15)" />
                      <circle cx="30" cy="24" r="8" fill="hsl(var(--primary)/0.1)" stroke="white" strokeWidth="2" />
                      <circle cx="40" cy="24" r="8" fill="hsl(var(--primary)/0.08)" stroke="white" strokeWidth="2" />
                      <rect x="12" y="38" width="36" height="6" rx="3" fill="hsl(var(--primary)/0.08)" />
                      <text x="47" y="28" fontSize="14" fill="hsl(var(--primary)/0.4)" fontWeight="bold">@</text>
                    </svg>
                  </div>
                </div>
                <div className="flex -space-x-2">
                  {["J", "S", "M"].map((initial, i) => (
                    <div
                      key={i}
                      className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-primary/10 text-xs font-bold text-primary"
                    >
                      {initial}
                    </div>
                  ))}
                  <Button asChild size="sm" variant="outline" className="h-7 w-7 rounded-full p-0 ml-1 border-dashed group-hover:border-primary transition-colors">
                    <Link to="/team">
                      <Users className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Projects */}
        <div>
          <h3 className="text-base font-semibold text-foreground mb-4">Recent Projects</h3>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {mockProjects.map((project) => (
              <Card key={project.id} className="rounded-xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                {/* Thumbnail */}
                <div className="aspect-[16/10] bg-muted relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
                    <div className="w-[85%] rounded-md bg-white shadow-sm p-2 space-y-1.5">
                      <div className="h-2 w-1/3 rounded-full bg-primary/20" />
                      <div className="h-1.5 w-full rounded-full bg-muted" />
                      <div className="h-1.5 w-4/5 rounded-full bg-muted" />
                      <div className="h-6 w-full rounded bg-muted mt-1" />
                    </div>
                  </div>
                </div>

                <CardContent className="p-4">
                  {/* Name + Status */}
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-foreground truncate">{project.name}</h4>
                    <Badge
                      className={`text-[10px] px-2 py-0.5 font-semibold uppercase tracking-wide ${project.status === "live"
                          ? "bg-green-100 text-green-700 hover:bg-green-100"
                          : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                        }`}
                    >
                      {project.status === "live" ? "Live" : "Draft"}
                    </Badge>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" asChild className="flex-1 h-8 text-xs">
                      <Link to={`/builder/${project.id}`}>
                        <Pencil className="mr-1 h-3 w-3" />
                        Edit
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" asChild className="flex-1 h-8 text-xs">
                      <Link to={`/preview/${project.id}`}>
                        <Eye className="mr-1 h-3 w-3" />
                        Preview
                      </Link>
                    </Button>
                    {project.liveUrl && (
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
                        <a href={`https://${project.liveUrl}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
