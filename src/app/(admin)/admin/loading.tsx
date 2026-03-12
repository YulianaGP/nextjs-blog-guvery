export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Título */}
      <div>
        <div className="h-7 w-40 rounded-md bg-gray-3 dark:bg-dark-3" />
        <div className="mt-2 h-4 w-56 rounded-md bg-gray-3 dark:bg-dark-3" />
      </div>

      {/* Tarjetas de métricas */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark"
          >
            <div className="h-4 w-24 rounded bg-gray-3 dark:bg-dark-3" />
            <div className="mt-3 h-8 w-16 rounded bg-gray-3 dark:bg-dark-3" />
          </div>
        ))}
      </div>

      {/* Tabla */}
      <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="h-5 w-36 rounded bg-gray-3 dark:bg-dark-3" />
          <div className="h-4 w-20 rounded bg-gray-3 dark:bg-dark-3" />
        </div>
        <div className="divide-y divide-stroke dark:divide-dark-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4">
              <div className="h-4 flex-1 rounded bg-gray-3 dark:bg-dark-3" />
              <div className="h-4 w-24 rounded bg-gray-3 dark:bg-dark-3" />
              <div className="h-5 w-16 rounded-full bg-gray-3 dark:bg-dark-3" />
              <div className="h-4 w-12 rounded bg-gray-3 dark:bg-dark-3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
