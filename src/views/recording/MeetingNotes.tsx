'use client'

import { useCallback, useEffect, useState } from 'react'
import { useEditor, EditorContent, Content } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import { MenuBar } from '@/views/recording/MenuBar'
import { useTranscriptionStore } from '@/lib/store/transcription.store'
import { TRANSCRIPTION_TIME_WINDOW } from '@/config'
import { useContextPackStore } from '@/lib/store/context-pack.store'
import { generateMeetingNotesService } from '@/lib/llm/services/meetingNotes.service'
import MeetingNotesDialog from './MeetingNotesDialog'
import { useRecordingStore } from '@/lib/store/recording.store'

const MeetingNotes = () => {
  const { currentContextPack } = useContextPackStore()
  const { meetingNotesSelectedModel } = useRecordingStore()
  const { getLastFewMinTranscript } = useTranscriptionStore()
  const [text, setText] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: true },
        orderedList: { keepMarks: true, keepAttributes: true },
      }),
      Placeholder.configure({
        placeholder: 'Your AI-powered Conversation Canvas will appear here...',
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none p-4 h-full w-full tiptap-editor',
      },
    },
  })

  useEffect(() => {
    return () => {
      editor?.destroy()
    }
  }, [editor])

  const handleProcessTranscript = useCallback(async () => {
    if (!editor) return

    const lastFewMinTranscript = getLastFewMinTranscript()

    if (
      editor.isDestroyed ||
      !editor.isEditable ||
      lastFewMinTranscript.trim().length === 0
    ) {
      return
    }

    try {
      const contextPrompt = {
        FULL_TRANSCRIPT: lastFewMinTranscript,
        CONTEXT_PACK_DATA: currentContextPack?.properties,
        AGGRESSION_LEVEL: 5,
        VERBOSITY_LEVEL: 'medium',
        CANVAS_STATE: editor.getJSON(),
      }

      const response = await generateMeetingNotesService(
        contextPrompt,
        meetingNotesSelectedModel,
      )

      editor.commands.setContent(response as Content)
    } catch (error) {
      console.error('Error processing transcript:', error)
      const message =
        error instanceof Error ? error.message : 'Failed to process transcript'
      editor
        .chain()
        .focus()
        .setContent(
          `<p><strong>Error:</strong> ${message}</p><p>Please try again.</p>`,
        )
        .run()
    }
  }, [
    currentContextPack?.properties,
    editor,
    getLastFewMinTranscript,
    meetingNotesSelectedModel,
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      handleProcessTranscript()
    }, TRANSCRIPTION_TIME_WINDOW)

    return () => clearInterval(interval)
  }, [handleProcessTranscript])

  return (
    <div className="bg-white rounded-3xl p-4 no-drag h-full flex flex-col">
      <div className="flex items-center justify-between mb-0.5">
        <h3 className="font-semibold text-gray-900">Meeting Notes</h3>
        {process.env.NEXT_PUBLIC_IS_LOCAL_ENVIRONMENT === 'local' && (
          <MeetingNotesDialog />
        )}
      </div>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button onClick={() => handleProcessTranscript()}>Process</button>

      <div className="flex-1 flex flex-col overflow-hidden border border-gray-200 rounded-2xl mt-1">
        {editor && <MenuBar editor={editor} />}
        <div className="flex-1 overflow-hidden text-sm relative">
          <div className="absolute inset-0 overflow-auto no-drag-handle">
            <EditorContent
              editor={editor}
              className="h-full w-full editor-content no-drag-handle"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default MeetingNotes
