import os
import re
import glob
from datetime import datetime
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from isodate import parse_duration
import yaml # For reading frontmatter of existing posts
# zoneinfo is built-in for Python 3.9+
# If using Python < 3.9, you'd need 'pytz' and different date handling
from zoneinfo import ZoneInfo

# --- Configuration ---
API_KEY = os.environ.get("YOUTUBE_API_KEY")
CHANNEL_ID = os.environ.get("YOUTUBE_CHANNEL_ID", "UCRkqSGyfZkhOzZIHjlgBXcQ") # Default your channel ID
POSTS_DIR = "_posts"
CATEGORY = "video" # As per your example

YOUTUBE_API_SERVICE_NAME = "youtube"
YOUTUBE_API_VERSION = "v3"

def get_youtube_service():
    """Initializes and returns the YouTube API service object."""
    if not API_KEY:
        print("Error: YOUTUBE_API_KEY environment variable not found.")
        return None
    return build(YOUTUBE_API_SERVICE_NAME, YOUTUBE_API_VERSION, developerKey=API_KEY)

def format_duration(iso_duration_str):
    """Converts ISO 8601 duration to MM:SS format."""
    try:
        duration = parse_duration(iso_duration_str)
        total_seconds = int(duration.total_seconds())
        minutes = total_seconds // 60
        seconds = total_seconds % 60
        return f"{minutes:02d}:{seconds:02d}"
    except Exception as e:
        print(f"Warning: Could not parse duration '{iso_duration_str}': {e}")
        return "00:00"


def sanitize_filename(title):
    """Creates a safe filename from a title."""
    if not title:
        title = "untitled-video"
    title = title.lower()
    title = re.sub(r"[^\w\s-]", "", title) # Remove special characters except word chars, whitespace, hyphens
    title = re.sub(r"\s+", "-", title)    # Replace whitespace with hyphens
    title = re.sub(r"-+", "-", title)     # Replace multiple hyphens with single
    title = title.strip("-")
    return title[:80] if title else "video" # Truncate and provide default

def get_existing_video_ids(posts_dir):
    """Scans existing posts and extracts VideoIds from frontmatter."""
    existing_ids = set()
    if not os.path.exists(posts_dir):
        print(f"Posts directory '{posts_dir}' not found. Creating it.")
        try:
            os.makedirs(posts_dir)
        except OSError as e:
            print(f"Error creating directory {posts_dir}: {e}")
            return existing_ids # Return empty set if dir creation fails
        
    for filepath in glob.glob(os.path.join(posts_dir, "*.md")):
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                if content.startswith("---"):
                    parts = content.split("---", 2)
                    if len(parts) >= 2:
                        frontmatter_str = parts[1]
                        # Ensure frontmatter_str is not empty before trying to load
                        if frontmatter_str.strip():
                            frontmatter = yaml.safe_load(frontmatter_str)
                            if frontmatter and "VideoId" in frontmatter:
                                existing_ids.add(frontmatter["VideoId"])
                        else:
                            print(f"Warning: Empty frontmatter in {filepath}")
        except yaml.YAMLError as e:
            print(f"Warning: Could not parse YAML frontmatter for {filepath}: {e}")
        except Exception as e:
            print(f"Warning: Could not process file {filepath}: {e}")
    return existing_ids

def fetch_channel_videos(youtube, channel_id):
    """Fetches all video details for a given channel."""
    videos_data = []
    try:
        channel_response = youtube.channels().list(
            part="contentDetails",
            id=channel_id
        ).execute()

        if not channel_response.get("items"):
            print(f"No channel found for ID: {channel_id}")
            return []

        uploads_playlist_id = channel_response["items"][0]["contentDetails"]["relatedPlaylists"]["uploads"]
        
        video_ids = []
        next_page_token = None
        while True:
            playlist_items_response = youtube.playlistItems().list(
                playlistId=uploads_playlist_id,
                part="contentDetails",
                maxResults=50,
                pageToken=next_page_token
            ).execute()

            for item in playlist_items_response.get("items", []):
                video_ids.append(item["contentDetails"]["videoId"])

            next_page_token = playlist_items_response.get("nextPageToken")
            if not next_page_token:
                break
        
        if not video_ids:
            print(f"No videos found in uploads playlist for channel {channel_id}")
            return []

        for i in range(0, len(video_ids), 50):
            chunk_ids = video_ids[i:i+50]
            videos_response = youtube.videos().list(
                part="snippet,contentDetails",
                id=",".join(chunk_ids)
            ).execute()

            for video in videos_response.get("items", []):
                snippet = video.get("snippet", {})
                description = snippet.get("description", "No description available.")
                first_line_description = description.strip().splitlines()[0] if description else "No description available."

                videos_data.append({
                    "id": video["id"],
                    "title": snippet.get("title", "Untitled Video"),
                    "description": first_line_description,
                    "full_description": description, # Store full description if needed later
                    "published_at": snippet.get("publishedAt"), # e.g., "2017-08-29T07:00:00Z"
                    "duration": video.get("contentDetails", {}).get("duration")
                })
        
        return videos_data

    except HttpError as e:
        print(f"An HTTP error {e.resp.status} occurred: {e.content.decode()}")
        return []
    except Exception as e:
        print(f"An unexpected error occurred during YouTube API call: {e}")
        return []

