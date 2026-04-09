"""Stub module for future bone-face classification via camera + ResNet.

This module will eventually:
1. Accept a camera frame (image array)
2. Run inference through a trained ResNet model
3. Return a list of Face labels for each detected bone

For now, it provides a placeholder interface.
"""

from src.iching.types import Face


def classify_bones(frame) -> list[Face]:
    """Classify bone faces from a camera frame.

    Args:
        frame: Image data from the camera (format TBD — likely a numpy array
               or PIL Image once the hardware pipeline is integrated).

    Returns:
        A list of 3 Face labels, one per bone detected in the frame.

    Raises:
        NotImplementedError: Always, until the vision model is integrated.
    """
    raise NotImplementedError(
        "Bone classification is not yet implemented. "
        "This stub will be replaced with a ResNet-based classifier "
        "when the hardware pipeline is ready."
    )
