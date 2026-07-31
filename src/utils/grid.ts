import { DesktopItem } from '../types';

/**
 * Finds the next available grid spot on the Desktop that doesn't overlap with existing items.
 */
export function findAvailableGridSpot(
  items: DesktopItem[],
  excludeId?: string
): { x: number; y: number } {
  // Only consider items visible directly on the desktop (not deleted, no folderId)
  const activeItems = items.filter(
    (item) => !item.isDeleted && !item.folderId && item.id !== excludeId
  );

  const isOccupied = (x: number, y: number) => {
    return activeItems.some(
      (item) => Math.abs(item.x - x) < 60 && Math.abs(item.y - y) < 60
    );
  };

  const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  const maxRows = Math.max(5, Math.floor((windowHeight - 140) / 100));

  for (let col = 0; col < 25; col++) {
    for (let row = 0; row < maxRows; row++) {
      const candidateX = 24 + col * 110;
      const candidateY = 24 + row * 100;
      if (!isOccupied(candidateX, candidateY)) {
        return { x: candidateX, y: candidateY };
      }
    }
  }

  return { x: 24, y: 24 };
}

/**
 * Auto-resolves any overlapping items in a list of desktop items.
 */
export function resolveOverlappingItems(items: DesktopItem[]): {
  items: DesktopItem[];
  changed: boolean;
} {
  let changed = false;
  const occupiedKeys = new Set<string>();

  const updatedItems = items.map((item) => {
    if (item.isDeleted || item.folderId) return item;

    // Grid cell key rounded to 50px
    const key = `${Math.round(item.x / 50)},${Math.round(item.y / 50)}`;
    if (occupiedKeys.has(key)) {
      // Overlap detected! Find next free spot
      const spot = findAvailableGridSpot(items, item.id);
      item = { ...item, x: spot.x, y: spot.y };
      changed = true;
    }
    const newKey = `${Math.round(item.x / 50)},${Math.round(item.y / 50)}`;
    occupiedKeys.add(newKey);
    return item;
  });

  return { items: updatedItems, changed };
}
