"use client";

import { useEffect, useRef, useState } from "react";

type Heading = {
  id: string;
  text: string;
  level: 2 | 3;
};

type Props = {
  /** Selector CSS del contenedor del artículo. Por defecto "#article-content". */
  contentSelector?: string;
};

function slugifyText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function TableOfContents({ contentSelector = "#article-content" }: Props) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 1. Extrae headings del DOM y les asigna ids
  useEffect(() => {
    const container = document.querySelector(contentSelector);
    if (!container) return;

    const nodes = container.querySelectorAll("h2, h3");
    if (nodes.length === 0) return;

    const extracted: Heading[] = [];
    const usedIds = new Set<string>();

    nodes.forEach((node) => {
      const level = parseInt(node.tagName[1]) as 2 | 3;
      const text = node.textContent?.trim() ?? "";

      // Genera un id único si el heading no tiene uno
      if (!node.id) {
        let base = slugifyText(text) || `heading-${extracted.length}`;
        let id = base;
        let counter = 1;
        while (usedIds.has(id)) {
          id = `${base}-${counter++}`;
        }
        node.id = id;
      }

      usedIds.add(node.id);
      extracted.push({ id: node.id, text, level });
    });

    setHeadings(extracted);
    if (extracted.length > 0) setActiveId(extracted[0].id);
  }, [contentSelector]);

  // 2. IntersectionObserver para resaltar el heading activo
  useEffect(() => {
    if (headings.length === 0) return;

    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // El primer heading visible desde arriba pasa a ser el activo
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "0px 0px -70% 0px",
        threshold: 0,
      },
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [headings]);

  if (headings.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-3 text-base font-bold text-gray-900 dark:text-white">
          En este artículo
        </h2>
        <p className="text-sm text-gray-400">
          Desplázate por el contenido para leer el artículo completo.
        </p>
      </div>
    );
  }

  return (
    <nav
      aria-label="Tabla de contenidos"
      className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
    >
      <h2 className="mb-4 text-base font-bold text-gray-900 dark:text-white">
        En este artículo
      </h2>
      <ol className="space-y-1">
        {headings.map(({ id, text, level }) => (
          <li key={id} className={level === 3 ? "pl-4" : ""}>
            <a
              href={`#${id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
                setActiveId(id);
              }}
              className={`block rounded-lg px-2 py-1 text-sm transition-colors ${
                activeId === id
                  ? "font-semibold text-[#E86C2C]"
                  : "text-gray-500 hover:text-[#E86C2C] dark:text-gray-400 dark:hover:text-[#E86C2C]"
              }`}
            >
              {text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
