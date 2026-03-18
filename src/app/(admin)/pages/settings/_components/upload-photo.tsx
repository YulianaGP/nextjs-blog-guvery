"use client";

import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { updateProfileImage } from "@/actions/profile.actions";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { useState, useTransition } from "react";

const FALLBACK_IMG = "/images/user/user-03.png";

type Props = {
  image: string | null;
  name: string;
};

export function UploadPhotoForm({ image, name }: Props) {
  const [src, setSrc] = useState(image ?? FALLBACK_IMG);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleUploadSuccess(secureUrl: string) {
    setSrc(secureUrl);
    startTransition(async () => {
      const result = await updateProfileImage(secureUrl);
      setMessage({ text: result?.message ?? "", ok: result?.success ?? false });
    });
  }

  return (
    <ShowcaseSection title="Tu foto" className="!p-7">
      <div className="mb-4 flex items-center gap-3">
        <Image
          src={src}
          width={55}
          height={55}
          alt={`Foto de ${name}`}
          className="size-14 rounded-full object-cover"
          quality={90}
        />
        <div>
          <span className="mb-1.5 block font-medium text-dark dark:text-white">
            Editar foto de perfil
          </span>
          <p className="text-body-xs text-gray-500 dark:text-gray-400">
            PNG, JPG o JPEG · máx. 800×800 px
          </p>
        </div>
      </div>

      <CldUploadWidget
        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
        options={{
          maxFiles: 1,
          resourceType: "image",
          clientAllowedFormats: ["jpg", "jpeg", "png"],
          maxFileSize: 2_000_000,
          cropping: true,
          croppingAspectRatio: 1,
          sources: ["local"],
          language: "es",
        }}
        onSuccess={(result) => {
          if (
            result.event === "success" &&
            typeof result.info === "object" &&
            result.info !== null &&
            "secure_url" in result.info
          ) {
            handleUploadSuccess(result.info.secure_url as string);
          }
        }}
      >
        {({ open }) => (
          <div className="relative mb-5.5 block w-full rounded-xl border border-dashed border-gray-4 bg-gray-2 hover:border-primary dark:border-dark-3 dark:bg-dark-2 dark:hover:border-primary">
            <button
              type="button"
              onClick={() => open()}
              className="flex w-full cursor-pointer flex-col items-center justify-center p-4 sm:py-7.5"
            >
              <div className="flex size-13.5 items-center justify-center rounded-full border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark">
                <span className="text-xl">↑</span>
              </div>
              <p className="mt-2.5 text-body-sm font-medium">
                <span className="text-primary">Click para subir</span> o arrastra y suelta
              </p>
              <p className="mt-1 text-body-xs">PNG, JPG o JPEG (máx. 800×800 px)</p>
            </button>
          </div>
        )}
      </CldUploadWidget>

      {message && (
        <p className={`mb-3 text-sm ${message.ok ? "text-green-600" : "text-red-500"}`}>
          {message.text}
        </p>
      )}

      {isPending && (
        <p className="mb-3 text-sm text-gray-500">Guardando foto...</p>
      )}
    </ShowcaseSection>
  );
}
