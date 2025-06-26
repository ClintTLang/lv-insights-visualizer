import os
import csv
import random
from datetime import datetime, timedelta
from tqdm import tqdm

def generate_dummy_csv(output_path="src/backend/dummyrunfiles/china_dummy_data.csv"):
    # Make sure the output directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    now = datetime.now()
    start = now - timedelta(days=1)  # 24 hours ago

    with open(output_path, "w", newline="", encoding="utf-8") as csvfile:
        # Write CSV header
        csvfile.write("shortCode,hashtags,timestamp\n")

        # For each minute in the last 24h
        for minute_offset in tqdm(reversed(range(24 * 60)), desc="Generating dummy data", unit="min"):
            minute_time = start + timedelta(minutes=minute_offset)
            count = random.randint(13, 27)
            for sec in reversed(range(count)):
                ts = minute_time + timedelta(seconds=sec)
                ts_str = ts.strftime("%Y-%m-%dT%H:%M:%S.000Z")
                # Write a row with hashtags in quotes
                csvfile.write(f'x,"y",{ts_str}\n')

    print(f"Dummy data written to {output_path} ({24*60:,} minutes × ~25 avg rows/min ≈ {24*60*25:,} rows)")

if __name__ == "__main__":
    generate_dummy_csv()