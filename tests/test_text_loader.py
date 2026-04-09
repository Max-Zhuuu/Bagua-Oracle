import json
import tempfile
from pathlib import Path
from unittest.mock import patch

from src.iching.text_loader import load_hexagram_text


SAMPLE_HEXAGRAM = {
    "number": 1,
    "name_zh": "乾",
    "name_full": "乾为天",
    "structure": "乾上乾下",
    "judgment": "元，亨，利，贞。",
    "lines": [
        {"position": "初九", "text": "潜龙，勿用。"},
        {"position": "九二", "text": "见龙再田，利见大人。"},
    ],
    "yong": "用九：见群龙无首，吉。",
    "tuan": "大哉乾元...",
    "xiang": "天行健，君子以自强不息。",
    "wenyan": "元者，善之长也...",
}


class TestTextLoader:
    def test_loads_existing_file(self, tmp_path: Path):
        hexdir = tmp_path / "hexagrams"
        hexdir.mkdir()
        filepath = hexdir / "01.json"
        filepath.write_text(json.dumps(SAMPLE_HEXAGRAM, ensure_ascii=False), encoding="utf-8")

        with patch("src.iching.text_loader.HEXAGRAMS_DIR", hexdir):
            result = load_hexagram_text(1)

        assert result["number"] == 1
        assert result["name_zh"] == "乾"
        assert result["judgment"] == "元，亨，利，贞。"
        assert isinstance(result["lines"], list)
        assert len(result["lines"]) == 2
        assert "tuan" in result
        assert "xiang" in result
        assert "wenyan" in result

    def test_placeholder_when_file_missing(self, tmp_path: Path):
        hexdir = tmp_path / "hexagrams"
        hexdir.mkdir()

        with patch("src.iching.text_loader.HEXAGRAMS_DIR", hexdir):
            result = load_hexagram_text(42)

        assert result["number"] == 42
        assert result["name_zh"] == ""
        assert result["judgment"] == ""
        assert result["lines"] == []
        assert "tuan" in result
        assert "xiang" in result

    def test_invalid_number_raises(self):
        import pytest
        with pytest.raises(ValueError):
            load_hexagram_text(0)
        with pytest.raises(ValueError):
            load_hexagram_text(65)

    def test_expected_keys_present(self, tmp_path: Path):
        hexdir = tmp_path / "hexagrams"
        hexdir.mkdir()
        filepath = hexdir / "01.json"
        filepath.write_text(json.dumps(SAMPLE_HEXAGRAM, ensure_ascii=False), encoding="utf-8")

        with patch("src.iching.text_loader.HEXAGRAMS_DIR", hexdir):
            result = load_hexagram_text(1)

        expected_keys = {"number", "name_zh", "name_full", "structure",
                         "judgment", "lines", "tuan", "xiang"}
        assert expected_keys.issubset(result.keys())
