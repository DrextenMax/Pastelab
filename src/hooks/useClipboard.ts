import { useState, useCallback } from "react";
import { seedItems } from "@store/clipboard";
import type { ClipboardItem } from "@/types";

export function useClipboard() {
  const [items, setItems] = useState<ClipboardItem[]>(seedItems);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const togglePin = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isPinned: !i.isPinned } : i))
    );
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, isFavorite: !i.isFavorite } : i
      )
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  return { items, remove, togglePin, toggleFavorite, clear };
}
