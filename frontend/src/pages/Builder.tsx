import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Monitor, Tablet, Smartphone, Save, Eye, Upload, ArrowLeft,
  ChevronUp, ChevronDown, Trash2, Plus, History, Palette, Sparkles, Lock, GripVertical,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const componentLibrary = [
  { category: "Layout", items: [{ name: "Hero Section", pro: false }, { name: "Header", pro: false }, { name: "Footer", pro: false }] },
  { category: "Content", items: [{ name: "Text Block", pro: false }, { name: "Image Gallery", pro: true }, { name: "Video Embed", pro: false }] },
  { category: "Forms", items: [{ name: "Contact Form", pro: false }, { name: "Newsletter Signup", pro: true }] },
  { category: "Commerce", items: [{ name: "Pricing Table", pro: true }, { name: "CTA Banner", pro: false }] },
];

const defaultPages = [
  { id: "1", name: "Home" },
  { id: "2", name: "About" },
  { id: "3", name: "Contact" },
];

interface CanvasComponent {
  id: string;
  type: string;
  props: Record<string, string>;
}

const defaultCanvas: CanvasComponent[] = [
  { id: "c1", type: "Hero Section", props: { heading: "Welcome to Acme", subheading: "Building the future" } },
  { id: "c2", type: "Text Block", props: { heading: "About Us", content: "We are a company..." } },
  { id: "c3", type: "CTA Banner", props: { heading: "Get Started Today", buttonText: "Sign Up" } },
];

const versions = [
  { id: "v3", label: "Current", time: "Just now" },
  { id: "v2", label: "Version 2", time: "2 hours ago" },
  { id: "v1", label: "Version 1", time: "Yesterday" },
];

type Device = "desktop" | "tablet" | "mobile";

