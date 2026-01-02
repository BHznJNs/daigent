import type { Editor } from "@tiptap/react";
import type { VariantProps } from "class-variance-authority";
import {
  ChevronDownIcon,
  CodeIcon,
  MinusIcon,
  PlusIcon,
  QuoteIcon,
  TableIcon,
} from "lucide-react";
import type { toggleVariants } from "@/components/ui/toggle";
import type { FormatAction } from "../../types";
import { LinkEditPopover } from "../link/link-edit-popover";
import { ToolbarSection } from "../toolbar-section";

type InsertElementAction =
  | "codeBlock"
  | "blockquote"
  | "horizontalRule"
  | "table";
interface InsertElement extends FormatAction {
  value: InsertElementAction;
}

const formatActions: InsertElement[] = [
  {
    value: "codeBlock",
    label: "Code block",
    icon: <CodeIcon className="size-5" />,
    action: (editor) => editor.chain().focus().toggleCodeBlock().run(),
    isActive: (editor) => editor.isActive("codeBlock"),
    canExecute: (editor) =>
      editor.can().chain().focus().toggleCodeBlock().run(),
    shortcuts: ["mod", "alt", "C"],
  },
  {
    value: "blockquote",
    label: "Blockquote",
    icon: <QuoteIcon className="size-5" />,
    action: (editor) => editor.chain().focus().toggleBlockquote().run(),
    isActive: (editor) => editor.isActive("blockquote"),
    canExecute: (editor) =>
      editor.can().chain().focus().toggleBlockquote().run(),
    shortcuts: ["mod", "shift", "B"],
  },
  {
    value: "horizontalRule",
    label: "Divider",
    icon: <MinusIcon className="size-5" />,
    action: (editor) => editor.chain().focus().setHorizontalRule().run(),
    isActive: () => false,
    canExecute: (editor) =>
      editor.can().chain().focus().setHorizontalRule().run(),
    shortcuts: ["mod", "alt", "-"],
  },
  {
    value: "table",
    label: "Table",
    icon: <TableIcon className="size-5" />,
    action: (editor) =>
      editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run(),
    isActive: (editor) => editor.isActive("table"),
    canExecute: (editor) =>
      editor.can().chain().focus().insertTable({ rows: 3, cols: 3 }).run(),
    shortcuts: ["mod", "alt", "T"],
  },
];

interface SectionFiveProps extends VariantProps<typeof toggleVariants> {
  editor: Editor;
  activeActions?: InsertElementAction[];
  mainActionCount?: number;
}

export function SectionFive({
  editor,
  activeActions = formatActions.map((action) => action.value),
  mainActionCount = 0,
  size,
  variant,
}: SectionFiveProps) {
  return (
    <>
      <LinkEditPopover editor={editor} size={size} variant={variant} />
      <ToolbarSection
        editor={editor}
        actions={formatActions}
        activeActions={activeActions}
        mainActionCount={mainActionCount}
        dropdownIcon={
          <>
            <PlusIcon className="size-5" />
            <ChevronDownIcon className="size-5" />
          </>
        }
        dropdownTooltip="Insert elements"
        size={size}
        variant={variant}
      />
    </>
  );
}

SectionFive.displayName = "SectionFive";

export default SectionFive;
