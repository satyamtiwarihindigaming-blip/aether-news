import os
import re
import json
import time
import requests
import feedparser
import cloudinary
import cloudinary.uploader
import urllib.parse
import random
from datetime import datetime
from dotenv import load_dotenv

# Load local environment variables
load_dotenv()

# API Configuration
GROQ_KEY = os.getenv("GROQ_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

CLOUDINARY_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
CLOUDINARY_SECRET = os.getenv("CLOUDINARY_API_SECRET")

TELEGRAM_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

# Configure Cloudinary SDK
if CLOUDINARY_NAME and CLOUDINARY_API_KEY and CLOUDINARY_SECRET:
    cloudinary.config(
        cloud_name=CLOUDINARY_NAME,
        api_key=CLOUDINARY_API_KEY,
        api_secret=CLOUDINARY_SECRET,
        secure=True
    )

# Feeds list to scrape
FEEDS = [
    {"url": "https://techcrunch.com/feed/", "category": "Tech"},
    {"url": "https://dev.to/feed/tag/ai", "category": "AI"},
    {"url": "https://dev.to/feed/tag/webdev", "category": "Dev"},
    {"url": "https://www.pcgamer.com/rss/", "category": "Gaming"},
    {"url": "https://feeds.feedburner.com/ign/news", "category": "Gaming"},
    {"url": "https://news.google.com/rss/search?q=GTA+6+OR+%22Grand+Theft+Auto+6%22+OR+%22Grand+Theft+Auto+VI%22&hl=en-US&gl=US&ceid=US:en", "category": "Gaming"}
]

def fetch_youtube_video(query):
    """Scrapes YouTube search results for a video matching the query and returns the watch URL."""
    try:
        search_query = urllib.parse.quote(query)
        url = f"https://www.youtube.com/results?search_query={search_query}"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9"
        }
        print(f"Searching YouTube for: {query}")
        res = requests.get(url, headers=headers, timeout=10)
        if res.status_code == 200:
            # Locate all videoId strings in the response HTML
            video_ids = re.findall(r'"videoId":"([a-zA-Z0-9_-]{11})"', res.text)
            if video_ids:
                video_url = f"https://www.youtube.com/watch?v={video_ids[0]}"
                print(f"Found YouTube Video: {video_url} for query '{query}'")
                return video_url
    except Exception as e:
        print(f"Error fetching YouTube video for query '{query}': {e}")
    return None


def extract_image_url(entry):
    """Attempts to extract an image from various RSS feed elements."""
    # Method 1: Check media content tags
    if 'media_content' in entry and len(entry.media_content) > 0:
        return entry.media_content[0].get('url')
    # Method 2: Check standard links for images
    if 'links' in entry:
        for link in entry.links:
            if 'image' in link.get('type', ''):
                return link.get('href')
    # Method 3: Search HTML body for img tags
    body = entry.get('summary', '') or entry.get('description', '')
    match = re.search(r'<img[^>]+src="([^">]+)"', body)
    if match:
        return match.group(1)
    
    return None

UNSPLASH_FALLBACKS = {
    "AI": [
        "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=800&auto=format&fit=crop&q=80"
    ],
    "Dev": [
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80"
    ],
    "Gaming": [
        "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&auto=format&fit=crop&q=80"
    ],
    "Tech": [
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80"
    ]
}

def get_fallback_image(category):
    """Returns a random high-res Unsplash image URL for the given category."""
    images = UNSPLASH_FALLBACKS.get(category, UNSPLASH_FALLBACKS["Tech"])
    return random.choice(images)

def is_duplicate(source_url):
    """Checks if the article already exists in Supabase or local fallback database."""
    # 1. Check Supabase if configured
    if SUPABASE_URL and SUPABASE_KEY:
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json"
        }
        try:
            encoded_url = urllib.parse.quote(source_url)
            check_url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/posts?source_url=eq.{encoded_url}&select=id"
            res = requests.get(check_url, headers=headers, timeout=10)
            if res.status_code == 200:
                data = res.json()
                if len(data) > 0:
                    return True
        except Exception as e:
            print(f"Supabase duplicate check failed: {e}")

    # 2. Check local fallback database
    fallback_file = "posts.json"
    if os.path.exists(fallback_file):
        try:
            with open(fallback_file, 'r', encoding='utf-8') as f:
                posts = json.load(f)
                if any(p.get('sourceUrl') == source_url or p.get('source_url') == source_url for p in posts):
                    return True
        except Exception as e:
            print(f"Local duplicate check failed: {e}")

    return False

