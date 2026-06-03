import fs from "fs/promises";
import path from "path";
import { supabase } from "@/lib/supabase";
import Dashboard from "@/components/Dashboard";

export const revalidate = 3600; // ISR cache validation every hour

async function getPosts() {
  let isSupabaseActive = false;
  let posts = [];

  // Attempt to fetch from Supabase
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        posts = data;
        isSupabaseActive = true;
        console.log("Next.js Page fetched posts from Supabase database.");
      }
    } catch (e) {
      console.warn("Supabase fetch failed, falling back to posts.json: ", e);
    }
  }

  // Fallback: Read posts.json from root
  if (posts.length === 0) {
    try {
      const filePath = path.join(process.cwd(), "posts.json");
      const fileContents = await fs.readFile(filePath, "utf8");
      
      // Map posts.json structure to match db column schemas (standardizing property keys)
      const localData = JSON.parse(fileContents);
      posts = localData.map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        image_url: post.imageUrl || post.image_url,
        video_url: post.videoUrl || post.video_url || null,
        category: post.category,
        seo_description: post.summary || post.seo_description,
        created_at: post.date,
        source_url: post.sourceUrl || post.source_url
      }));
      console.log(`Next.js Page loaded ${posts.length} posts from local posts.json.`);
    } catch (e) {
      console.error("Local database read error:", e);
    }
  }

  return { posts, isSupabaseActive };
}

export default async function HomePage() {
  const { posts, isSupabaseActive } = await getPosts();
  
  return (
    <Dashboard initialPosts={posts} isSupabaseActive={isSupabaseActive} />
  );
}
