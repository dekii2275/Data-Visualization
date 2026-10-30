"""Domain errors translated into HTTP responses at the application boundary."""


class DatasetUnavailableError(RuntimeError):
    """The database has no initialized traffic dataset."""
