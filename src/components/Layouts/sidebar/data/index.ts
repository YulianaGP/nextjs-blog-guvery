import type { ReactElement, SVGProps } from "react";
import * as Icons from "../icons";

type NavSubItem = { title: string; url: string };
type NavItem = {
  title: string;
  url?: string;
  icon: (props: SVGProps<SVGSVGElement>) => ReactElement;
  items: NavSubItem[];
};
type NavSection = { label: string; items: NavItem[] };

export const NAV_DATA: NavSection[] = [
  {
    label: "BLOG GUVERY",
    items: [
      {
        title: "Dashboard",
        url: "/admin",
        icon: Icons.HomeIcon,
        items: [],
      },
      {
        title: "Artículos",
        url: "/admin/articulos",
        icon: Icons.Alphabet,
        items: [],
      },
      {
        title: "Categorías",
        url: "/admin/categorias",
        icon: Icons.FourCircle,
        items: [],
      },
      {
        title: "Suscriptores",
        url: "/admin/suscriptores",
        icon: Icons.User,
        items: [],
      },
    ],
  },
  {
    label: "SISTEMA",
    items: [
      {
        title: "Perfil",
        url: "/profile",
        icon: Icons.User,
        items: [],
      },
      {
        title: "Configuración",
        url: "/pages/settings",
        icon: Icons.Alphabet,
        items: [],
      },
    ],
  },
];
