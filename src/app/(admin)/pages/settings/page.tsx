import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings Page",
};

export default function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-[1080px]">
      <Breadcrumb pageName="Settings" />

      <div className="flex flex-col gap-8">
        {/* Preferencias de la aplicación */}
        <ShowcaseSection title="Preferencias de la aplicación" className="!p-7">
          <div className="flex flex-col gap-6">
            {/* Tema */}
            <div>
              <h3 className="mb-3 text-sm font-medium text-dark dark:text-white">
                Tema
              </h3>
              <div className="flex gap-3">
                {["Claro", "Oscuro", "Sistema"].map((option) => (
                  <label
                    key={option}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <input
                      type="radio"
                      name="theme"
                      value={option.toLowerCase()}
                      defaultChecked={option === "Sistema"}
                      className="accent-primary"
                    />
                    <span className="text-sm text-dark dark:text-white">
                      {option}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Idioma */}
            <div>
              <label
                htmlFor="language"
                className="mb-2 block text-sm font-medium text-dark dark:text-white"
              >
                Idioma
              </label>
              <select
                id="language"
                name="language"
                defaultValue="es"
                className="w-full max-w-xs rounded-lg border border-stroke bg-white px-4 py-2 text-sm text-dark focus:border-primary focus:outline-none dark:border-dark-3 dark:bg-gray-dark dark:text-white"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="pt">Português</option>
              </select>
            </div>

            {/* Notificaciones */}
            <div>
              <h3 className="mb-3 text-sm font-medium text-dark dark:text-white">
                Notificaciones
              </h3>
              <div className="flex flex-col gap-3">
                {[
                  { id: "notif-email", label: "Notificaciones por email" },
                  { id: "notif-push", label: "Notificaciones push" },
                  { id: "notif-marketing", label: "Emails de marketing" },
                ].map(({ id, label }) => (
                  <label
                    key={id}
                    htmlFor={id}
                    className="flex cursor-pointer items-center justify-between rounded-lg border border-stroke px-4 py-3 dark:border-dark-3"
                  >
                    <span className="text-sm text-dark dark:text-white">
                      {label}
                    </span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        id={id}
                        defaultChecked
                        className="peer sr-only"
                      />
                      <div className="h-5 w-9 rounded-full bg-gray-4 peer-checked:bg-primary dark:bg-dark-3" />
                      <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-4" />
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="rounded-lg border border-stroke px-6 py-[7px] font-medium text-dark hover:shadow-1 dark:border-dark-3 dark:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-lg bg-primary px-6 py-[7px] font-medium text-gray-2 hover:bg-opacity-90"
              >
                Guardar
              </button>
            </div>
          </div>
        </ShowcaseSection>

        {/* Seguridad */}
        <ShowcaseSection title="Seguridad" className="!p-7">
          <div className="flex flex-col gap-6">
            {/* Cambio de contraseña */}
            <div>
              <h3 className="mb-4 text-sm font-medium text-dark dark:text-white">
                Cambio de contraseña
              </h3>
              <div className="flex flex-col gap-4">
                <div>
                  <label
                    htmlFor="current-password"
                    className="mb-2 block text-sm font-medium text-dark dark:text-white"
                  >
                    Contraseña actual
                  </label>
                  <input
                    type="password"
                    id="current-password"
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-stroke bg-white px-4 py-2.5 text-sm text-dark focus:border-primary focus:outline-none dark:border-dark-3 dark:bg-gray-dark dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="new-password"
                    className="mb-2 block text-sm font-medium text-dark dark:text-white"
                  >
                    Nueva contraseña
                  </label>
                  <input
                    type="password"
                    id="new-password"
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-stroke bg-white px-4 py-2.5 text-sm text-dark focus:border-primary focus:outline-none dark:border-dark-3 dark:bg-gray-dark dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="confirm-password"
                    className="mb-2 block text-sm font-medium text-dark dark:text-white"
                  >
                    Confirmar nueva contraseña
                  </label>
                  <input
                    type="password"
                    id="confirm-password"
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-stroke bg-white px-4 py-2.5 text-sm text-dark focus:border-primary focus:outline-none dark:border-dark-3 dark:bg-gray-dark dark:text-white"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="rounded-lg bg-primary px-6 py-[7px] font-medium text-gray-2 hover:bg-opacity-90"
                  >
                    Actualizar contraseña
                  </button>
                </div>
              </div>
            </div>

            {/* 2FA */}
            <div className="border-t border-stroke pt-6 dark:border-dark-3">
              <h3 className="mb-1 text-sm font-medium text-dark dark:text-white">
                Autenticación de dos factores (2FA)
              </h3>
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                Agrega una capa adicional de seguridad a tu cuenta.
              </p>
              <div className="flex items-center justify-between rounded-lg border border-stroke px-4 py-3 dark:border-dark-3">
                <div>
                  <p className="text-sm font-medium text-dark dark:text-white">
                    Aplicación de autenticación
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Usa Google Authenticator, Authy u otra app compatible.
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-lg border border-primary px-4 py-1.5 text-sm font-medium text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  Activar
                </button>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        {/* Integraciones */}
        <ShowcaseSection title="Integraciones" className="!p-7">
          <div className="flex flex-col gap-4">
            {[
              {
                name: "Google",
                description: "Conecta tu cuenta de Google para iniciar sesión fácilmente.",
                connected: true,
              },
              {
                name: "GitHub",
                description: "Vincula tu cuenta de GitHub para acceso rápido.",
                connected: false,
              },
              {
                name: "Slack",
                description: "Recibe notificaciones directamente en tu canal de Slack.",
                connected: false,
              },
            ].map((integration) => (
              <div
                key={integration.name}
                className="flex items-center justify-between rounded-lg border border-stroke px-4 py-3.5 dark:border-dark-3"
              >
                <div>
                  <p className="text-sm font-medium text-dark dark:text-white">
                    {integration.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {integration.description}
                  </p>
                </div>
                <button
                  type="button"
                  className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                    integration.connected
                      ? "border border-red bg-transparent text-red hover:bg-red hover:text-white"
                      : "bg-primary text-gray-2 hover:bg-opacity-90"
                  }`}
                >
                  {integration.connected ? "Desconectar" : "Conectar"}
                </button>
              </div>
            ))}
          </div>
        </ShowcaseSection>
      </div>
    </div>
  );
}