def rewrite_with_groq(original_title, original_content, category):
    """Uses Groq API (Llama 3.1 8B model) to rewrite the article in a premium, engaging, human tech-blogger tone."""
    if not GROQ_KEY:
        print("[Skipping Groq] GROQ_API_KEY is not configured.")
        return original_title, original_content, f"Read the latest {category} update on our blog."

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {GROQ_KEY}",
        "Content-Type": "application/json"
    }
    
    prompt = f"""
    You are a professional human tech blogger. Rewrite this article to be engaging and human-sounding (under 250 words).
    
    Title: {original_title}
    Details: {original_content}
    Category: {category}
    
    JSON Format to return:
    {{
        "title": "catchy title without quotes",
        "content": "engaging summary (2-3 paragraphs)",
        "seo_description": "seo description (max 150 chars)"
    }}
    """
    
    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [{"role": "user", "content": prompt}],
        "response_format": {"type": "json_object"},
        "temperature": 0.7,
        "max_tokens": 1024
    }

    for attempt in range(1, 4):
        try:
            res = requests.post(url, json=payload, headers=headers, timeout=20)
            if res.status_code == 200:
                data = res.json()
                content_text = data['choices'][0]['message']['content'].strip()
                parsed_data = json.loads(content_text)
                return parsed_data.get("title"), parsed_data.get("content"), parsed_data.get("seo_description")
            elif res.status_code == 429:
                print(f"[Rate Limited] Groq 429. Attempt {attempt} of 3. Waiting 15 seconds to cool down...")
                time.sleep(15)
            else:
                raise Exception(f"Groq API returned HTTP {res.status_code}: {res.text}")
        except Exception as e:
            print(f"Error on Groq API call (attempt {attempt}/3): {e}")
            if attempt < 3:
                time.sleep(5)
            
    print("All Groq API rewrite attempts failed. Falling back to original content.")
    return original_title, original_content, f"Latest news about {original_title} for {category} enthusiasts."

def upload_to_cloudinary(image_url):
    """Uploads the source image to Cloudinary and returns a secure optimized CDN URL."""
    if not image_url:
        return None
    if not (CLOUDINARY_NAME and CLOUDINARY_API_KEY and CLOUDINARY_SECRET):
        print("[Skipping Cloudinary] Credentials are not configured in .env.")
        return image_url # Fallback to original image URL

    try:
        print(f"Uploading image to Cloudinary: {image_url}")
        res = cloudinary.uploader.upload(
            image_url,
            folder="aether_news",
            transformation=[
                {"width": 800, "crop": "limit"},
                {"quality": "auto"},
                {"fetch_format": "auto"}
            ]
        )
        return res.get("secure_url")
    except Exception as e:
        print(f"Error uploading image to Cloudinary: {e}")
        return image_url

def send_telegram_notification(title, url):
    """Sends a notification about the new post to a Telegram Channel."""
    if not (TELEGRAM_TOKEN and TELEGRAM_CHAT_ID):
        print("[Skipping Telegram] Token or Chat ID not configured in .env.")
        return

    text = f"🚨 *New Article Published!*\n\n*Title:* {title}\n\n🔗 [Read Full Post]({url})"
    api_url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
    
    try:
        res = requests.post(api_url, json={
            "chat_id": TELEGRAM_CHAT_ID,
            "text": text,
            "parse_mode": "Markdown"
        }, timeout=10)
        if res.status_code == 200:
            print("Telegram notification dispatched successfully.")
        else:
            print(f"Telegram returned error code {res.status_code}: {res.text}")
    except Exception as e:
        print(f"Error sending Telegram notification: {e}")

