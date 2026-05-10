"use client";

import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, ExternalLink, Link2, BookOpen, BrainCircuit, Trash2 } from "lucide-react";
import aiService from "@/services/aiService";
import toast from "react-hot-toast";

// Canvas-based — phải dynamic import vì không hỗ trợ SSR
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-500">
      <div className="flex flex-col items-center gap-3 animate-pulse">
        <BrainCircuit size={32} className="text-blue-600" />
        <span className="text-sm font-medium">Đang khởi tạo Engine...</span>
      </div>
    </div>
  ),
});

// ── Relation type styling config ─────────────────────────────────────────────
//  Centralized design tokens for all relation types.
//  Adding a new type? Just add an entry here.

interface RelationStyle {
  color: string;
  label: string;
  labelVi: string;
  dash?: number[];  // undefined = solid line
}

const RELATION_STYLES: Record<string, RelationStyle> = {
  prerequisite: {
    color: "#f59e0b",   // Amber-500
    label: "Prerequisite",
    labelVi: "Tiên quyết",
  },
  extends: {
    color: "#10b981",   // Emerald-500
    label: "Extends",
    labelVi: "Mở rộng",
  },
  related: {
    color: "#3b82f6",   // Blue-500
    label: "Related",
    labelVi: "Liên quan",
    dash: [4, 2],       // dashed for semantic similarity
  },
  parent_child: {
    color: "#8b5cf6",   // Violet-500
    label: "Parent → Child",
    labelVi: "Bao gồm",
  },
};

const DEFAULT_STYLE: RelationStyle = {
  color: "#94a3b8",
  label: "Unknown",
  labelVi: "Khác",
  dash: [2, 2],
};

function getRelationStyle(type: string): RelationStyle {
  return RELATION_STYLES[type] ?? DEFAULT_STYLE;
}

// ── Component ────────────────────────────────────────────────────────────────

interface GraphLink {
  source: number | any;
  target: number | any;
  type: string;
  strength?: number;
  auto_generated?: boolean;
}

interface KnowledgeGraphProps {
  courseId: number;
  initialData?: { nodes: any[]; links: GraphLink[] };
}

