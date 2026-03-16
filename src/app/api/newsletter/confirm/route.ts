import { prisma } from "@/lib/prisma";
import { SubscriberStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://blog.guvery.com";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    redirect(`${BASE_URL}/confirmacion?error=invalid`);
  }

  const subscriber = await prisma.subscriber.findUnique({
    where: { confirmationToken: token },
  });

  if (!subscriber || subscriber.status !== SubscriberStatus.PENDING) {
    redirect(`${BASE_URL}/confirmacion?error=invalid`);
  }

  await prisma.subscriber.update({
    where: { id: subscriber.id },
    data: {
      status: SubscriberStatus.CONFIRMED,
      confirmedAt: new Date(),
      confirmationToken: null,
    },
  });

  redirect(`${BASE_URL}/confirmacion?success=1`);
}
