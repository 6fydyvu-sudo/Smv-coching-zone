import Link from "next/link";
import type { Prisma, Notice, Achievement, GalleryImage, Testimonial } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getServerDictionary } from "@/lib/locale";
import { getSiteContent } from "@/lib/settings";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";

// Rendered per-request: nearly every section of the homepage (stats,
// featured courses, notices, achievements, gallery, testimonials) is
// edited live from the Admin panel. Static generation would require a
// reachable DATABASE_URL during `next build`, which isn't available on
// hosts like Netlify's drop-deploy unless explicitly configured — so this
// page always renders fresh, on request, against the live database.
export const dynamic = "force-dynamic";

type FeaturedCourse = Prisma.CourseGetPayload<{
  include: { primaryTeacher: { include: { user: true } } };
}>;
type HomeTeacher = Prisma.TeacherProfileGetPayload<{ include: { user: true } }>;
type UpcomingExam = Prisma.ExamGetPayload<{ include: { course: true; subject: true } }>;

export default async function HomePage() {
  const { locale, dict } = getServerDictionary();
  const content = await getSiteContent();

  const [
    studentCount,
    teacherCount,
    courseCount,
    graduatedCount,
    featuredCourses,
    teachers,
    notices,
    upcomingExams,
    achievements,
    galleryImages,
    testimonials
  ]: [
    number,
    number,
    number,
    number,
    FeaturedCourse[],
    HomeTeacher[],
    Notice[],
    UpcomingExam[],
    Achievement[],
    GalleryImage[],
    Testimonial[]
  ] = await Promise.all([
    prisma.studentProfile.count({ where: { status: "ACTIVE" } }),
    prisma.teacherProfile.count({ where: { isActive: true } }),
    prisma.course.count({ where: { published: true } }),
    prisma.studentProfile.count({ where: { status: "GRADUATED" } }),
    prisma.course.findMany({
      where: { published: true, featured: true },
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { primaryTeacher: { include: { user: true } } }
    }),
    prisma.teacherProfile.findMany({
      where: { isActive: true },
      take: 4,
      orderBy: { createdAt: "desc" },
      include: { user: true }
    }),
    prisma.notice.findMany({
      where: { published: true },
      take: 5,
      orderBy: [{ pinned: "desc" }, { publishDate: "desc" }]
    }),
    prisma.exam.findMany({
      where: { published: true, examDate: { gte: new Date() } },
      take: 4,
      orderBy: { examDate: "asc" },
      include: { course: true, subject: true }
    }),
    prisma.achievement.findMany({ where: { published: true }, take: 4, orderBy: { createdAt: "desc" } }),
    prisma.galleryImage.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      where: { album: { published: true } }
    }),
    prisma.testimonial.findMany({ where: { published: true }, take: 6, orderBy: { createdAt: "desc" } })
  ]);

  const stats = [
    { label: dict.home.statsStudents, value: studentCount },
    { label: dict.home.statsTeachers, value: teacherCount },
    { label: dict.home.statsCourses, value: courseCount },
    { label: dict.home.statsSuccess, value: graduatedCount }
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-800 to-brand-600 text-white">
        <div className="container-page grid gap-10 py-16 sm:py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mb-3 inline-block rounded-full bg-white/10 px-4 py-1 text-sm font-medium">
              {content.tagline}
            </p>
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              {locale === "bn" ? content.heroHeadlineBn : content.heroHeadlineEn}
            </h1>
            <p className="mt-4 max-w-xl text-base text-white/85 sm:text-lg">
              {locale === "bn" ? content.heroSubtextBn : content.heroSubtextEn}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/admission" className="rounded-xl bg-white px-6 py-3 font-semibold text-brand-700 hover:bg-slate-100">
                {dict.home.admissionCta}
              </Link>
              <Link href="/courses" className="rounded-xl border border-white/40 px-6 py-3 font-semibold text-white hover:bg-white/10">
                {dict.home.coursesCta}
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl bg-white/10 p-6 text-center backdrop-blur">
                <p className="text-3xl font-bold">{s.value}+</p>
                <p className="mt-1 text-sm text-white/80">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About preview */}
      <section className="container-page py-14">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{dict.nav.about}</h2>
            <p className="mt-3 text-slate-600">{locale === "bn" ? content.aboutBn : content.aboutEn}</p>
            <Link href="/about" className="mt-4 inline-block font-medium text-brand-600 hover:underline">
              {dict.home.readMore} →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {content.whyChooseUs.slice(0, 4).map((f, i) => (
              <Card key={i}>
                <p className="font-semibold text-slate-900">{locale === "bn" ? f.titleBn : f.titleEn}</p>
                <p className="mt-1 text-sm text-slate-500">{locale === "bn" ? f.descBn : f.descEn}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured courses */}
      <section className="bg-white py-14">
        <div className="container-page">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">{dict.home.featuredCourses}</h2>
            <Link href="/courses" className="text-sm font-medium text-brand-600 hover:underline">
              {dict.home.viewAll} →
            </Link>
          </div>
          {featuredCourses.length === 0 ? (
            <EmptyState title={dict.common.noData} />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredCourses.map((course: FeaturedCourse) => (
                <Link key={course.id} href={`/courses/${course.id}`}>
                  <Card className="h-full transition-shadow hover:shadow-lg">
                    <div className="mb-3 flex items-center justify-between">
                      <Badge tone="blue">{course.classGrade ?? "All Classes"}</Badge>
                      <span className="text-sm font-semibold text-brand-700">
                        {formatCurrency(course.monthlyFee.toString())}/mo
                      </span>
                    </div>
                    <p className="font-semibold text-slate-900">
                      {locale === "bn" ? course.nameBn : course.nameEn}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                      {locale === "bn" ? course.descriptionBn : course.descriptionEn}
                    </p>
                    {course.primaryTeacher && (
                      <p className="mt-3 text-xs text-slate-400">
                        Taught by {course.primaryTeacher.user.name}
                      </p>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Teachers */}
      <section className="container-page py-14">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">{dict.home.ourTeachers}</h2>
          <Link href="/teachers" className="text-sm font-medium text-brand-600 hover:underline">
            {dict.home.viewAll} →
          </Link>
        </div>
        {teachers.length === 0 ? (
          <EmptyState title={dict.common.noData} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {teachers.map((t: HomeTeacher) => (
              <Card key={t.id} className="text-center">
                <div className="mx-auto mb-3 h-20 w-20 overflow-hidden rounded-full bg-slate-100">
                  {t.photoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.photoUrl} alt={t.user.name} className="h-full w-full object-cover" />
                  )}
                </div>
                <p className="font-semibold text-slate-900">{t.user.name}</p>
                <p className="text-sm text-slate-500">{t.subjectSpecialization}</p>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Notices + Exams */}
      <section className="bg-white py-14">
        <div className="container-page grid gap-8 lg:grid-cols-2">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">{dict.home.latestNotices}</h2>
              <Link href="/notices" className="text-sm font-medium text-brand-600 hover:underline">
                {dict.home.viewAll} →
              </Link>
            </div>
            {notices.length === 0 ? (
              <EmptyState title={dict.common.noData} />
            ) : (
              <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
                {notices.map((n: Notice) => (
                  <li key={n.id} className="flex items-start justify-between gap-3 p-4">
                    <div>
                      <p className="font-medium text-slate-900">
                        {locale === "bn" ? n.titleBn : n.titleEn}
                      </p>
                      <p className="text-xs text-slate-400">{formatDate(n.publishDate, locale)}</p>
                    </div>
                    {n.pinned && <Badge tone="amber">Pinned</Badge>}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">{dict.home.upcomingExams}</h2>
            </div>
            {upcomingExams.length === 0 ? (
              <EmptyState title={dict.common.noData} />
            ) : (
              <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
                {upcomingExams.map((e: UpcomingExam) => (
                  <li key={e.id} className="flex items-start justify-between gap-3 p-4">
                    <div>
                      <p className="font-medium text-slate-900">
                        {locale === "bn" ? e.titleBn : e.titleEn}
                      </p>
                      <p className="text-xs text-slate-400">
                        {e.subject.nameEn} · {formatDate(e.examDate, locale)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="container-page py-14">
        <h2 className="mb-6 text-2xl font-bold text-slate-900">{dict.home.achievements}</h2>
        {achievements.length === 0 ? (
          <EmptyState title={dict.common.noData} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {achievements.map((a: Achievement) => (
              <Card key={a.id} className="text-center">
                <div className="mx-auto mb-3 h-16 w-16 overflow-hidden rounded-full bg-slate-100">
                  {a.photoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.photoUrl} alt={a.studentName} className="h-full w-full object-cover" />
                  )}
                </div>
                <p className="font-semibold text-slate-900">{a.studentName}</p>
                <p className="text-sm text-slate-500">{a.resultText}</p>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Gallery preview */}
      <section className="bg-white py-14">
        <div className="container-page">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">{dict.home.gallery}</h2>
            <Link href="/gallery" className="text-sm font-medium text-brand-600 hover:underline">
              {dict.home.viewAll} →
            </Link>
          </div>
          {galleryImages.length === 0 ? (
            <EmptyState title={dict.common.noData} />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {galleryImages.map((img: GalleryImage) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={img.id}
                  src={img.imageUrl}
                  alt={img.caption ?? ""}
                  className="h-40 w-full rounded-xl object-cover"
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="container-page py-14">
        <h2 className="mb-6 text-2xl font-bold text-slate-900">{dict.home.testimonials}</h2>
        {testimonials.length === 0 ? (
          <EmptyState title={dict.common.noData} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t: Testimonial) => (
              <Card key={t.id}>
                <p className="text-amber-500">{"★".repeat(t.rating)}</p>
                <p className="mt-2 text-sm text-slate-600">&ldquo;{t.message}&rdquo;</p>
                <p className="mt-3 text-sm font-semibold text-slate-900">{t.name}</p>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Contact preview */}
      <section className="bg-brand-950 py-14 text-white">
        <div className="container-page grid gap-6 sm:grid-cols-3">
          <div>
            <p className="text-sm font-semibold text-white/70">Address</p>
            <p className="mt-1">{content.address || "—"}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-white/70">Phone</p>
            <p className="mt-1">{content.phone || "—"}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-white/70">Follow Us</p>
            <div className="mt-1 flex gap-3">
              {content.facebookUrl && (
                <a href={content.facebookUrl} className="underline">Facebook</a>
              )}
              {content.youtubeUrl && (
                <a href={content.youtubeUrl} className="underline">YouTube</a>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
