import Link from "next/link";
import { getServerDictionary } from "@/lib/locale";
import { getSiteContent } from "@/lib/settings";

export async function Footer() {
  const content = await getSiteContent();
  const { dict } = getServerDictionary();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-lg font-bold text-white">{content.siteName}</p>
          <p className="mt-2 text-sm text-slate-400">{content.tagline}</p>
          <div className="mt-4 flex gap-3">
            {content.facebookUrl && (
              <a href={content.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white">
                Facebook
              </a>
            )}
            {content.youtubeUrl && (
              <a href={content.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white">
                YouTube
              </a>
            )}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">Quick Links</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-white">{dict.nav.about}</Link></li>
            <li><Link href="/courses" className="hover:text-white">{dict.nav.courses}</Link></li>
            <li><Link href="/admission" className="hover:text-white">{dict.nav.admission}</Link></li>
            <li><Link href="/notices" className="hover:text-white">{dict.nav.notices}</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">Resources</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/teachers" className="hover:text-white">{dict.nav.teachers}</Link></li>
            <li><Link href="/routine" className="hover:text-white">{dict.nav.routine}</Link></li>
            <li><Link href="/materials" className="hover:text-white">{dict.nav.materials}</Link></li>
            <li><Link href="/gallery" className="hover:text-white">{dict.nav.gallery}</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">Contact</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            {content.address && <li>{content.address}</li>}
            {content.phone && <li>{content.phone}</li>}
            {content.email && <li>{content.email}</li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        © {year} {content.siteName}. All rights reserved.
      </div>
    </footer>
  );
}
