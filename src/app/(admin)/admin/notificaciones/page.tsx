import { getUserNotifications } from "@/actions/notification.actions";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { MarkAllReadButton } from "./_components/MarkAllReadButton";

export const metadata = {
  title: "Notificaciones | Admin",
};

type NotificationItem = Awaited<ReturnType<typeof getUserNotifications>>[number];

function timeAgo(date: Date | string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "hace un momento";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  return `hace ${Math.floor(hours / 24)}d`;
}

function getPostHref(item: NotificationItem): string {
  if (!item.post) return "/admin/articulos";
  if (item.type === "POST_APPROVED") return `/blog/${item.post.slug}`;
  return `/admin/articulos/${item.postId}/editar`;
}

export default async function NotificacionesPage() {
  const notifications = await getUserNotifications();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      {/* ── Encabezado ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">
            Notificaciones
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {unreadCount > 0
              ? `${unreadCount} sin leer · ${notifications.length} en total`
              : `${notifications.length} notificaciones`}
          </p>
        </div>

        {unreadCount > 0 && <MarkAllReadButton />}
      </div>

      {/* ── Lista ───────────────────────────────────────────────────────── */}
      <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark">
        {notifications.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-500">
            No tienes notificaciones todavía.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-dark-3">
            {notifications.map((item) => (
              <li key={item.id}>
                <Link
                  href={getPostHref(item)}
                  className={cn(
                    "flex items-start gap-4 px-6 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-dark-2",
                    !item.read && "bg-blue-light-5 dark:bg-dark-2",
                  )}
                >
                  {/* Avatar del remitente */}
                  {item.from?.image ? (
                    <Image
                      src={item.from.image}
                      className="size-10 flex-shrink-0 rounded-full object-cover"
                      width={40}
                      height={40}
                      alt={item.from.name ?? "Usuario"}
                    />
                  ) : (
                    <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                      {item.from?.name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                  )}

                  {/* Mensaje y fecha */}
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm text-dark dark:text-white",
                        !item.read && "font-medium",
                      )}
                    >
                      {item.message}
                    </p>
                    {item.post && (
                      <p className="mt-0.5 truncate text-xs text-gray-400">
                        {item.post.title}
                      </p>
                    )}
                    <span className="mt-1 block text-xs text-dark-5 dark:text-dark-6">
                      {timeAgo(item.createdAt)}
                    </span>
                  </div>

                  {/* Indicador de no leída */}
                  {!item.read && (
                    <span className="mt-2 size-2 flex-shrink-0 rounded-full bg-primary" />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
