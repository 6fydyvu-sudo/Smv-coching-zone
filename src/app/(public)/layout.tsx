import type { ReactNode } from "react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

// The public site (Navbar/Footer included) reads from the database on
// every page (site settings, notices, courses, etc.). Forcing dynamic
// rendering here means Next.js never tries to query the database at
// BUILD time (which would fail if DATABASE_URL isn't reachable from the
// build environment, e.g. Netlify/Vercel build servers) — every page
// renders per-request instead, which also means admin edits show up
// immediately with no stale-cache delay.
export const dynamic = "force-dynamic";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
