"use client";

import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from "react";
import dynamic from "next/dynamic";
import {
  AlertCircle, BrainCircuit, ChevronDown,
  Filter, Maximize2, Minimize2, RefreshCw,
  Search, Sliders, X, Link2, BookOpen, ExternalLink
} from "lucide-react";
import aiService, {
  KnowledgeGraphNode,
  KnowledgeGraphResponse,
} from "@/services/aiService";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";

// ── Canvas graph (no SSR) ─────────────────────────────────────────────────────
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-3 animate-pulse">
        <BrainCircuit size={40} className="text-blue-600" />
        <span className="text-sm font-medium text-slate-500">Khởi tạo Engine đồ thị...</span>
      </div>
    </div>
  ),
});

// ── Constants & Helpers ────────────────────────────────────────────────────────
const COURSE_PALETTE = [
  "#6366f1", "#f59e0b", "#10b981", "#ef4444",
  "#8b5cf6", "#06b6d4", "#f97316", "#84cc16",
  "#ec4899", "#14b8a6", "#a855f7", "#eab308",
];

const RELATION_META: Record<string, { color: string; label: string; dash?: number[] }> = {
  prerequisite: { color: "#f59e0b", label: "Tiên quyết" },
  extends: { color: "#10b981", label: "Mở rộng" },
  related: { color: "#3b82f6", label: "Liên quan", dash: [4, 2] },
  parent_child: { color: "#8b5cf6", label: "Bao gồm" },
  PREREQUISITE: { color: "#f59e0b", label: "Tiên quyết" },
  EXTENDS: { color: "#10b981", label: "Mở rộng" },
  RELATED: { color: "#3b82f6", label: "Liên quan", dash: [4, 2] },
};

const DEFAULT_REL = { color: "#94a3b8", label: "Khác", dash: [2, 2] };
const getRelMeta = (type: string) => RELATION_META[type] ?? DEFAULT_REL;

// ── Main Component ────────────────────────────────────────────────────────────
interface Props {
  courseId?: number;
  title?: string;
  global?: boolean;
}

