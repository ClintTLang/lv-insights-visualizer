from apify_client import ApifyClient
from dotenv import load_dotenv
import os
from urllib.parse import quote

# Initialize the ApifyClient with your Apify API token
load_dotenv()
KEY = os.getenv("APIFY_KEY")
client = ApifyClient(KEY)

# Prepare the Actor input
TAG = "王玮"  # or your desired hashtag text; it will be URL-encoded in the query
run_input = {
    "url": f"https://s.weibo.com/weibo?q={quote(f'#{TAG}')}%23",
    "max_results": 10,
    "cookies": [],
    "proxyConfiguration": {
        "useApifyProxy": True,
        "apifyProxyGroups": [],
    },
}

# Run the Actor and wait for it to finish
run = client.actor("saswave/weibo-feed-scraper").call(run_input=run_input)

# Fetch and print Actor results from the run's dataset (if there are any)
print("💾 Check your data here: https://console.apify.com/storage/datasets/" + run["defaultDatasetId"])
for item in client.dataset(run["defaultDatasetId"]).iterate_items():
    print(item)