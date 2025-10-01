import { DiaryEntry } from '@/types/entry';
import TurndownService from 'turndown';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
});

export const exportService = {
  // Export to JSON
  async exportToJSON(entries: DiaryEntry[]): Promise<void> {
    const data = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      entries: entries,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    saveAs(blob, `diary-backup-${new Date().toISOString().split('T')[0]}.json`);
  },

  // Export to Markdown
  async exportToMarkdown(entries: DiaryEntry[]): Promise<void> {
    let markdown = '# My Diary\n\n';
    markdown += `Exported on: ${new Date().toLocaleDateString()}\n\n---\n\n`;

    for (const entry of entries) {
      markdown += `## ${entry.title}\n\n`;
      markdown += `**Date:** ${new Date(entry.date).toLocaleDateString()}\n\n`;
      
      if (entry.tags.length > 0) {
        markdown += `**Tags:** ${entry.tags.join(', ')}\n\n`;
      }

      // Convert HTML to Markdown
      const content = turndownService.turndown(entry.content);
      markdown += content + '\n\n---\n\n';
    }

    const blob = new Blob([markdown], { type: 'text/markdown' });
    saveAs(blob, `diary-export-${new Date().toISOString().split('T')[0]}.md`);
  },

  // Export to DOCX
  async exportToDocx(entries: DiaryEntry[]): Promise<void> {
    const children: Paragraph[] = [];

    // Title
    children.push(
      new Paragraph({
        text: 'My Diary',
        heading: HeadingLevel.HEADING_1,
      })
    );

    children.push(
      new Paragraph({
        text: `Exported on: ${new Date().toLocaleDateString()}`,
        spacing: { after: 400 },
      })
    );

    // Add each entry
    for (const entry of entries) {
      children.push(
        new Paragraph({
          text: entry.title,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 },
        })
      );

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Date: ${new Date(entry.date).toLocaleDateString()}`,
              italics: true,
            }),
          ],
          spacing: { after: 200 },
        })
      );

      if (entry.tags.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Tags: ${entry.tags.join(', ')}`,
                italics: true,
              }),
            ],
            spacing: { after: 200 },
          })
        );
      }

      // Convert HTML to plain text for DOCX
      const div = document.createElement('div');
      div.innerHTML = entry.content;
      const text = div.textContent || div.innerText || '';
      
      children.push(
        new Paragraph({
          text: text,
          spacing: { after: 400 },
        })
      );
    }

    const doc = new Document({
      sections: [
        {
          children,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `diary-export-${new Date().toISOString().split('T')[0]}.docx`);
  },

  // Import from JSON
  async importFromJSON(file: File): Promise<{ entries: DiaryEntry[] }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);

          // Validate the data structure
          if (!data.entries || !Array.isArray(data.entries)) {
            throw new Error('Invalid backup file format');
          }

          resolve(data);
        } catch (error) {
          reject(new Error('Failed to parse backup file'));
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  },
};
