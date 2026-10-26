"""Data cleaning, validation, and preprocessing for market price series."""

from typing import List, Tuple
import numpy as np
import pandas as pd
from backend.app.utils.errors import DataQualityError


REQUIRED_COLUMNS = ["open", "high", "low", "close", "volume"]


def preprocess_market_data(
    df: pd.DataFrame, min_bars: int = 15
) -> Tuple[pd.DataFrame, List[str]]:
    """Clean and validate raw historical market OHLCV DataFrame.

    Rules applied:
    - Normalizes column names to lowercase.
    - Ensures Date index or column is converted to sorted UTC datetime.
    - Drops duplicate timestamps keeping the latest bar.
    - Rejects non-positive prices (Price <= 0) and impossible bars (High < Low).
    - Preserves true missing values as np.nan without converting them to artificial zeroes.
    - Emits descriptive warnings for discarded rows or gaps.
    """
    warnings: List[str] = []

    if df.empty:
        raise DataQualityError("Provider returned empty price DataFrame.")

    # Work on a copy
    clean_df = df.copy()

    # Normalize column names
    clean_df.columns = [str(c).strip().lower() for c in clean_df.columns]

    # Handle Date column or Datetime index
    if "date" in clean_df.columns:
        clean_df["date"] = pd.to_datetime(clean_df["date"], errors="coerce")
        clean_df = clean_df.dropna(subset=["date"]).set_index("date")
    elif not isinstance(clean_df.index, pd.DatetimeIndex):
        try:
            clean_df.index = pd.to_datetime(clean_df.index, errors="coerce")
            clean_df = clean_df[clean_df.index.notnull()]
        except Exception as e:
            raise DataQualityError(f"Unable to parse DatetimeIndex: {str(e)}")

    # Sort chronologically
    clean_df = clean_df.sort_index()

    # Deduplicate timestamps
    if clean_df.index.has_duplicates:
        duplicate_count = clean_df.index.duplicated(keep="last").sum()
        clean_df = clean_df[~clean_df.index.duplicated(keep="last")]
        warnings.append(f"Dropped {duplicate_count} duplicate timestamp(s).")

    # Validate required columns
    missing_cols = [c for c in REQUIRED_COLUMNS if c not in clean_df.columns]
    if missing_cols:
        raise DataQualityError(f"Missing required price columns: {missing_cols}")

    initial_len = len(clean_df)

    # Coerce to numeric
    for col in REQUIRED_COLUMNS:
        clean_df[col] = pd.to_numeric(clean_df[col], errors="coerce")

    # Drop rows where Close is missing or non-positive
    invalid_close_mask = (clean_df["close"].isna()) | (clean_df["close"] <= 0)
    if invalid_close_mask.any():
        num_invalid = invalid_close_mask.sum()
        clean_df = clean_df[~invalid_close_mask]
        warnings.append(f"Discarded {num_invalid} row(s) with non-positive or missing Close price.")

    # Validate High >= Low
    impossible_spread = clean_df["high"] < clean_df["low"]
    if impossible_spread.any():
        num_spread = impossible_spread.sum()
        clean_df = clean_df[~impossible_spread]
        warnings.append(f"Discarded {num_spread} row(s) where High price was strictly less than Low.")

    # Sanitize Open and Low non-positive values
    for col in ["open", "high", "low"]:
        invalid_pos = clean_df[col] <= 0
        if invalid_pos.any():
            clean_df.loc[invalid_pos, col] = np.nan
            warnings.append(f"Replaced non-positive values in '{col}' with NaN.")

    # Ensure Volume is non-negative
    invalid_vol = clean_df["volume"] < 0
    if invalid_vol.any():
        clean_df.loc[invalid_vol, "volume"] = np.nan
        warnings.append("Replaced negative volume values with NaN.")

    final_len = len(clean_df)
    if final_len < min_bars:
        raise DataQualityError(
            f"Insufficient clean trading bars after preprocessing: {final_len} bars (minimum required: {min_bars}).",
            details={"bars_available": final_len, "bars_required": min_bars},
        )

    if final_len < initial_len:
        warnings.append(f"Cleaned {initial_len - final_len} malformed price record(s).")

    return clean_df, warnings
