#!/usr/bin/env python3
import csv
import json
from collections import Counter
from collections import OrderedDict
import os
import itertools
from pathlib import Path

def analyze(input_folder: str, input_csv_filename: str, output_folder: str, output_json_filename: str):
    # Build input CSV path
    csv_path = os.path.join(os.path.dirname(__file__), input_folder, input_csv_filename)
    
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

    # Sort buckets chronologically (keys are ISO strings)
    sorted_counts = OrderedDict(sorted(counts.items(), key=lambda kv: kv[0]))
    print(json.dumps(sorted_counts, indent=2))

    # Build output JSON path
    save_dir = Path(__file__).parent / output_folder
    save_dir.mkdir(parents=True, exist_ok=True)
    output_path = save_dir / output_json_filename
    with open(output_path, "w", encoding="utf-8") as jf:
        json.dump(sorted_counts, jf, indent=2)
    print(f"Saved analysis JSON to {output_path}")

def main():
    # Generate analysis for each dataset
    analyze('dummyrunfiles', 'dummy_data.csv', 'dummyinput', 'dummyinstadata.json')
    analyze('dummyrunfiles', 'china_dummy_data.csv', 'dummyinput', 'dummywechatdata.json')

if __name__ == '__main__':
    main()