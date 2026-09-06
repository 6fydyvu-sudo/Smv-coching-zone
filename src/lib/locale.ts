import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES, type Locale, getDictionary } from "@/i18n/dictionaries";

/** Server-side: reads the visitor's chosen language from a cookie. */
export function getCurrentLocale(): Locale {
  const cookieValue = cookies().get(LOCALE_COOKIE)?.value;
  if (cookieValue && LOCALES.includes(cookieValue as Locale)) {
    return cookieValue as Locale;
  }
  return DEFAULT_LOCALE;
}

/** Convenience helper for server components/pages. */
export function getServerDictionary() {
  const locale = getCurrentLocale();
  return { locale, dict: getDictionary(locale) };
}
