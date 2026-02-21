import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Monitor, Tablet, Smartphone, Save, Eye, Upload, ArrowLeft,
  ChevronUp, ChevronDown, Trash2, Plus, History, Palette, Sparkles,
  GripVertical, MessageCircle, RefreshCw, X, Send,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
  DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useBuilder, type PageComponent } from "@/hooks/useBuilder";
import {
  COMPONENT_TYPES,
  LAYOUT_OPTIONS,
  SKELETON_HEIGHTS,
  SPACING_OPTIONS,
} from "@/data/componentTypes";

// ── Sub-components ───────────────────────────────────────────────────────────

function ComponentSkeleton({ type }: { type: string }) {
  const height = SKELETON_HEIGHTS[type] ?? "h-48";
  return (
    <div className={`${height} bg-muted/60 animate-pulse flex items-center justify-center rounded-lg`}>
      <span className="text-muted-foreground/60 text-sm capitalize">{type.replace("_", " ")}</span>
    </div>
  );
}

function ComponentBlock({
  comp,
  idx,
  isSelected,
  totalCount,
  onSelect,
  onMove,
  onRemove,
  onOpenChat,
}: {
  comp: PageComponent;
  idx: number;
  isSelected: boolean;
  totalCount: number;
  onSelect: () => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
  onOpenChat: () => void;
}) {
  const spacingClass = SPACING_OPTIONS.find((s) => s.value === comp.spacing)?.className ?? "mt-8";

  return (
    <div
      onClick={onSelect}
      className={`group cursor-pointer rounded-xl border bg-card shadow-sm transition-all ${idx > 0 ? spacingClass : ""
        } ${isSelected ? "ring-2 ring-primary" : "hover:border-primary/30"}`}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30 rounded-t-xl">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          <Badge variant="secondary" className="text-xs capitalize">
            {comp.componentId.replace("_", " ")}
          </Badge>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={(e) => { e.stopPropagation(); onMove(-1); }}
            disabled={idx === 0}
          >
            <ChevronUp className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={(e) => { e.stopPropagation(); onMove(1); }}
            disabled={idx === totalCount - 1}
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={(e) => { e.stopPropagation(); onOpenChat(); }}
          >
            <MessageCircle className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-destructive"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Render area */}
      <div className="p-4">
        {comp.isGenerating ? (
          <div className="relative">
            <ComponentSkeleton type={comp.componentId} />
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-lg">
              <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary">
                <Sparkles className="h-4 w-4 animate-pulse" />
                AI is generating...
              </div>
            </div>
          </div>
        ) : comp.generatedHtml ? (
          <div dangerouslySetInnerHTML={{ __html: comp.generatedHtml }} />
        ) : (
          <ComponentSkeleton type={comp.componentId} />
        )}
      </div>
    </div>
  );
}