function KnowledgeGraph({ courseId, initialData }: KnowledgeGraphProps) {
  const [graphData, setGraphData] = useState(initialData || { nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [hoveredNode, setHoveredNode] = useState<any | null>(null);
  const [hoveredLink, setHoveredLink] = useState<GraphLink | null>(null);
  const [nodeChunks, setNodeChunks] = useState<any[]>([]);
  const [isLoadingChunks, setIsLoadingChunks] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Unique relation types present in graph for legend
  const activeRelationTypes = useMemo(() => {
    const types = new Set(graphData.links.map((l: GraphLink) => l.type));
    return Array.from(types) as string[];
  }, [graphData.links]);

  // Lấy kích thước lần đầu khi mount
  useEffect(() => {
    if (!containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    setDimensions({ width, height });
  }, []);

  // Sync external data changes
  useEffect(() => {
    if (initialData) {
      setGraphData(initialData);
    }
  }, [initialData]);

  const handleNodeClick = useCallback(async (node: any) => {
    setSelectedNode(node);
    setIsLoadingChunks(true);
    setNodeChunks([]);

    setTimeout(() => {
      if (graphRef.current) {
        graphRef.current.centerAt(node.x, node.y, 800);
        graphRef.current.zoom(3.5, 800);
      }
    }, 50);

    try {
      const chunks = await aiService.getNodeChunks(courseId, node.id);
      setNodeChunks(chunks || []);
    } catch (error) {
      console.error("Lỗi khi fetch chunk verifiable", error);
    } finally {
      setIsLoadingChunks(false);
    }
  }, [courseId]);

  const handleClosePanel = () => {
    setSelectedNode(null);
    if (graphRef.current) {
      graphRef.current.zoomToFit(800, 50);
    }
  };

  const handleDeleteNode = async () => {
    if (!selectedNode) return;

    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa node "${selectedNode.name}"? \nHành động này sẽ xóa vĩnh viễn node khỏi cơ sở dữ liệu, biểu đồ kiến thức và các câu hỏi nháp liên quan.`
    );

    if (!confirmed) return;

    try {
      await aiService.deleteKnowledgeNode(courseId, selectedNode.id);
      toast.success("Đã xóa node kiến thức thành công");

      // Update local state to remove the node and its links instantly
      setGraphData(prev => ({
        nodes: prev.nodes.filter(n => n.id !== selectedNode.id),
        links: prev.links.filter(l => {
          const srcId = l.source?.id ?? l.source;
          const tgtId = l.target?.id ?? l.target;
          return srcId !== selectedNode.id && tgtId !== selectedNode.id;
        })
      }));

      setSelectedNode(null);
    } catch (error: any) {
      console.error("Lỗi khi xóa node:", error);
      toast.error(error.response?.data?.message || "Không thể xóa node. Vui lòng thử lại sau.");
    }
  };

  // ── Link helpers ───────────────────────────────────────────────────────────

  const isLinkNeighbor = useCallback((link: any) => {
    if (!selectedNode) return false;
    const srcId = link.source?.id ?? link.source;
    const tgtId = link.target?.id ?? link.target;
    return srcId === selectedNode.id || tgtId === selectedNode.id;
  }, [selectedNode]);

  const getLinkColor = useCallback((link: any): string => {
    const style = getRelationStyle(link.type);
    if (selectedNode) {
      return isLinkNeighbor(link) ? style.color : "rgba(148, 163, 184, 0.15)";
    }
    return style.color;
  }, [selectedNode, isLinkNeighbor]);

  const getLinkWidth = useCallback((link: any): number => {
    const base = link.strength ? 0.5 + link.strength * 2 : 1.5;
    if (selectedNode) {
      return isLinkNeighbor(link) ? base * 1.5 : 0.5;
    }
    if (hoveredLink === link) return base * 2;
    return base;
  }, [selectedNode, hoveredLink, isLinkNeighbor]);

  return (
    <div className="flex h-[80vh] w-full border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans shadow-sm relative">

      {/* ── Area: Graph Canvas ── */}
      <div
        ref={containerRef}
        className={`relative h-full ${selectedNode ? 'w-2/3 border-r border-slate-200 dark:border-slate-800' : 'w-full'}`}
      >
        {/* Badge top-left */}
        <div className="absolute top-4 left-4 z-10 pointer-events-none">
          <Badge variant="outline" className="bg-white/80 dark:bg-slate-900/80 border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400">
            <BrainCircuit size={14} className="mr-2" /> AI Knowledge Network
          </Badge>
        </div>

        {/* Legend bottom-left */}
        {activeRelationTypes.length > 0 && (
          <div className="absolute bottom-4 left-4 z-10 bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 shadow-sm backdrop-blur-sm">
            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Loại liên kết
            </p>
            <div className="flex flex-col gap-1">
              {activeRelationTypes.map(type => {
                const style = getRelationStyle(type);
                return (
                  <div key={type} className="flex items-center gap-2">
                    <svg width="20" height="8" className="flex-shrink-0">
                      <line
                        x1="0" y1="4" x2="16" y2="4"
                        stroke={style.color}
                        strokeWidth="2"
                        strokeDasharray={style.dash?.join(",") ?? "none"}
                      />
                      {/* Arrow head */}
                      <polygon
                        points="14,1 20,4 14,7"
                        fill={style.color}
                      />
                    </svg>
                    <span className="text-[10px] text-slate-600 dark:text-slate-300 font-medium">
                      {style.labelVi}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Hovered link tooltip */}
        {hoveredLink && (
          <div className="absolute top-4 right-4 z-10 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 shadow-md backdrop-blur-sm pointer-events-none">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              {getRelationStyle(hoveredLink.type).labelVi}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Độ mạnh: {((hoveredLink.strength ?? 0) * 100).toFixed(0)}%
              {hoveredLink.auto_generated ? " · AI tự tạo" : " · Thủ công"}
            </p>
          </div>
        )}

        <ForceGraph2D
          ref={graphRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          nodeLabel=""
          nodeRelSize={6}
          backgroundColor="rgba(0,0,0,0)"

          // ── Link styling ──
          linkColor={getLinkColor}
          linkWidth={getLinkWidth}
          linkCurvature={0.15}
          linkLineDash={(link: any) => getRelationStyle(link.type).dash || null}

          // Directional arrows
          linkDirectionalArrowLength={5}
          linkDirectionalArrowRelPos={0.85}
          linkDirectionalArrowColor={getLinkColor}

          // Hạt chạy truyền dữ liệu (chỉ khi không chọn node → tránh visual noise)
          linkDirectionalParticles={(link: any) => {
            if (selectedNode) return isLinkNeighbor(link) ? 2 : 0;
            return 1;
          }}
          linkDirectionalParticleWidth={1.5}
          linkDirectionalParticleSpeed={0.005}
          linkDirectionalParticleColor={getLinkColor}

          onNodeClick={handleNodeClick}
          onBackgroundClick={handleClosePanel}
          onNodeHover={(node) => setHoveredNode(node)}
          onLinkHover={(link) => setHoveredLink(link as GraphLink | null)}

          // ── Node rendering ──
          nodeCanvasObject={(node: any, ctx, globalScale) => {
            const label = node.name || `Node ${node.id}`;
            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px Inter, sans-serif`;

            const isSelected = selectedNode?.id === node.id;
            const isNeighbor = selectedNode && graphData.links.some((l: any) =>
              ((l.source.id ?? l.source) === selectedNode.id && (l.target.id ?? l.target) === node.id) ||
              ((l.target.id ?? l.target) === selectedNode.id && (l.source.id ?? l.source) === node.id)
            );
            const isHovered = hoveredNode?.id === node.id;

            // Node color
            ctx.fillStyle = isSelected ? '#f59e0b'
              : (isHovered ? '#7c3aed'
                : (isNeighbor ? '#2563eb' : '#64748b'));

            ctx.beginPath();
            ctx.arc(node.x, node.y, isSelected ? 6 : (isHovered ? 5.5 : 4), 0, 2 * Math.PI, false);
            ctx.fill();

            // Label (only when selected/neighbor/hovered/zoomed)
            if (isSelected || isNeighbor || isHovered || globalScale > 1.5) {
              ctx.textAlign = 'center';
              ctx.textBaseline = 'top';

              // Stroke for readability
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
              ctx.lineWidth = 2.5 / globalScale;
              ctx.strokeText(label, node.x, node.y + 6);

              ctx.fillStyle = isSelected ? '#d97706' : '#334155';
              ctx.fillText(label, node.x, node.y + 6);
            }
          }}

          // ── Custom link canvas (for dashes + relation label on hover) ──
          linkCanvasObjectMode={() => "after"}
          linkCanvasObject={(link: any, ctx, globalScale) => {
            // Draw relation type label at midpoint when hovered
            if (hoveredLink !== link && !isLinkNeighbor(link)) return;
            if (!selectedNode && hoveredLink !== link) return;

            const src = link.source;
            const tgt = link.target;
            if (!src?.x || !tgt?.x) return;

            const midX = (src.x + tgt.x) / 2;
            const midY = (src.y + tgt.y) / 2;
            const style = getRelationStyle(link.type);

            const labelFontSize = 9 / globalScale;
            ctx.font = `600 ${labelFontSize}px Inter, sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            // Background pill
            const text = style.labelVi;
            const textWidth = ctx.measureText(text).width;
            const padding = 3 / globalScale;

            ctx.fillStyle = "rgba(255,255,255,0.9)";
            const x = midX - textWidth / 2 - padding;
            const y = midY - labelFontSize / 2 - padding;
            const w = textWidth + padding * 2;
            const h = labelFontSize + padding * 2;
            ctx.fillRect(x, y, w, h);

            ctx.fillStyle = style.color;
            ctx.fillText(text, midX, midY);
          }}
        />
      </div>

      {/* ── Area: Verifiability Panel ── */}
      {selectedNode && (
        <div className="w-1/3 min-w-[320px] bg-white dark:bg-slate-900 flex flex-col z-10">

          <div className="flex items-start justify-between p-5 border-b border-slate-100 dark:border-slate-800">
            <div>
              <Badge className="mb-2 bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400 font-medium">
                VERIFIED CONCEPT
              </Badge>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-tight">{selectedNode.name}</h3>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handleDeleteNode}
                title="Xóa node này"
                className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 size={18} />
              </button>
              <button
                onClick={handleClosePanel}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-5 space-y-6">
              {/* Description Section */}
              {selectedNode.description && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Mô tả khái niệm</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{selectedNode.description}</p>
                </div>
              )}

              {/* Connected links summary */}
              {(() => {
                const connectedLinks = graphData.links.filter((l: any) => {
                  const srcId = l.source?.id ?? l.source;
                  const tgtId = l.target?.id ?? l.target;
                  return srcId === selectedNode.id || tgtId === selectedNode.id;
                });
                if (connectedLinks.length === 0) return null;

                return (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Liên kết kiến thức</p>
                    <div className="flex flex-wrap gap-2">
                      {connectedLinks.map((l: any, i: number) => {
                        const style = getRelationStyle(l.type);
                        const srcId = l.source?.id ?? l.source;
                        const tgtId = l.target?.id ?? l.target;
                        const otherId = srcId === selectedNode.id ? tgtId : srcId;
                        const otherNode = graphData.nodes.find((n: any) => n.id === otherId);
                        const isOutgoing = srcId === selectedNode.id;
                        return (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full border font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 cursor-default"
                            style={{ borderColor: style.color + "40", color: style.color, backgroundColor: style.color + "08" }}
                          >
                            {isOutgoing ? "→" : "←"} {otherNode?.name ?? `#${otherId}`}
                            <span className="opacity-60 font-normal">({style.labelVi})</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Ground Truth Section */}
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-sm">
                  <Link2 size={16} className="text-blue-600" /> Dữ liệu gốc trích xuất
                </h4>

                {isLoadingChunks ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <Card key={i} className="border-slate-100 dark:border-slate-800 shadow-none animate-pulse">
                        <CardContent className="p-4">
                          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mb-3"></div>
                          <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-full mb-2"></div>
                          <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : nodeChunks.length > 0 ? (
                  <div className="space-y-3">
                    {nodeChunks.map((chunk, idx) => (
                      <Card key={idx} className="border-slate-200 dark:border-slate-700 shadow-none hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center mb-3">
                            <span className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                              <BrainCircuit size={12} />
                            </span>
                            <button className="text-slate-400 hover:text-blue-600 transition-colors">
                              <ExternalLink size={14} />
                            </button>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic border-l-2 border-slate-300 dark:border-slate-600 pl-3">
                            {chunk.chunk_text}
                          </p>
                          {chunk.source && (
                            <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                              <BookOpen size={12} />
                              <span>Trích từ: {chunk.source}</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
                    <BrainCircuit className="text-slate-300 dark:text-slate-600 mb-2" size={24} />
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Chưa có dữ liệu gốc</p>
                    <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-1 text-center">Khái niệm này có thể được AI tự động nội suy từ ngữ cảnh chung.</p>
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

export default KnowledgeGraph;