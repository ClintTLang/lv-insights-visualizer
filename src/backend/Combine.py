import csv
import os
from tqdm import tqdm
import json
from pathlib import Path
from collections import OrderedDict

# Parameter declared as "insta_datasets: list[tuple[str, dict[str, str]]] = []"

# This is where we combine the data from each hashtag into collectiveinstadata/collective_insta_data.csv
def combine_csv(insta_datasets):
    full_ds: dict[str, tuple[str, str]] = {}
    for tag, mapping in tqdm(insta_datasets, desc="Combining tags", unit="tag"):
        for short_code, timestamp in tqdm(mapping.items(), desc=f"Processing {tag}", unit="post"):
            if short_code in full_ds:
                newTag = f"{full_ds[short_code][0]},{tag}"
                full_ds[short_code] = (newTag, timestamp)
            else:
                full_ds[short_code] = (tag, timestamp)

    # Path to collective CSV
    collective_dir = os.path.join(os.path.dirname(__file__), 'collectiveinstadata')
    os.makedirs(collective_dir, exist_ok=True)
    collective_csv = os.path.join(collective_dir, 'collective_insta_data.csv')

    # Prepare new entries: a list of (shortCode, hashtags, timestamp)
    new_entries = [
        (short_code, tag_ts[0], tag_ts[1])
        for short_code, tag_ts in full_ds.items()
    ]

    # If the collective file does not exist, create and write header + all entries
    if not os.path.exists(collective_csv):
        with open(collective_csv, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(['shortCode', 'hashtags', 'timestamp'])
            # Sort by timestamp ascending and write
            for short_code, hashtags, timestamp in tqdm(sorted(new_entries, key=lambda e: e[2]),
                                                        desc="Writing new collective entries", unit="entry"):
                writer.writerow([short_code, hashtags, timestamp])
    else:
        # Read existing shortCodes
        with open(collective_csv, 'r', newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            existing = {row['shortCode'] for row in reader}

        # Filter out entries already present
        to_add = [
            (sc, hs, ts) for sc, hs, ts in new_entries
            if sc not in existing
        ]
        if to_add:
            # Sort new entries by timestamp ascending
            to_add_sorted = sorted(to_add, key=lambda e: e[2])
            # Append to the CSV
            with open(collective_csv, 'a', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                for short_code, hashtags, timestamp in tqdm(to_add_sorted,
                                                            desc="Appending new entries", unit="entry"):
                    writer.writerow([short_code, hashtags, timestamp])


# This is where we combine the data from each hashtag into input/instadata.csv
def combine_json(tags):
    # Base directory for input JSON files
    base_dir = Path(__file__).parent / "input"
    aggregated: dict[str, int] = {}

    # Determine the intersection window across all tag datasets
    start_times = []
    end_times = []
    for tag in tags:
        file_path = base_dir / f"{tag}_instadata.json"
        if not file_path.exists():
            continue
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        times = sorted(data.keys())
        if times:
            start_times.append(times[0])
            end_times.append(times[-1])
    # Compute the latest start and earliest end
    latest_start = max(start_times) if start_times else None
    earliest_end = min(end_times) if end_times else None

    # Read each tag file and accumulate counts
    for tag in tags:
        file_path = base_dir / f"{tag}_instadata.json"
        if not file_path.exists():
            continue
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        for ts, count in data.items():
            # Only include timestamps within the common window
            if latest_start and ts < latest_start:
                continue
            if earliest_end and ts > earliest_end:
                continue
            aggregated[ts] = aggregated.get(ts, 0) + count

    # Sort timestamps ascending (ISO format)
    sorted_agg = OrderedDict(sorted(aggregated.items(), key=lambda kv: kv[0]))

    # Write combined JSON
    output_path = base_dir / "instadata.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(sorted_agg, f, indent=2)

    print(f"Combined JSON saved to {output_path}")


# Parameter declared as "insta_datasets: list[tuple[str, dict[str, str]]] = []"
def combine(insta_datasets):
    combine_csv(insta_datasets)
    tags = []
    for tag, _ in insta_datasets:
        tags.append(tag)
    combine_json(tags)