import os
import re
import json
import time
import requests
import feedparser
import urllib.parse
import random
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# ── API Keys ──────────────────────────────────────────────
GROQ_KEY        = os.getenv("GROQ_API_KEY")
SUPABASE_URL    = os.getenv("SUPABASE_URL")
SUPABASE_KEY    = os.getenv("SUPABASE_KEY")
TELEGRAM_TOKEN  = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID= os.getenv("TELEGRAM_CHAT_ID")

# ── Cloudinary (optional image CDN) ───────────────────────
try:
    import cloudinary
    import cloudinary.uploader
    CLOUDINARY_NAME   = os.getenv("CLOUDINARY_CLOUD_NAME")
    CLOUDINARY_API_KEY= os.getenv("CLOUDINARY_API_KEY")
    CLOUDINARY_SECRET = os.getenv("CLOUDINARY_API_SECRET")
    if CLOUDINARY_NAME and CLOUDINARY_API_KEY and CLOUDINARY_SECRET:
        cloudinary.config(
            cloud_name=CLOUDINARY_NAME,
            api_key=CLOUDINARY_API_KEY,
            api_secret=CLOUDINARY_SECRET,
            secure=True
        )
        CLOUDINARY_OK = True
    else:
        CLOUDINARY_OK = False
except ImportError:
    CLOUDINARY_OK = False

# ── RSS Feeds ─────────────────────────────────────────────
FEEDS = [
    {"url": "https://news.google.com/rss/search?q=GTA+6+OR+%22Grand+Theft+Auto+VI%22&hl=en-US&gl=US&ceid=US:en", "category": "Gaming"},
    {"url": "https://www.pcgamer.com/rss/",                        "category": "Gaming"},
    {"url": "https://feeds.feedburner.com/ign/news",               "category": "Gaming"},
    {"url": "https://techcrunch.com/feed/",                        "category": "Tech"},
    {"url": "https://dev.to/feed/tag/ai",                          "category": "AI"},
    {"url": "https://dev.to/feed/tag/webdev",                      "category": "Dev"},
]

# ── Unsplash fallback images per category ─────────────────
UNSPLASH = {
    "Gaming": [
        "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1580327344181-c1163234e5a0?w=800&auto=format&fit=crop&q=80",
    ],
    "Tech": [
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&auto=format&fit=crop&q=80",
    ],
    "AI": [
        "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=800&auto=format&fit=crop&q=80",
    ],
    "Dev": [
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
    ],
}

def get_fallback_image(category):
    pool = UNSPLASH.get(category, UNSPLASH["Tech"])
    return random.choice(pool)

# ── Image helpers ─────────────────────────────────────────
def extract_image_url(entry):
    if 'media_content' in entry and entry.media_content:
        return entry.media_content[0].get('url')
    if 'links' in entry:
        for lnk in entry.links:
            if 'image' in lnk.get('type', ''):
                return lnk.get('href')
    body = entry.get('summary', '') or entry.get('description', '')
    m = re.search(r'<img[^>]+src="([^">]+)"', body)
    if m:
        return m.group(1)
    return None

def upload_to_cloudinary(image_url):
    if not image_url or not CLOUDINARY_OK:
        return image_url
    try:
        print(f"  Uploading to Cloudinary: {image_url[:60]}...")
        res = cloudinary.uploader.upload(
            image_url,
            folder="aether_news",
            transformation=[{"width": 800, "crop": "limit"}, {"quality": "auto"}, {"fetch_format": "auto"}]
        )
        return res.get("secure_url", image_url)
    except Exception as e:
        print(f"  Cloudinary upload failed: {e}")
        return image_url

# ── YouTube video search ───────────────────────────────────
def fetch_youtube_video(query):
    try:
        q = urllib.parse.quote(query + " trailer OR gameplay OR review")
        url = f"https://www.youtube.com/results?search_query={q}"
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        res = requests.get(url, headers=headers, timeout=10)
        if res.status_code == 200:
            ids = re.findall(r'"videoId":"([a-zA-Z0-9_-]{11})"', res.text)
            if ids:
                vid = f"https://www.youtube.com/watch?v={ids[0]}"
                print(f"  YouTube: {vid}")
                return vid
    except Exception as e:
        print(f"  YouTube search failed: {e}")
    return None

