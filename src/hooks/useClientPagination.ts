import { useMemo, useState } from "react";

export function useClientPagination<T>(items: T[], pageSize: number) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const pageItems = useMemo(
    () => items.slice(page * pageSize, page * pageSize + pageSize),
    [items, page, pageSize],
  );

  const goPrev = () => setPage((prev) => Math.max(0, prev - 1));
  const goNext = () => setPage((prev) => Math.min(totalPages - 1, prev + 1));
  const resetPage = () => setPage(0);

  return { page, totalPages, pageItems, goPrev, goNext, resetPage };
}
