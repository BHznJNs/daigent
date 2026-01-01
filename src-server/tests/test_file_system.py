import pytest
from pathlib import Path
from src.agent.tools.file_system import FileSystemTool


class TestFileSystemToolInit:    
    def test_init_with_absolute_path(self, temp_workspace):
        tool = FileSystemTool(temp_workspace)
        assert tool.cwd == temp_workspace
        assert hasattr(tool, "md")

    def test_init_with_tilde(self):
        tool = FileSystemTool("~")
        assert tool.cwd == str(Path.home())

    def test_markitdown_instance(self, temp_workspace):
        tool = FileSystemTool(temp_workspace)
        assert tool.md is not None


class TestIsMarkitdownConvertableBinary:    
    @pytest.mark.parametrize("filename,expected", [
        ("test.pdf", True),
        ("test.docx", True),
        ("test.pptx", True),
        ("test.xlsx", True),
        ("test.epub", True),
        ("test.PDF", True),
        ("test.DOCX", True),
        ("test.txt", False),
        ("test.py", False),
        ("test.json", False),
        ("test.md", False),
    ])
    def test_format_detection(self, temp_workspace, filename, expected):
        tool = FileSystemTool(temp_workspace)
        assert tool._is_markitdown_convertable_binary(filename) == expected


class TestReadFile:    
    def test_read_text_file_without_line_numbers(self, temp_workspace, sample_text_file):
        filename, expected_content = sample_text_file
        tool = FileSystemTool(temp_workspace)
        result = tool.read_file(filename, enable_line_numbers=False)
        assert result == expected_content

    def test_read_text_file_with_line_numbers(self, temp_workspace, sample_text_file):
        filename, content = sample_text_file
        tool = FileSystemTool(temp_workspace)
        result = tool.read_file(filename, enable_line_numbers=True)

        lines = result.split("\n")
        assert len(lines) == 4
        assert "   1 | Line 1" in result
        assert "   2 | Line 2" in result
        assert "   3 | Line 3" in result
        assert "   4 | Special chars: !@#$%" in result

    def test_read_binary_file_with_mock(self, temp_workspace, mocker):
        # Create a .pdf file (actually an empty file)
        pdf_path = Path(temp_workspace) / "test.pdf"
        pdf_path.write_bytes(b"fake pdf content")

        mock_result = mocker.MagicMock()
        mock_result.markdown = "# Test PDF\nThis is converted markdown content."
        mock_md = mocker.MagicMock()
        mock_md.convert.return_value = mock_result

        tool = FileSystemTool(temp_workspace)
        tool.md = mock_md

        result = tool.read_file("test.pdf")
        assert "Test PDF" in result
        assert "converted markdown" in result
        mock_md.convert.assert_called_once()

    def test_read_nonexistent_file(self, temp_workspace):
        tool = FileSystemTool(temp_workspace)
        with pytest.raises(FileNotFoundError) as exc_info:
            tool.read_file("nonexistent.txt")
        assert "File not found at nonexistent.txt" in str(exc_info.value)

    def test_read_empty_file(self, temp_workspace, empty_file):
        tool = FileSystemTool(temp_workspace)
        result = tool.read_file(empty_file)
        assert result == ""

    def test_read_file_with_relative_path(self, temp_workspace):
        subdir = Path(temp_workspace) / "subdir"
        subdir.mkdir()
        file_path = subdir / "test.txt"
        file_path.write_text("Test content", encoding="utf-8")

        tool = FileSystemTool(temp_workspace)
        result = tool.read_file("subdir/test.txt")
        assert result == "Test content"


class TestReadFileBatch:
    def test_read_single_file(self, temp_workspace, sample_text_file):
        filename, content = sample_text_file
        tool = FileSystemTool(temp_workspace)
        result = tool.read_file_batch([filename])

        assert f'<file_content path="{filename}">' in result
        assert content in result
        assert '</file_content>' in result

    def test_read_multiple_files(self, temp_workspace, multiple_files):
        tool = FileSystemTool(temp_workspace)
        filenames = list(multiple_files.keys())
        result = tool.read_file_batch(filenames)

        for filename, content in multiple_files.items():
            assert f'<file_content path="{filename}">' in result
            assert content in result

    def test_read_batch_with_nonexistent_file(self, temp_workspace, sample_text_file):
        filename, content = sample_text_file
        tool = FileSystemTool(temp_workspace)
        result = tool.read_file_batch([filename, "nonexistent.txt"])

        # Existing file should be read normally
        assert content in result
        # Non-existent file should show error
        assert "Error:" in result
        assert "nonexistent.txt" in result

    def test_read_batch_with_line_numbers(self, temp_workspace, multiple_files):
        tool = FileSystemTool(temp_workspace)
        filenames = list(multiple_files.keys())
        result = tool.read_file_batch(filenames, enable_line_numbers=True)

        # Check line number format
        assert "   1 |" in result


