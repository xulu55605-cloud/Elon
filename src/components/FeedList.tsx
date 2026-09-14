import React, { useState } from "react";
import { MuskPost } from "../types.js";
import { ExternalLink, Heart, Repeat, Eye, Tag, Sparkles, Filter, MessageSquare, Video, Tv, Music, Radio } from "lucide-react";

interface FeedListProps {
  posts: MuskPost[];
}

export const FeedList: React.FC<FeedListProps> = ({ posts }) => {
  const [selectedFigure, setSelectedFigure] = useState<string>("All");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const categories = ["All", ...Array.from(new Set(posts.map((p) => p.category)))];
  const platforms = [
    "All",
    "微信公众号",
    "微信视频号",
    "B站 (Bilibili)",
    "抖音 (Douyin)",
    "微博 (Weibo)",
    "X (Twitter)"
  ];

  const getPlatformLabel = (platform?: string) => {
    if (!platform) return "社交动态";
    return platform;
  };

  const getPlatformBadge = (platform?: string) => {
    if (!platform) return null;
    if (platform.includes("微信公众号") || platform.includes("公众号")) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <MessageSquare className="w-3 h-3 mr-1 text-emerald-600" />
          微信公众号
        </span>
      );
    }
    if (platform.includes("视频号")) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
          <Video className="w-3 h-3 mr-1 text-amber-600" />
          微信视频号
        </span>
      );
    }
    if (platform.includes("B站") || platform.includes("Bilibili") || platform.includes("哔哩哔哩")) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300">
          <Tv className="w-3 h-3 mr-1 text-sky-600" />
          B站 (Bilibili)
        </span>
      );
    }
    if (platform.includes("抖音") || platform.includes("Douyin")) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-slate-900 text-cyan-300 border border-slate-700">
          <Music className="w-3 h-3 mr-1 text-cyan-400" />
          抖音 (Douyin)
        </span>
      );
    }
    if (platform.includes("微博") || platform.includes("Weibo")) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
          <Radio className="w-3 h-3 mr-1 text-rose-600" />
          微博 (Weibo)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">
        <span className="font-mono mr-1">𝕏</span> X (Twitter)
      </span>
    );
  };

  const filteredPosts = posts.filter((post) => {
    const isLeiJun = (post.figure && post.figure.includes("雷军")) || post.category?.includes("小米");
    const matchesFigure =
      selectedFigure === "All" ||
      (selectedFigure === "musk" && !isLeiJun) ||
      (selectedFigure === "leijun" && isLeiJun);

    const matchesPlatform =
      selectedPlatform === "All" ||
      (post.platform && post.platform.toLowerCase().includes(selectedPlatform.toLowerCase().replace(/ \(.*/, "")));

    const matchesCat = selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch =
      searchTerm.trim() === "" ||
      post.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.translation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.originalText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.figure && post.figure.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (post.platform && post.platform.toLowerCase().includes(searchTerm.toLowerCase())) ||
      post.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesFigure && matchesPlatform && matchesCat && matchesSearch;
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
      case "小米汽车 SU7 / EV":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "小米手机 / 澎湃OS":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "小米生态链 / 战略":
        return "bg-teal-50 text-teal-700 border-teal-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-4">
      {/* Figure Filter & Category Filter Bar */}
      <div className="flex flex-col gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Figure switch tabs */}
          <div className="flex items-center space-x-1.5 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setSelectedFigure("All")}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${
                selectedFigure === "All"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              全部动态 ({posts.length})
            </button>
            <button
              onClick={() => setSelectedFigure("musk")}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-colors flex items-center space-x-1 ${
                selectedFigure === "musk"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>🚀 Elon Musk</span>
              <span className="text-[10px] opacity-75 font-normal">
                ({posts.filter(p => !(p.figure?.includes("雷军") || p.category.includes("小米"))).length})
              </span>
            </button>
            <button
              onClick={() => setSelectedFigure("leijun")}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-colors flex items-center space-x-1 ${
                selectedFigure === "leijun"
                  ? "bg-orange-600 text-white shadow-xs"
                  : "text-orange-700 hover:bg-orange-50"
              }`}
            >
              <span>🇨🇳 雷军 (Lei Jun)</span>
              <span className="text-[10px] opacity-75 font-normal">
                ({posts.filter(p => (p.figure?.includes("雷军") || p.category.includes("小米"))).length})
              </span>
            </button>
          </div>

          {/* Search box */}
          <div className="relative">
            <input
              type="text"
              placeholder="搜索关键词、原帖、标签..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-60 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
            />
          </div>
        </div>

        {/* Categories row */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-slate-100">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 shrink-0" />
          <span className="text-[11px] font-medium text-slate-400 mr-1 shrink-0">行业分类:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-0.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-slate-800 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat === "All" ? "全部行业分类" : cat}
            </button>
          ))}
        </div>

        {/* Social Platforms Row (WeChat Official, Channels, Bilibili, Douyin, Weibo, X) */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-400 mr-1 shrink-0 flex items-center">
            来源平台:
          </span>
          {platforms.map((plat) => {
            const count = plat === "All"
              ? posts.length
              : posts.filter(p => p.platform && p.platform.toLowerCase().includes(plat.toLowerCase().replace(/ \(.*/, ""))).length;
            return (
              <button
                key={plat}
                onClick={() => setSelectedPlatform(plat)}
                className={`px-2.5 py-0.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex items-center space-x-1 ${
                  selectedPlatform === plat
                    ? "bg-sky-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>{plat === "All" ? "全部社交渠道" : plat}</span>
                {count > 0 && (
                  <span className={`text-[10px] px-1 rounded-full ${selectedPlatform === plat ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feed Cards */}
      <div className="grid grid-cols-1 gap-4">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-400 text-sm">
            没有找到匹配的动态内容（可尝试切换来源平台或分类）
          </div>
        ) : (
          filteredPosts.map((post, idx) => {
            const isLeiJun = (post.figure && post.figure.includes("雷军")) || post.category?.includes("小米");
            return (
              <div
                key={post.id || idx}
                className={`bg-white rounded-xl border transition-all shadow-xs hover:shadow-md p-5 ${
                  isLeiJun
                    ? "border-orange-200/80 hover:border-orange-300"
                    : "border-slate-200/90 hover:border-slate-300"
                }`}
              >
                {/* Top metadata */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    {isLeiJun ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-orange-600 text-white">
                        🇨🇳 雷军
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-slate-900 text-white">
                        🚀 Elon Musk
                      </span>
                    )}
                    {getPlatformBadge(post.platform)}
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

                {/* Content / Translation */}
                <div
                  className={`border-l-4 p-3.5 rounded-r-lg mb-3 ${
                    isLeiJun
                      ? "bg-orange-50/50 border-orange-500"
                      : "bg-sky-50/50 border-sky-600"
                  }`}
                >
                  <div
                    className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${
                      isLeiJun ? "text-orange-700" : "text-sky-700"
                    }`}
                  >
                    {isLeiJun ? "核心内容精粹" : "核心内容（中文译文）"}
                  </div>
                  <p className="text-sm text-slate-800 leading-relaxed">
                    {post.translation}
                  </p>
                </div>

                {/* Original Quote */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-xs text-slate-600 italic mb-3 font-serif">
                  <span className="font-semibold text-slate-400 not-italic mr-1.5 font-sans">
                    {isLeiJun ? "雷军 原文/公开讲话:" : "Elon Musk 原文推文:"}
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
                      href={post.sourceUrl || (isLeiJun ? "https://weibo.com/leijun" : "https://x.com/elonmusk")}
                      target="_blank"
                      rel="noreferrer"
                      className={`inline-flex items-center space-x-1 font-medium ml-2 ${
                        isLeiJun ? "text-orange-600 hover:text-orange-700" : "text-sky-600 hover:text-sky-700"
                      }`}
                    >
                      <span>原动态</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
