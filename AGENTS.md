<!-- BEGIN:nextjs-agent-rules -->
# Next.js Agent Rules
- Use only modern Next.js patterns (App Router, Server Components where applicable).
- Adhere to the established Tailwind + Global CSS design system.
<!-- END:nextjs-agent-rules -->

# 🎖️ Flores Store AI Skills

### 🎨 Skill: Excellence Guardian (Design)
- **Rule:** NEVER use generic browser colors (red, blue). Use `--color-accent` (#9B1C1C) for branding.
- **Rule:** Prioritize Dark Aesthetics. All UI must feel "Premium" using glassmorphism (`glass-card`) and smooth animations (`animate-slide-up`).
- **Rule:** Layout must be responsive. Test grid spans for mobile (1-2 columns) vs desktop (4 columns).

### 💬 Skill: WhatsApp Checkout Logic
- **Workflow:** When editing the cart, ensure the 3-step checkout (Review -> Data -> WhatsApp) remains functional.
- **Message Formatting:** Always use professional WhatsApp formatting (Bold for titles, lists for products, clear totals).

### 🔌 Skill: API-First Consistency
- **Rule:** No mocks allowed in production routes. Always fetch via `publicApi` or `adminApi`.
- **Images:** Use Cloudinary remote patterns. Ensure `next.config.ts` is updated if new domains are added.

### 🚀 Skill: Deployment Safety
- **Rule:** Before proposing changes to the API, verify the `docker-compose` structure in the VPS context.

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