# ── Groq AI rewriter — English + Hindi bilingual ──────────
def rewrite_bilingual(original_title, original_content, category):
    if not GROQ_KEY:
        print("  [Groq] No API key — skipping rewrite.")
        return original_title, original_content, original_content[:100], original_title, original_content

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {"Authorization": f"Bearer {GROQ_KEY}", "Content-Type": "application/json"}

    prompt = f"""You are a bilingual tech/gaming blogger. Rewrite this article in TWO languages.

Title: {original_title}
Content: {original_content[:1500]}
Category: {category}

Return ONLY this JSON (no extra text):
{{
  "title_en": "catchy English title",
  "content_en": "2-3 engaging English paragraphs (under 300 words)",
  "seo_description": "SEO meta description in English (max 150 chars)",
  "title_hi": "आकर्षक हिंदी शीर्षक",
  "content_hi": "2-3 रोचक हिंदी पैराग्राफ (200 शब्दों से कम)"
}}"""

    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [{"role": "user", "content": prompt}],
        "response_format": {"type": "json_object"},
        "temperature": 0.7,
        "max_tokens": 1500
    }

    for attempt in range(1, 4):
        try:
            res = requests.post(url, json=payload, headers=headers, timeout=25)
            if res.status_code == 200:
                data = json.loads(res.json()['choices'][0]['message']['content'])
                return (
                    data.get("title_en", original_title),
                    data.get("content_en", original_content),
                    data.get("seo_description", ""),
                    data.get("title_hi", original_title),
                    data.get("content_hi", "")
                )
            elif res.status_code == 429:
                print(f"  [Groq] Rate limited. Waiting 20s... (attempt {attempt}/3)")
                time.sleep(20)
            else:
                print(f"  [Groq] Error {res.status_code}: {res.text[:100]}")
                break
        except Exception as e:
            print(f"  [Groq] Exception attempt {attempt}: {e}")
            time.sleep(5)

    print("  [Groq] All attempts failed. Using original content.")
    return original_title, original_content, original_content[:120], original_title, ""

# ── Duplicate check ────────────────────────────────────────
def is_duplicate(source_url):
    # Check Supabase
    if SUPABASE_URL and SUPABASE_KEY:
        try:
            encoded = urllib.parse.quote(source_url, safe='')
            r = requests.get(
                f"{SUPABASE_URL.rstrip('/')}/rest/v1/posts?source_url=eq.{encoded}&select=id",
                headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"},
                timeout=10
            )
            if r.status_code == 200 and len(r.json()) > 0:
                return True
        except Exception as e:
            print(f"  Supabase dup check error: {e}")

    # Check local posts.json
    if os.path.exists("posts.json"):
        try:
            with open("posts.json", "r", encoding="utf-8") as f:
                posts = json.load(f)
            if any(p.get("sourceUrl") == source_url or p.get("source_url") == source_url for p in posts):
                return True
        except:
            pass
    return False

# ── Save to Supabase ───────────────────────────────────────
def push_to_supabase(title_en, content_en, title_hi, content_hi, image_url,
                      category, seo_description, source_url, video_url=None):
    if not (SUPABASE_URL and SUPABASE_KEY):
        save_fallback_locally(title_en, content_en, title_hi, content_hi,
                               image_url, category, seo_description, source_url, video_url)
        return

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

    payload = {
        "title": title_en,
        "title_hi": title_hi,
        "content": content_en,
        "content_hi": content_hi,
        "image_url": image_url,
        "category": category,
        "seo_description": seo_description,
        "source_url": source_url,
    }
    if video_url:
        payload["video_url"] = video_url

    try:
        res = requests.post(f"{SUPABASE_URL.rstrip('/')}/rest/v1/posts",
                            json=payload, headers=headers, timeout=15)

        # Retry without Hindi fields if column missing
        if res.status_code == 400:
            print("  [Supabase] Retry without Hindi columns...")
            payload_simple = {k: v for k, v in payload.items() if k not in ("title_hi", "content_hi")}
            res = requests.post(f"{SUPABASE_URL.rstrip('/')}/rest/v1/posts",
                                json=payload_simple, headers=headers, timeout=15)

        if res.status_code in (200, 201):
            print(f"  ✅ Saved to Supabase: {title_en[:60]}")
            rdata = res.json()
            site_url = os.getenv("NEXT_PUBLIC_SITE_URL", "https://aether-news.vercel.app")
            if rdata and rdata[0].get("id"):
                send_telegram(title_en, f"{site_url}/post/{rdata[0]['id']}")
        else:
            print(f"  ⚠️ Supabase error {res.status_code}: {res.text[:150]}")
            save_fallback_locally(title_en, content_en, title_hi, content_hi,
                                   image_url, category, seo_description, source_url, video_url)
    except Exception as e:
        print(f"  Supabase push failed: {e}")
        save_fallback_locally(title_en, content_en, title_hi, content_hi,
                               image_url, category, seo_description, source_url, video_url)

