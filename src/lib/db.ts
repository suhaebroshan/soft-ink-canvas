import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { DiaryEntry } from '@/types/entry';

interface DiaryDB extends DBSchema {
  entries: {
    key: string;
    value: DiaryEntry;
    indexes: { 'by-date': Date; 'by-title': string };
  };
  settings: {
    key: string;
    value: any;
  };
}

const DB_NAME = 'diary-db';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<DiaryDB> | null = null;

export const initDB = async (): Promise<IDBPDatabase<DiaryDB>> => {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<DiaryDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create entries store
      if (!db.objectStoreNames.contains('entries')) {
        const entryStore = db.createObjectStore('entries', { keyPath: 'id' });
        entryStore.createIndex('by-date', 'date');
        entryStore.createIndex('by-title', 'title');
      }

      // Create settings store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings');
      }
    },
  });

  return dbInstance;
};

export const dbService = {
  // Entries CRUD
  async getAllEntries(): Promise<DiaryEntry[]> {
    const db = await initDB();
    const entries = await db.getAll('entries');
    // Convert date strings back to Date objects
    return entries.map((entry) => ({
      ...entry,
      date: new Date(entry.date),
      lastModified: new Date(entry.lastModified),
    }));
  },

  async getEntry(id: string): Promise<DiaryEntry | undefined> {
    const db = await initDB();
    const entry = await db.get('entries', id);
    if (entry) {
      return {
        ...entry,
        date: new Date(entry.date),
        lastModified: new Date(entry.lastModified),
      };
    }
    return undefined;
  },

  async addEntry(entry: DiaryEntry): Promise<void> {
    const db = await initDB();
    await db.add('entries', entry);
  },

  async updateEntry(entry: DiaryEntry): Promise<void> {
    const db = await initDB();
    await db.put('entries', entry);
  },

  async deleteEntry(id: string): Promise<void> {
    const db = await initDB();
    await db.delete('entries', id);
  },

  async clearAllEntries(): Promise<void> {
    const db = await initDB();
    await db.clear('entries');
  },

  // Settings
  async getSetting(key: string): Promise<any> {
    const db = await initDB();
    return await db.get('settings', key);
  },

  async setSetting(key: string, value: any): Promise<void> {
    const db = await initDB();
    await db.put('settings', value, key);
  },

  // Backup and restore
  async exportAllData(): Promise<{ entries: DiaryEntry[]; settings: any }> {
    const db = await initDB();
    const entries = await this.getAllEntries();
    const settingsKeys = await db.getAllKeys('settings');
    const settings: any = {};
    
    for (const key of settingsKeys) {
      settings[key] = await db.get('settings', key);
    }

    return { entries, settings };
  },

  async importAllData(data: { entries: DiaryEntry[]; settings?: any }): Promise<void> {
    const db = await initDB();
    
    // Clear existing data
    await db.clear('entries');
    
    // Import entries
    const tx = db.transaction('entries', 'readwrite');
    for (const entry of data.entries) {
      await tx.store.add({
        ...entry,
        date: new Date(entry.date),
        lastModified: new Date(entry.lastModified),
      });
    }
    await tx.done;

    // Import settings if provided
    if (data.settings) {
      for (const [key, value] of Object.entries(data.settings)) {
        await db.put('settings', value, key);
      }
    }
  },
};
