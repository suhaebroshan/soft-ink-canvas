import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Upload, FileJson, FileText, FileType } from 'lucide-react';
import { useDiary } from '@/contexts/DiaryContext';
import { exportService } from '@/lib/export';
import { dbService } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

export const ExportImportDialog = () => {
  const { entries, refreshEntries } = useDiary();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExportJSON = async () => {
    try {
      setIsExporting(true);
      await exportService.exportToJSON(entries);
      toast({
        title: 'Export successful',
        description: 'Your diary has been exported as JSON',
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Failed to export diary',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportMarkdown = async () => {
    try {
      setIsExporting(true);
      await exportService.exportToMarkdown(entries);
      toast({
        title: 'Export successful',
        description: 'Your diary has been exported as Markdown',
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Failed to export diary',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportDocx = async () => {
    try {
      setIsExporting(true);
      await exportService.exportToDocx(entries);
      toast({
        title: 'Export successful',
        description: 'Your diary has been exported as DOCX',
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Failed to export diary',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const data = await exportService.importFromJSON(file);
      await dbService.importAllData(data);
      await refreshEntries();
      
      toast({
        title: 'Import successful',
        description: `Imported ${data.entries.length} entries`,
      });
      
      setIsOpen(false);
    } catch (error) {
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'Failed to import backup',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
      // Reset input
      event.target.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Backup & Restore
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Backup & Restore</DialogTitle>
          <DialogDescription>
            Export your diary for safekeeping or import from a previous backup
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Export Section */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Diary
            </h3>
            <div className="grid gap-2">
              <Button
                variant="outline"
                onClick={handleExportJSON}
                disabled={isExporting || entries.length === 0}
                className="justify-start gap-2"
              >
                <FileJson className="h-4 w-4" />
                Export as JSON (backup format)
              </Button>
              <Button
                variant="outline"
                onClick={handleExportMarkdown}
                disabled={isExporting || entries.length === 0}
                className="justify-start gap-2"
              >
                <FileText className="h-4 w-4" />
                Export as Markdown
              </Button>
              <Button
                variant="outline"
                onClick={handleExportDocx}
                disabled={isExporting || entries.length === 0}
                className="justify-start gap-2"
              >
                <FileType className="h-4 w-4" />
                Export as DOCX (Word)
              </Button>
            </div>
            {entries.length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                No entries to export yet
              </p>
            )}
          </div>

          <Separator />

          {/* Import Section */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import from Backup
            </h3>
            <div className="space-y-2">
              <label htmlFor="import-file">
                <Button
                  variant="outline"
                  className="justify-start gap-2 w-full cursor-pointer"
                  disabled={isImporting}
                  asChild
                >
                  <span>
                    <Upload className="h-4 w-4" />
                    {isImporting ? 'Importing...' : 'Import JSON Backup'}
                  </span>
                </Button>
              </label>
              <input
                id="import-file"
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={isImporting}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground">
                Warning: Importing will replace all current entries
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
