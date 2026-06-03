"use client";

import { useState } from "react";
import PostCard from "./PostCard";
import { LayoutGrid, Sparkles, Code2, Globe, Cpu } from "lucide-react";

export default function Dashboard({ initialPosts, isSupabaseActive }) {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredPosts = activeCategory === "all"
    ? initialPosts
    : initialPosts.filter(post => post.category.toLowerCase() === activeCategory.toLowerCase());

  const categories = [
    { id: "all", label: "All Articles", icon: <LayoutGrid className="w-4 h-4 mr-1.5" /> },
    { id: "ai", label: "AI", icon: <Sparkles className="w-4 h-4 mr-1.5" /> },
    { id: "dev", label: "Development", icon: <Code2 className="w-4 h-4 mr-1.5" /> },
    { id: "tech", label: "Future Tech", icon: <Globe className="w-4 h-4 mr-1.5" /> }
  ];

  return (
    <>
      {/* Header */}
      <header className="flex justify-between items-center py-6 border-b border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-3.5 h-3.5 rounded-full bg-primary-glow shadow-[0_0_15px_#00f2fe] animate-pulse-glow" />
          <span className="font-display font-extrabold text-xl tracking-wider bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            AETHER<span className="text-neonBlue">NEWS</span>
          </span>
        </div>
        <div className="inline-flex items-center gap-2 bg-neonBlue/5 border border-neonBlue/15 px-3.5 py-1.5 rounded-full text-xs font-semibold text-neonBlue">
          <span className="w-1.5 h-1.5 rounded-full bg-neonBlue animate-pulse-glow" />
          Realtime Feed: Live
        </div>
      </header>

      {/* Hero */}
      <section className="text-center py-16 max-w-3xl mx-auto flex flex-col items-center">
        <div className="inline-flex items-center gap-2 bg-neonPurple/5 border border-neonPurple/20 text-[#c98eff] px-4 py-1.5 rounded-full text-xs font-display font-semibold uppercase tracking-wider mb-6">
          <Sparkles className="w-3.5 h-3.5 text-neonPurple" />
          Verified Editorial Insights
        </div>
        <h1 className="font-display font-extrabold text-4xl md:text-5xl lg:text-6xl leading-[1.15] mb-6 tracking-tight">
          Stay Ahead of the <span className="bg-gradient-to-r from-neonBlue via-[#569eff] to-neonPurple bg-clip-text text-transparent">Tech Frontier</span>
        </h1>
        <p className="text-textSecondary text-base md:text-lg font-light leading-relaxed mb-12 max-w-2xl">
          High-fidelity summaries of engineering breakthroughs, artificial intelligence breakthroughs, and future technology trends.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-xl">
          <div className="glass-panel rounded-2xl p-4 flex flex-col items-center">
            <span className="font-display font-bold text-2xl bg-primary-glow bg-clip-text text-transparent">
              {initialPosts.length}
            </span>
            <span className="text-[10px] text-textMuted uppercase tracking-wider mt-1">Articles Published</span>
          </div>
          <div className="glass-panel rounded-2xl p-4 flex flex-col items-center">
            <span className="font-display font-bold text-2xl bg-primary-glow bg-clip-text text-transparent">
              Realtime
            </span>
            <span className="text-[10px] text-textMuted uppercase tracking-wider mt-1">Update Speed</span>
          </div>
          <div className="glass-panel rounded-2xl p-4 flex flex-col items-center">
            <span className="font-display font-bold text-2xl bg-primary-glow bg-clip-text text-transparent">
              Premium
            </span>
            <span className="text-[10px] text-textMuted uppercase tracking-wider mt-1">Curation Level</span>
          </div>
        </div>
      </section>

      {/* Filter Navigation */}
      <section className="flex justify-center mb-10">
        <div className="flex gap-2 bg-zinc-950/60 p-1.5 rounded-full border border-white/10 backdrop-blur-md">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center text-sm font-semibold font-display px-4 py-2 rounded-full transition-all duration-300 ${
                activeCategory === cat.id
                  ? "bg-primary-glow text-background shadow-lg shadow-neonBlue/20"
                  : "text-textSecondary hover:text-textPrimary hover:bg-white/5"
              }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Posts Grid */}
      <main className="flex-grow pb-16">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-20 text-textMuted flex flex-col items-center justify-center">
            <LayoutGrid className="w-12 h-12 mb-3 stroke-[1.5]" />
            <p className="font-display text-lg">No articles found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-8 border-t border-white/10 text-xs text-textMuted">
        <p>&copy; 2026 AetherNews. Designed for Developers and Tech Enthusiasts.</p>
      </footer>
    </>
  );
}
