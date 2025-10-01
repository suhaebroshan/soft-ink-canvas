import React, { createContext, useContext, useState, useEffect } from 'react';
import { DiaryEntry, EntryFilters } from '@/types/entry';
import { dbService } from '@/lib/db';

interface DiaryContextType {
  entries: DiaryEntry[];
  currentEntry: DiaryEntry | null;
  isLoading: boolean;
  setCurrentEntry: (entry: DiaryEntry | null) => void;
  addEntry: (entry: Omit<DiaryEntry, 'id' | 'date' | 'lastModified'>) => Promise<void>;
  updateEntry: (id: string, updates: Partial<DiaryEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  searchEntries: (filters: EntryFilters) => DiaryEntry[];
  refreshEntries: () => Promise<void>;
}

const DiaryContext = createContext<DiaryContextType | undefined>(undefined);

export const DiaryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<DiaryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load entries from IndexedDB on mount
  const refreshEntries = async () => {
    try {
      setIsLoading(true);
      const loadedEntries = await dbService.getAllEntries();
      // Sort by date, newest first
      loadedEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setEntries(loadedEntries);
    } catch (error) {
      console.error('Failed to load entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshEntries();

    // Restore last session
    const restoreSession = async () => {
      const lastEntryId = await dbService.getSetting('lastOpenEntry');
      if (lastEntryId) {
        const entry = await dbService.getEntry(lastEntryId);
        if (entry) {
          setCurrentEntry(entry);
        }
      }
    };

    restoreSession();
  }, []);

  // Save current entry ID for session restore
  useEffect(() => {
    if (currentEntry) {
      dbService.setSetting('lastOpenEntry', currentEntry.id);
    }
  }, [currentEntry?.id]);

  const addEntry = async (entry: Omit<DiaryEntry, 'id' | 'date' | 'lastModified'>) => {
    const newEntry: DiaryEntry = {
      ...entry,
      id: crypto.randomUUID(),
      date: new Date(),
      lastModified: new Date(),
    };

    await dbService.addEntry(newEntry);
    setEntries((prev) => [newEntry, ...prev]);
    setCurrentEntry(newEntry);
  };

  const updateEntry = async (id: string, updates: Partial<DiaryEntry>) => {
    const existingEntry = entries.find((e) => e.id === id);
    if (!existingEntry) return;

    const updatedEntry: DiaryEntry = {
      ...existingEntry,
      ...updates,
      lastModified: new Date(),
    };

    await dbService.updateEntry(updatedEntry);
    
    setEntries((prev) =>
      prev.map((entry) => (entry.id === id ? updatedEntry : entry))
    );

    if (currentEntry?.id === id) {
      setCurrentEntry(updatedEntry);
    }
  };

  const deleteEntry = async (id: string) => {
    await dbService.deleteEntry(id);
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
    
    if (currentEntry?.id === id) {
      setCurrentEntry(null);
      await dbService.setSetting('lastOpenEntry', null);
    }
  };

  const searchEntries = (filters: EntryFilters): DiaryEntry[] => {
    return entries.filter((entry) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (
          !entry.title.toLowerCase().includes(searchLower) &&
          !entry.content.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      if (filters.tags && filters.tags.length > 0) {
        if (!filters.tags.some((tag) => entry.tags.includes(tag))) {
          return false;
        }
      }

      if (filters.folder && entry.folder !== filters.folder) {
        return false;
      }

      if (filters.dateRange) {
        const entryDate = new Date(entry.date);
        if (
          entryDate < filters.dateRange.start ||
          entryDate > filters.dateRange.end
        ) {
          return false;
        }
      }

      return true;
    });
  };

  return (
    <DiaryContext.Provider
      value={{
        entries,
        currentEntry,
        isLoading,
        setCurrentEntry,
        addEntry,
        updateEntry,
        deleteEntry,
        searchEntries,
        refreshEntries,
      }}
    >
      {children}
    </DiaryContext.Provider>
  );
};

export const useDiary = () => {
  const context = useContext(DiaryContext);
  if (!context) {
    throw new Error('useDiary must be used within DiaryProvider');
  }
  return context;
};
