"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PostCard from "./PostCard";
import { Sparkles, TrendingUp, Mail, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";

export default function Dashboard({ initialPosts }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  // Categories list
  const categories = [
    { id: "all", label: "All News" },
    { id: "tech", label: "Future Tech" },
    { id: "ai", label: "AI" },
    { id: "dev", label: "Development" },
    { id: "gaming", label: "Gaming" }
  ];

  // Filtering posts by both category and search query
  const filteredPosts = initialPosts.filter(post => {
    const matchesCategory = activeCategory === "all" || post.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = searchQuery.trim() === "" || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (post.content && post.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (post.seo_description && post.seo_description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (post.summary && post.summary.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Slideshow posts (latest 4 posts)
  const slidePosts = initialPosts.slice(0, 4);

  // Main feed grid posts
  const gridPosts = filteredPosts;

  // Top trending posts list (first 5 posts from initial list)
  const trendingPosts = initialPosts.slice(0, 5);

  // Auto-slide effect for hero banner (5 seconds interval)
  useEffect(() => {
    if (slidePosts.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slidePosts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slidePosts.length]);

  // Helper date format
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return dateString;
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slidePosts.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slidePosts.length) % slidePosts.length);
  };

  return (
    <>
      {/* Premium Header */}
      <header className="flex flex-col md:flex-row justify-between items-center py-6 border-b border-white/10 gap-4">
        {/* Logo and Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-display font-black text-2xl tracking-tight text-white group-hover:text-neonBlue transition-colors duration-200">
            AETHER<span className="text-zinc-400 group-hover:text-neonPurple transition-colors duration-200">NEWS</span>
          </span>
        </Link>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 pr-10 rounded-full bg-zinc-900 border border-white/10 text-sm text-textPrimary placeholder-textMuted focus:outline-none focus:border-neonBlue focus:ring-1 focus:ring-neonBlue transition-all duration-200"
          />
          <svg
            className="absolute left-3.5 top-2.5 w-4 h-4 text-textMuted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-2.5 text-xs text-textMuted hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </header>

      {/* Category Sub-header Navigation Bar */}
      <nav className="flex items-center justify-start overflow-x-auto py-4 border-b border-white/5 scrollbar-none gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setActiveCategory(cat.id);
            }}
            className={`flex items-center text-xs font-semibold px-4 py-2 rounded-full transition-all duration-200 whitespace-nowrap border ${
              activeCategory === cat.id
                ? "bg-white text-zinc-950 border-white"
                : "text-textSecondary border-white/10 hover:border-white/25 hover:text-textPrimary bg-white/5"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </nav>

      {/* Auto-sliding Interactive Hero Banner Carousel */}
      {slidePosts.length > 0 && activeCategory === "all" && searchQuery === "" && (
        <section className="relative w-full h-[380px] md:h-[450px] rounded-3xl overflow-hidden mt-8 border border-white/10 group shadow-2xl">
          {slidePosts.map((post, index) => (
            <div
              key={post.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              {/* Background cover image */}
              <div className="absolute inset-0 bg-zinc-950">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.image_url || post.imageUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80"}
                  alt={post.title}
                  className="w-full h-full object-cover opacity-40 scale-105 transition-transform duration-10000 group-hover:scale-100"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              </div>

              {/* Slide content overlay */}
              <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-16 max-w-2xl z-20">
                <span className="inline-flex items-center text-xs font-bold text-neonBlue uppercase tracking-wider mb-3">
                  <Sparkles className="w-3.5 h-3.5 mr-1" /> Trending &bull; {post.category}
                </span>
                <h1 className="font-display font-extrabold text-2xl md:text-4xl text-textPrimary leading-tight mb-4 group-hover:text-neonBlue transition-colors duration-200">
                  {post.title}
                </h1>
                <p className="text-textSecondary text-sm md:text-base font-light leading-relaxed mb-6 line-clamp-3">
                  {post.seo_description || post.summary || post.content}
                </p>
                <div className="flex gap-4">
                  <Link
                    href={`/post/${post.id}`}
                    className="inline-flex items-center bg-primary-glow text-background font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-neonBlue/10 hover:shadow-neonBlue/30 hover:scale-[1.02] transition-all duration-300"
                  >
                    Read Full Story
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Navigation Controls */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 hover:bg-neonBlue hover:text-background"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 hover:bg-neonBlue hover:text-background"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Slide Indicator Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 z-30">
            {slidePosts.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === currentSlide ? "bg-neonBlue w-6" : "bg-white/30"
                }`}
              />
            ))}
          </div>
        </section>
      )}

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 py-10 flex-grow">
        
        {/* Left Column: Main Post Feed (Col span: 8) */}
        <main className="lg:col-span-8 space-y-12">
          
          <div className="space-y-6">
            <h3 className="font-display font-bold text-lg text-textPrimary flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-neonBlue" />
              Latest Publications
            </h3>
            
            {filteredPosts.length === 0 ? (
              <div className="glass-panel text-center py-20 text-textMuted rounded-3xl flex flex-col items-center justify-center">
                <BookOpen className="w-12 h-12 mb-3 stroke-[1.5]" />
                <p className="font-display text-lg">
                  {searchQuery ? `No articles found matching "${searchQuery}"` : "No articles posted in this category."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {gridPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Right Column: Sidebar (Col span: 4) */}
        <aside className="lg:col-span-4 space-y-8">
          
          {/* Sidebar Section 1: Trending / Top Stories */}
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
                        {post.category} &bull; {formatDate(post.created_at || post.date)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Sidebar Section 2: Premium Newsletter Subscription */}
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
