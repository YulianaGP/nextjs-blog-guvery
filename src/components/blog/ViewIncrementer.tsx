"use client";

import { incrementViews } from "@/actions/post.actions";
import { useEffect } from "react";

/**
 * Componente invisible que incrementa las vistas al montar el artículo.
 * Al ser cliente, se ejecuta en cada visita real (no en el caché ISR).
 */
export function ViewIncrementer({ slug }: { slug: string }) {
  useEffect(() => {
    incrementViews(slug);
  }, [slug]);

  return null;
}
