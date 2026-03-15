"use client";

import {
  getUserNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/actions/notification.actions";
import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BellIcon } from "./icons";

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

export function Notification() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const isMobile = useIsMobile();

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function fetchNotifications() {
    const data = await getUserNotifications();
    setNotifications(data);
  }

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleOpen(open: boolean) {
    setIsOpen(open);
    // Al abrir el dropdown, marcar todas como leídas
    if (open && unreadCount > 0) {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  }

  async function handleItemClick(id: string) {
    setIsOpen(false);
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }

  return (
    <Dropdown isOpen={isOpen} setIsOpen={handleOpen}>
      <DropdownTrigger
        className="grid size-12 place-items-center rounded-full border bg-gray-2 text-dark outline-none hover:text-primary focus-visible:border-primary focus-visible:text-primary dark:border-dark-4 dark:bg-dark-3 dark:text-white dark:focus-visible:border-primary"
        aria-label="Ver notificaciones"
      >
        <span className="relative">
          <BellIcon />

          {unreadCount > 0 && (
            <span className="absolute right-0 top-0 z-1 size-2 rounded-full bg-red-light ring-2 ring-gray-2 dark:ring-dark-3">
              <span className="absolute inset-0 -z-1 animate-ping rounded-full bg-red-light opacity-75" />
            </span>
          )}
        </span>
      </DropdownTrigger>

      <DropdownContent
        align={isMobile ? "end" : "center"}
        className="border border-stroke bg-white px-3.5 py-3 shadow-md dark:border-dark-3 dark:bg-gray-dark min-[350px]:min-w-[20rem]"
      >
        <div className="mb-1 flex items-center justify-between px-2 py-1.5">
          <span className="text-lg font-medium text-dark dark:text-white">
            Notificaciones
          </span>
          {unreadCount > 0 && (
            <span className="rounded-md bg-primary px-[9px] py-0.5 text-xs font-medium text-white">
              {unreadCount} {unreadCount === 1 ? "nueva" : "nuevas"}
            </span>
          )}
        </div>

        <ul className="mb-3 max-h-[23rem] space-y-1.5 overflow-y-auto">
          {notifications.length === 0 ? (
            <li className="px-2 py-6 text-center text-sm text-dark-5 dark:text-dark-6">
              Sin notificaciones
            </li>
          ) : (
            notifications.map((item) => (
              <li key={item.id} role="menuitem">
                <Link
                  href={getPostHref(item)}
                  onClick={() => handleItemClick(item.id)}
                  className={cn(
                    "flex items-start gap-3 rounded-lg px-2 py-2 outline-none hover:bg-gray-2 focus-visible:bg-gray-2 dark:hover:bg-dark-3 dark:focus-visible:bg-dark-3",
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

                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm text-dark dark:text-white">
                      {item.message}
                    </p>
                    <span className="text-xs text-dark-5 dark:text-dark-6">
                      {timeAgo(item.createdAt)}
                    </span>
                  </div>

                  {/* Punto indicador de no leída */}
                  {!item.read && (
                    <span className="mt-1.5 size-2 flex-shrink-0 rounded-full bg-primary" />
                  )}
                </Link>
              </li>
            ))
          )}
        </ul>

        <Link
          href="/admin/notificaciones"
          onClick={() => setIsOpen(false)}
          className="block rounded-lg border border-primary p-2 text-center text-sm font-medium tracking-wide text-primary outline-none transition-colors hover:bg-blue-light-5 focus:bg-blue-light-5 focus:text-primary focus-visible:border-primary dark:border-dark-3 dark:text-dark-6 dark:hover:border-dark-5 dark:hover:bg-dark-3 dark:hover:text-dark-7 dark:focus-visible:border-dark-5 dark:focus-visible:bg-dark-3 dark:focus-visible:text-dark-7"
        >
          Ver todas las notificaciones
        </Link>
      </DropdownContent>
    </Dropdown>
  );
}
