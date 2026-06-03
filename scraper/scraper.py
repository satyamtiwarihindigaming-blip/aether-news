import os
import re
import json
import requests
import feedparser
import cloudinary
import cloudinary.uploader
import google.generativeai as genai
import urllib.parse
from datetime import datetime
from dotenv import load_dotenv

# Load local environment variables
load_dotenv()

# API Configuration
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
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

# Configure Gemini SDK
if GEMINI_KEY:
    genai.configure(api_key=GEMINI_KEY)

# Feeds list to scrape
FEEDS = [
    {"url": "https://techcrunch.com/feed/", "category": "Tech"},
    {"url": "https://dev.to/feed/tag/ai", "category": "AI"},
    {"url": "https://dev.to/feed/tag/webdev", "category": "Dev"}
]

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

def rewrite_with_gemini(original_title, original_content, category):
    """Uses Google Gemini API to rewrite the article in a viral tech-blogger tone."""
    if not GEMINI_KEY:
        print("[Skipping Gemini] GEMINI_API_KEY is not configured in .env.")
        return original_title, original_content, f"Read the latest {category} update on our blog."

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = f"""
        You are an expert viral tech blogger and SEO specialist. 
        Analyze the following article title and details.
        
        Title: {original_title}
        Content Details: {original_content}
        Category: {category}
        
        Tasks:
        1. Write a catchy, click-worthy, modern headline. Do not use quotes around it.
        2. Write a highly engaging, professional yet conversational blog post summarizing this content. Use markdown and structure it with paragraphs.
        3. Write a short, powerful SEO meta description (max 150 characters).
        
        Return your response strictly in the following JSON format:
        {{
            "title": "Your rewritten headline here",
            "content": "Your full rewritten blog article here with paragraphs separated by newlines",
            "seo_description": "Your SEO meta description here"
        }}
        """
        response = model.generate_content(prompt)
        
        # Clean potential markdown wrapping around JSON output
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
        
        data = json.loads(text.strip())
        return data.get("title"), data.get("content"), data.get("seo_description")
    except Exception as e:
        print(f"Error calling Gemini LLM rewriter: {e}")
        # Return fallback values
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

def push_to_supabase(title, content, image_url, category, seo_description, source_url):
    """Pushes a new post record into Supabase PostgreSQL database using REST API."""
    if not (SUPABASE_URL and SUPABASE_KEY):
        print("[Skipping Supabase] Credentials not configured in .env.")
        save_fallback_locally(title, content, image_url, category, seo_description, source_url)
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

        insert_url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/posts"
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
        save_fallback_locally(title, content, image_url, category, seo_description, source_url)

def save_fallback_locally(title, content, image_url, category, seo_description, source_url):
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
        
        # Scrape top 2 entries per feed to avoid API limits during automation runs
        for entry in feed.entries[:2]:
            title = entry.get('title')
            content = entry.get('summary', '') or entry.get('description', '')
            source_url = entry.get('link')
            
            # Clean up HTML tags from text contents
            clean_content = re.sub(r'<[^>]+>', '', content)
            
            print(f"\nFound Post: {title}")
            
            # 1. Image extraction & Cloudinary upload
            raw_img = extract_image_url(entry)
            cloudinary_img = upload_to_cloudinary(raw_img)
            
            # 2. Gemini AI Rewriter & Meta Tag Optimization
            new_title, rewritten_body, seo_meta = rewrite_with_gemini(title, clean_content, category)
            
            # 3. Save to database (Supabase / local fallback)
            push_to_supabase(
                title=new_title,
                content=rewritten_body,
                image_url=cloudinary_img,
                category=category,
                seo_description=seo_meta,
                source_url=source_url
            )

    print("\n========================================")
    print("News Pipeline Run Finished.")
    print("========================================")

if __name__ == '__main__':
    run_pipeline()
