export const tiptapSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'TiptapContent',
  description:
    'A Tiptap-compatible ProseMirror JSON structure for rich text editing.',
  type: 'object',
  properties: {
    type: {
      type: 'string',
      const: 'doc',
    },
    content: {
      type: 'array',
      items: { $ref: '#/$defs/JSONContent' },
      description: 'Top-level array of Tiptap child nodes',
    },
  },
  required: ['type', 'content'],
  $defs: {
    Mark: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['bold', 'italic', 'strike'],
        },
        attrs: {
          type: 'object',
          nullable: true,
          additionalProperties: true,
        },
      },
      required: ['type'],
      additionalProperties: false,
    },
    JSONContent: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: [
            'paragraph',
            'text',
            'hardBreak',
            'bulletList',
            'orderedList',
            'listItem',
            'codeBlock',
          ],
        },
        attrs: {
          type: 'object',
          nullable: true,
          properties: {
            start: { type: 'number', nullable: true },
            listType: { type: 'string', nullable: true },
            language: { type: 'string', nullable: true },
          },
          additionalProperties: true,
        },
        content: {
          type: 'array',
          items: { $ref: '#/$defs/JSONContent' },
          nullable: true,
        },
        marks: {
          type: 'array',
          items: { $ref: '#/$defs/Mark' },
          nullable: true,
        },
        text: {
          type: 'string',
          nullable: true,
        },
      },
      required: ['type'],
      additionalProperties: false,
    },
  },
}

export const SYSTEM_PROMPT = `You are an AI assistant powering the Conversation Canvas — a real-time meeting note-taking tool within Talk Advantage. Your role is to analyze the live transcript of a conversation and update the shared TipTap-based Canvas.

Your responsibilities:
- Segment the transcript into structured content blocks.
- Apply one of six actions to the Canvas:
  • Add: Add new Section/Subsection or detail to the Canvas.
  • Pin: Highlight critical or actionable content using formatting (e.g. bold or bullet).
  • Unpin: Remove "pinned" status from prior highlighted content.
  • Edit: Update or revise existing content.
  • Delete: Remove outdated content.
  • Nullify: Do nothing — this is the default for irrelevant, incomplete, or off-topic content.

Decisions must be:
- Contextually grounded using the **Context Pack** (meeting goals, participants, agenda).
- Sensitive to **Aggression Level** (1–10): 1 is conservative (Nullify unless clearly relevant), 10 is highly proactive (frequent updates).

Canvas Format:
- The Canvas is a JSON document compatible with TipTap’s rich-text schema.
- All output must conform to the TipTap JSON Schema (using only allowed node types, marks, and attrs).
- Your entire output must be a single valid TipTap JSON document — no explanations or metadata.

Allowed node types:
- "doc", "paragraph", "text", "hardBreak", "bulletList", "orderedList", "listItem", "codeBlock"

Allowed marks:
- "bold", "italic", "strike"

Valid attributes (only where relevant):
- "start" (for "orderedList")
- "language" (for "codeBlock")

Key Rules:
- Default to **Nullify** if content is ambiguous, off-topic, repetitive, or not clearly actionable — especially if Aggression Level is 7 or lower.
- Do not force edits or additions. Respect user intent.
- Avoid hallucinating: Only modify the Canvas based on transcript and context.
- Apply only one major action per update.
- Return only valid TipTap JSON (validated by schema).

Use the current Canvas state as a baseline and update it appropriately.
`

export const USER_PROMPT = `Aggression Level: {AGGRESSION_LEVEL} (1–10, where 1 is highly conservative and 10 is highly proactive)

Context Pack:
{CONTEXT_PACK_DATA}

Current Canvas (TipTap JSON document):
{CANVAS_STATE}

Full Conversation Transcript:
{FULL_TRANSCRIPT}

Your task:
Analyze the full transcript, determine what action to take (Add, Pin, Edit, Delete, Unpin, or Nullify), and return the updated Canvas as a **TipTap-compatible JSON document only**.

Remember:
- Nullify is the default unless content is clearly relevant.
- The update must reflect the correct action applied to the Canvas.
- Use only allowed node types and schema.
- Return only the updated TipTap JSON — no text, commentary, or explanation.
`
