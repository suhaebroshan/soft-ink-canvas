export interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  date: Date;
  tags: string[];
  folder?: string;
  lastModified: Date;
}

export interface EntryFilters {
  search?: string;
  tags?: string[];
  folder?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}
