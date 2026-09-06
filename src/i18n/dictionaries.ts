export const dictionaries = {
  en: {
    nav: {
      home: "Home",
      about: "About",
      courses: "Courses",
      teachers: "Teachers",
      routine: "Routine",
      results: "Results",
      notices: "Notices",
      materials: "Study Materials",
      gallery: "Gallery",
      achievements: "Achievements",
      admission: "Admission",
      contact: "Contact",
      login: "Login",
      dashboard: "Dashboard",
      logout: "Logout"
    },
    home: {
      admissionCta: "Apply for Admission",
      coursesCta: "Browse Courses",
      whyChooseUs: "Why Choose Us",
      featuredCourses: "Featured Courses",
      ourTeachers: "Our Teachers",
      latestNotices: "Latest Notices",
      upcomingExams: "Upcoming Exams",
      achievements: "Achievements",
      gallery: "Gallery",
      testimonials: "What Our Students Say",
      readMore: "Read More",
      viewAll: "View All",
      statsStudents: "Students",
      statsTeachers: "Teachers",
      statsCourses: "Courses",
      statsSuccess: "Successful Students"
    },
    common: {
      loading: "Loading...",
      noData: "Nothing to show here yet.",
      error: "Something went wrong.",
      save: "Save",
      cancel: "Cancel",
      edit: "Edit",
      delete: "Delete",
      create: "Create",
      submit: "Submit",
      search: "Search",
      status: "Status",
      published: "Published",
      unpublished: "Unpublished",
      actions: "Actions"
    }
  },
  bn: {
    nav: {
      home: "হোম",
      about: "সম্পর্কে",
      courses: "কোর্সসমূহ",
      teachers: "শিক্ষকবৃন্দ",
      routine: "রুটিন",
      results: "ফলাফল",
      notices: "নোটিশ",
      materials: "স্টাডি ম্যাটেরিয়াল",
      gallery: "গ্যালারি",
      achievements: "অর্জনসমূহ",
      admission: "ভর্তি",
      contact: "যোগাযোগ",
      login: "লগইন",
      dashboard: "ড্যাশবোর্ড",
      logout: "লগআউট"
    },
    home: {
      admissionCta: "ভর্তির জন্য আবেদন করুন",
      coursesCta: "কোর্সসমূহ দেখুন",
      whyChooseUs: "কেন আমাদের বেছে নেবেন",
      featuredCourses: "বিশেষ কোর্সসমূহ",
      ourTeachers: "আমাদের শিক্ষকবৃন্দ",
      latestNotices: "সাম্প্রতিক নোটিশ",
      upcomingExams: "আসন্ন পরীক্ষা",
      achievements: "অর্জনসমূহ",
      gallery: "গ্যালারি",
      testimonials: "শিক্ষার্থীরা যা বলে",
      readMore: "আরও পড়ুন",
      viewAll: "সব দেখুন",
      statsStudents: "শিক্ষার্থী",
      statsTeachers: "শিক্ষক",
      statsCourses: "কোর্স",
      statsSuccess: "সফল শিক্ষার্থী"
    },
    common: {
      loading: "লোড হচ্ছে...",
      noData: "এখানে দেখানোর মতো কিছু নেই।",
      error: "কিছু একটা সমস্যা হয়েছে।",
      save: "সংরক্ষণ করুন",
      cancel: "বাতিল",
      edit: "সম্পাদনা",
      delete: "মুছুন",
      create: "তৈরি করুন",
      submit: "জমা দিন",
      search: "খুঁজুন",
      status: "অবস্থা",
      published: "প্রকাশিত",
      unpublished: "অপ্রকাশিত",
      actions: "কার্যক্রম"
    }
  }
} as const;

export type Locale = keyof typeof dictionaries;
export const LOCALES: Locale[] = ["bn", "en"];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "smv_locale";

export function getDictionary(locale: Locale) {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}
