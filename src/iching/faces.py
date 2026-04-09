from src.iching.types import Face, Line

FACE_TO_LINE: dict[Face, Line] = {
    Face.BROAD_A: Line.YIN,
    Face.BROAD_B: Line.YIN,
    Face.NARROW_A: Line.YANG,
    Face.NARROW_B: Line.YANG,
}


def face_to_line(face: Face) -> Line:
    """Map a bone face label to a yin/yang line value."""
    return FACE_TO_LINE[face]


def faces_to_lines(faces: list[Face]) -> list[Line]:
    """Convert a list of 3 face labels to 3 line values (bottom to top order)."""
    if len(faces) != 3:
        raise ValueError(f"Expected 3 faces, got {len(faces)}")
    return [face_to_line(f) for f in faces]
