import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { PersonalInfoForm } from "@/app/(admin)/pages/settings/_components/personal-info";
import { UploadPhotoForm } from "@/app/(admin)/pages/settings/_components/upload-photo";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/admin/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      image: true,
      bio: true,
      slug: true,
    },
  });

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="mx-auto w-full max-w-[1080px]">
      <Breadcrumb pageName="Perfil" />

      <div className="grid grid-cols-5 gap-8">
        <div className="col-span-5 xl:col-span-3">
          <PersonalInfoForm
            name={user.name ?? ""}
            email={user.email}
            slug={user.slug}
            bio={user.bio}
          />
        </div>
        <div className="col-span-5 xl:col-span-2">
          <UploadPhotoForm image={user.image} name={user.name ?? ""} />
        </div>
      </div>
    </div>
  );
}
