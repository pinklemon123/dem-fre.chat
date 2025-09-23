"""Convenience wrapper for the EnhancedNewsBot implementation.

This module exposes :class:`EnhancedNewsBot` from the actual
implementation located in ``src/lib/enhanced_newsbot.py`` so that
``import enhanced_newsbot`` continues to work as expected.
"""

from src.lib.enhanced_newsbot import *  # noqa: F401,F403
