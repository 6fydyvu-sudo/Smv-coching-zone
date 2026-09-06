import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getServerDictionary } from "@/lib/locale";
import { getSiteContent } from "@/lib/settings";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { MobileNav } from "@/components/site/MobileNav";

function roleHome(role?: string) {
  if (role === "SUPER_ADMIN" || role === "ADMIN") return "/admin";
  if (role === "TEACHER") return "/teacher";
  if (role === "STUDENT") return "/student";
  return "/";
}

export async function Navbar() {
  const session = await getServerSession(authOptions);
  const { locale, dict } = getServerDictionary();
  const content = await getSiteContent();

  const navLinks = [
    { href: "/", label: dict.nav.home },
    { href: "/about", label: dict.nav.about },
    { href: "/courses", label: dict.nav.courses },
    { href: "/teachers", label: dict.nav.teachers },
    { href: "/routine", label: dict.nav.routine },
    { href: "/results", label: dict.nav.results },
    { href: "/notices", label: dict.nav.notices },
    { href: "/materials", label: dict.nav.materials },
    { href: "/gallery", label: dict.nav.gallery },
    { href: "/achievements", label: dict.nav.achievements },
    { href: "/admission", label: dict.nav.admission },
    { href: "/contact", label: dict.nav.contact }
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-brand-700">
          {content.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={content.logoUrl} alt={content.siteName} className="h-9 w-9 rounded-lg object-cover" />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-sm text-white">
              SMV
            </span>
          )}
          <span className="hidden text-lg leading-tight sm:block">{content.siteName}</span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-medium text-slate-600 xl:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-brand-600">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 xl:flex">
          <LanguageSwitcher current={locale} />
          {session?.user ? (
            <Link
              href={roleHome(session.user.role)}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              {dict.nav.dashboard}
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-lg border border-brand-600 px-4 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50"
            >
              {dict.nav.login}
            </Link>
          )}
        </div>

        <MobileNav
          links={navLinks}
          locale={locale}
          isLoggedIn={!!session?.user}
          dashboardHref={roleHome(session?.user?.role)}
          loginLabel={dict.nav.login}
          dashboardLabel={dict.nav.dashboard}
        />
      </div>
    </header>
  );
}
