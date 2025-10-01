import React, { createContext, useContext, useState, useEffect } from 'react';
import { DiaryEntry, EntryFilters } from '@/types/entry';

interface DiaryContextType {
  entries: DiaryEntry[];
  currentEntry: DiaryEntry | null;
  setCurrentEntry: (entry: DiaryEntry | null) => void;
  addEntry: (entry: Omit<DiaryEntry, 'id' | 'date' | 'lastModified'>) => void;
  updateEntry: (id: string, updates: Partial<DiaryEntry>) => void;
  deleteEntry: (id: string) => void;
  searchEntries: (filters: EntryFilters) => DiaryEntry[];
}

const DiaryContext = createContext<DiaryContextType | undefined>(undefined);

const STORAGE_KEY = 'diary-entries';

export const DiaryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<DiaryEntry | null>(null);

  // Load entries from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const entriesWithDates = parsed.map((entry: any) => ({
          ...entry,
          date: new Date(entry.date),
          lastModified: new Date(entry.lastModified),
        }));
        setEntries(entriesWithDates);
      } catch (error) {
        console.error('Failed to load entries:', error);
      }
    }
  }, []);

  // Save entries to localStorage whenever they change
  useEffect(() => {
    if (entries.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    }
  }, [entries]);

  const addEntry = (entry: Omit<DiaryEntry, 'id' | 'date' | 'lastModified'>) => {
    const newEntry: DiaryEntry = {
      ...entry,
      id: crypto.randomUUID(),
      date: new Date(),
      lastModified: new Date(),
    };
    setEntries((prev) => [newEntry, ...prev]);
    setCurrentEntry(newEntry);
  };

  const updateEntry = (id: string, updates: Partial<DiaryEntry>) => {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === id
          ? { ...entry, ...updates, lastModified: new Date() }
          : entry
      )
    );
    if (currentEntry?.id === id) {
      setCurrentEntry((prev) => (prev ? { ...prev, ...updates, lastModified: new Date() } : null));
    }
  };

  const deleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
    if (currentEntry?.id === id) {
      setCurrentEntry(null);
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
        setCurrentEntry,
        addEntry,
        updateEntry,
        deleteEntry,
        searchEntries,
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