const Builder = () => {
  const { id } = useParams();
  const [device, setDevice] = useState<Device>("desktop");
  const [projectName, setProjectName] = useState("Acme Landing Page");
  const [pages] = useState(defaultPages);
  const [activePage, setActivePage] = useState("1");
  const [canvas, setCanvas] = useState(defaultCanvas);
  const [selectedComponent, setSelectedComponent] = useState<string | null>("c1");
  const [saved, setSaved] = useState(true);

  const canvasWidth = device === "desktop" ? "max-w-full" : device === "tablet" ? "max-w-2xl" : "max-w-sm";

  const moveComponent = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= canvas.length) return;
    const updated = [...canvas];
    [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
    setCanvas(updated);
    setSaved(false);
  };

  const removeComponent = (id: string) => {
    setCanvas(canvas.filter((c) => c.id !== id));
    setSaved(false);
  };

  const addComponent = (name: string) => {
    setCanvas([...canvas, { id: `c${Date.now()}`, type: name, props: { heading: name, content: "Edit this content" } }]);
    setSaved(false);
  };

  const selected = canvas.find((c) => c.id === selectedComponent);

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top Toolbar */}
      <header className="flex h-14 items-center justify-between border-b bg-card px-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild><Link to="/dashboard"><ArrowLeft className="h-4 w-4" /></Link></Button>
          <Input
            value={projectName}
            onChange={(e) => { setProjectName(e.target.value); setSaved(false); }}
            className="h-8 w-48 border-none bg-transparent text-sm font-medium focus-visible:ring-1"
          />
        </div>
        <div className="flex items-center gap-1">
          <Button variant={device === "desktop" ? "default" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setDevice("desktop")}><Monitor className="h-4 w-4" /></Button>
          <Button variant={device === "tablet" ? "default" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setDevice("tablet")}><Tablet className="h-4 w-4" /></Button>
          <Button variant={device === "mobile" ? "default" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setDevice("mobile")}><Smartphone className="h-4 w-4" /></Button>
        </div>
        <div className="flex items-center gap-2">
          {/* Version History */}
          <Sheet>
            <SheetTrigger asChild><Button variant="ghost" size="sm"><History className="mr-1 h-4 w-4" /> History</Button></SheetTrigger>
            <SheetContent>
              <SheetHeader><SheetTitle>Version History</SheetTitle></SheetHeader>
              <div className="mt-4 space-y-3">
                {versions.map((v) => (
                  <div key={v.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{v.label}</p>
                      <p className="text-xs text-muted-foreground">{v.time}</p>
                    </div>
                    {v.id !== "v3" && <Button size="sm" variant="outline">Rollback</Button>}
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          {/* Branding */}
          <Dialog>
            <DialogTrigger asChild><Button variant="ghost" size="sm"><Palette className="mr-1 h-4 w-4" /> Branding</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Edit Branding</DialogTitle><DialogDescription>Update your website branding</DialogDescription></DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2"><Label>Primary Color</Label><Input defaultValue="#090979" /></div>
                <div className="space-y-2"><Label>Font</Label><Input defaultValue="Inter" /></div>
              </div>
              <DialogFooter><Button>Save Changes</Button></DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm" onClick={() => setSaved(true)}><Save className="mr-1 h-4 w-4" /> Save</Button>
          <Button variant="outline" size="sm" asChild><Link to={`/preview/${id}`}><Eye className="mr-1 h-4 w-4" /> Preview</Link></Button>

          {/* Publish */}
          <Dialog>
            <DialogTrigger asChild><Button size="sm"><Upload className="mr-1 h-4 w-4" /> Publish</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Publish Website</DialogTitle><DialogDescription>Make your changes live</DialogDescription></DialogHeader>
              <p className="text-sm text-muted-foreground">Your website will be published to <strong>acme.sitepilot.app</strong>. This action will make all saved changes live.</p>
              <DialogFooter><Button>Confirm Publish</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Status bar */}
      <div className="flex h-8 items-center border-b bg-card px-4">
        <span className={`text-xs ${saved ? "text-success" : "text-warning"}`}>
          {saved ? "✓ All changes saved" : "● Unsaved changes"}
        </span>
      </div>

      {/* Three-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel */}
        <div className="hidden w-64 flex-shrink-0 overflow-y-auto border-r bg-card md:block">
          <div className="border-b p-4">
            <h3 className="mb-2 text-sm font-semibold text-foreground">Pages</h3>
            <div className="space-y-1">
              {pages.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActivePage(p.id)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm ${activePage === p.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-accent"}`}
                >
                  {p.name}
                </button>
              ))}
              <button className="w-full rounded-lg px-3 py-2 text-left text-sm text-muted-foreground hover:bg-accent">
                <Plus className="mr-1 inline h-3 w-3" /> Add Page
              </button>
            </div>
          </div>

          <div className="p-4">
            <h3 className="mb-2 text-sm font-semibold text-foreground">Components</h3>
            {componentLibrary.map((group) => (
              <div key={group.category} className="mb-4">
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">{group.category}</p>
                {group.items.map((item) => (
                  <button
                    key={item.name}
                    disabled={item.pro}
                    onClick={() => !item.pro && addComponent(item.name)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent disabled:opacity-50"
                  >
                    <span>{item.name}</span>
                    {item.pro && <Badge variant="secondary" className="text-[10px]"><Lock className="mr-1 h-3 w-3" />PRO</Badge>}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Center Canvas */}
        <div className="flex-1 overflow-y-auto bg-muted/50 p-4 lg:p-8">
          <div className={`mx-auto ${canvasWidth} space-y-3`}>
            {canvas.length === 0 && (
              <div className="flex h-64 items-center justify-center rounded-xl border-2 border-dashed border-border">
                <p className="text-sm text-muted-foreground">Add components from the left panel</p>
              </div>
            )}
            {canvas.map((comp, idx) => (
              <div
                key={comp.id}
                onClick={() => setSelectedComponent(comp.id)}
                className={`group cursor-pointer rounded-xl border bg-card p-6 shadow-sm transition-colors ${selectedComponent === comp.id ? "ring-2 ring-primary" : "hover:border-primary/30"}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                    <Badge variant="secondary" className="text-xs">{comp.type}</Badge>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); moveComponent(idx, -1); }} disabled={idx === 0}><ChevronUp className="h-3 w-3" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); moveComponent(idx, 1); }} disabled={idx === canvas.length - 1}><ChevronDown className="h-3 w-3" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); removeComponent(comp.id); }}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground">{comp.props.heading}</h3>
                {comp.props.subheading && <p className="text-sm text-muted-foreground">{comp.props.subheading}</p>}
                {comp.props.content && <p className="mt-1 text-sm text-muted-foreground">{comp.props.content}</p>}
                {comp.props.buttonText && <Button size="sm" className="mt-3">{comp.props.buttonText}</Button>}
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="hidden w-72 flex-shrink-0 overflow-y-auto border-l bg-card lg:block">
          <div className="p-4">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Properties</h3>
            {selected ? (
              <div className="space-y-4">
                <Badge variant="secondary">{selected.type}</Badge>
                {Object.entries(selected.props).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <Label className="text-xs capitalize">{key}</Label>
                    <Input
                      value={value as string}
                      onChange={(e) => {
                        setCanvas(canvas.map((c) => c.id === selected.id ? { ...c, props: { ...c.props, [key]: e.target.value } } : c));
                        setSaved(false);
                      }}
                    />
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Sparkles className="h-4 w-4" /> Improve with AI
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Select a component to edit its properties.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Builder;
