import os

class FileSystemTool:
    def __init__(self, cwd: str):
        if cwd == "~":
            cwd = os.path.expanduser("~")
        self.cwd = cwd

    def read_file(self, path: str) -> str:
        """
        Request to read the contents of a file at the specified path.
        Use this when you need to examine the contents of an existing file you do not know the contents of,\
        for example to analyze code, review text files, or extract information from configuration files.

        Args:
            path: (required) The path of the file to read (relative to the current working directory).

        Returns:
            The contents of the file, with line numbers added.
        """
        abs_path = os.path.join(self.cwd, path)

        if not os.path.exists(abs_path):
            raise FileNotFoundError(f"File not found at {path}")

        with open(abs_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
        return "\n".join(f"{i:4d} | {line}" for i, line in enumerate(lines, 1))
