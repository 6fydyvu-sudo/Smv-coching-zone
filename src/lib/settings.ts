import { prisma } from "@/lib/prisma";

/**
 * Typed shape of editable website content. Admin edits these through the
 * Website Settings screen (Admin > Settings) — no code changes required.
 * Stored as individual rows in SiteSetting (key -> JSON value) so new
 * fields can be added later without a migration.
 */
export interface SiteContent {
  siteName: string;
  tagline: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  heroHeadlineBn: string;
  heroHeadlineEn: string;
  heroSubtextBn: string;
  heroSubtextEn: string;
  aboutBn: string;
  aboutEn: string;
  missionBn: string;
  missionEn: string;
  visionBn: string;
  visionEn: string;
  historyBn: string;
  historyEn: string;
  founderNameBn: string;
  founderNameEn: string;
  founderMessageBn: string;
  founderMessageEn: string;
  whyChooseUs: Array<{ titleBn: string; titleEn: string; descBn: string; descEn: string }>;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  facebookUrl: string;
  youtubeUrl: string;
  mapEmbedUrl: string;
  admissionOpen: boolean;
  registrationOpen: boolean;
  publicResultSearchEnabled: boolean;
  seoDefaultTitle: string;
  seoDefaultDescription: string;
}

export const DEFAULT_SITE_CONTENT: SiteContent = {
  siteName: "S.M.V Coaching Zone",
  tagline: "Guiding Students Towards Excellence",
  logoUrl: null,
  faviconUrl: null,
  heroHeadlineBn: "এস.এম.ভি কোচিং জোনে স্বাগতম",
  heroHeadlineEn: "Welcome to S.M.V Coaching Zone",
  heroSubtextBn: "মানসম্পন্ন শিক্ষা, অভিজ্ঞ শিক্ষক এবং নিয়মিত মূল্যায়নের মাধ্যমে শিক্ষার্থীদের সাফল্যের পথে এগিয়ে নিয়ে যাওয়াই আমাদের লক্ষ্য।",
  heroSubtextEn:
    "We help students succeed through quality education, experienced teachers, and regular academic assessment.",
  aboutBn: "এস.এম.ভি কোচিং জোন একটি মানসম্পন্ন শিক্ষা প্রতিষ্ঠান যেখানে শিক্ষার্থীদের ব্যক্তিগত মনোযোগ দিয়ে পড়ানো হয়।",
  aboutEn:
    "S.M.V Coaching Zone is a quality-focused coaching institute providing individual attention to every student.",
  missionBn: "প্রতিটি শিক্ষার্থীর সম্ভাবনা বিকাশে সহায়তা করা।",
  missionEn: "To help every student reach their full academic potential.",
  visionBn: "একটি আধুনিক ও ফলাফলমুখী শিক্ষা প্রতিষ্ঠান হিসেবে প্রতিষ্ঠিত হওয়া।",
  visionEn: "To become a modern, results-driven educational institution.",
  historyBn: "",
  historyEn: "",
  founderNameBn: "",
  founderNameEn: "",
  founderMessageBn: "",
  founderMessageEn: "",
  whyChooseUs: [
    {
      titleBn: "অভিজ্ঞ শিক্ষক",
      titleEn: "Experienced Teachers",
      descBn: "যোগ্য ও অভিজ্ঞ শিক্ষকমণ্ডলী দ্বারা পাঠদান।",
      descEn: "Learn from qualified and experienced educators."
    },
    {
      titleBn: "মানসম্পন্ন শিক্ষা",
      titleEn: "Quality Education",
      descBn: "যুগোপযোগী পাঠ্যক্রম ও পদ্ধতি।",
      descEn: "A modern, well-structured curriculum and teaching method."
    },
    {
      titleBn: "নিয়মিত পরীক্ষা",
      titleEn: "Regular Exams",
      descBn: "নিয়মিত মূল্যায়নের মাধ্যমে অগ্রগতি পর্যবেক্ষণ।",
      descEn: "Progress tracked through regular assessments."
    },
    {
      titleBn: "ব্যক্তিগত মনোযোগ",
      titleEn: "Individual Attention",
      descBn: "প্রতিটি শিক্ষার্থীর প্রতি বিশেষ যত্ন।",
      descEn: "Focused, individual attention for every student."
    }
  ],
  address: "",
  phone: "",
  whatsapp: "",
  email: "",
  facebookUrl: "",
  youtubeUrl: "",
  mapEmbedUrl: "",
  admissionOpen: true,
  registrationOpen: true,
  publicResultSearchEnabled: false,
  seoDefaultTitle: "S.M.V Coaching Zone",
  seoDefaultDescription: "S.M.V Coaching Zone — a modern coaching and education management platform."
};

const SITE_CONTENT_KEY = "site_content";

export async function getSiteContent(): Promise<SiteContent> {
  const row = await prisma.siteSetting.findUnique({ where: { key: SITE_CONTENT_KEY } });
  if (!row) {
    return DEFAULT_SITE_CONTENT;
  }
  // Merge with defaults so newly-added fields don't break older saved settings.
  return { ...DEFAULT_SITE_CONTENT, ...(row.value as Partial<SiteContent>) };
}

export async function updateSiteContent(partial: Partial<SiteContent>): Promise<SiteContent> {
  const current = await getSiteContent();
  const next = { ...current, ...partial };
  await prisma.siteSetting.upsert({
    where: { key: SITE_CONTENT_KEY },
    create: { key: SITE_CONTENT_KEY, value: next },
    update: { value: next }
  });
  return next;
}
