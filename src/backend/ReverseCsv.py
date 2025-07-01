import csv
import os

def reverse_csv(input_path: str, output_path: str):
    with open(input_path, newline='', encoding='utf-8') as infile:
        reader = csv.reader(infile)
        all_rows = list(reader)
        if not all_rows:
            header = []
            rows = []
        else:
            header = all_rows[0]
            rows = all_rows[1:]
    rows.reverse()
    with open(output_path, 'w', newline='', encoding='utf-8') as outfile:
        writer = csv.writer(outfile)
        if header:
            writer.writerow(header)
        writer.writerows(rows)

def main():
    # Define input and output paths relative to this script's directory
    base_dir = os.path.dirname(__file__)
    input_path = os.path.join(base_dir, 'collectiveinstadata', 'collective_insta_data.csv')
    output_path = os.path.join(base_dir, 'collectiveinstadata', 'collective_insta_data.csv')
    reverse_csv(input_path, output_path)
    print(f"Reversed CSV written to {output_path}")

# Run main when executed as a script
if __name__ == '__main__':
    main()