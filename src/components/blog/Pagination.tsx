import Link from "next/link";

type Props = {
  currentPage: number;
  totalPages: number;
  /** Base de la URL, ej: "/blog" o "/categoria/amazon" */
  basePath: string;
};

function pageHref(basePath: string, page: number) {
  return page === 1 ? basePath : `${basePath}?page=${page}`;
}

export function Pagination({ currentPage, totalPages, basePath }: Props) {
  if (totalPages <= 1) return null;

  // Genera el rango de páginas a mostrar (máx. 5 números)
  const pages: (number | "...")[] = [];
  const delta = 2;

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <nav
      aria-label="Paginación"
      className="flex items-center justify-center gap-1 py-8"
    >
      {/* Anterior */}
      {currentPage > 1 ? (
        <Link
          href={pageHref(basePath, currentPage - 1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-sm text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
          aria-label="Página anterior"
        >
          ←
        </Link>
      ) : (
        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-100 text-sm text-gray-300 dark:border-gray-800 dark:text-gray-600">
          ←
        </span>
      )}

      {/* Números */}
      {pages.map((page, i) =>
        page === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="flex h-9 w-9 items-center justify-center text-sm text-gray-400"
          >
            …
          </span>
        ) : (
          <Link
            key={page}
            href={pageHref(basePath, page)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
              page === currentPage
                ? "bg-[#E86C2C] text-white"
                : "border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </Link>
        ),
      )}

      {/* Siguiente */}
      {currentPage < totalPages ? (
        <Link
          href={pageHref(basePath, currentPage + 1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-sm text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
          aria-label="Página siguiente"
        >
          →
        </Link>
      ) : (
        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-100 text-sm text-gray-300 dark:border-gray-800 dark:text-gray-600">
          →
        </span>
      )}
    </nav>
  );
}
