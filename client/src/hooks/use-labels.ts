import { useEffect, useState } from "react";
import { TaskLabel } from "@shared/schema";
import { storage } from "@/lib/storage";

export const LABEL_COLORS = [
  "#F3793A",
  "#147E50",
  "#3B82F6",
  "#8B5CF6",
  "#EAB308",
  "#EC4899",
];

export function useLabels() {
  const [labels, setLabels] = useState<TaskLabel[]>(storage.getLabels);

  useEffect(() => {
    const refresh = () => setLabels(storage.getLabels());
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);

  const addLabel = (name: string, color?: string) => {
    const cleanName = name.trim();
    if (!cleanName) return null;
    const existing = labels.find(
      label => label.name.toLowerCase() === cleanName.toLowerCase(),
    );
    if (existing) return existing;

    const label = storage.addLabel(
      cleanName,
      color || LABEL_COLORS[labels.length % LABEL_COLORS.length],
    );
    setLabels(current => [...current, label]);
    return label;
  };

  const updateLabelColor = (id: string, color: string) => {
    storage.updateLabel(id, { color });
    setLabels(current =>
      current.map(label => (label.id === id ? { ...label, color } : label)),
    );
    window.dispatchEvent(new Event("storage"));
  };

  const deleteLabel = (id: string) => {
    storage.deleteLabel(id);
    setLabels(current => current.filter(label => label.id !== id));
    window.dispatchEvent(new Event("storage"));
  };

  return { labels, addLabel, updateLabelColor, deleteLabel };
}
