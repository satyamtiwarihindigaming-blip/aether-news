import fs from "fs/promises";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Calendar, User } from "lucide-react";
import ShareButton from "@/components/ShareButton";
import SafeImage from "@/components/SafeImage";
import ThemeToggle from "@/components/ThemeToggle";
import LiteYouTube from "@/components/LiteYouTube";

export const revalidate = 3600; // ISR cache validation every hour

// Fetch all posts helper for fallback operations
async function getAllPostsRaw() {
  if (supabase) {
    try {
      const { data, error } = await supabase.from("posts").select("*");
      if (!error && data && data.length > 0) return data;
    } catch {}
  }
  try {
    const filePath = path.join(process.cwd(), "posts.json");
    const contents = await fs.readFile(filePath, "utf8");
    return JSON.parse(contents).map(post => ({
      id: String(post.id),
      title: post.title,
      content: post.content,
      image_url: post.imageUrl || post.image_url,
      video_url: post.videoUrl || post.video_url || null,
      category: post.category,
      seo_description: post.summary || post.seo_description,
      created_at: post.date || post.created_at,
      date: post.date || post.created_at,
      source_url: post.sourceUrl || post.source_url
    }));
  } catch {
    return [];
  }
}

// Generate static params for Next.js build optimization
export async function generateStaticParams() {
  const posts = await getAllPostsRaw();
  return posts.map((post) => ({
    id: String(post.id),
  }));
}

// Fetch single post
async function getPost(id) {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();
      if (!error && data) return data;
    } catch {}
  }

  // Fallback lookup
  const posts = await getAllPostsRaw();
  const found = posts.find((p) => String(p.id) === String(id));
  return found || null;
}

// Generate Dynamic Metadata for social cards sharing
export async function generateMetadata({ params }) {
  const post = await getPost(params.id);
  if (!post) return {};

  return {
    title: `${post.title} | AetherNews`,
    description: post.seo_description || post.summary || "Tech article feed",
    openGraph: {
      title: post.title,
      description: post.seo_description || post.summary,
      images: [
        {
          url: post.image_url || post.imageUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&q=80",
          width: 800,
          height: 600,
        },
      ],
    },
  };
}

export default async function PostPage({ params }) {
  const post = await getPost(params.id);

  if (!post) {
    notFound();
  }

  const paragraphs = post.content.split("\n\n");

  return (
    <>
      {/* Header */}
      <header className="flex justify-between items-center py-6 border-b border-headerBorder backdrop-blur-md">
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-textSecondary hover:text-textPrimary transition-colors duration-200">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Articles
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display font-black text-xl tracking-tight text-textPrimary">
              AETHER<span className="text-textSecondary">NEWS</span>
            </span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow py-12 max-w-3xl mx-auto">
        <article>
          {/* Metadata */}
          <div className="flex flex-wrap gap-4 items-center text-sm text-textSecondary mb-6">
            <span className="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full border border-borderCustom bg-card text-textPrimary uppercase tracking-wider">
              {post.category}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-textMuted" />
              {(() => {
                try {
                  const d = new Date(post.created_at || post.date);
                  if (isNaN(d.getTime())) return post.created_at || post.date;
                  return d.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  });
                } catch {
                  return post.created_at || post.date;
                }
              })()}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-textMuted" />
              By Aether News Staff
            </span>
          </div>

          {/* Title */}
          <h1 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-textPrimary leading-tight mb-8">
            {post.title}
          </h1>

          {/* Featured Image */}
          <div className="w-full h-80 md:h-[400px] relative rounded-3xl overflow-hidden mb-10 border border-borderCustom">
            <SafeImage
              src={post.image_url || post.imageUrl}
              alt={post.title}
              className="w-full h-full object-cover"
              fallbackSrc="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&q=80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent" />
          </div>

          {/* YouTube Video Section if present */}
          {post.video_url && (
            <LiteYouTube videoUrl={post.video_url} title={post.title} />
          )}

          {/* Body Article Content */}
          <div className="text-textSecondary text-base md:text-lg leading-relaxed font-light space-y-6">
            {paragraphs.map((p, index) => (
              <p key={index}>{p}</p>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-12 pt-8 border-t border-headerBorder flex justify-between items-center">
            <ShareButton title={post.title} />
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 border-t border-headerBorder text-xs text-textMuted mt-12">
        <p>&copy; 2026 AetherNews. Designed for Developers and Tech Enthusiasts.</p>
      </footer>
    </>
  );
}
