#!/usr/bin/env python3
import csv
import json
from collections import Counter
import os
import itertools

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

    # Return the full counts as a JSON-serializable dict
    # print(json.dumps({k: counts[k] for k in list(counts)[:10]}, indent=2))
    # To print the full JSON result, uncomment the line below:
    print(json.dumps(dict(counts), indent=2))

if __name__ == '__main__':
    result = main()