class TestListDirectory:
    def test_list_directory_non_recursive(self, temp_workspace, nested_directory):
        tool = FileSystemTool(temp_workspace)
        result = tool.list_directory(".")

        assert "Directory: ." in result
        assert "[dir] dir1" in result
        assert "[dir] dir2" in result
        assert "[file] file1.txt" in result
        assert "[file] file2.txt" in result
        # Should not include files in subdirectories
        assert "file3.txt" not in result

    def test_list_empty_directory(self, temp_workspace, empty_directory):
        tool = FileSystemTool(temp_workspace)
        result = tool.list_directory(empty_directory)

        assert "(empty directory)" in result

    def test_list_directory_recursive_unlimited(self, temp_workspace, nested_directory):
        tool = FileSystemTool(temp_workspace)
        result = tool.list_directory(".", recursive=True)

        assert "1 [dir] dir1" in result
        assert "1.1 [dir] subdir1" in result
        assert "file4.txt" in result  # Deep level file

    def test_list_directory_recursive_with_depth_limit(self, temp_workspace, nested_directory):
        tool = FileSystemTool(temp_workspace)
        result = tool.list_directory(".", recursive=True, max_depth=2)

        # Should include first two levels
        assert "[dir] dir1" in result
        assert "[dir] subdir1" in result
        # Should not include third level content
        assert "file4.txt" not in result

    def test_list_nonexistent_directory(self, temp_workspace):
        tool = FileSystemTool(temp_workspace)
        with pytest.raises(FileNotFoundError):
            tool.list_directory("nonexistent")

    def test_list_file_as_directory(self, temp_workspace, sample_text_file):
        filename, _ = sample_text_file
        tool = FileSystemTool(temp_workspace)
        with pytest.raises(NotADirectoryError):
            tool.list_directory(filename)

    def test_list_directory_invalid_max_depth(self, temp_workspace):
        tool = FileSystemTool(temp_workspace)
        with pytest.raises(ValueError):
            tool.list_directory(".", recursive=True, max_depth=0)

    def test_list_directory_with_permission_error(self, temp_workspace, mocker):
        tool = FileSystemTool(temp_workspace)

        # Use mocker.patch instead of unittest.mock.patch
        mock_iterdir = mocker.patch("pathlib.Path.iterdir")
        mock_iterdir.side_effect = PermissionError()

        result = tool.list_directory(".")
        assert "Error: Permission denied" in result


class TestEdgeCases:
    def test_unicode_filename(self, temp_workspace):
        filename = "测试文件.txt"
        file_path = Path(temp_workspace) / filename
        content = "Unicode content: 你好世界"
        file_path.write_text(content, encoding="utf-8")

        tool = FileSystemTool(temp_workspace)
        result = tool.read_file(filename)
        assert result == content

    def test_special_characters_in_content(self, temp_workspace):
        filename = "special.txt"
        content = "Special chars: <>&\"'\n\t"
        file_path = Path(temp_workspace) / filename
        file_path.write_text(content, encoding="utf-8")

        tool = FileSystemTool(temp_workspace)
        result = tool.read_file(filename)
        assert "<>&\"'" in result

    def test_list_directory_sorting(self, temp_workspace):
        base = Path(temp_workspace)

        # Create files and directories (intentionally in random order)
        (base / "zebra.txt").write_text("", encoding="utf-8")
        (base / "apple.txt").write_text("", encoding="utf-8")
        (base / "zoo_dir").mkdir()
        (base / "alpha_dir").mkdir()

        tool = FileSystemTool(temp_workspace)
        result = tool.list_directory(".")

        lines = result.split("\n")
        # Find positions of directories and files
        dir_lines = [line for line in lines if "[dir]" in line]
        file_lines = [line for line in lines if "[file]" in line]

        # Verify directories come before files
        assert len(dir_lines) == 2
        assert len(file_lines) == 2
        assert "alpha_dir" in dir_lines[0]
        assert "zoo_dir" in dir_lines[1]
        assert "apple.txt" in file_lines[0]
        assert "zebra.txt" in file_lines[1]
