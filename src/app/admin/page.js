"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { ArrowLeft, Trash2, ShieldAlert, CheckCircle, Lock, Layout } from "lucide-react";

// Initialize client-side Supabase instance
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY || "";
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [posts, setPosts] = useState([]);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  // Environment password (uses fallback if not set)
  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin123";

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminPosts();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const fetchAdminPosts = async () => {
    setLoading(true);
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("posts")
          .select("id, title, category, created_at")
          .order("created_at", { ascending: false });
        if (!error && data) {
          setPosts(data);
        } else {
          showMsg(error?.message || "Failed to load database posts.", "error");
        }
      } catch (e) {
        showMsg("Could not connect to Supabase database.", "error");
      }
    } else {
      // Load fallback posts from posts.json (simulated client mock fetch)
      try {
        const response = await fetch("/posts.json");
        if (response.ok) {
          const localData = await response.json();
          setPosts(localData.map(p => ({
            id: p.id,
            title: p.title,
            category: p.category,
            created_at: p.date
          })));
        }
      } catch (e) {
        showMsg("Local database file not accessible.", "error");
      }
    }
    setLoading(false);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      showMsg("Access Granted. Welcome Administrator.", "success");
    } else {
      showMsg("Access Denied. Invalid security password.", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this article?")) return;

    setLoading(true);
    if (supabase) {
      try {
        const { error } = await supabase.from("posts").delete().eq("id", id);
        if (!error) {
          setPosts(posts.filter((p) => p.id !== id));
          showMsg("Article deleted successfully from Supabase.", "success");
        } else {
          showMsg(error.message, "error");
        }
      } catch (e) {
        showMsg("Deletion failed: " + e.message, "error");
      }
    } else {
      // Simulate local database removal
      setPosts(posts.filter((p) => p.id !== id));
      showMsg("Simulated local delete (update posts.json to apply changes permanently).", "success");
    }
    setLoading(false);
  };

  const showMsg = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex-grow flex items-center justify-center py-24">
        <div className="glass-panel w-full max-w-md p-8 rounded-3xl border border-white/10 text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-neonPurple/10 border border-neonPurple/25 flex items-center justify-center text-neonPurple mb-6">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="font-display font-bold text-2xl text-textPrimary mb-2">Admin Portal</h1>
          <p className="text-sm text-textSecondary mb-8">Enter security key to manage site content</p>

          <form onSubmit={handleLogin} className="w-full space-y-4">
            <input
              type="password"
              placeholder="Security Key"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3 rounded-xl bg-zinc-900 border border-white/10 text-textPrimary focus:outline-none focus:border-neonBlue transition-colors duration-200"
              required
            />
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-primary-glow text-background font-bold shadow-lg shadow-neonBlue/10 hover:shadow-neonBlue/30 hover:scale-[1.01] transition-all duration-200"
            >
              Verify Credentials
            </button>
          </form>

          {message.text && (
            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-[#ff5252]">
              <ShieldAlert className="w-3.5 h-3.5" />
              {message.text}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow py-12 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/10">
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-textSecondary hover:text-neonBlue transition-colors duration-200">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Exit Dashboard
        </Link>
        <div className="flex items-center gap-2 font-display font-semibold text-sm text-neonPurple">
          <Layout className="w-4 h-4" />
          Admin Panel
        </div>
      </div>

      {/* Message Banner */}
      {message.text && (
        <div className={`p-4 rounded-xl mb-6 border flex items-center gap-2 text-sm ${
          message.type === "success" 
            ? "bg-green-500/10 border-green-500/20 text-green-400" 
            : "bg-red-500/10 border-red-500/20 text-[#ff4c4c]"
        }`}>
          {message.type === "success" ? <CheckCircle className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      {/* Panel Body */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display font-bold text-xl text-textPrimary">Moderation Panel</h2>
          <span className="text-xs text-textMuted">{posts.length} Posts Detected</span>
        </div>

        {loading && <div className="text-center py-10 text-sm text-textSecondary">Syncing database operations...</div>}

        {!loading && posts.length === 0 ? (
          <div className="text-center py-20 text-textMuted text-sm">No articles active in target tables.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-textMuted uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Published</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-white/[0.02] transition-colors duration-150">
                    <td className="py-3.5 px-4 font-medium text-textPrimary truncate max-w-xs">{post.title}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded border border-white/10 bg-white/5 text-textSecondary">
                        {post.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-textMuted">
                      {new Date(post.created_at || post.date).toLocaleDateString("en-US")}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-2 rounded-lg hover:bg-[#ff5252]/10 text-textSecondary hover:text-[#ff5252] transition-colors duration-200"
                        title="Delete Post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
