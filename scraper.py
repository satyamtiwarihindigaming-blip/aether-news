import json
import urllib.request
import urllib.error
from datetime import datetime
import os

# Configuration
DB_FILE = 'posts.json'
MAX_POSTS = 50

TAG_MAPPING = {
    'ai': 'AI',
    'webdev': 'Dev',
    'technology': 'Tech'
}

def fetch_articles_for_tag(tag):
    url = f"https://dev.to/api/articles?tag={tag}&per_page=5"
    req = urllib.request.Request(
        url, 
        headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    )
    
    try:
        print(f"Fetching articles for tag: '{tag}'...")
        with urllib.request.urlopen(req, timeout=10) as response:
            if response.status == 200:
                return json.loads(response.read().decode('utf-8'))
    except urllib.error.URLError as e:
        print(f"Error fetching tag '{tag}': {e}")
    return []

def format_date(date_str):
    try:
        # e.g., '2026-06-03T10:30:00Z'
        dt = datetime.strptime(date_str.split('T')[0], "%Y-%m-%d")
        return dt.strftime("%Y-%m-%d")
    except Exception:
        return datetime.now().strftime("%Y-%m-%d")

def run_scraper():
    # 1. Load existing posts database
    posts = []
    if os.path.exists(DB_FILE):
        try:
            with open(DB_FILE, 'r', encoding='utf-8') as f:
                posts = json.load(f)
            print(f"Loaded {len(posts)} existing posts.")
        except Exception as e:
            print(f"Could not load database file, starting fresh: {e}")
            posts = []

    # Keep track of existing titles and source URLs to prevent duplicates
    existing_urls = {p.get('sourceUrl') for p in posts if p.get('sourceUrl')}
    existing_titles = {p.get('title').lower() for p in posts if p.get('title')}

    new_posts_added = 0

    # 2. Fetch new posts from tags
    for tag, category in TAG_MAPPING.items():
        raw_articles = fetch_articles_for_tag(tag)
        for article in raw_articles:
            source_url = article.get('url')
            title = article.get('title')

            if source_url in existing_urls or (title and title.lower() in existing_titles):
                # Skip duplicate
                continue

            # Parse article details
            desc = article.get('description', '')
            # Clean up cover image URL, fallback to social image or Unsplash placeholder
            img_url = article.get('cover_image') or article.get('social_image')
            if not img_url:
                if category == 'AI':
                    img_url = "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80"
                elif category == 'Dev':
                    img_url = "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800&auto=format&fit=crop&q=80"
                else:
                    img_url = "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80"

            # Create post structure
            post_item = {
                "id": str(article.get('id')),
                "title": title,
                "category": category,
                "date": format_date(article.get('published_at')),
                "summary": desc,
                "content": f"{desc}\n\nThis article highlights fresh changes in the field of {category.lower()}. It outlines key paradigms, updates, and community findings.\n\nAuthor: {article.get('user', {}).get('name', 'Anonymous Writer')}\nPositive Reactions: {article.get('positive_reactions_count', 0)}",
                "imageUrl": img_url,
                "sourceUrl": source_url
            }

            # Insert at the beginning of the list
            posts.insert(0, post_item)
            existing_urls.add(source_url)
            existing_titles.add(title.lower())
            new_posts_added += 1

    print(f"Scrape completed. Added {new_posts_added} new posts.")

    # 3. Truncate database to keep MAX_POSTS limit
    posts = posts[:MAX_POSTS]

    # 4. Save to JSON database
    try:
        with open(DB_FILE, 'w', encoding='utf-8') as f:
            json.dump(posts, f, indent=2, ensure_ascii=False)
        print(f"Database successfully saved. Total articles count: {len(posts)}.")
    except Exception as e:
        print(f"Error saving database: {e}")

if __name__ == '__main__':
    run_scraper()
