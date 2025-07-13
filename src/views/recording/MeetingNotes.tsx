'use client'
import { useEffect, useCallback } from "react";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { MenuBar } from "@/views/recording/MenuBar";
import { useTranscriptionStore } from "@/lib/store/transcription.store";
import { TRANSCRIPTION_TIME_WINDOW } from '@/config';
import { useContextPackStore } from '@/lib/store/context-pack.store';

const MeetingNotes = () => {

  const { currentContextPack } = useContextPackStore()

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: true,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: true,
        },
      }),
      Placeholder.configure({
        placeholder: 'Your AI-powered Conversation Canvas will appear here...',
      }),
      // Add support for tables
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none p-4 h-full w-full tiptap-editor',
      },
    },
    onBlur: () => {
      // Save content when editor loses focus
      // You can add logic here to persist content if needed
    },
  });
  
  // Clean up editor instance on unmount
  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  const { getLastFewMinTranscript } =
  useTranscriptionStore();

  const handleProcessTranscript = useCallback(async () => {
    if (!editor) return;

    const lastFewMinTranscript = getLastFewMinTranscript();

   try {
      // Ensure editor is ready before accessing its methods
      if (!editor.isDestroyed && editor.isEditable && lastFewMinTranscript.trim().length > 0) {
        const response = await fetch('/api/ai/generate-notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recentTranscript: lastFewMinTranscript,
            contextPack: currentContextPack,
            currentCanvasState: JSON.stringify(editor.getJSON())
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to process transcript');
        }

        const result = await response.json();
        if (result.content.content[0].content[0].text && !editor.isDestroyed) {
          editor.commands.setContent(result.content.content[0].content[0].text);
        } else if (!result.content) {
          throw new Error('Invalid response format from server');
        }
      }
    } catch (error) {
      console.error("Error processing transcript:", error);
      if (editor && !editor.isDestroyed) {
        editor.chain().focus().setContent(`
        <p><strong>Error:</strong> ${error instanceof Error ? error.message : 'Failed to process transcript'}</p>
        <p>Please try again or check the console for more details.</p>
      `).run();
      }
    }
  }, [currentContextPack, editor, getLastFewMinTranscript]);

  // call this function on interval of 5 minute
  useEffect(() => {
    const interval = setInterval(() => {
      handleProcessTranscript();
    }, TRANSCRIPTION_TIME_WINDOW);
    return () => clearInterval(interval);
  }, [handleProcessTranscript]);

  return (
    <div className="bg-white rounded-3xl p-4 no-drag h-full flex flex-col">
      <div className="flex items-center justify-between mb-0.5">
        <h3 className="font-semibold text-gray-900">Meeting Notes</h3>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-gray-500 hover:text-gray-400 cursor-pointer"
          onClick={() => console.log("Settings clicked")}
        >
          <Settings className="size-4" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden border border-gray-200 rounded-2xl mt-1">
        {editor && <MenuBar editor={editor} />}
        <div className="flex-1 overflow-hidden text-sm relative">
          <div className="absolute inset-0 overflow-auto no-drag-handle">
            <EditorContent editor={editor} className="h-full w-full editor-content no-drag-handle" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingNotes;
