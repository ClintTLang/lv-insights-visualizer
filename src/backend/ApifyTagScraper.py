from apify_client import ApifyClient
from dotenv import load_dotenv
import os
import csv
from datetime import datetime
from zoneinfo import ZoneInfo

# Initialize the ApifyClient with Apify API token
load_dotenv()
KEY = os.getenv("APIFY_KEY")
client = ApifyClient(KEY)

def run_scraper(hashtag, results_limit):
    # Prepare the Actor input
    # hashtag must be a string
    run_input = {
        "hashtags": [hashtag],
        "resultsType": "posts",
        "resultsLimit": results_limit,
    }

    # Run the Actor and wait for it to finish
    run = client.actor("apify/instagram-hashtag-scraper").call(run_input=run_input)

    # Fetch and print Actor results from the run's dataset (if there are any)
    print("💾 Check your data here: https://console.apify.com/storage/datasets/" + run["defaultDatasetId"])

    # Ensure the output directory exists
    os.makedirs("src/backend/runfiles", exist_ok=True)
    # Generate timestamped filename
    now = datetime.now(ZoneInfo("America/New_York"))
    # Format as H:MM:SSam/pm and lowercase
    time_str = now.strftime("%-I:%M:%S%p").lower()
    csv_name = f"{hashtag}-run-{time_str}.csv"
    csv_path = os.path.join("src", "backend", "runfiles", csv_name)
    # Open CSV for writing
    csv_file = open(csv_path, "w", newline="", encoding="utf-8")
    writer = csv.DictWriter(csv_file, fieldnames=["shortCode", "hashtags", "timestamp"])
    writer.writeheader()

    for item in client.dataset(run["defaultDatasetId"]).iterate_items():
        writer.writerow({
            "shortCode": item.get("shortCode"),
            "hashtags": ",".join(item.get("hashtags", [])),
            "timestamp": item.get("timestamp")
        })
    # Close the CSV file
    csv_file.close()
    print(f"Saved posts to {csv_path}")
    return csv_name