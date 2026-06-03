"use client";

import { useState } from "react";
import Link from "next/link";
import PostCard from "./PostCard";
import { LayoutGrid, Sparkles, Code2, Globe, TrendingUp, Mail, BookOpen, Clock } from "lucide-react";

export default function Dashboard({ initialPosts }) {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredPosts = activeCategory === "all"
    ? initialPosts
    : initialPosts.filter(post => post.category.toLowerCase() === activeCategory.toLowerCase());

  // First post is highlighted as Featured Post
  const featuredPost = filteredPosts[0];
  // Rest of the posts go to the grid list
  const gridPosts = filteredPosts.slice(1);

  // Top trending posts list (first 3 posts from initial list)
  const trendingPosts = initialPosts.slice(0, 3);

  const categories = [
    { id: "all", label: "All Topics", count: initialPosts.length, icon: <LayoutGrid className="w-4 h-4 mr-2" /> },
    { id: "ai", label: "Artificial Intelligence", count: initialPosts.filter(p => p.category.toLowerCase() === "ai").length, icon: <Sparkles className="w-4 h-4 mr-2" /> },
    { id: "dev", label: "Development", count: initialPosts.filter(p => p.category.toLowerCase() === "dev").length, icon: <Code2 className="w-4 h-4 mr-2" /> },
    { id: "tech", label: "Future Tech", count: initialPosts.filter(p => p.category.toLowerCase() === "tech").length, icon: <Globe className="w-4 h-4 mr-2" /> }
  ];

  // Helper date format
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return dateString;
    }
  };

  return (
    <>
      {/* Premium Header */}
      <header className="flex justify-between items-center py-6 border-b border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-3.5 h-3.5 rounded-full bg-primary-glow shadow-[0_0_15px_#00f2fe] animate-pulse-glow" />
          <span className="font-display font-extrabold text-2xl tracking-wider bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            AETHER<span className="text-neonBlue">NEWS</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-textSecondary font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-glow" />
            Connected
          </span>
        </div>
      </header>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 py-10 flex-grow">
        
        {/* Left Column: Main Post Feed (Col span: 8) */}
        <main className="lg:col-span-8 space-y-12">
          
          {/* Featured Post Card (Hero Highlight) */}
          {featuredPost && activeCategory === "all" && (
            <div className="glass-panel rounded-3xl overflow-hidden border border-white/10 group transition-all duration-300">
              <Link href={`/post/${featuredPost.id}`} className="grid grid-cols-1 md:grid-cols-12 gap-0">
                <div className="md:col-span-7 h-64 md:h-96 relative overflow-hidden bg-zinc-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={featuredPost.image_url || featuredPost.imageUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80"}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                  <span className="absolute top-4 left-4 bg-neonPurple text-white text-[10px] font-display font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                    Featured Story
                  </span>
                </div>
                <div className="md:col-span-5 p-6 md:p-8 flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-neonBlue uppercase tracking-wider mb-2 block">
                    {featuredPost.category} &bull; {formatDate(featuredPost.created_at || featuredPost.date)}
                  </span>
                  <h2 className="font-display font-bold text-xl md:text-2xl text-textPrimary leading-tight mb-4 group-hover:text-neonBlue transition-colors duration-200">
                    {featuredPost.title}
                  </h2>
                  <p className="text-textSecondary text-sm font-light leading-relaxed mb-6 line-clamp-4">
                    {featuredPost.seo_description || featuredPost.summary || featuredPost.content}
                  </p>
                  <span className="text-xs font-semibold text-neonBlue group-hover:text-neonPurple inline-flex items-center transition-colors duration-200">
                    Read Featured Post &rarr;
                  </span>
                </div>
              </Link>
            </div>
          )}

          {/* Grid list of articles */}
          <div className="space-y-6">
            <h3 className="font-display font-bold text-lg text-textPrimary flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-neonBlue" />
              Latest Publications
            </h3>
            
            {filteredPosts.length === 0 ? (
              <div className="glass-panel text-center py-20 text-textMuted rounded-3xl flex flex-col items-center justify-center">
                <BookOpen className="w-12 h-12 mb-3 stroke-[1.5]" />
                <p className="font-display text-lg">No articles posted in this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* If active category is selected, render featured post in grid as well */}
                {(activeCategory !== "all" ? filteredPosts : gridPosts).map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Right Column: Sidebar (Col span: 4) */}
        <aside className="lg:col-span-4 space-y-8">
          
          {/* Sidebar Section 1: Categories selector */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10">
            <h4 className="font-display font-bold text-sm text-textPrimary uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
              Discover Topics
            </h4>
            <div className="flex flex-col gap-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center justify-between text-sm font-medium px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeCategory === cat.id
                      ? "bg-primary-glow text-background font-bold shadow-md shadow-neonBlue/10"
                      : "text-textSecondary hover:text-textPrimary hover:bg-white/5"
                  }`}
                >
                  <span className="flex items-center">
                    {cat.icon}
                    {cat.label}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    activeCategory === cat.id ? "bg-background/25 text-background" : "bg-white/5 text-textMuted"
                  }`}>
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Sidebar Section 2: Trending / Top Stories */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10">
            <h4 className="font-display font-bold text-sm text-textPrimary uppercase tracking-wider mb-4 border-b border-white/5 pb-2 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-neonPurple" />
              Trending Now
            </h4>
            <div className="space-y-4">
              {trendingPosts.map((post, idx) => (
                <Link key={post.id} href={`/post/${post.id}`} className="group block">
                  <div className="flex gap-3">
                    <span className="font-display font-extrabold text-2xl text-textMuted group-hover:text-neonBlue transition-colors duration-150 w-6">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-grow min-w-0">
                      <h5 className="font-display font-semibold text-sm text-textPrimary line-clamp-2 leading-snug group-hover:text-neonBlue transition-colors duration-150">
                        {post.title}
                      </h5>
                      <span className="text-[10px] text-textMuted uppercase mt-1 block">
                        {post.category} &bull; 3 min read
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Sidebar Section 3: Premium Newsletter Subscription */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10 bg-gradient-to-br from-zinc-950/80 via-zinc-900/40 to-transparent">
            <div className="w-10 h-10 rounded-xl bg-neonBlue/10 border border-neonBlue/20 flex items-center justify-center text-neonBlue mb-4">
              <Mail className="w-5 h-5" />
            </div>
            <h4 className="font-display font-bold text-md text-textPrimary mb-2">
              Subscribe to AetherMail
            </h4>
            <p className="text-xs text-textSecondary font-light leading-relaxed mb-4">
              Get high-fidelity technical writeups and future engineering insights directly in your inbox weekly.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert("Subscription successful!"); }} className="space-y-2">
              <input
                type="email"
                placeholder="Email Address"
                className="w-full px-4 py-2.5 rounded-lg bg-zinc-900 border border-white/10 text-xs focus:outline-none focus:border-neonBlue text-textPrimary"
                required
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-primary-glow text-background font-bold text-xs shadow-md shadow-neonBlue/5 hover:shadow-neonBlue/25 hover:scale-[1.01] transition-all duration-200"
              >
                Join Newsletter
              </button>
            </form>
          </div>
        </aside>
      </div>

      {/* Clean Footer */}
      <footer className="text-center py-8 border-t border-white/10 text-xs text-textMuted">
        <p>&copy; 2026 AetherNews. All rights reserved.</p>
      </footer>
    </>
  );
}
