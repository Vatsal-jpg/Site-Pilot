# 🤖 SitePilot AI Wrapper

A standalone AI microservice for [SitePilot](https://github.com/SPIT-Hackathon-2026/Chicka-chicka-book-boom) — a SaaS website builder. This service wraps Google Gemini (`gemini-1.5-flash`) behind a clean REST API with built-in retry logic, Zod validation, and safe fallbacks.

> **Note:** This is a pure AI service. It does **not** touch the database. All credit checks, usage tracking, and Prisma operations are handled by the main backend, which calls this service over HTTP.

---

## 📦 Tech Stack

| Technology | Purpose |
|---|---|
| TypeScript | Language |
| Express.js | HTTP server |
| Google Gemini 1.5 Flash | AI model |
| Zod | Response schema validation |
| JWT | Auth (shared secret with backend) |

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
cd ai_wrapper
npm install

# 2. Create .env (copy from .env.example)
cp .env.example .env
# Fill in GEMINI_API_KEY, JWT_SECRET (must match backend)

# 3. Run in development
npm run dev

# 4. Or build & run production
npm run build
npm start
```

**Default port:** `4001`

---

## 🔑 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | ✅ | Google AI Studio API key |
| `JWT_SECRET` | ✅ | Must match the backend's JWT secret |
| `PORT` | ❌ | Server port (default: `4001`) |

---

## 🔒 Authentication

All `/api/ai/*` routes require a **Bearer JWT** in the `Authorization` header. The token is issued by the main backend and must contain:

```json
{
  "id": "user_cuid",
  "tenantId": "tenant_cuid",
  "role": "owner | admin | editor | viewer",
  "plan": "starter | pro | enterprise"
}
```

**Header format:**
```
Authorization: Bearer <jwt_token>
```

---

## 📡 API Routes

### Base URL
```
http://localhost:4001
```

---

### `GET /health`

Health check endpoint. No authentication required.

#### Response `200 OK`

```json
{
  "status": "ok",
  "service": "ai-wrapper"
}
```

---

### `POST /api/ai/suggest-theme`

Generates a brand color palette, font pairing, and tagline for a business website using AI.

#### Headers

| Header | Value |
|---|---|
| `Content-Type` | `application/json` |
| `Authorization` | `Bearer <jwt_token>` |

#### Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `description` | `string` | ✅ | Business description (e.g. "A modern coffee shop in downtown NYC") |
| `businessType` | `string` | ✅ | Business category (e.g. "restaurant", "portfolio", "saas") |

```json
{
  "description": "A boutique bakery specializing in artisan sourdough bread and pastries",
  "businessType": "restaurant"
}
```

#### Response `200 OK`

```json
{
  "data": {
    "primaryColor": "#2C1810",
    "secondaryColor": "#D4A574",
    "accentColor": "#E8C07D",
    "bgColor": "#FFF8F0",
    "headingFont": "Playfair Display",
    "bodyFont": "Lato",
    "suggestedTagline": "Crafted with care, baked with love"
  },
  "tokensUsed": 142
}
```

#### Response Schema (`data` object)

| Field | Type | Constraints |
|---|---|---|
| `primaryColor` | `string` | Valid 6-digit hex (`#RRGGBB`) |
| `secondaryColor` | `string` | Valid 6-digit hex (`#RRGGBB`) |
| `accentColor` | `string` | Valid 6-digit hex (`#RRGGBB`) |
| `bgColor` | `string` | Valid 6-digit hex (`#RRGGBB`) |
| `headingFont` | `string` | One of: `Inter`, `Playfair Display`, `Roboto`, `Poppins`, `Lato`, `Merriweather`, `Montserrat`, `Open Sans`, `Raleway`, `Source Sans Pro` |
| `bodyFont` | `string` | Same font options as above |
| `suggestedTagline` | `string` | Max 100 characters |

#### Fallback (if AI fails after 3 retries)

```json
{
  "data": {
    "primaryColor": "#1a1a2e",
    "secondaryColor": "#e94560",
    "accentColor": "#f5a623",
    "bgColor": "#ffffff",
    "headingFont": "Inter",
    "bodyFont": "Inter",
    "suggestedTagline": "Building something great"
  },
  "tokensUsed": 0
}
```

---

### `POST /api/ai/improve-component`

Uses AI to improve the text content of a website component while preserving its structure, URLs, colors, and non-text values.

#### Headers

| Header | Value |
|---|---|
| `Content-Type` | `application/json` |
| `Authorization` | `Bearer <jwt_token>` |

#### Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `componentId` | `string` | ✅ | Component identifier (e.g. `"hero_with_cta"`) |
| `currentProps` | `object` | ✅ | Current component props — keys define the expected output shape |
| `instruction` | `string` | ✅ | What to improve (e.g. `"Make the headline more engaging"`) |
| `businessContext` | `object` | ✅ | Business info for context (see below) |

**`businessContext` object:**

| Field | Type | Required |
|---|---|---|
| `businessName` | `string` | ✅ |
| `description` | `string` | ✅ |
| `businessType` | `string` | ✅ |

```json
{
  "componentId": "hero_with_cta",
  "currentProps": {
    "heading": "Welcome to Our Website",
    "subheading": "We are glad you are here",
    "buttonLabel": "Get Started",
    "buttonLink": "/contact",
    "backgroundImage": null,
    "textAlign": "center"
  },
  "instruction": "Make the headline more compelling and the subheading more descriptive",
  "businessContext": {
    "businessName": "Sunrise Bakery",
    "description": "A boutique bakery specializing in artisan sourdough bread",
    "businessType": "restaurant"
  }
}
```

#### Response `200 OK`

```json
{
  "updatedProps": {
    "heading": "Freshly Baked, Crafted with Passion",
    "subheading": "Discover our handcrafted artisan sourdough bread and pastries, baked fresh every morning",
    "buttonLabel": "Order Now",
    "buttonLink": "/contact",
    "backgroundImage": null,
    "textAlign": "center"
  },
  "tokensUsed": 205
}
```

> **Key behavior:** The AI only modifies text/string values. URLs, hex colors, booleans, numbers, and `null` values are preserved unchanged. The output always has the **exact same keys** as `currentProps`.

#### Fallback (if AI fails after 3 retries)

Returns the original `currentProps` unchanged with `tokensUsed: 0`.

---

## ❌ Error Responses

All error responses follow the same shape:

```json
{
  "error": "Error message here"
}
```

| Status | Cause |
|---|---|
| `400 Bad Request` | Missing required fields in request body |
| `401 Unauthorized` | Missing, invalid, or expired JWT token |
| `500 Internal Server Error` | Unexpected server error |

### Examples

**400 — Missing fields:**
```json
// POST /api/ai/suggest-theme with empty body
{
  "error": "description and businessType are required"
}
```

**401 — No token:**
```json
{
  "error": "Missing or invalid authorization header"
}
```

**401 — Bad token:**
```json
{
  "error": "Invalid or expired token"
}
```

---

## 🏗️ Architecture

```
ai_wrapper/
├── src/
│   ├── ai/
│   │   ├── gemini.ts           # Gemini client (JSON mode, temp 0.7)
│   │   ├── schema.ts           # Zod schemas for AI output validation
│   │   ├── callAI.ts           # Generic retry + parse + validate wrapper
│   │   ├── suggestTheme.ts     # Theme suggestion function
│   │   ├── improveComponent.ts # Component improvement function
│   │   └── index.ts            # Barrel exports
│   ├── middleware/
│   │   └── auth.ts             # JWT auth middleware
│   ├── routes/
│   │   └── ai.ts               # Express route handlers
│   └── index.ts                # Express app entry point
├── package.json
├── tsconfig.json
├── .env.example
└── .gitignore
```

### How it fits with the main backend

```
┌──────────────┐     HTTP/JSON      ┌──────────────────┐
│   Frontend   │ ──────────────────▶│  Backend (JS)    │
│   (React)    │                    │  Port 4000       │
└──────────────┘                    │                  │
                                    │  • Auth          │
                                    │  • Credit check  │
                                    │  • DB writes     │
                                    │  • Usage tracking│
                                    └────────┬─────────┘
                                             │
                                    Forward JWT + body
                                             │
                                             ▼
                                    ┌──────────────────┐
                                    │  AI Wrapper (TS) │
                                    │  Port 4001       │
                                    │                  │
                                    │  • Gemini calls  │
                                    │  • Retry logic   │
                                    │  • Zod validation│
                                    │  • Fallbacks     │
                                    └──────────────────┘
```

### Backend → AI Wrapper call example (JS)

```js
const response = await fetch("http://localhost:4001/api/ai/suggest-theme", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": req.headers.authorization, // forward user's JWT
  },
  body: JSON.stringify({ description, businessType }),
});

const { data, tokensUsed } = await response.json();

// Backend handles DB operations:
// - Credit check before calling
// - AIUsage record creation after
// - Tenant.aiCreditsUsed increment after
```

---

## 🔄 Retry & Fallback Behavior

| Feature | Details |
|---|---|
| Max retries | 3 attempts per AI call |
| Backoff | 500ms → 1000ms → 1500ms (linear) |
| JSON parsing | Strips markdown fences as defense-in-depth |
| Validation | Zod schema validation (suggest-theme) / key matching (improve-component) |
| Fallback | Returns safe defaults on total failure, `tokensUsed: 0` |

---

## 📜 Scripts

| Script | Command | Description |
|---|---|---|
| `npm run dev` | `ts-node-dev --respawn src/index.ts` | Dev server with hot reload |
| `npm run build` | `tsc` | Compile TypeScript to `dist/` |
| `npm start` | `node dist/index.js` | Run compiled production build |
