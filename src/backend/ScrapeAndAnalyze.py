from pathlib import Path
from ApifyTagScraper import run_scraper
from DataAnalyzer import analyze
from Combine import combine
import csv
import os

INSTA_TAGS = ["louisvuitton", "fendi", "dior"]
RESULTS_LIMIT = 200

def main():
    # Base directory of this script
    base_dir = Path(__file__).parent
    runfiles_dir = base_dir / "runfiles"

    # Will hold tuples of (tag, {shortCode: timestamp})
    insta_datasets: list[tuple[str, dict[str, str]]] = []

    for tag in INSTA_TAGS:
        csv_name = run_scraper(tag, RESULTS_LIMIT)

        # Build mapping of shortCode to timestamp from the CSV
        csv_path = str(runfiles_dir / csv_name)
        mapping: dict[str, str] = {}
        with open(csv_path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                mapping[row['shortCode']] = row['timestamp']

        Insta_pair = (tag, mapping)
        insta_datasets.append(Insta_pair)

        analyze('runfiles', csv_name, 'input', f'{tag}_instadata.json')

    combine(insta_datasets)


if __name__ == '__main__':
    main()