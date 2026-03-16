/** @type {import("next").NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Dominios específicos para avatares de OAuth y CDN propio
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "cdn.guvery.com" },
      // Permitir cualquier dominio HTTPS para imágenes de artículos
      // (los admins pueden ingresar URLs de fuentes externas arbitrarias)
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
