import "@/css/satoshi.css";
import "@/css/style.css";

import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import type { PropsWithChildren } from "react";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    template: "%s | Guvery Blog",
    default: "Guvery Blog — Aprende a comprar en Amazon desde Perú",
  },
  description:
    "Guías y consejos sobre compras internacionales e importaciones personales desde USA para Perú.",
  openGraph: {
    siteName: "Guvery Blog",
    locale: "es_PE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <Providers>
          <NextTopLoader color="#E86C2C" showSpinner={false} />
          {children}
        </Providers>
      </body>
    </html>
  );
}
