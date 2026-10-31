# Implementation Plan: End Of All Known Band Website

A modern, high-performance band website for **End Of All Known** built with **Next.js (App Router)**, **Sanity.io** (Embedded Headless CMS), and **Tailwind CSS**. Designed in a dark, atmospheric metalcore aesthetic (inspired by Avalanche Effect).

---

## 1. Tech Stack & Services

- **Framework:** Next.js 14+ (App Router, TypeScript)
- **Styling:** Tailwind CSS, Lucide Icons (`lucide-react`), Framer Motion
- **CMS & Assets:** Sanity.io (embedded Studio at `/admin`)
- **Email Service:** Resend (via Next.js Server Actions)
- **Widgets & Embeds:** Bandsintown Widget V4, YouTube No-Cookie Embed, Spotify Embed
- **Deployment Target:** Vercel / Cloudflare Pages

---

## 2. Project Setup & Configuration

### Step 2.1: Initialize Next.js Project
- Run `npx create-next-app@latest . --typescript --tailwind --app --eslint --src-dir=false --import-alias="@/*"`
- Install core dependencies:
  - `npm install next-sanity @sanity/image-url @sanity/vision sanity`
  - `npm install resend lucide-react framer-motion clsx tailwind-merge`
  - `npm install -D @types/node`

### Step 2.2: Environment Variables (`.env.local`)
Create `.env.local` and `.env.example` with:
```env
NEXT_PUBLIC_SANITY_PROJECT_ID="your_sanity_project_id"
NEXT_PUBLIC_SANITY_DATASET="production"
SANITY_API_READ_TOKEN="your_sanity_read_token"
RESEND_API_KEY="re_123456789"
CONTACT_EMAIL_RECIPIENT="booking@endofallknown.de"
```

### Step 2.3: Tailwind Theme Configuration (`tailwind.config.ts`)
Set up dark metalcore color palette and fonts:
- Primary Dark: `#09090b` (Zinc 950), `#000000`
- Accent Color: `#e11d48` (Rose 600 / Crimson Red) or `#dc2626` (Red 600)
- Surface Cards: `#18181b` (Zinc 900) with `#27272a` (Zinc 800) borders

---

## 3. Sanity CMS Setup (`/sanity` & `/admin`)

### Step 3.1: Embedded Studio Route
- Create route `app/admin/[[...index]]/page.tsx` rendering `<NextStudio config={config} />`.
- Define Sanity configuration in `sanity.config.ts`.

### Step 3.2: Schemas (`sanity/schemas/`)
1. **`siteSettings.ts` (Single Document):**
   - `bandName` (string)
   - `socialLinks`: Array of `{ platform: string, url: string }` (Instagram, Spotify, YouTube, Facebook, TikTok)
   - `latestYoutubeUrl` (url)
   - `featuredSpotifyUrl` (url)
   - `bandsintownArtistName` (string, default: "End Of All Known")
   - `bookingEmail` (string)
   - `managementEmail` (string)
2. **`pressKit.ts` (Single Document):**
   - `biography` (portable text / block)
   - `pressRelease` (portable text / block)
   - `pressKitPdf` (file)
   - `gallery`: Array of images with `caption` (string) and `isHighRes` (boolean).

---

## 4. Component Architecture

Implement components in `components/`:

### 4.1 Layout & Navigation
- **`Navbar.tsx`:** Sticky top header with blurred background, band logo, anchor links (`#music`, `#shows`, `#bio`, `#gallery`, `#contact`), and dynamic social media icons from Sanity.
- **`Footer.tsx`:** Copyright info, social links, legal links (Impressum, Datenschutz).

### 4.2 Home Page Sections
- **`Hero.tsx`:** Full-screen background visual with overlay, bold typography, and CTAs (*"Latest Release"*, *"Tour Dates"*).
- **`MediaSection.tsx` (`#music`):**
  - **YouTube Player:** Responsive `iframe` using `youtube-nocookie.com`.
  - **Spotify Embed:** Lazy-loaded Spotify artist/album widget.
- **`TourDates.tsx` (`#shows`):**
  - Next.js `<Script>` loading `https://widget.bandsintown.com/main.min.js`.
  - Styled Bandsintown anchor target matching the site's dark palette.
- **`BioSection.tsx` (`#bio`):**
  - PortableText renderer for bio and press release.
  - Download button for `pressKitPdf`.
- **`GallerySection.tsx` (`#gallery`):**
  - Responsive image grid using `next/image` with high-res download badges.
  - Interactive Lightbox view for full-screen inspection.
- **`ContactSection.tsx` (`#contact`):**
  - Displays direct contacts (`bookingEmail`, `managementEmail`).
  - Interactive contact form with client-side state and feedback (success/error states).

---

## 5. Server Actions & Backend Integration

### Step 5.1: Sanity Fetch Utility (`lib/sanity.ts`)
- Client setup with `@sanity/image-url` builder for responsive image URL generation.
- Reusable GROQ queries (`getSiteSettings`, `getPressKit`).

### Step 5.2: Contact Form Server Action (`app/actions/sendEmail.ts`)
- Server Action `sendContactEmail(formData: FormData)`:
  - Validates `name`, `email`, and `message`.
  - Sends email using `resend.emails.send()`.
  - Returns `{ success: true }` or `{ error: string }`.

---

## 6. Page Routing Structure

- `app/layout.tsx`: Root layout with dark theme class, metadata, and Navbar/Footer.
- `app/page.tsx`: Main landing page fetching Sanity data server-side and rendering all sections.
- `app/admin/[[...index]]/page.tsx`: Sanity Studio route.
- `app/impressum/page.tsx` & `app/datenschutz/page.tsx`: Legal pages (DSGVO compliance).

---

## 7. Performance & DSGVO / Compliance

- **Embed Privacy:** Implement two-click consent or explicit notice for YouTube, Spotify, and Bandsintown embeds.
- **Font Optimization:** Use `next/font` (e.g., Oswald / Inter) to eliminate render-blocking custom fonts.
- **Asset Optimization:** Use `next/image` with WebP/AVIF formats and custom Sanity loader.

---

## 8. Definition of Done (DoD)

1. [ ] Project compiles with zero TypeScript errors (`npm run build`).
2. [ ] Sanity Studio at `/admin` allows editing social links, YouTube/Spotify URLs, bio, and press photos.
3. [ ] All links on the page dynamically reflect Sanity data.
4. [ ] Bandsintown widget displays upcoming tour dates.
5. [ ] Contact form successfully delivers emails via Resend.
6. [ ] Site is fully responsive across mobile, tablet, and desktop viewports.