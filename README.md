# mcp-crossref

Search 150M+ academic works, get DOI metadata, citations, journals, and funders.

> **Free API** — No API key required.

## Tools

| Tool | Description |
|------|-------------|
| `search_works` | Search academic works (papers, books, etc.) via Crossref. |
| `get_work` | Get metadata for a specific work by DOI. |
| `get_citations` | Get works that cite a specific DOI. |
| `search_journals` | Search academic journals. |
| `search_funders` | Search research funders. |

## Installation

```bash
git clone https://github.com/PetrefiedThunder/mcp-crossref.git
cd mcp-crossref
npm install
npm run build
```

## Usage with Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "crossref": {
      "command": "node",
      "args": ["/path/to/mcp-crossref/dist/index.js"]
    }
  }
}
```

## Usage with npx

```bash
npx mcp-crossref
```

## License

MIT

## Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `CONTACT_EMAIL` | `amw-dogfood@agentmail.to` | Contact address sent to the upstream API. Crossref asks for a contact address in the User-Agent (`mailto:`) to route requests to its "polite" pool. Set it to an address you monitor. |
