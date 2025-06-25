#!/usr/bin/env python3
import csv
import json
from collections import Counter
import os
import itertools
from pathlib import Path

def main():
    # Path to your dummy data
    csv_path = os.path.join(os.path.dirname(__file__), 'dummyrunfiles', 'dummy_data.csv')
    
    counts = Counter()
    with open(csv_path, newline='') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        for row in reversed(rows):
            ts = row['timestamp']
            # Bucket to nearest 10-minute interval by string math
            minute = int(ts[14:16])
            bucket_min = minute - (minute % 10)
            bucket = ts[:14] + f"{bucket_min:02d}"
            counts[bucket] += 1

    # To print the full JSON result, uncomment the line below:
    print(json.dumps(dict(counts), indent=2))

    # Save full JSON result to backend/runfiles/instadata.json
    runfiles_dir = Path(__file__).parent / "runfiles"
    runfiles_dir.mkdir(exist_ok=True)
    output_path = runfiles_dir / "instadata.json"
    with open(output_path, "w", encoding="utf-8") as jf:
        json.dump(dict(counts), jf, indent=2)
    print(f"Saved analysis JSON to {output_path}")

if __name__ == '__main__':
    result = main()
    # result is written to instadata.json above