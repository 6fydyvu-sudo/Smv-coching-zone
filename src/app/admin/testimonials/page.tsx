import { prisma } from "@/lib/prisma";
import { TestimonialManager } from "@/components/dashboard/TestimonialManager";

export default async function AdminTestimonialsPage() {
  const [testimonials, courses] = await Promise.all([
    prisma.testimonial.findMany({ orderBy: { createdAt: "desc" }, include: { course: true } }),
    prisma.course.findMany({ orderBy: { nameEn: "asc" } })
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Testimonials</h1>
      <p className="mt-1 text-sm text-slate-500">Manage student/guardian testimonials shown on the homepage.</p>
      <div className="mt-6">
        <TestimonialManager testimonials={testimonials} courses={courses} />
      </div>
    </div>
  );
}