def create_jekyll_post(video_info, posts_dir, category):
    """Creates a Jekyll post file for a video."""
    video_id = video_info["id"]
    title = video_info["title"]
    
    if not video_info["published_at"]:
        print(f"Warning: Video '{title}' (ID: {video_id}) has no published_at date. Skipping.")
        return False
        
    published_dt_utc = datetime.fromisoformat(video_info["published_at"].replace('Z', '+00:00'))
    post_date_str = published_dt_utc.strftime("%Y-%m-%d")
    
    slug = sanitize_filename(title)
    base_filename = f"{post_date_str}-{slug}.md"
    filepath = os.path.join(posts_dir, base_filename)

    counter = 1
    while os.path.exists(filepath):
        # This check is secondary; the primary check is existing_video_ids.
        # This handles rare cases of different videos with same title and publish date,
        # or if sanitize_filename results in the same slug.
        print(f"Warning: File '{filepath}' already exists. Appending counter.")
        filename = f"{post_date_str}-{slug}-{counter}.md"
        filepath = os.path.join(posts_dir, filename)
        counter += 1
    
    frontmatter = {
        "layout": "post",
        "title": title,
        "description": video_info["description"], # First line
        "date": post_date_str, 
        "category": category,
        "duration": format_duration(video_info["duration"]) if video_info["duration"] else "00:00",
        "VideoId": video_id
    }

    try:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write("---\n")
            yaml.dump(frontmatter, f, allow_unicode=True, sort_keys=False, default_flow_style=False)
            f.write("---\n\n")
            # Optionally, add the full description or other content here
            # f.write(video_info["full_description"] + "\n") 
        print(f"Created post: {filepath}")
        return True
    except Exception as e:
        print(f"Error writing file {filepath}: {e}")
        return False

def main():
    if not API_KEY:
        print("CRITICAL: YOUTUBE_API_KEY is not set in environment variables. Exiting.")
        return

    if not CHANNEL_ID:
        print("CRITICAL: YOUTUBE_CHANNEL_ID is not set. Please configure it. Exiting.")
        return

    print(f"Fetching videos for channel ID: {CHANNEL_ID}")
    youtube = get_youtube_service()
    if not youtube:
        print("Failed to initialize YouTube service. Exiting.")
        return

    videos = fetch_channel_videos(youtube, CHANNEL_ID)
    if not videos:
        print("No videos found or an error occurred while fetching.")
        # Check if POSTS_DIR exists, otherwise, script might seem like it did nothing
        if not os.path.exists(POSTS_DIR) or not os.listdir(POSTS_DIR):
            print(f"The '{POSTS_DIR}' directory is empty or does not exist. No posts to compare against.")
        return

    existing_video_ids = get_existing_video_ids(POSTS_DIR)
    print(f"Found {len(existing_video_ids)} existing video posts by VideoId.")

    new_posts_created = 0
    # Process in chronological order (oldest first) by sorting based on published_at
    # This makes the log output more intuitive if you're watching it process.
    # YouTube API usually returns newest first by default for playlistItems.
    sorted_videos = sorted(videos, key=lambda v: v["published_at"] if v["published_at"] else "")


    for video_info in sorted_videos:
        if video_info["id"] not in existing_video_ids:
            print(f"Processing new video: '{video_info['title']}' (ID: {video_info['id']})")
            if create_jekyll_post(video_info, POSTS_DIR, CATEGORY):
                new_posts_created += 1
        else:
            print(f"Skipping existing video: '{video_info['title']}' (ID: {video_info['id']})")

    print(f"\n--- Summary ---")
    print(f"Total videos fetched from YouTube API: {len(videos)}")
    print(f"New Jekyll posts created: {new_posts_created}")
    if new_posts_created > 0:
        print(f"New posts are in the '{POSTS_DIR}' directory.")
    else:
        print("No new videos to post or all fetched videos already have corresponding posts.")

if __name__ == "__main__":
    # Ensure _posts directory exists before script operations that rely on it
    if not os.path.exists(POSTS_DIR):
        print(f"Creating directory: {POSTS_DIR}")
        try:
            os.makedirs(POSTS_DIR)
        except OSError as e:
            print(f"FATAL: Could not create posts directory '{POSTS_DIR}': {e}. Exiting.")
            exit(1) # Exit if we can't create the essential directory
    main()