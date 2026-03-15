"use client";

import {
  EmailIcon,
  GlobeIcon,
  PencilSquareIcon,
  UserIcon,
} from "@/assets/icons";
import InputGroup from "@/components/FormElements/InputGroup";
import { TextAreaGroup } from "@/components/FormElements/InputGroup/text-area";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { updateProfile } from "@/actions/profile.actions";
import { useSession } from "next-auth/react";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";

type Props = {
  name: string;
  email: string;
  slug: string | null;
  bio: string | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-primary px-6 py-[7px] font-medium text-gray-2 hover:bg-opacity-90 disabled:opacity-60"
    >
      {pending ? "Guardando..." : "Guardar"}
    </button>
  );
}

export function PersonalInfoForm({ name, email, slug, bio }: Props) {
  const [state, formAction] = useActionState(updateProfile, null);
  const { update: updateSession } = useSession();

  // Sincroniza el nombre en el JWT del cliente cuando el guardado fue exitoso
  useEffect(() => {
    if (state?.success && state.updatedName) {
      updateSession({ name: state.updatedName });
    }
  }, [state, updateSession]);

  return (
    <ShowcaseSection title="Información personal" className="!p-7">
      <form action={formAction}>
        <InputGroup
          className="mb-5.5"
          type="text"
          name="name"
          label="Nombre completo"
          placeholder="Tu nombre"
          defaultValue={name}
          icon={<UserIcon />}
          iconPosition="left"
          height="sm"
        />

        <InputGroup
          className="mb-5.5"
          type="email"
          name="email"
          label="Email"
          placeholder=""
          defaultValue={email}
          icon={<EmailIcon />}
          iconPosition="left"
          height="sm"
          disabled
        />

        <div className="mb-5.5">
          <InputGroup
            type="text"
            name="slug"
            label="URL pública del perfil"
            placeholder="tu-nombre"
            defaultValue={slug ?? ""}
            icon={<GlobeIcon />}
            iconPosition="left"
            height="sm"
          />
          <p className="mt-1.5 text-body-xs text-gray-500 dark:text-gray-400">
            Tu perfil público estará en{" "}
            <span className="font-medium">/autor/{slug ?? "tu-slug"}</span>
          </p>
        </div>

        <TextAreaGroup
          className="mb-5.5"
          label="Bio"
          name="bio"
          placeholder="Escribe una breve descripción sobre ti"
          icon={<PencilSquareIcon />}
          defaultValue={bio ?? ""}
        />

        {state && (
          <p
            className={`mb-4 text-sm ${
              state.success ? "text-green-600" : "text-red"
            }`}
          >
            {state.message}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="reset"
            className="rounded-lg border border-stroke px-6 py-[7px] font-medium text-dark hover:shadow-1 dark:border-dark-3 dark:text-white"
          >
            Cancelar
          </button>

          <SubmitButton />
        </div>
      </form>
    </ShowcaseSection>
  );
}
