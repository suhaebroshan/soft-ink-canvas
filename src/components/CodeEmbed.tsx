import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Code } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface CodeEmbedProps {
  code: string;
  language?: string;
  runnable?: boolean;
}

export const CodeEmbed = ({ code, language = 'html', runnable = false }: CodeEmbedProps) => {
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = () => {
    setIsRunning(!isRunning);
  };

  // Create iframe content for live preview
  const iframeContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { margin: 0; padding: 16px; font-family: system-ui, sans-serif; }
          * { box-sizing: border-box; }
        </style>
      </head>
      <body>
        ${code}
      </body>
    </html>
  `;

  return (
    <Card className="my-4 overflow-hidden border-2">
      {runnable && (
        <div className="flex items-center justify-between px-4 py-2 bg-muted border-b">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Code className="h-4 w-4" />
            <span className="font-mono">{language}</span>
          </div>
          <Button
            variant={isRunning ? "secondary" : "default"}
            size="sm"
            onClick={handleRun}
            className="gap-2"
          >
            <Play className="h-3 w-3" />
            {isRunning ? 'Hide Preview' : 'Run Code'}
          </Button>
        </div>
      )}

      {isRunning && runnable ? (
        <div className="bg-white">
          <iframe
            srcDoc={iframeContent}
            sandbox="allow-scripts"
            className="w-full h-64 border-0"
            title="Code preview"
          />
        </div>
      ) : (
        <pre className="p-4 overflow-x-auto bg-card">
          <code className="text-sm font-mono">{code}</code>
        </pre>
      )}
    </Card>
  );
};
