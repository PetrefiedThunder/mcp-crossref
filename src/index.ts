#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE = "https://api.crossref.org";
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "amw-dogfood@agentmail.to";
const UA = `mcp-crossref/1.0.0 (mailto:${CONTACT_EMAIL})`;
const RATE_LIMIT_MS = 200;
let last = 0;

async function crFetch(path: string): Promise<any> {
  const now = Date.now(); if (now - last < RATE_LIMIT_MS) await new Promise((r) => setTimeout(r, RATE_LIMIT_MS - (now - last)));
  last = Date.now();
  const res = await fetch(`${BASE}${path}`, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`Crossref ${res.status}`);
  return res.json();
}

const server = new McpServer({ name: "mcp-crossref", version: "1.0.0" });

server.tool("search_works", "Search academic works (papers, books, etc.) via Crossref.", {
  query: z.string(), rows: z.number().min(1).max(100).default(10),
  filter: z.string().optional().describe("Crossref filter (e.g. 'from-pub-date:2024-01-01,type:journal-article')"),
  sort: z.enum(["relevance", "published", "is-referenced-by-count"]).default("relevance"),
}, async ({ query, rows, filter, sort }) => {
  const p = new URLSearchParams({ query, rows: String(rows), sort });
  if (filter) p.set("filter", filter);
  const d = await crFetch(`/works?${p}`);
  const items = d.message?.items?.map((w: any) => ({
    doi: w.DOI, title: w.title?.[0], type: w.type,
    authors: w.author?.map((a: any) => `${a.given || ""} ${a.family || ""}`).join(", "),
    published: w.published?.["date-parts"]?.[0]?.join("-"),
    journal: w["container-title"]?.[0],
    citedBy: w["is-referenced-by-count"],
    url: w.URL,
  }));
  return { content: [{ type: "text" as const, text: JSON.stringify({ total: d.message?.["total-results"], items }, null, 2) }] };
});

server.tool("get_work", "Get metadata for a specific work by DOI.", {
  doi: z.string().describe("DOI (e.g. '10.1038/nature12373')"),
}, async ({ doi }) => {
  const d = await crFetch(`/works/${encodeURIComponent(doi)}`);
  return { content: [{ type: "text" as const, text: JSON.stringify(d.message, null, 2) }] };
});

server.tool("get_citations", "Get works that cite a specific DOI.", {
  doi: z.string(), rows: z.number().min(1).max(100).default(20),
}, async ({ doi, rows }) => {
  const p = new URLSearchParams({ filter: `cites:${doi}`, rows: String(rows), sort: "is-referenced-by-count" });
  const d = await crFetch(`/works?${p}`);
  const items = d.message?.items?.map((w: any) => ({
    doi: w.DOI, title: w.title?.[0], published: w.published?.["date-parts"]?.[0]?.join("-"),
    journal: w["container-title"]?.[0], citedBy: w["is-referenced-by-count"],
  }));
  return { content: [{ type: "text" as const, text: JSON.stringify({ total: d.message?.["total-results"], items }, null, 2) }] };
});

server.tool("search_journals", "Search academic journals.", {
  query: z.string(), rows: z.number().min(1).max(100).default(10),
}, async ({ query, rows }) => {
  const d = await crFetch(`/journals?query=${encodeURIComponent(query)}&rows=${rows}`);
  const items = d.message?.items?.map((j: any) => ({
    title: j.title, issn: j.ISSN, publisher: j.publisher,
    totalDois: j.counts?.["total-dois"], currentDois: j.counts?.["current-dois"],
  }));
  return { content: [{ type: "text" as const, text: JSON.stringify(items, null, 2) }] };
});

server.tool("search_funders", "Search research funders.", {
  query: z.string(), rows: z.number().min(1).max(100).default(10),
}, async ({ query, rows }) => {
  const d = await crFetch(`/funders?query=${encodeURIComponent(query)}&rows=${rows}`);
  const items = d.message?.items?.map((f: any) => ({
    id: f.id, name: f.name, location: f.location, workCount: f["work-count"],
  }));
  return { content: [{ type: "text" as const, text: JSON.stringify(items, null, 2) }] };
});

async function main() { const t = new StdioServerTransport(); await server.connect(t); }
main().catch((e) => { console.error("Fatal:", e); process.exit(1); });