export default function GlobalKnowledgeGraphPanel({
  courseId,
  title = "Mạng lưới Tri thức Toàn cầu",
  global: isGlobal = true,
}: Props) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [raw, setRaw] = useState<KnowledgeGraphResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<Set<number>>(new Set());
  const [minStrength, setMinStrength] = useState(0.3);
  const [showCrossOnly, setShowCrossOnly] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [hoveredNode, setHoveredNode] = useState<any | null>(null);
  const [hoveredLink, setHoveredLink] = useState<any | null>(null);
  const [nodeChunks, setNodeChunks] = useState<any[]>([]);
  const [loadingChunks, setLoadingChunks] = useState(false);

  const graphRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 900, height: 600 });

  // ── Derived Data ───────────────────────────────────────────────────────────
  const courseColorMap = useMemo(() => {
    const ids = Array.from(new Set(raw?.nodes.map(n => n.course_id ?? 0) ?? []));
    const map: Record<number, string> = {};
    ids.forEach((id, i) => { map[id] = COURSE_PALETTE[i % COURSE_PALETTE.length]; });
    return map;
  }, [raw]);

  const graphData = useMemo(() => {
    if (!raw) return { nodes: [], links: [] };
    const nodeSet = new Set(selectedCourses.size > 0
      ? raw.nodes.filter(n => selectedCourses.has(n.course_id ?? 0)).map(n => n.id)
      : raw.nodes.map(n => n.id));

    const sq = search.toLowerCase();
    const filteredNodes = raw.nodes.filter(n => {
      if (!nodeSet.has(n.id)) return false;
      if (sq && !(n.name_vi ?? n.name).toLowerCase().includes(sq)) return false;
      return true;
    });
    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));

    const filteredLinks = raw.edges.filter(e => {
      const sid = typeof e.source === "object" ? (e.source as any).id : e.source;
      const tid = typeof e.target === "object" ? (e.target as any).id : e.target;
      if (!filteredNodeIds.has(sid) || !filteredNodeIds.has(tid)) return false;
      if (e.strength < minStrength) return false;
      if (showCrossOnly && !e.cross_course) return false;
      return true;
    });

    return { nodes: filteredNodes, links: filteredLinks };
  }, [raw, selectedCourses, search, minStrength, showCrossOnly]);

  // ── Effects & Handlers ─────────────────────────────────────────────────────
  const fetchGraph = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = isGlobal
        ? await aiService.getGlobalKnowledgeGraph({ min_strength: 0.1, limit: 1000 })
        : await aiService.getKnowledgeGraph(courseId!);
      setRaw(data);
    } catch (e: any) {
      setError(e?.message ?? "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [isGlobal, courseId]);

  useEffect(() => { fetchGraph(); }, [fetchGraph]);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDims({ width, height });
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const handleNodeClick = useCallback(async (node: any) => {
    setSelectedNode(node);
    setNodeChunks([]);
    if (graphRef.current) {
      graphRef.current.centerAt(node.x, node.y, 800);
      graphRef.current.zoom(3, 800);
    }
    if (node.course_id) {
      setLoadingChunks(true);
      try {
        const chunks = await aiService.getNodeChunks(node.course_id, node.id);
        setNodeChunks(chunks ?? []);
      } catch { /* ignore */ } finally { setLoadingChunks(false); }
    }
  }, []);

  const isLinkNeighbor = useCallback((link: any) => {
    if (!selectedNode) return false;
    const sid = link.source?.id ?? link.source;
    const tid = link.target?.id ?? link.target;
    return sid === selectedNode.id || tid === selectedNode.id;
  }, [selectedNode]);

  // ── Render ─────────────────────────────────────────────────────────────────
  const wrapperCls = cn(
    "flex h-[80vh] w-full border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans shadow-xl relative transition-all duration-300",
    fullscreen ? "fixed inset-4 z-[9999] h-[calc(100vh-32px)]" : "w-full"
  );

    const [linkingGlobal, setLinkingGlobal] = useState(false);
    const [linkMessage, setLinkMessage] = useState("");

    const handleLinkGlobal = async () => {
      if (!confirm("Hệ thống sẽ quét toàn bộ các khóa học để tìm các mối liên kết tiềm năng. Quá trình này chạy ngầm và có thể mất vài phút. Bạn có muốn tiếp tục?")) return;
      
      setLinkingGlobal(true);
      setLinkMessage("");
      try {
        const res = await aiService.linkGlobalKnowledgeGraph();
        setLinkMessage(res.message || "Đã gửi yêu cầu liên kết toàn cục thành công!");
        setTimeout(() => setLinkMessage(""), 5000);
      } catch (e: any) {
        setLinkMessage("Lỗi: " + (e?.message || "Không thể gửi yêu cầu"));
      } finally {
        setLinkingGlobal(false);
      }
    };

    return (
      <div className={wrapperCls}>
  
        {/* Feedback Alert for Link Global */}
        {linkMessage && (
          <div className={cn(
            "absolute top-20 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-lg shadow-2xl border text-sm font-medium animate-in fade-in slide-in-from-top-4 duration-300",
            linkMessage.startsWith("Lỗi") ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"
          )}>
            {linkMessage}
          </div>
        )}

        {/* ── Area: Graph Canvas ── */}
        <div
          ref={containerRef}
          className={cn("relative h-full transition-all duration-500", selectedNode ? "w-2/3 border-r border-slate-200 dark:border-slate-800" : "w-full")}
        >
          {/* Floating Controls */}
          <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2 pointer-events-auto">
              <Badge variant="outline" className="bg-white/90 dark:bg-slate-900/90 border-blue-200 py-1.5 px-3">
                <BrainCircuit size={16} className="mr-2 text-blue-600" />
                <span className="font-bold text-slate-800 dark:text-slate-100">{title}</span>
              </Badge>
              <div className="hidden sm:flex items-center gap-2">
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                  {graphData.nodes.length} nodes
                </Badge>
                {/* Admin-only Button */}
                <button 
                  onClick={handleLinkGlobal}
                  disabled={linkingGlobal}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md"
                  title="Tìm liên kết kiến thức xuyên khóa học"
                >
                  {linkingGlobal ? <RefreshCw size={12} className="animate-spin" /> : <Link2 size={12} />}
                  Link All Nodes
                </button>
              </div>
            </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tìm node..."
                className="pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg w-40 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className={cn("p-2 rounded-lg border transition-colors", showFilters ? "bg-blue-600 border-blue-500 text-white" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500")}>
              <Filter size={16} />
            </button>
            <button onClick={fetchGraph} className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-600">
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
            <button onClick={() => setFullscreen(!fullscreen)} className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500">
              {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
        </div>

        {/* Filters Panel Overlay */}
        {showFilters && (
          <div className="absolute top-16 right-4 z-30 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-2xl backdrop-blur-md w-72 animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Độ mạnh liên kết (≥ {minStrength})</label>
                <input type="range" min="0" max="1" step="0.05" value={minStrength} onChange={e => setMinStrength(parseFloat(e.target.value))} className="w-full accent-blue-600" />
              </div>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div onClick={() => setShowCrossOnly(!showCrossOnly)} className={cn("w-10 h-5 rounded-full relative transition-colors", showCrossOnly ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700")}>
                  <div className={cn("absolute top-1 w-3 h-3 rounded-full bg-white transition-all", showCrossOnly ? "left-6" : "left-1")} />
                </div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Chỉ hiện liên kết liên khóa</span>
              </label>
            </div>
          </div>
        )}

        <ForceGraph2D
          ref={graphRef}
          width={selectedNode ? dims.width * 0.66 : dims.width}
          height={dims.height}
          graphData={graphData}
          backgroundColor="rgba(0,0,0,0)"
          d3AlphaDecay={0.03}
          d3VelocityDecay={0.4}
          // ── Node Rendering ──
          nodeCanvasObject={(node: any, ctx, globalScale) => {
            const color = courseColorMap[node.course_id ?? 0] ?? "#64748b";
            const isSelected = selectedNode?.id === node.id;
            const isNeighbor = selectedNode && graphData.links.some((l: any) => {
              const sid = l.source.id ?? l.source;
              const tid = l.target.id ?? l.target;
              return (sid === selectedNode.id && tid === node.id) || (tid === selectedNode.id && sid === node.id);
            });
            const isHovered = hoveredNode?.id === node.id;

            ctx.fillStyle = isSelected ? '#f59e0b' : (isHovered ? '#3b82f6' : (isNeighbor ? color : color + 'cc'));
            ctx.shadowColor = isSelected ? '#f59e0b' : 'transparent';
            ctx.shadowBlur = isSelected ? 15 : 0;

            ctx.beginPath();
            ctx.arc(node.x, node.y, isSelected ? 8 : (isHovered ? 6.5 : 5), 0, 2 * Math.PI, false);
            ctx.fill();
            ctx.shadowBlur = 0;

            if (isSelected || isNeighbor || isHovered || globalScale > 1.8) {
              const label = node.name_vi ?? node.name;
              const fontSize = 12 / globalScale;
              ctx.font = `${isSelected ? '600' : '400'} ${fontSize}px Inter, sans-serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'top';
              ctx.strokeStyle = 'rgba(255,255,255,0.8)';
              ctx.lineWidth = 3 / globalScale;
              ctx.strokeText(label, node.x, node.y + (isSelected ? 10 : 7));
              ctx.fillStyle = isSelected ? '#d97706' : (dark ? '#cbd5e1' : '#334155');
              ctx.fillText(label, node.x, node.y + (isSelected ? 10 : 7));
            }
          }}
          // ── Link Rendering ──
          linkColor={(link: any) => {
            const m = getRelMeta(link.type);
            return selectedNode ? (isLinkNeighbor(link) ? m.color : "rgba(148, 163, 184, 0.08)") : m.color;
          }}
          linkWidth={(link: any) => (isLinkNeighbor(link) ? 2.5 : 1) * (link.strength || 1)}
          linkDirectionalArrowLength={4}
          linkDirectionalArrowRelPos={0.9}
          linkCurvature={0.1}
          linkDirectionalParticles={link => isLinkNeighbor(link) ? 3 : 0}
          linkDirectionalParticleWidth={2}
          onNodeClick={handleNodeClick}
          onNodeHover={node => setHoveredNode(node)}
          onLinkHover={link => setHoveredLink(link)}
          onBackgroundClick={() => { setSelectedNode(null); graphRef.current?.zoomToFit(800, 50); }}
        />
      </div>

      {/* ── Area: Sidebar Panel ── */}
      {selectedNode && (
        <div className="w-1/3 min-w-[380px] bg-white dark:bg-slate-900 flex flex-col z-10 animate-in slide-in-from-right duration-500 shadow-2xl">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-start justify-between mb-4">
              <Badge className="bg-blue-50 text-blue-600 dark:bg-blue-900/30 border-blue-100 font-bold px-3 py-1">
                CHI TIẾT KIẾN THỨC
              </Badge>
              <button onClick={() => setSelectedNode(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
              {selectedNode.name_vi ?? selectedNode.name}
            </h3>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: courseColorMap[selectedNode.course_id ?? 0] }} />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Khóa học #{selectedNode.course_id}</span>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6 space-y-8">
              {selectedNode.description && (
                <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-inner">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Mô tả định nghĩa</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">{selectedNode.description}</p>
                </div>
              )}

              <div className="space-y-4">
                <h4 className="text-sm font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                  <Link2 size={18} className="text-blue-600" /> Dữ liệu gốc trích xuất
                </h4>
                {loadingChunks ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl" />)}
                  </div>
                ) : nodeChunks.length > 0 ? (
                  <div className="space-y-4">
                    {nodeChunks.map((chunk, idx) => (
                      <Card key={idx} className="border-slate-200 dark:border-slate-800 shadow-none hover:border-blue-400 dark:hover:border-blue-700 transition-all rounded-2xl overflow-hidden group">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] font-mono bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-md">
                              CHUNK #{chunk.chunk_index || idx}
                            </span>
                            <ExternalLink size={14} className="text-slate-300 group-hover:text-blue-500" />
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-l-3 border-blue-500/30 pl-4 py-1">
                            {chunk.chunk_text}
                          </p>
                          {chunk.source_type && (
                            <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                              <BookOpen size={12} />
                              <span>Nguồn: {chunk.source_type.toUpperCase()}</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
                    <BrainCircuit size={32} className="text-slate-200 dark:text-slate-700 mb-2" />
                    <p className="text-sm text-slate-400 font-medium">Không tìm thấy chunk gốc</p>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

// Giả lập biến dark cho việc render màu text label
const dark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;