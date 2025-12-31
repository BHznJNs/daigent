from pathlib import Path
from markitdown import MarkItDown

class FileSystemTool:
    def __init__(self, cwd: str):
        if cwd == "~":
            cwd = str(Path.home())
        self.cwd = cwd
        self.md = MarkItDown()

    def _is_markitdown_convertable_binary(self, path: str) -> bool:
        return Path(path).suffix.lower() in (".pdf", ".docx", ".pptx", ".xlsx", ".epub")

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
            The contents of the file, with optional line numbers added.
        """
        abs_path = Path(self.cwd) / path

        if not abs_path.exists():
            raise FileNotFoundError(f"File not found at {path}")

        if self._is_markitdown_convertable_binary(path):
            result = self.md.convert(abs_path)
            lines = result.markdown.splitlines()
        else:
            with open(abs_path, "r", encoding="utf-8") as f:
                lines = f.read().splitlines()

        if enable_line_numbers:
            return "\n".join(f"{i:4d} | {line}" for i, line in enumerate(lines, 1))
        else:
            return "\n".join(lines)

    def read_file_batch(self, paths: list[str], enable_line_numbers: bool = False) -> str:
        """
        Request to read the contents of multiple files at the specified paths.
        This tool will directly return the file content for text files;
        for .pdf, .docx, .pptx, .xlsx, .epub files, this tool will convert the file to markdown format and return the markdown text.
        Use this when you need to examine the contents of multiple existing files you do not know the contents of,
        for example to analyze code, review text files, or extract information from configuration files.
        
        
        Args:
            paths: (required) The paths of the files to read (relative to the current working directory).
            enable_line_numbers: (optional, default: False) Whether to add line numbers to the file content, if you want to edit the read file later, you may need to enable this option.

        Returns:
            The contents of the files with XML wrapper, with optional line numbers added.
        
        Result example:
            Input:
                paths: ["test.txt"]
                enable_line_numbers: True

            Output:
            ```
            <file_content path="test.txt">
            1 | Hello World!
            2 | This is a test file.
            3 | It contains multiple lines.
            4 | And some special characters like !@#$%^&*()_+{}|:"<>?
            </file_content>
            ```

            - - -

            Input:
                paths: ["test.txt", "test.pdf", "not_exist.txt"]
                enable_line_numbers: False

            Output:
            ```
            <file_content path="test.txt">
            Hello World!
            This is a test file.
            It contains multiple lines.
            And some special characters like !@#$%^&*()_+{}|:"<>?
            </file_content>
            <file_content path="test.pdf">
            # Test PDF File
            This is a test PDF file.
            It contains multiple pages.
            And some special characters like !@#$%^&*()_+{}|:"<>?
            </file_content>
            <file_content path="not_exist.txt">
            Error: File not found at not_exist.txt
            </file_content>            
            ```
        """
        result = ""
        for path in paths:
            try:
                file_content = self.read_file(path, enable_line_numbers)
            except Exception as e:
                file_content = f"Error: {e}"
            result += f"""\
<file_content path="{path}">
{file_content}
</file_content>
"""
        return result
