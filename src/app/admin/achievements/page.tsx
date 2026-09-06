import { prisma } from "@/lib/prisma";
import { AchievementManager } from "@/components/dashboard/AchievementManager";

export default async function AdminAchievementsPage() {
  const achievements = await prisma.achievement.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Achievements</h1>
      <p className="mt-1 text-sm text-slate-500">Highlight top-performing students on the public site.</p>
      <div className="mt-6">
        <AchievementManager achievements={achievements} />
      </div>
    </div>
  );
}