# ── Save to posts.json fallback ────────────────────────────
def save_fallback_locally(title_en, content_en, title_hi, content_hi,
                           image_url, category, seo_description, source_url, video_url=None):
    print("  Writing to posts.json fallback...")
    posts = []
    if os.path.exists("posts.json"):
        try:
            with open("posts.json", "r", encoding="utf-8") as f:
                posts = json.load(f)
        except:
            posts = []

    if any(p.get("sourceUrl") == source_url for p in posts):
        print("  Duplicate in posts.json — skipping.")
        return

    # Find max existing ID
    max_id = 0
    for p in posts:
        try:
            max_id = max(max_id, int(p.get("id", 0)))
        except:
            pass

    entry = {
        "id": str(max_id + 1),
        "title": title_en,
        "title_hi": title_hi,
        "category": category,
        "date": datetime.now().strftime("%Y-%m-%d"),
        "summary": seo_description,
        "content": content_en,
        "content_hi": content_hi,
        "imageUrl": image_url,
        "sourceUrl": source_url,
    }
    if video_url:
        entry["videoUrl"] = video_url

    posts.insert(0, entry)
    with open("posts.json", "w", encoding="utf-8") as f:
        json.dump(posts[:60], f, indent=2, ensure_ascii=False)
    print(f"  ✅ Saved to posts.json (id={entry['id']}): {title_en[:60]}")

# ── Telegram notification ──────────────────────────────────
def send_telegram(title, url):
    if not (TELEGRAM_TOKEN and TELEGRAM_CHAT_ID):
        return
    try:
        msg = f"🎮 *New Post!*\n\n*{title}*\n\n🔗 [Read Article]({url})"
        requests.post(
            f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage",
            json={"chat_id": TELEGRAM_CHAT_ID, "text": msg, "parse_mode": "Markdown"},
            timeout=10
        )
    except Exception as e:
        print(f"  Telegram error: {e}")

# ── Main pipeline ──────────────────────────────────────────
def run_pipeline():
    print("=" * 50)
    print("  AetherNews Auto-Scraper Starting...")
    print("=" * 50)

    total_saved = 0

    for feed_info in FEEDS:
        feed_url  = feed_info["url"]
        category  = feed_info["category"]
        print(f"\n📡 Feed: {feed_url[:70]}")

        try:
            feed = feedparser.parse(feed_url)
        except Exception as e:
            print(f"  Feed parse error: {e}")
            continue

        for entry in feed.entries[:5]:
            source_url = entry.get("link", "")
            raw_title  = entry.get("title", "Untitled")
            raw_body   = re.sub(r"<[^>]+>", "", entry.get("summary", "") or entry.get("description", ""))

            if not source_url:
                continue

            print(f"\n  → {raw_title[:70]}")

            if is_duplicate(source_url):
                print("    [SKIP] Already exists.")
                continue

            # 1. Get image — always guaranteed
            image_url = extract_image_url(entry) or get_fallback_image(category)
            image_url = upload_to_cloudinary(image_url) or image_url
            print(f"    Image: {image_url[:60]}...")

            # 2. AI Rewrite in English + Hindi
            print("    Rewriting with Groq AI (EN + HI)...")
            title_en, content_en, seo_desc, title_hi, content_hi = rewrite_bilingual(
                raw_title, raw_body, category
            )

            # 3. YouTube video disabled as requested ("video rahane de")
            video_url = None

            # 4. Save
            push_to_supabase(
                title_en=title_en,
                content_en=content_en,
                title_hi=title_hi,
                content_hi=content_hi,
                image_url=image_url,
                category=category,
                seo_description=seo_desc,
                source_url=source_url,
                video_url=video_url,
            )
            total_saved += 1

            # 5. Rate limit pause
            print("    Pausing 3s...")
            time.sleep(3)

    print(f"\n{'=' * 50}")
    print(f"  Pipeline Done! Saved {total_saved} new posts.")
    print("=" * 50)

if __name__ == "__main__":
    run_pipeline()
