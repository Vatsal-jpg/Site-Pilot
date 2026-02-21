import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { mockProjects, planLimits } from "@/data/mockData";
import { Link } from "react-router-dom";
import { Plus, MoreVertical, ExternalLink, Pencil, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Dashboard = () => {
  const { user } = useAuth();
  const limits = planLimits[user?.plan || "starter"];
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const stats = [
    { label: "Projects", value: `${mockProjects.length} of ${limits.websites === Infinity ? "∞" : limits.websites}`, progress: limits.websites === Infinity ? 10 : (mockProjects.length / limits.websites) * 100 },
    { label: "Storage", value: `1.2 of ${limits.storage} GB`, progress: (1.2 / limits.storage) * 100 },
    { label: "AI Credits", value: `23 of ${limits.aiCredits === Infinity ? "∞" : limits.aiCredits}`, progress: limits.aiCredits === Infinity ? 5 : (23 / limits.aiCredits) * 100, sub: "Resets in 18 days" },
    { label: "Team Members", value: "3 members", progress: 0 },
  ];

  return (
    <DashboardLayout>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Welcome back, {user?.name}</h1>
        <p className="text-sm text-muted-foreground">{today}</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="rounded-xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold text-foreground">{s.value}</p>
              {s.progress > 0 && <Progress value={s.progress} className="mt-2 h-2" />}
              {s.sub && <p className="mt-1 text-xs text-muted-foreground">{s.sub}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Projects */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Your Projects</h2>
        <Button asChild size="sm"><Link to="/projects/new"><Plus className="mr-2 h-4 w-4" /> New Project</Link></Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockProjects.map((project) => (
          <Card key={project.id} className="rounded-xl shadow-sm">
            <div className="aspect-video bg-muted flex items-center justify-center rounded-t-xl">
              <span className="text-xs text-muted-foreground">Preview</span>
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-foreground">{project.name}</h3>
                  <p className="text-xs text-muted-foreground">Edited {project.lastEdited}</p>
                  {project.liveUrl && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-primary">
                      <ExternalLink className="h-3 w-3" /> {project.liveUrl}
                    </p>
                  )}
                </div>
                <Badge className={project.status === "live" ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}>
                  {project.status.toUpperCase()}
                </Badge>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Button size="sm" variant="outline" asChild className="flex-1"><Link to={`/builder/${project.id}`}><Pencil className="mr-1 h-3 w-3" /> Edit</Link></Button>
                <Button size="sm" variant="outline" asChild className="flex-1"><Link to={`/preview/${project.id}`}><Eye className="mr-1 h-3 w-3" /> View</Link></Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button size="sm" variant="ghost"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Rename</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
