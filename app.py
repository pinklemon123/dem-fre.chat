#!/usr/bin/env python3
"""
Alternative entry point for dem-fre.chat

This file provides an alternative entry point (app.py) for deployment
platforms that look for this filename. It simply imports and runs
the main module.
"""

from main import main
import sys

if __name__ == "__main__":
    sys.exit(main())