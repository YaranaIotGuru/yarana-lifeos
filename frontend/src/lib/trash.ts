// Trash/Recycle Bin — localStorage based (30-day retention)
export type TrashType = 'note' | 'task' | 'client' | 'ledger';
export interface TrashItem { id: string; type: TrashType; data: any; deletedAt: string; }

const KEY = 'yarana_trash_v1';

export const trash = {
  add(type: TrashType, data: any) {
    const items = trash.getAll();
    items.unshift({ id: `${type}_${data.id}_${Date.now()}`, type, data, deletedAt: new Date().toISOString() });
    localStorage.setItem(KEY, JSON.stringify(items.slice(0, 200)));
  },
  getAll(): TrashItem[] {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || '[]') as TrashItem[];
      const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 30);
      return raw.filter(i => new Date(i.deletedAt) > cutoff);
    } catch { return []; }
  },
  remove(id: string) {
    localStorage.setItem(KEY, JSON.stringify(trash.getAll().filter(i => i.id !== id)));
  },
  clear() { localStorage.removeItem(KEY); },
};
