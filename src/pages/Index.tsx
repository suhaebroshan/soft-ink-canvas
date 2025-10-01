import { useState } from 'react';
import { DiaryProvider, useDiary } from '@/contexts/DiaryContext';
import { EntryCard } from '@/components/EntryCard';
import { RichTextEditor } from '@/components/RichTextEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  PenLine, 
  Search, 
  BookOpen, 
  X,
  Plus,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const DiaryContent = () => {
  const { entries, currentEntry, setCurrentEntry, addEntry, updateEntry, deleteEntry, searchEntries } = useDiary();
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const { toast } = useToast();

  const filteredEntries = searchQuery
    ? searchEntries({ search: searchQuery })
    : entries;

  const handleNewEntry = () => {
    setEditTitle('');
    setEditContent('<p>Start writing your thoughts...</p>');
    setEditTags('');
    setCurrentEntry(null);
    setIsEditing(true);
  };

  const handleEditEntry = (entryId: string) => {
    const entry = entries.find((e) => e.id === entryId);
    if (entry) {
      setCurrentEntry(entry);
      setEditTitle(entry.title);
      setEditContent(entry.content);
      setEditTags(entry.tags.join(', '));
      setIsEditing(true);
    }
  };

  const handleSaveEntry = () => {
    if (!editTitle.trim()) {
      toast({
        title: 'Title required',
        description: 'Please add a title to your entry',
        variant: 'destructive',
      });
      return;
    }

    const tags = editTags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    if (currentEntry) {
      updateEntry(currentEntry.id, {
        title: editTitle,
        content: editContent,
        tags,
      });
      toast({
        title: 'Entry updated',
        description: 'Your diary entry has been saved',
      });
    } else {
      addEntry({
        title: editTitle,
        content: editContent,
        tags,
      });
      toast({
        title: 'Entry created',
        description: 'Your new diary entry has been saved',
      });
    }

    setIsEditing(false);
  };

  const handleDeleteEntry = (entryId: string) => {
    deleteEntry(entryId);
    toast({
      title: 'Entry deleted',
      description: 'Your diary entry has been removed',
    });
    setDeleteConfirmId(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setCurrentEntry(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {!isEditing ? (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="container mx-auto px-4 py-8 max-w-6xl"
          >
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-8 w-8 text-primary" />
                  <h1 className="text-4xl font-serif font-bold text-foreground">My Diary</h1>
                </div>
                <Button
                  onClick={handleNewEntry}
                  size="lg"
                  className="gap-2"
                >
                  <Plus className="h-5 w-5" />
                  New Entry
                </Button>
              </div>

              {/* Search */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search your entries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-card"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Entries Grid */}
            {filteredEntries.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <PenLine className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-serif font-semibold mb-2 text-foreground">
                  {searchQuery ? 'No entries found' : 'Start your diary journey'}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {searchQuery
                    ? 'Try a different search term'
                    : 'Create your first entry and begin documenting your thoughts'}
                </p>
                {!searchQuery && (
                  <Button onClick={handleNewEntry} size="lg">
                    <Plus className="h-5 w-5 mr-2" />
                    Create First Entry
                  </Button>
                )}
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEntries.map((entry) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    onClick={() => handleEditEntry(entry.id)}
                    onDelete={() => setDeleteConfirmId(entry.id)}
                  />
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="editor"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="container mx-auto px-4 py-8 max-w-4xl"
          >
            {/* Editor Header */}
            <div className="mb-6 flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={handleCancelEdit}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to entries
              </Button>
              <Button onClick={handleSaveEntry} size="lg">
                Save Entry
              </Button>
            </div>

            {/* Title Input */}
            <Input
              type="text"
              placeholder="Entry title..."
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="mb-4 text-2xl font-serif font-semibold h-14 bg-card"
            />

            {/* Tags Input */}
            <Input
              type="text"
              placeholder="Tags (comma separated)..."
              value={editTags}
              onChange={(e) => setEditTags(e.target.value)}
              className="mb-6 bg-card"
            />

            {/* Rich Text Editor */}
            <RichTextEditor
              content={editContent}
              onChange={setEditContent}
              placeholder="Start writing your thoughts..."
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDeleteEntry(deleteConfirmId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const Index = () => {
  return (
    <DiaryProvider>
      <DiaryContent />
    </DiaryProvider>
  );
};

export default Index;
