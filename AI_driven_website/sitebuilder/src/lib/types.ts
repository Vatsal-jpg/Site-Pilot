export interface SlotDef {
  key: string;
  type: string;
  label: string;
  required: boolean;
}

export interface ComponentDefinition {
  name: string;
  description: string;
  slots: SlotDef[];
  variants: string[];
}

export interface Section {
  id: string;
  componentType: string;
  slots: Record<string, any>;
  variant: string;
}

export interface Page {
  id: string;
  name: string;
  slug: string;
  sections: Section[];
}

export interface Site {
  id: string;
  name: string;
  prompt: string;
  businessType: string;
  brandColor: string;
  logoUrl: string;
  pages: Page[];
  createdAt: string;
  status: string;
  palette?: { id: string; name: string; primary: string; bg: string; surface: string; text: string; accent: string } | null;
  uploadedImages?: string[];
}
