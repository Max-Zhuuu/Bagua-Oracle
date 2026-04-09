import pytest

from src.iching.types import Line
from src.iching.trigrams import lines_to_trigram


YANG = Line.YANG
YIN = Line.YIN


class TestTrigramLookup:
    def test_qian_heaven(self):
        tri = lines_to_trigram([YANG, YANG, YANG])
        assert tri.id == "qian"
        assert tri.image_en == "Heaven"

    def test_kun_earth(self):
        tri = lines_to_trigram([YIN, YIN, YIN])
        assert tri.id == "kun"
        assert tri.image_en == "Earth"

    def test_gen_mountain(self):
        tri = lines_to_trigram([YANG, YIN, YIN])
        assert tri.id == "gen"
        assert tri.image_en == "Mountain"

    def test_kan_water(self):
        tri = lines_to_trigram([YIN, YANG, YIN])
        assert tri.id == "kan"
        assert tri.image_en == "Water"

    def test_zhen_thunder(self):
        tri = lines_to_trigram([YIN, YIN, YANG])
        assert tri.id == "zhen"
        assert tri.image_en == "Thunder"

    def test_dui_lake(self):
        tri = lines_to_trigram([YANG, YANG, YIN])
        assert tri.id == "dui"
        assert tri.image_en == "Lake"

    def test_li_fire(self):
        tri = lines_to_trigram([YANG, YIN, YANG])
        assert tri.id == "li"
        assert tri.image_en == "Fire"

    def test_xun_wind(self):
        tri = lines_to_trigram([YIN, YANG, YANG])
        assert tri.id == "xun"
        assert tri.image_en == "Wind"


class TestTrigramLineOrder:
    def test_lines_are_bottom_to_top(self):
        tri = lines_to_trigram([YIN, YANG, YIN])
        assert tri.lines == (YIN, YANG, YIN)
        assert tri.lines[0] == YIN   # bottom
        assert tri.lines[1] == YANG  # middle
        assert tri.lines[2] == YIN   # top


class TestTrigramErrors:
    def test_wrong_count_raises(self):
        with pytest.raises(ValueError):
            lines_to_trigram([YANG, YANG])

    def test_metadata_populated(self):
        tri = lines_to_trigram([YANG, YANG, YANG])
        assert tri.name_zh == "乾"
        assert tri.pinyin == "Qián"