def push_to_supabase(title, content, image_url, category, seo_description, source_url, video_url=None):
    """Pushes a new post record into Supabase PostgreSQL database using REST API."""
    if not (SUPABASE_URL and SUPABASE_KEY):
        print("[Skipping Supabase] Credentials not configured in .env.")
        save_fallback_locally(title, content, image_url, category, seo_description, source_url, video_url)
        return

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

    try:
        # Check if source_url already exists to prevent duplicate entries
        encoded_url = urllib.parse.quote(source_url)
        check_url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/posts?source_url=eq.{encoded_url}&select=id"
        check_res = requests.get(check_url, headers=headers, timeout=10)
        
        if check_res.status_code == 200 and len(check_res.json()) > 0:
            print(f"Article already exists in Supabase. Skipping: {title}")
            return

        payload = {
            "title": title,
            "content": content,
            "image_url": image_url,
            "category": category,
            "seo_description": seo_description,
            "source_url": source_url
        }
        if video_url:
            payload["video_url"] = video_url

        insert_url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/posts"
        res = requests.post(insert_url, json=payload, headers=headers, timeout=10)
        
        # If insertion fails with 400 because video_url doesn't exist in the current Supabase schema
        if res.status_code == 400 and "video_url" in payload:
            print("[Warning] Supabase insert failed. 'video_url' column might be missing. Retrying without 'video_url'...")
            del payload["video_url"]
            res = requests.post(insert_url, json=payload, headers=headers, timeout=10)

        if res.status_code not in (200, 201):
            raise Exception(f"Supabase REST error: {res.status_code} - {res.text}")
            
        print(f"Inserted post into Supabase successfully.")
        
        # Dispatch notifications
        res_data = res.json()
        site_url = os.getenv("NEXT_PUBLIC_SITE_URL", "https://localhost:3000")
        if len(res_data) > 0:
            inserted_id = res_data[0].get("id")
            post_link = f"{site_url}/post/{inserted_id}"
            send_telegram_notification(title, post_link)

    except Exception as e:
        print(f"Error saving to Supabase: {e}")
        save_fallback_locally(title, content, image_url, category, seo_description, source_url, video_url)

def save_fallback_locally(title, content, image_url, category, seo_description, source_url, video_url=None):
    """Writes to local posts.json as a fallback database if Supabase is offline."""
    print("Writing post to local fallback database (posts.json)...")
    fallback_file = "posts.json"
    posts = []
    if os.path.exists(fallback_file):
        try:
            with open(fallback_file, 'r', encoding='utf-8') as f:
                posts = json.load(f)
        except Exception:
            posts = []

    # Check duplicate
    if any(p.get('sourceUrl') == source_url for p in posts):
        return

    post_item = {
        "id": str(len(posts) + 1),
        "title": title,
        "category": category,
        "date": datetime.now().strftime("%Y-%m-%d"),
        "summary": seo_description,
        "content": content,
        "imageUrl": image_url,
        "sourceUrl": source_url
    }
    if video_url:
        post_item["videoUrl"] = video_url

    posts.insert(0, post_item)
    with open(fallback_file, 'w', encoding='utf-8') as f:
        json.dump(posts[:50], f, indent=2, ensure_ascii=False)

def run_pipeline():
    print("========================================")
    print("Starting Automated News Pipeline Run...")
    print("========================================")

    for feed_info in FEEDS:
        feed_url = feed_info["url"]
        category = feed_info["category"]
        
        print(f"\nProcessing feed: {feed_url}")
        feed = feedparser.parse(feed_url)
        
        # Scrape top 6 entries per feed to compile a rich catalog of posts
        for entry in feed.entries[:6]:
            source_url = entry.get('link')
            title = entry.get('title')
            
            # Check duplicate BEFORE making any API calls (Cloudinary / Groq)
            if is_duplicate(source_url):
                print(f"Article already exists. Skipping: {title}")
                continue
                
            content = entry.get('summary', '') or entry.get('description', '')
            
            # Clean up HTML tags from text contents
            clean_content = re.sub(r'<[^>]+>', '', content)
            
            print(f"\nProcessing new post: {title}")
            
            # 1. Image extraction & Cloudinary upload (with category fallback)
            raw_img = extract_image_url(entry)
            if not raw_img:
                raw_img = get_fallback_image(category)
                print(f"No image in RSS feed. Assigned fallback Unsplash image: {raw_img}")
                
            cloudinary_img = upload_to_cloudinary(raw_img)
            
            # 2. Groq Llama AI Rewriter & Meta Tag Optimization
            new_title, rewritten_body, seo_meta = rewrite_with_groq(title, clean_content, category)
            
            # 2.5 Fetch YouTube Video for Gaming/AI categories
            video_url = None
            if category in ("Gaming", "AI"):
                if category == "Gaming":
                    video_query = f"{new_title} gameplay trailer"
                else:
                    video_query = f"{new_title} news overview"
                video_url = fetch_youtube_video(video_query)
            
            # 3. Save to database (Supabase / local fallback)
            push_to_supabase(
                title=new_title,
                content=rewritten_body,
                image_url=cloudinary_img,
                category=category,
                seo_description=seo_meta,
                source_url=source_url,
                video_url=video_url
            )
            
            # 4. Pace requests to avoid Groq rate limit (TPM/RPM limits)
            print("Pacing pipeline, sleeping for 2 seconds...")
            time.sleep(2)

    print("\n========================================")
    print("News Pipeline Run Finished.")
    print("========================================")

if __name__ == '__main__':
    run_pipeline()
