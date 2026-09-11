import React, { useState } from "react";
import { MuskPost } from "../types.js";
import { ExternalLink, Heart, Repeat, Eye, Tag, Sparkles, Filter } from "lucide-react";

interface FeedListProps {
  posts: MuskPost[];
}

export const FeedList: React.FC<FeedListProps> = ({ posts }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const categories = ["All", ...Array.from(new Set(posts.map((p) => p.category)))];

  const filteredPosts = posts.filter((post) => {
    const matchesCat = selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch =
      searchTerm.trim() === "" ||
      post.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.translation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.originalText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const getImpactBadge = (level: string) => {
    switch (level) {
      case "High":
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
            高价值动态
          </span>
        );
      case "Medium":
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-700 border border-amber-200">
            中等关注
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
            一般观察
          </span>
        );
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "SpaceX / Starship":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Tesla / Robotaxi":
        return "bg-red-50 text-red-700 border-red-200";
      case "xAI / Grok":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "X (Twitter)":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Tech & AI":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <Filter className="w-4 h-4 text-slate-400 mr-1 shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat === "All" ? "全部领域" : cat}
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="搜索关键词或标签..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-56 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
          />
        </div>
      </div>

      {/* Feed Cards */}
      <div className="grid grid-cols-1 gap-4">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-400 text-sm">
            没有找到匹配的动态内容
          </div>
        ) : (
          filteredPosts.map((post, idx) => (
            <div
              key={post.id || idx}
              className="bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 transition-all shadow-xs hover:shadow-md p-5"
            >
              {/* Top metadata */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${getCategoryBadgeClass(
                      post.category
                    )}`}
                  >
                    {post.category}
                  </span>
                  {getImpactBadge(post.impactLevel)}
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {post.timestamp}
                </div>
              </div>

              {/* Title / Topic */}
              <h3 className="text-base font-bold text-slate-900 mb-3 leading-snug">
                {post.topic}
              </h3>

              {/* Chinese Translation */}
              <div className="bg-sky-50/50 border-l-4 border-sky-600 p-3.5 rounded-r-lg mb-3">
                <div className="text-[11px] font-bold text-sky-700 uppercase tracking-wider mb-1">
                  核心内容（中文译文）
                </div>
                <p className="text-sm text-slate-800 leading-relaxed">
                  {post.translation}
                </p>
              </div>

              {/* Original Quote */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-xs text-slate-600 italic mb-3 font-serif">
                <span className="font-semibold text-slate-400 not-italic mr-1.5 font-sans">
                  Elon Musk 英文原文:
                </span>
                "{post.originalText}"
              </div>

              {/* Industry/Business Takeaway */}
              {post.summary && (
                <div className="text-xs text-slate-600 leading-relaxed mb-4 flex items-start">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 mr-1.5 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-slate-800">深度透视: </strong>
                    {post.summary}
                  </div>
                </div>
              )}

              {/* Bottom footer: stats, tags, source */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                <div className="flex items-center space-x-3 text-slate-400">
                  <span className="flex items-center">
                    <Heart className="w-3.5 h-3.5 mr-1 text-rose-400" />
                    {post.engagement?.likes || "高赞"}
                  </span>
                  <span className="flex items-center">
                    <Repeat className="w-3.5 h-3.5 mr-1 text-sky-400" />
                    {post.engagement?.retweets || "高频转"}
                  </span>
                  <span className="flex items-center">
                    <Eye className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                    {post.engagement?.views || "千万级"}
                  </span>
                </div>

                <div className="flex items-center space-x-2 flex-wrap">
                  {post.tags?.map((t, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[11px]"
                    >
                      <Tag className="w-2.5 h-2.5 mr-0.5 text-slate-400" />
                      {t}
                    </span>
                  ))}

                  <a
                    href={post.sourceUrl || "https://x.com/elonmusk"}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 text-sky-600 hover:text-sky-700 font-medium ml-2"
                  >
                    <span>原帖</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
