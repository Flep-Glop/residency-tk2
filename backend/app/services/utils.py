def format_number(value, decimal_places=1):
    """Format number removing unnecessary trailing zeros."""
    if isinstance(value, (int, float)):
        formatted = f"{value:.{decimal_places}f}".rstrip('0').rstrip('.')
        if '.' not in formatted:
            return formatted
        return formatted
    return str(value)
