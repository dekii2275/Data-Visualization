#!/usr/bin/env python3
"""Check the bundled datasets against a versioned integrity manifest."""

import argparse
import csv
import hashlib
import json
import logging
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
MANIFEST_PATH = ROOT / "data-manifest.json"
RAW_DIRECTORIES = tuple(ROOT / lab / "data" / "raw" for lab in ("lab01", "lab02", "final_lab"))
DEMO_DATA_PATH = ROOT / "final_lab" / "demo" / "traffic_data.json"
CSV_ENCODINGS = ("utf-8-sig", "cp949", "latin1")


def describe_csv(path: Path) -> dict[str, Any]:
    """Read CSV columns and count records, handling the original bike encodings."""
    for encoding in CSV_ENCODINGS:
        try:
            with path.open(encoding=encoding, newline="") as source:
                reader = csv.reader(source, strict=True)
                columns = next(reader)
                if not columns or len(columns) != len(set(columns)):
                    raise ValueError(f"Invalid CSV header: {path}")
                rows = 0
                for row in reader:
                    if len(row) != len(columns):
                        raise ValueError(f"Invalid column count in {path}, record {rows + 1}")
                    rows += 1
            return {"encoding": encoding, "rows": rows, "columns": columns}
        except UnicodeDecodeError:
            continue
    raise ValueError(f"Cannot decode CSV: {path}")


def build_manifest() -> dict[str, Any]:
    """Describe all bundled CSVs and validate the published dashboard JSON contract."""
    paths = []
    for directory in RAW_DIRECTORIES:
        csv_paths = sorted(directory.glob("*.csv"))
        if not csv_paths:
            raise ValueError(f"Missing raw datasets: {directory}")
        paths.extend(csv_paths)
    paths.append(DEMO_DATA_PATH)
    files = []
    for path in paths:
        content = path.read_bytes()
        record: dict[str, Any] = {
            "path": path.relative_to(ROOT).as_posix(),
            "bytes": len(content),
            "sha256": hashlib.sha256(content).hexdigest(),
        }
        if path.suffix == ".csv":
            record.update(describe_csv(path))
        else:
            dataset = json.loads(content)
            expected_types = {
                "metadata": dict,
                "system_kpis": dict,
                "hourly_system_stats": dict,
                "segments": list,
                "hotspots": list,
                "routing_scenarios": list,
            }
            for key, expected_type in expected_types.items():
                if not isinstance(dataset.get(key), expected_type) or not dataset[key]:
                    raise ValueError(f"Missing or invalid dashboard field: {key}")
            record["segments"] = len(dataset["segments"])
        files.append(record)
    return {"version": 1, "files": sorted(files, key=lambda record: record["path"])}


def main() -> int:
    """Verify existing data by default; explicitly regenerate the manifest with --write."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--write", action="store_true", help="Update the manifest after a data change"
    )
    args = parser.parse_args()
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
    try:
        actual = build_manifest()
        if args.write:
            MANIFEST_PATH.write_text(
                json.dumps(actual, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
            )
            logging.info("Updated %s", MANIFEST_PATH.name)
        elif actual != json.loads(MANIFEST_PATH.read_text(encoding="utf-8")):
            raise ValueError(
                "Dataset differs from data-manifest.json; review changes before --write"
            )
        logging.info("Verified %d bundled datasets", len(actual["files"]))
    except (OSError, ValueError, csv.Error, StopIteration) as error:
        logging.error("Data validation failed: %s", error)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
