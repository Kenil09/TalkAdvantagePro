import { cn } from '@/utils/tailwind'
import { Editor } from '@tiptap/react'
import { Button } from '@/components/ui/button'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Undo,
  Redo,
  Code,
  Strikethrough,
} from 'lucide-react'

interface MenuBarProps {
  editor: Editor | null
}

export const MenuBar = ({ editor }: MenuBarProps) => {
  if (!editor) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-1 mb-2 border-b border-gray-100 py-[10px] px-[25px]">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn(
          'h-8 w-8 p-0 cursor-pointer',
          editor.isActive('bold') ? 'bg-gray-100' : '',
        )}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn(
          'h-8 w-8 p-0 cursor-pointer',
          editor.isActive('italic') ? 'bg-gray-100' : '',
        )}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={cn(
          'h-8 w-8 p-0 cursor-pointer',
          editor.isActive('strike') ? 'bg-gray-100' : '',
        )}
        title="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(
          'h-8 w-8 p-0 cursor-pointer',
          editor.isActive('bulletList') ? 'bg-gray-100' : '',
        )}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn(
          'h-8 w-8 p-0 cursor-pointer',
          editor.isActive('orderedList') ? 'bg-gray-100' : '',
        )}
        title="Numbered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={cn(
          'h-8 w-8 p-0 cursor-pointer',
          editor.isActive('codeBlock') ? 'bg-gray-100' : '',
        )}
        title="Code Block"
      >
        <Code className="h-4 w-4" />
      </Button>

      <div className="flex-1" />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="h-8 w-8 p-0 cursor-pointer"
        title="Undo"
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="h-8 w-8 p-0 cursor-pointer"
        title="Redo"
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  )
}
