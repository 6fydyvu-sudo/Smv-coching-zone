import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/rbac";
import { NotificationList } from "@/components/dashboard/NotificationList";

export default async function StudentNotificationsPage() {
  const user = await getCurrentUser();
  const notifications = user
    ? await prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 50
      })
    : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
      <div className="mt-6">
        <NotificationList
          notifications={notifications.map((n) => ({ ...n, createdAt: n.createdAt.toISOString() }))}
        />
      </div>
    </div>
  );
}
