"use client";

import { Site } from "./types";

const STORAGE_KEY = "sitebuilder_sites";

function getAll(): Site[] {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
        return JSON.parse(raw) as Site[];
    } catch {
        return [];
    }
}

function saveAll(sites: Site[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sites));
}

export function saveSite(site: Site): void {
    const sites = getAll();
    const idx = sites.findIndex((s) => s.id === site.id);
    if (idx >= 0) {
        sites[idx] = site;
    } else {
        sites.push(site);
    }
    saveAll(sites);
}

export function getSite(id: string): Site | null {
    const sites = getAll();
    return sites.find((s) => s.id === id) ?? null;
}

export function getAllSites(): Site[] {
    return getAll();
}

export function updateSite(id: string, updates: Partial<Site>): void {
    const sites = getAll();
    const idx = sites.findIndex((s) => s.id === id);
    if (idx >= 0) {
        sites[idx] = { ...sites[idx], ...updates };
        saveAll(sites);
    }
}

export function deleteSite(id: string): void {
    const sites = getAll().filter((s) => s.id !== id);
    saveAll(sites);
}
