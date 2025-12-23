import sys

__is_frozen = getattr(sys, "frozen", False)
IS_DEV = not __is_frozen
