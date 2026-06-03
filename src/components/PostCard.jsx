import Link from "next/link";
import { ArrowRight, Sparkles, Code2, Globe } from "lucide-react";

export default function PostCard({ post }) {
  // Category configuration
  const getCategoryStyles = (category) => {
    switch (category.toLowerCase()) {
      case "ai":
        return {
          icon: <Sparkles className="w-3.5 h-3.5 mr-1" />,
          badge: "bg-purple-500/10 text-purple-400 border-purple-500/25",
        };
      case "dev":
        return {
          icon: <Code2 className="w-3.5 h-3.5 mr-1" />,
          badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/25",
        };
      default:
        return {
          icon: <Globe className="w-3.5 h-3.5 mr-1" />,
          badge: "bg-blue-500/10 text-blue-400 border-blue-500/25",
        };
    }
  };

  const { icon, badge } = getCategoryStyles(post.category);

  // Format Date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Link href={`/post/${post.id}`} className="group block h-full">
      <div className="glass-panel rounded-2xl overflow-hidden h-full flex flex-col transition-all duration-300">
        
        {/* Cover Image */}
        <div className="w-full h-48 relative overflow-hidden bg-zinc-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.image_url || post.imageUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60"}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent" />
        </div>

        {/* Card Body */}
        <div className="p-5 flex flex-col flex-grow">
          <div className="flex justify-between items-center mb-3">
            <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${badge}`}>
              {icon}
              {post.category}
            </span>
            <span className="text-xs text-textMuted">
              {formatDate(post.created_at || post.date)}
            </span>
          </div>

          <h3 className="font-display font-semibold text-lg text-textPrimary leading-snug mb-2 line-clamp-2 group-hover:text-neonBlue transition-colors duration-200">
            {post.title}
          </h3>

          <p className="text-sm text-textSecondary leading-relaxed line-clamp-3 mb-5 flex-grow">
            {post.seo_description || post.summary || post.content}
          </p>

          <div className="mt-auto flex items-center text-sm font-semibold text-neonBlue group-hover:text-neonPurple transition-colors duration-200">
            Read Story 
            <ArrowRight className="w-4 h-4 ml-1.5 transition-transform duration-200 group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  );
}
