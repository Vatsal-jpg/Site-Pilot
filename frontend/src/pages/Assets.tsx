import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { mockAssets } from "@/data/mockData";
import { Upload, Copy, Trash2, Image, FileText, Video, File } from "lucide-react";
import { useState } from "react";

const filterTabs = ["All", "Images", "Videos", "Documents"];

const typeIcon: Record<string, typeof Image> = { image: Image, document: FileText, video: Video, font: File };

const Assets = () => {
  const [filter, setFilter] = useState("All");

  const filtered = mockAssets.filter((a) => {
    if (filter === "All") return true;
    return a.type === filter.toLowerCase().slice(0, -1);
  });

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Assets</h1>
        <Button size="sm"><Upload className="mr-2 h-4 w-4" /> Upload</Button>
      </div>

      {/* Storage */}
      <Card className="mb-6 rounded-xl shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Storage Used</span>
            <span className="text-sm text-muted-foreground">1.2 GB of 5 GB</span>
          </div>
          <Progress value={24} className="h-2" />
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        {filterTabs.map((tab) => (
          <Button key={tab} size="sm" variant={filter === tab ? "default" : "outline"} onClick={() => setFilter(tab)}>
            {tab}
          </Button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((asset) => {
          const Icon = typeIcon[asset.type] || File;
          return (
            <Card key={asset.id} className="rounded-xl shadow-sm overflow-hidden">
              <div className="aspect-square bg-muted flex items-center justify-center">
                {asset.type === "image" ? (
                  <img src={asset.url} alt={asset.name} className="h-full w-full object-cover" />
                ) : (
                  <Icon className="h-10 w-10 text-muted-foreground" />
                )}
              </div>
              <CardContent className="p-3">
                <p className="truncate text-sm font-medium text-foreground">{asset.name}</p>
                <p className="text-xs text-muted-foreground">{asset.size}</p>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1"><Copy className="mr-1 h-3 w-3" /> URL</Button>
                  <Button size="sm" variant="outline" className="text-destructive"><Trash2 className="h-3 w-3" /></Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </DashboardLayout>
  );
};

export default Assets;
