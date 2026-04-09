import pytest

from src.iching.hexagrams import lookup_hexagram_number


class TestHexagramLookup:
    """Spot checks against the King Wen sequence table."""

    def test_qian_qian_is_1(self):
        assert lookup_hexagram_number("qian", "qian") == 1

    def test_kun_kun_is_2(self):
        assert lookup_hexagram_number("kun", "kun") == 2

    def test_zhen_kan_is_3(self):
        assert lookup_hexagram_number("zhen", "kan") == 3

    def test_kan_gen_is_4(self):
        assert lookup_hexagram_number("kan", "gen") == 4

    def test_qian_kan_is_5(self):
        assert lookup_hexagram_number("qian", "kan") == 5

    def test_kan_qian_is_6(self):
        assert lookup_hexagram_number("kan", "qian") == 6

    def test_qian_kun_is_11(self):
        assert lookup_hexagram_number("qian", "kun") == 11

    def test_kun_qian_is_12(self):
        assert lookup_hexagram_number("kun", "qian") == 12

    def test_li_kan_is_63(self):
        assert lookup_hexagram_number("li", "kan") == 63

    def test_kan_li_is_64(self):
        assert lookup_hexagram_number("kan", "li") == 64

    def test_dui_dui_is_58(self):
        assert lookup_hexagram_number("dui", "dui") == 58

    def test_zhen_zhen_is_51(self):
        assert lookup_hexagram_number("zhen", "zhen") == 51


class TestHexagramLookupErrors:
    def test_invalid_key_raises(self):
        with pytest.raises(ValueError):
            lookup_hexagram_number("foo", "bar")
