import pytest
from pathlib import Path


@pytest.fixture
def temp_workspace(tmp_path):
    workspace = tmp_path / "workspace"
    workspace.mkdir()
    yield str(workspace)


@pytest.fixture
def sample_text_file(temp_workspace):
    file_path = Path(temp_workspace) / "sample.txt"
    content = "Line 1\nLine 2\nLine 3\nSpecial chars: !@#$%"
    file_path.write_text(content, encoding="utf-8")
    return "sample.txt", content


@pytest.fixture
def multiple_files(temp_workspace):
    files = {}

    file1 = Path(temp_workspace) / "file1.txt"
    content1 = "Content of file 1"
    file1.write_text(content1, encoding="utf-8")
    files["file1.txt"] = content1

    file2 = Path(temp_workspace) / "file2.txt"
    content2 = "Content of file 2\nSecond line"
    file2.write_text(content2, encoding="utf-8")
    files["file2.txt"] = content2

    file3 = Path(temp_workspace) / "file3.txt"
    content3 = "Content of file 3"
    file3.write_text(content3, encoding="utf-8")
    files["file3.txt"] = content3

    return files


@pytest.fixture
def nested_directory(temp_workspace):
    base = Path(temp_workspace)

    # 创建目录结构
    (base / "dir1").mkdir()
    (base / "dir1" / "subdir1").mkdir()
    (base / "dir2").mkdir()

    # 创建文件
    (base / "file1.txt").write_text("Root file 1", encoding="utf-8")
    (base / "file2.txt").write_text("Root file 2", encoding="utf-8")
    (base / "dir1" / "file3.txt").write_text("Dir1 file 3", encoding="utf-8")
    (base / "dir1" / "subdir1" / "file4.txt").write_text("Subdir1 file 4", encoding="utf-8")
    (base / "dir2" / "file5.txt").write_text("Dir2 file 5", encoding="utf-8")

    return temp_workspace


@pytest.fixture
def mock_markitdown(mocker):
    mock = mocker.MagicMock()
    mock_result = mocker.MagicMock()
    mock_result.markdown = "# Test PDF\nThis is converted markdown content."
    mock.convert.return_value = mock_result
    return mock


@pytest.fixture
def empty_file(temp_workspace):
    file_path = Path(temp_workspace) / "empty.txt"
    file_path.write_text("", encoding="utf-8")
    return "empty.txt"


@pytest.fixture
def empty_directory(temp_workspace):
    dir_path = Path(temp_workspace) / "empty_dir"
    dir_path.mkdir()
    return "empty_dir"