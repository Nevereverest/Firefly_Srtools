# Firefly SrTools

![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=for-the-badge&logo=bun&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

**Firefly SrTools** is a modern, high-performance web toolkit designed to streamline workflows and provide essential services. This project is built upon the powerful synergy of the **Next.js** framework and the ultra-fast **Bun.js** runtime, ensuring lightning-fast development and deployment.

---

## Live Sites

The application is deployed and available at the following URLs:

| Role | URL |
| :--- | :--- |
| **Main Site** | [srtools.punklorde.org](https://srtools.punklorde.org) |

---

## Key Features

* **Optimized Performance:** Leveraging Bun for dependency management, scripting, and development server speed.
* **Next.js App Router:** Modern routing and data fetching using the latest Next.js architecture.
* **Server-Side Rendering (SSR):** Enhanced SEO and faster initial load times for improved user experience.
* **Robust Type Safety:** Built with TypeScript for reliable and maintainable code.
* **Modular Design:** Clean separation of concerns with reusable components and utilities.

## Technology Stack

* **Frontend Framework:** [Next.js 15](https://nextjs.org/) (React)
* **Runtime & Package Manager:** [Bun](https://bun.sh/)
* **Language:** TypeScript
* **Styling:** (Tailwind CSS, DaisyUI)
* **State Management:** (Zustand)

---

## Prerequisites

Ensure you have **Bun** installed on your system.

Install Bun (macOS, WSL, Linux):

```bash
curl -fsSL [https://bun.sh/install](https://bun.sh/install) | bash
```

## Development

```bash
bun install
```

```bash
bun run dev
```

```bash
bun run build
bun run start
```

## Data transport

`bun run build` prepares lossless API payloads in `data/.packed/` before building
Next.js. Repeated long strings are transmitted once and restored on the client
before queries resolve. No datasets, locales, numeric fields, or PNG URLs are
removed. The original `data/` files and unqualified `/api/data/:name` responses
remain compatible; `?encoding=strings-v1` opts into the smaller payload.

Generated files are reused only when both the source and encoder/build script
hashes match. The server also verifies source hashes and falls back to original
responses when generated data is missing/stale. Data responses revalidate using
content ETags instead of timestamp cache-busting. In development the original
files are served and changes are checked per dataset.

Run `bun run test` for lightweight data/battle/persistence regression tests.

## Maintaining battle rules

* `src/helper/battleConfig.ts`: pure, typed rules, with one entry point per mode:
  `deriveMocConfig`, `derivePfConfig`, `deriveAsConfig`, `derivePeakConfig`, and
  `fillTheoryCraftHP`. Change a mode's rules in its function; shared helpers only
  handle side selection, stage-to-monster mapping, and unchanged-result checks.
* `src/lib/battleConfigSync.ts`: store subscriptions and one explicit case per
  mode. Add a new mode's config/data dependency, calculator, and setter here.
  Do not put buffs, cycle limits, or enemy calculation in this file or the modal.
* `bun test tests/battleConfig.test.mjs`: focused regressions, no browser needed.
