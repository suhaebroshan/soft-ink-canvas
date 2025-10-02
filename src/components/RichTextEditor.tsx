import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight } from 'lowlight';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import html from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Code, 
  Heading1, 
  Heading2, 
  List, 
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Highlighter,
  FileCode,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

// Setup syntax highlighting
const lowlight = createLowlight();
lowlight.register('javascript', javascript);
lowlight.register('typescript', typescript);
lowlight.register('html', html);
lowlight.register('css', css);

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  onSave?: () => void;
}

const MenuBar = ({ editor }: any) => {
  const [embedDialogOpen, setEmbedDialogOpen] = useState(false);
  const [embedCode, setEmbedCode] = useState('');
  const [embedLanguage, setEmbedLanguage] = useState('html');

  if (!editor) {
    return null;
  }

  const buttonClass = "h-8 w-8 p-0";

  const handleInsertCodeBlock = () => {
    editor.chain().focus().toggleCodeBlock().run();
  };

  const handleInsertEmbed = () => {
    if (embedCode.trim()) {
      editor.chain().focus().insertContent({
        type: 'codeBlock',
        attrs: { language: embedLanguage },
        content: [{ type: 'text', text: embedCode }],
      }).run();
      setEmbedCode('');
      setEmbedDialogOpen(false);
    }
  };

  return (
    <div className="border-b border-border bg-card px-4 py-2 flex items-center gap-1 flex-wrap sticky top-0 z-10">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={buttonClass}
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            data-active={editor.isActive('bold')}
            aria-label="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Bold</TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={buttonClass}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            data-active={editor.isActive('italic')}
            aria-label="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Italic</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={buttonClass}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
            data-active={editor.isActive('strike')}
            aria-label="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Strikethrough</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={buttonClass}
            onClick={() => editor.chain().focus().toggleCode().run()}
            disabled={!editor.can().chain().focus().toggleCode().run()}
            data-active={editor.isActive('code')}
            aria-label="Code"
          >
            <Code className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Inline Code</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={buttonClass}
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            data-active={editor.isActive('highlight')}
            aria-label="Highlight"
          >
            <Highlighter className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Highlight</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={buttonClass}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            data-active={editor.isActive('heading', { level: 1 })}
            aria-label="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Heading 1</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={buttonClass}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            data-active={editor.isActive('heading', { level: 2 })}
            aria-label="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Heading 2</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={buttonClass}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            data-active={editor.isActive('bulletList')}
            aria-label="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Bullet List</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={buttonClass}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            data-active={editor.isActive('orderedList')}
            aria-label="Ordered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Numbered List</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={buttonClass}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            data-active={editor.isActive('blockquote')}
            aria-label="Quote"
          >
            <Quote className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Block Quote</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={buttonClass}
            onClick={handleInsertCodeBlock}
            data-active={editor.isActive('codeBlock')}
            aria-label="Code Block"
          >
            <FileCode className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Code Block</TooltipContent>
      </Tooltip>

      <Dialog open={embedDialogOpen} onOpenChange={setEmbedDialogOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={buttonClass}
                aria-label="Live Embed"
              >
                <Play className="h-4 w-4" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>Insert Live HTML/CSS/JS</TooltipContent>
        </Tooltip>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Live Code Embed</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="language">Language</Label>
              <select
                id="language"
                value={embedLanguage}
                onChange={(e) => setEmbedLanguage(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
              >
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
              </select>
            </div>
            <div>
              <Label htmlFor="code">Code</Label>
              <Textarea
                id="code"
                value={embedCode}
                onChange={(e) => setEmbedCode(e.target.value)}
                placeholder="Paste your code here..."
                className="mt-1 font-mono text-sm min-h-[200px]"
              />
            </div>
            <Button onClick={handleInsertEmbed} className="w-full">
              Insert Code Block
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={buttonClass}
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            aria-label="Undo"
          >
            <Undo className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Undo</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={buttonClass}
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            aria-label="Redo"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Redo</TooltipContent>
      </Tooltip>
    </div>
  );
};

export const RichTextEditor = ({ content, onChange, placeholder, onSave }: RichTextEditorProps) => {
  const [autoSaveTimer, setAutoSaveTimer] = React.useState<NodeJS.Timeout | null>(null);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Disable default code block
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'hljs',
        },
      }),
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
    ],
    content,
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
      onChange(newContent);
      
      // Auto-save after 3 seconds of inactivity
      if (onSave) {
        if (autoSaveTimer) {
          clearTimeout(autoSaveTimer);
        }
        const timer = setTimeout(() => {
          onSave();
        }, 3000);
        setAutoSaveTimer(timer);
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[500px] p-6 font-serif hljs-container',
      },
    },
  });

  // Cleanup timer on unmount
  React.useEffect(() => {
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [autoSaveTimer]);

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card shadow-sm">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} placeholder={placeholder} />
    </div>
  );
};
