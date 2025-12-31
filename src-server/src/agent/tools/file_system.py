from pathlib import Path
from markitdown import MarkItDown

class FileSystemTool:
    def __init__(self, cwd: str):
        if cwd == "~":
            cwd = str(Path.home())
        self.cwd = cwd
        self.md = MarkItDown()

    def _is_markitdown_convertable_binary(self, path: str) -> bool:
        return Path(path).suffix in (".pdf", ".docx", ".pptx", ".xlsx", ".epub")

    def read_file(self, path: str, enable_line_numbers: bool = False) -> str:
        """
        Request to read the contents of a file at the specified path.
        For text files, this tool will directly return the file content;
        for .pdf, .docx, .pptx, .xlsx, .epub files, this tool will convert the file to markdown format and return the markdown text.
        Use this when you need to examine the contents of an existing file you do not know the contents of,\
        for example to analyze code, review text files, or extract information from configuration files.

        Args:
            path: (required) The path of the file to read (relative to the current working directory).
            enable_line_numbers: (optional, default: False) Whether to add line numbers to the file content, if you want to edit the read file later, you may need to enable this option.

        Returns:
            The contents of the file, with line numbers added.
        """
        abs_path = Path(self.cwd) / path

        if not abs_path.exists():
            raise FileNotFoundError(f"File not found at {path}")

        if self._is_markitdown_convertable_binary(path):
            result = self.md.convert(abs_path)
            lines = result.markdown.splitlines()
        else:
            with open(abs_path, "r", encoding="utf-8") as f:
                lines = f.readlines()

        if enable_line_numbers:
            return "\n".join(f"{i:4d} | {line}" for i, line in enumerate(lines, 1))
        else:
            return "\n".join(lines)
