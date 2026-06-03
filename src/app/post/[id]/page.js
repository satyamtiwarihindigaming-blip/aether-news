import fs from "fs/promises";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Calendar, User } from "lucide-react";
import ShareButton from "@/components/ShareButton";

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
      category: post.category,
      seo_description: post.summary || post.seo_description,
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
      <header className="flex justify-between items-center py-6 border-b border-white/10 backdrop-blur-md">
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-textSecondary hover:text-neonBlue transition-colors duration-200">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-3.5 h-3.5 rounded-full bg-primary-glow shadow-[0_0_15px_#00f2fe] animate-pulse-glow" />
          <span className="font-display font-extrabold text-xl tracking-wider bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            AETHER<span className="text-neonBlue">NEWS</span>
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow py-12 max-w-3xl mx-auto">
        <article>
          {/* Metadata */}
          <div className="flex flex-wrap gap-4 items-center text-sm text-textSecondary mb-6">
            <span className="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full border border-neonBlue/20 bg-neonBlue/5 text-neonBlue uppercase tracking-wider">
              {post.category}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-textMuted" />
              {new Date(post.created_at || post.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-textMuted" />
              Aether Editorial Team
            </span>
          </div>

          {/* Title */}
          <h1 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-textPrimary leading-tight mb-8">
            {post.title}
          </h1>

          {/* Featured Image */}
          <div className="w-full h-80 md:h-[400px] relative rounded-3xl overflow-hidden mb-10 border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.image_url || post.imageUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&q=80"}
              alt={post.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&q=80";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent" />
          </div>

          {/* Body Article Content */}
          <div className="text-textSecondary text-base md:text-lg leading-relaxed font-light space-y-6">
            {paragraphs.map((p, index) => (
              <p key={index}>{p}</p>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-12 pt-8 border-t border-white/10 flex justify-between items-center">
            <ShareButton title={post.title} />
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 border-t border-white/10 text-xs text-textMuted mt-12">
        <p>&copy; 2026 AetherNews. Designed for Developers and Tech Enthusiasts.</p>
      </footer>
    </>
  );
}
