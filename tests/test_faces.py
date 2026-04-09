from src.iching.types import Face, Line
from src.iching.faces import face_to_line, faces_to_lines


class TestFaceToLine:
    def test_broad_a_is_yin(self):
        assert face_to_line(Face.BROAD_A) == Line.YIN

    def test_broad_b_is_yin(self):
        assert face_to_line(Face.BROAD_B) == Line.YIN

    def test_narrow_a_is_yang(self):
        assert face_to_line(Face.NARROW_A) == Line.YANG

    def test_narrow_b_is_yang(self):
        assert face_to_line(Face.NARROW_B) == Line.YANG

    def test_yin_value_is_zero(self):
        assert face_to_line(Face.BROAD_A).value == 0

    def test_yang_value_is_one(self):
        assert face_to_line(Face.NARROW_A).value == 1


class TestFacesToLines:
    def test_three_broad_gives_three_yin(self):
        result = faces_to_lines([Face.BROAD_A, Face.BROAD_B, Face.BROAD_A])
        assert result == [Line.YIN, Line.YIN, Line.YIN]

    def test_three_narrow_gives_three_yang(self):
        result = faces_to_lines([Face.NARROW_A, Face.NARROW_B, Face.NARROW_A])
        assert result == [Line.YANG, Line.YANG, Line.YANG]

    def test_mixed_faces(self):
        result = faces_to_lines([Face.BROAD_A, Face.NARROW_A, Face.BROAD_B])
        assert result == [Line.YIN, Line.YANG, Line.YIN]

    def test_wrong_count_raises(self):
        import pytest
        with pytest.raises(ValueError):
            faces_to_lines([Face.BROAD_A, Face.BROAD_B])
