"use client";

import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { useState } from "react";

type Props = {
  /** Nombre del input hidden — debe coincidir con el campo que lee el Server Action */
  name: string;
  /** URL inicial (al editar un recurso existente) */
  defaultValue?: string | null;
  /** Texto del botón de apertura */
  label?: string;
};

/**
 * Abre el widget de Cloudinary para subir una imagen.
 * Guarda la URL resultante en un <input hidden> para que el form padre la recoja.
 * Requiere NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME y un upload preset sin firmar.
 */
export function CloudinaryUploader({
  name,
  defaultValue,
  label = "Subir imagen",
}: Props) {
  const [url, setUrl] = useState<string>(defaultValue ?? "");

  return (
    <div className="space-y-3">
      {/* Input oculto que lleva la URL al Server Action */}
      <input type="hidden" name={name} value={url} />

      {/* Preview de la imagen actual */}
      {url && (
        <div className="relative h-36 w-full overflow-hidden rounded-lg border border-stroke dark:border-dark-3">
          <Image
            src={url}
            alt="Imagen de portada"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
          <button
            type="button"
            onClick={() => setUrl("")}
            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-xs text-white transition-opacity hover:bg-black/70"
            aria-label="Quitar imagen"
          >
            ✕
          </button>
        </div>
      )}

      {/* Botón que abre el widget de Cloudinary */}
      <CldUploadWidget
        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
        options={{
          maxFiles: 1,
          resourceType: "image",
          clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
          maxFileSize: 5_000_000,
          cropping: false,
          sources: ["local", "url"],
          language: "es",
          text: {
            es: {
              or: "o",
              menu: { files: "Mis archivos", url: "URL" },
              selection_counter: { image: "imagen seleccionada" },
              actions: { upload: "Subir" },
            },
          },
        }}
        onSuccess={(result) => {
          if (
            result.event === "success" &&
            typeof result.info === "object" &&
            result.info !== null &&
            "secure_url" in result.info
          ) {
            setUrl(result.info.secure_url as string);
          }
        }}
      >
        {({ open }) => (
          <button
            type="button"
            onClick={() => open()}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-stroke bg-gray-2 px-4 py-3 text-sm font-medium text-dark transition-colors hover:border-primary hover:text-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:hover:border-primary"
          >
            <span>↑</span>
            {url ? "Cambiar imagen" : label}
          </button>
        )}
      </CldUploadWidget>

      <p className="text-xs text-gray-500">
        JPG, PNG o WebP · máx. 5 MB
      </p>
    </div>
  );
}