function LayoutPicker({
  componentId,
  layout,
  onChange,
}: {
  componentId: string;
  layout: Record<string, string | number | boolean>;
  onChange: (key: string, value: string | number | boolean) => void;
}) {
  const options = LAYOUT_OPTIONS[componentId];
  if (!options) return null;

  return (
    <div className="space-y-4">
      {Object.entries(options).map(([key, values]) => (
        <div key={key} className="space-y-2">
          <Label className="text-xs capitalize">{key.replace(/([A-Z])/g, " $1")}</Label>
          <div className="flex flex-wrap gap-1.5">
            {values.map((opt) => {
              const isActive = layout[key] === opt.value;
              return (
                <button
                  key={String(opt.value)}
                  onClick={() => onChange(key, opt.value)}
                  className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${isActive
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-input hover:border-primary/50"
                    }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function ChatDrawer({
  comp,
  onClose,
  onSend,
}: {
  comp: PageComponent;
  onClose: () => void;
  onSend: (message: string) => void;
}) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput("");
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium capitalize">
            Chat — {comp.componentId.replace("_", " ")}
          </span>
        </div>
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Welcome message */}
        <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
          <span className="capitalize">{comp.componentId.replace("_", " ")}</span> is
          ready. How would you like to improve it?
        </div>
        {comp.chatHistory.map((msg) => (
          <div
            key={msg.id}
            className={`rounded-lg p-3 text-sm ${msg.role === "user"
                ? "bg-primary text-primary-foreground ml-8"
                : "bg-muted/50 text-foreground mr-8"
              }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t p-3 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your changes..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1"
        />
        <Button size="icon" onClick={handleSend} disabled={!input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ── Main Builder ─────────────────────────────────────────────────────────────

type Device = "desktop" | "tablet" | "mobile";

const versions = [
  { id: "v3", label: "Current", time: "Just now" },
  { id: "v2", label: "Version 2", time: "2 hours ago" },
  { id: "v1", label: "Version 1", time: "Yesterday" },
];

const Builder = () => {
  const { id } = useParams();
  const [device, setDevice] = useState<Device>("desktop");
  const [projectName, setProjectName] = useState("Acme Landing Page");

  const builder = useBuilder();
  const {
    branding,
    suggestedLayout,
    pages,
    activePage,
    setActivePage,
    canvas,
    selectedComponentId,
    setSelectedComponentId,
    selectedComponent,
    chatOpen,
    setChatOpen,
    saved,
    setSaved,
    addComponent,
    removeComponent,
    moveComponent,
    updateComponentLayout,
    updateComponentSpacing,
    useSuggestedLayout,
    addPage,
    sendChatMessage,
    componentTypes,
  } = builder;

  const canvasWidth =
    device === "desktop"
      ? "max-w-full"
      : device === "tablet"
        ? "max-w-2xl"
        : "max-w-sm";

  // Group component types by category
  const grouped: Record<string, typeof componentTypes> = {};
  componentTypes.forEach((ct) => {
    if (!grouped[ct.category]) grouped[ct.category] = [];
    grouped[ct.category].push(ct);
  });

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* ── Top Toolbar ───────────────────────────────────────────────────── */}
      <header className="flex h-14 items-center justify-between border-b bg-card px-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Input
            value={projectName}
            onChange={(e) => { setProjectName(e.target.value); setSaved(false); }}
            className="h-8 w-48 border-none bg-transparent text-sm font-medium focus-visible:ring-1"
          />
        </div>
        <div className="flex items-center gap-1">
          <Button variant={device === "desktop" ? "default" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setDevice("desktop")}>
            <Monitor className="h-4 w-4" />
          </Button>
          <Button variant={device === "tablet" ? "default" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setDevice("tablet")}>
            <Tablet className="h-4 w-4" />
          </Button>
          <Button variant={device === "mobile" ? "default" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setDevice("mobile")}>
            <Smartphone className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {/* Version History */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <History className="mr-1 h-4 w-4" /> History
              </Button>
            </SheetTrigger>
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
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm"><Palette className="mr-1 h-4 w-4" /> Branding</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Branding</DialogTitle>
                <DialogDescription>Update your website branding</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2"><Label>Primary Color</Label><Input defaultValue={branding.primaryColor} /></div>
                <div className="space-y-2"><Label>Font</Label><Input defaultValue={branding.font} /></div>
              </div>
              <DialogFooter><Button>Save Changes</Button></DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm" onClick={() => setSaved(true)}>
            <Save className="mr-1 h-4 w-4" /> Save
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/preview/${id}`}><Eye className="mr-1 h-4 w-4" /> Preview</Link>
          </Button>

          {/* Publish */}
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm"><Upload className="mr-1 h-4 w-4" /> Publish</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Publish Website</DialogTitle>
                <DialogDescription>Make your changes live</DialogDescription>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                Your website will be published to <strong>acme.sitepilot.app</strong>.
                This action will make all saved changes live.
              </p>
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

      {/* ── Three-panel layout ────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left Panel ──────────────────────────────────────────────────── */}
        <div className="hidden w-64 flex-shrink-0 overflow-y-auto border-r bg-card md:block">
          {/* Pages */}
          <div className="border-b p-4">
            <h3 className="mb-2 text-sm font-semibold text-foreground">Pages</h3>
            <div className="space-y-1">
              {pages.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActivePage(p.id)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm ${activePage === p.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-accent"
                    }`}
                >
                  {p.title}
                </button>
              ))}
              <button
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-muted-foreground hover:bg-accent"
                onClick={() => addPage("New Page")}
              >
                <Plus className="mr-1 inline h-3 w-3" /> Add Page
              </button>
            </div>
          </div>

          {/* AI Suggested Layout */}
          {suggestedLayout.length > 0 && (
            <div className="border-b p-4">
              <h3 className="mb-2 text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                AI Suggested Layout
              </h3>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {suggestedLayout.map((comp, i) => (
                  <span
                    key={`${comp}-${i}`}
                    className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary capitalize"
                  >
                    {comp.replace("_", " ")}
                  </span>
                ))}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full gap-1.5"
                onClick={useSuggestedLayout}
              >
                <Sparkles className="h-3 w-3" /> Use This Layout
              </Button>
            </div>
          )}

          {/* Component Library */}
          <div className="p-4">
            <h3 className="mb-2 text-sm font-semibold text-foreground">Components</h3>
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category} className="mb-4">
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground capitalize">
                  {category}
                </p>
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => addComponent(item.id)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent"
                  >
                    <span>{item.name}</span>
                    <Plus className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── Center Canvas ───────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto bg-muted/50 p-4 lg:p-8">
          <div className={`mx-auto ${canvasWidth} space-y-0`}>
            {canvas.length === 0 && (
              <div className="flex h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed border-border gap-3">
                <p className="text-sm text-muted-foreground">
                  {suggestedLayout.length > 0
                    ? "Click \"Use This Layout\" to get started, or add components manually"
                    : "Add components from the left panel"}
                </p>
                {suggestedLayout.length > 0 && (
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={useSuggestedLayout}>
                    <Sparkles className="h-3 w-3" /> Use Suggested Layout
                  </Button>
                )}
              </div>
            )}
            {canvas.map((comp, idx) => (
              <ComponentBlock
                key={comp.id}
                comp={comp}
                idx={idx}
                isSelected={selectedComponentId === comp.id}
                totalCount={canvas.length}
                onSelect={() => setSelectedComponentId(comp.id)}
                onMove={(dir) => moveComponent(idx, dir)}
                onRemove={() => removeComponent(comp.id)}
                onOpenChat={() => {
                  setSelectedComponentId(comp.id);
                  setChatOpen(true);
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Right Panel ─────────────────────────────────────────────────── */}
        <div className="hidden w-72 flex-shrink-0 overflow-y-auto border-l bg-card lg:block">
          {chatOpen && selectedComponent ? (
            <ChatDrawer
              comp={selectedComponent}
              onClose={() => setChatOpen(false)}
              onSend={(msg) => sendChatMessage(selectedComponent.id, msg)}
            />
          ) : (
            <div className="p-4">
              <h3 className="mb-4 text-sm font-semibold text-foreground">Properties</h3>
              {selectedComponent ? (
                <div className="space-y-6">
                  <Badge variant="secondary" className="capitalize">
                    {selectedComponent.componentId.replace("_", " ")}
                  </Badge>

                  {/* Section 1: Layout Picker */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                      Layout
                    </p>
                    <LayoutPicker
                      componentId={selectedComponent.componentId}
                      layout={selectedComponent.layout}
                      onChange={(key, val) =>
                        updateComponentLayout(selectedComponent.id, key, val)
                      }
                    />
                  </div>

                  {/* Section 2: Content Props */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                      Content
                    </p>
                    <div className="space-y-3">
                      {Object.entries(selectedComponent.props).map(([key, value]) => {
                        // Only show string/number primitives as editable inputs
                        if (typeof value !== "string" && typeof value !== "number") return null;
                        return (
                          <div key={key} className="space-y-1">
                            <Label className="text-xs capitalize">
                              {key.replace(/([A-Z])/g, " $1")}
                            </Label>
                            {String(value).length > 60 ? (
                              <Textarea
                                value={String(value)}
                                onChange={(e) =>
                                  builder.updateComponentProps(selectedComponent.id, key, e.target.value)
                                }
                                rows={3}
                                className="resize-none text-sm"
                              />
                            ) : (
                              <Input
                                value={String(value)}
                                onChange={(e) =>
                                  builder.updateComponentProps(selectedComponent.id, key, e.target.value)
                                }
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section 3: Spacing */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                      Spacing
                    </p>
                    <Label className="text-xs">Space above this component</Label>
                    <div className="flex gap-1.5 mt-2">
                      {SPACING_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => updateComponentSpacing(selectedComponent.id, opt.value)}
                          className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${selectedComponent.spacing === opt.value
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-card text-muted-foreground border-input hover:border-primary/50"
                            }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Section 4: Actions */}
                  <div className="space-y-2 pt-2 border-t">
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <RefreshCw className="h-4 w-4" /> Regenerate with AI
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => setChatOpen(true)}
                    >
                      <MessageCircle className="h-4 w-4" /> Chat to Improve
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Select a component to edit its properties.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Builder;
