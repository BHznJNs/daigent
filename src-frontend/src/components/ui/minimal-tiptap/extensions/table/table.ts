import { TableKit } from "@tiptap/extension-table";

export const Table = TableKit.extend({
  addKeyboardShortcuts() {
    return {
      "Mod-Alt-t": () =>
        this.editor.commands.insertTable({
          rows: 3,
          cols: 3,
        }),
    };
  },
});

export default Table;
