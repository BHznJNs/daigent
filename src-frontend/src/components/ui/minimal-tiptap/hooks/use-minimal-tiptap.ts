import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TextStyle } from "@tiptap/extension-text-style";
import { Typography } from "@tiptap/extension-typography";
import { Placeholder, Selection } from "@tiptap/extensions";
import { Markdown } from "@tiptap/markdown";
import type { Content, Editor, UseEditorOptions } from "@tiptap/react";
import { useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import * as React from "react";
import { cn } from "@/lib/utils";
import {
  CodeBlockLowlight,
  Color,
  HorizontalRule,
  MarkdownPaste,
  ResetMarksOnEnter,
  Table,
  UnsetAllMarks,
} from "../extensions";
import { useThrottle } from "../hooks/use-throttle";
import { getOutput } from "../utils";

export interface UseMinimalTiptapEditorProps extends UseEditorOptions {
  value?: Content;
  output?: "html" | "json" | "text" | "markdown";
  placeholder?: string;
  editorClassName?: string;
  throttleDelay?: number;
  onUpdate?: (content: Content) => void;
  onBlur?: (content: Content) => void;
}

const createExtensions = ({
  placeholder,
  output = "markdown",
}: {
  placeholder: string;
  output: UseMinimalTiptapEditorProps["output"];
}) => [
  StarterKit.configure({
    blockquote: { HTMLAttributes: { class: "block-node" } },
    // bold
    bulletList: { HTMLAttributes: { class: "list-node" } },
    code: { HTMLAttributes: { class: "inline", spellcheck: "false" } },
    codeBlock: false,
    // document
    dropcursor: { width: 2, class: "ProseMirror-dropcursor border" },
    // gapcursor
    // hardBreak
    heading: { HTMLAttributes: { class: "heading-node" } },
    // undoRedo
    horizontalRule: false,
    // italic
    // listItem
    // listKeymap
    link: {
      enableClickSelection: true,
      openOnClick: false,
      HTMLAttributes: {
        class: "link",
      },
    },
    orderedList: { HTMLAttributes: { class: "list-node" } },
    paragraph: { HTMLAttributes: { class: "text-node" } },
    // strike
    // text
    // underline
    // trailingNode
  }),
  Color,
  TextStyle,
  Selection,
  Typography,
  UnsetAllMarks,
  HorizontalRule,
  ResetMarksOnEnter,
  CodeBlockLowlight,
  Placeholder.configure({ placeholder: () => placeholder }),
  // Add MarkdownPaste extension when output is markdown
  ...(output === "markdown"
    ? [
        // Markdown with GFM support for tables, task lists, etc.
        Markdown.configure({
          markedOptions: {
            gfm: true,
          },
        }),
        // Task lists (checkboxes)
        TaskList.configure({
          HTMLAttributes: { class: "task-list-node" },
        }),
        TaskItem.configure({
          nested: true,
        }),
        // Tables
        Table.configure({
          table: {
            HTMLAttributes: { class: "table-node" },
          },
        }),
        MarkdownPaste,
      ]
    : []),
];

export const useMinimalTiptapEditor = ({
  value,
  output = "markdown",
  placeholder = "",
  editorClassName,
  throttleDelay = 0,
  onUpdate,
  onBlur,
  ...props
}: UseMinimalTiptapEditorProps) => {
  const throttledSetValue = useThrottle(
    (value: Content) => onUpdate?.(value),
    throttleDelay
  );

  const handleUpdate = React.useCallback(
    (editor: Editor) => throttledSetValue(getOutput(editor, output)),
    [output, throttledSetValue]
  );

  const handleCreate = React.useCallback(
    (editor: Editor) => {
      if (value && editor.isEmpty) {
        editor.commands.setContent(value, {
          contentType: output === "markdown" ? "markdown" : undefined,
        });
      }
    },
    [value, output]
  );

  const handleBlur = React.useCallback(
    (editor: Editor) => onBlur?.(getOutput(editor, output)),
    [output, onBlur]
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions: createExtensions({ placeholder, output }),
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        class: cn("focus:outline-hidden", editorClassName),
      },
    },
    onUpdate: ({ editor }) => handleUpdate(editor),
    onCreate: ({ editor }) => handleCreate(editor),
    onBlur: ({ editor }) => handleBlur(editor),
    ...props,
  });

  return editor;
};

export default useMinimalTiptapEditor;
