"use client";

import React, {
  useEffect, useState, useRef, useCallback, useMemo,
} from "react";
import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  X, ExternalLink, Link2, BookOpen, BrainCircuit, Trash2,
  GitMerge, Plus, Pencil, CheckCircle2, Loader2,
} from "lucide-react";
import aiService from "@/services/ai/aiService";
import toast from "react-hot-toast";

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

// ── Relation type config ──────────────────────────────────────────────────────

interface RelationStyle { color: string; label: string; labelVi: string; dash?: number[] }

const RELATION_STYLES: Record<string, RelationStyle> = {
  prerequisite:   { color: "#f59e0b", label: "Prerequisite",   labelVi: "Tiên quyết" },
  extends:        { color: "#10b981", label: "Extends",         labelVi: "Mở rộng" },
  related:        { color: "#3b82f6", label: "Related",         labelVi: "Liên quan",   dash: [4, 2] },
  equivalent:     { color: "#06b6d4", label: "Equivalent",      labelVi: "Tương đương" },
  contrasts_with: { color: "#ef4444", label: "Contrasts with",  labelVi: "Đối chiếu",   dash: [2, 1] },
  parent_child:   { color: "#8b5cf6", label: "Parent -> Child", labelVi: "Bao gồm" },
};
const VALID_RELATION_TYPES = ["prerequisite", "extends", "related", "equivalent", "contrasts_with"] as const;
const DEFAULT_STYLE: RelationStyle = { color: "#94a3b8", label: "Unknown", labelVi: "Khác", dash: [2, 2] };
const getRelStyle = (t: string) => RELATION_STYLES[t?.toLowerCase()] ?? DEFAULT_STYLE;

// ── Types ────────────────────────────────────────────────────────────────────

interface GraphLink { source: number | any; target: number | any; type: string; strength?: number; auto_generated?: boolean }
interface KnowledgeGraphProps { courseId: number; initialData?: { nodes: any[]; links: GraphLink[] } }
type LinkJobState = "idle" | "queued" | "done" | "error";
interface EdgeModal {
  mode: "create" | "edit";
  sourceNodeId: number; targetNodeId: number;
  sourceNodeName: string; targetNodeName: string;
  relationType: string; strength: number; bidirectional: boolean;
  existingType?: string;
}

// ── Component ────────────────────────────────────────────────────────────────

function KnowledgeGraph({ courseId, initialData }: KnowledgeGraphProps) {
  const [graphData, setGraphData] = useState(initialData || { nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [hoveredNode, setHoveredNode] = useState<any>(null);
  const [hoveredLink, setHoveredLink] = useState<GraphLink | null>(null);
  const [nodeChunks, setNodeChunks] = useState<any[]>([]);
  const [isLoadingChunks, setIsLoadingChunks] = useState(false);
  const [linkJob, setLinkJob] = useState<LinkJobState>("idle");
  const [linkJobNewEdges, setLinkJobNewEdges] = useState<number | null>(null);
  const [connectMode, setConnectMode] = useState(false);
  const [connectSrc, setConnectSrc] = useState<any>(null);
  const [edgeModal, setEdgeModal] = useState<EdgeModal | null>(null);
  const [edgeSubmitting, setEdgeSubmitting] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCount = useRef(0);
  const [dims, setDims] = useState({ width: 800, height: 600 });

  const activeTypes = useMemo(() => [...new Set(graphData.links.map((l: GraphLink) => l.type))] as string[], [graphData.links]);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver((entries) => {
      if (!entries[0]) return;
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        setDims({ width, height });
      }
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);
  useEffect(() => { if (initialData) setGraphData(initialData); }, [initialData]);
  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  // ── Polling logic for Link Isolated Job ──────────────────────────────────────

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const startPolling = useCallback((prevCount: number) => {
    stopPolling();
    pollCount.current = 0;
    pollRef.current = setInterval(async () => {
      pollCount.current++;
      if (pollCount.current > 24) {
        stopPolling();
        setLinkJob("idle");
        toast("Chưa nhận kết quả. Hãy tải lại đồ thị.", { icon: "⏱️" });
        return;
      }
      try {
        // Query job status from backend
        const jobInfo = await aiService.getLinkIsolatedStatus(courseId);
        if (jobInfo.status === "completed" || jobInfo.status === "failed") {
          stopPolling();
          const latest = await aiService.getKnowledgeGraph(courseId);
          const newLinks = latest.edges.map((e: any) => ({
            source: e.source, target: e.target, type: e.relation_type,
            strength: e.strength, auto_generated: e.auto_generated,
          }));
          const added = Math.max(0, newLinks.length - prevCount);
          setLinkJobNewEdges(added);
          setLinkJob("done");
          setGraphData({ nodes: latest.nodes.map((n: any) => ({ ...n })), links: newLinks });
          if (added > 0) {
            toast.success(`Kết nối thành công - thêm ${added} liên kết mới!`);
          } else {
            toast.success("Đã hoàn tất kiểm tra các node cô lập!");
          }
          return;
        }

        // Also check if graph edges count increased in the meantime
        const latest = await aiService.getKnowledgeGraph(courseId);
        if (latest.edges.length > prevCount) {
          stopPolling();
          const added = latest.edges.length - prevCount;
          setLinkJobNewEdges(added);
          setLinkJob("done");
          const newLinks = latest.edges.map((e: any) => ({
            source: e.source, target: e.target, type: e.relation_type,
            strength: e.strength, auto_generated: e.auto_generated,
          }));
          setGraphData({ nodes: latest.nodes.map((n: any) => ({ ...n })), links: newLinks });
          toast.success(`Kết nối thành công - thêm ${added} liên kết mới!`);
        }
      } catch { /* retry on next tick */ }
    }, 5000);
  }, [courseId, stopPolling]);

  // Check active job status on mount so returning users don't double click
  useEffect(() => {
    aiService.getLinkIsolatedStatus(courseId).then((st) => {
      if (st && (st.status === "queued" || st.status === "processing")) {
        setLinkJob("queued");
        startPolling(graphData.links.length);
      }
    }).catch(() => {});
  }, [courseId, startPolling, graphData.links.length]);

  // ── Link Isolated trigger ─────────────────────────────────────────────────────

  const handleLinkIsolated = useCallback(async () => {
    if (linkJob === "queued") return;
    try {
      setLinkJob("queued"); setLinkJobNewEdges(null);
      const res = await aiService.linkIsolatedNodes(courseId);
      if (res.status === "queued" || res.status === "processing") {
        toast.success("Hệ thống đang quét và kết nối các node cô lập...", { duration: 4000 });
        startPolling(graphData.links.length);
      } else {
        toast(res.message || "Tác vụ đang được thực hiện.", { icon: "ℹ️" });
      }
    } catch { setLinkJob("error"); toast.error("Không thể kích hoạt Link Graph."); }
  }, [courseId, graphData.links.length, linkJob, startPolling]);

  // ── Node click ───────────────────────────────────────────────────────────────

  const handleNodeClick = useCallback(async (node: any) => {
    if (connectMode) {
      if (connectSrc && connectSrc.id !== node.id) {
        setEdgeModal({ mode: "create", sourceNodeId: connectSrc.id, targetNodeId: node.id,
          sourceNodeName: connectSrc.name, targetNodeName: node.name,
          relationType: "related", strength: 0.85, bidirectional: false });
        setConnectMode(false); setConnectSrc(null);
      } else {
        setConnectSrc(node);
        toast(`Node A: "${node.name}". Bấm Node B để nối.`, { icon: "🔗" });
      }
      return;
    }
    setSelectedNode(node); setIsLoadingChunks(true); setNodeChunks([]);
    setTimeout(() => { if (graphRef.current) { graphRef.current.centerAt(node.x, node.y, 800); graphRef.current.zoom(3.5, 800); } }, 50);
    try { setNodeChunks((await aiService.getNodeChunks(courseId, node.id)) || []); }
    catch { } finally { setIsLoadingChunks(false); }
  }, [connectMode, connectSrc, courseId]);

  const handleDeleteNode = async () => {
    if (!selectedNode || !confirm(`Xóa node "${selectedNode.name}"?`)) return;
    try {
      await aiService.deleteKnowledgeNode(courseId, selectedNode.id);
      toast.success("Đã xóa node");
      setGraphData(p => ({
        nodes: p.nodes.filter((n: any) => n.id !== selectedNode.id),
        links: p.links.filter((l: any) => (l.source?.id ?? l.source) !== selectedNode.id && (l.target?.id ?? l.target) !== selectedNode.id),
      }));
      setSelectedNode(null);
    } catch (e: any) { toast.error(e.response?.data?.message || "Không thể xóa node."); }
  };

  const handleDeleteAllNodes = async () => {
    if (isDeletingAll || graphData.nodes.length === 0) return;
    const confirmed = confirm(
      `Xóa toàn bộ ${graphData.nodes.length} node của khóa học?\n\n` +
      "Tất cả bài giảng sẽ trở về trạng thái chưa index và cần index lại."
    );
    if (!confirmed) return;

    setIsDeletingAll(true);
    try {
      const result = await aiService.deleteAllKnowledgeNodes(courseId);
      stopPolling();
      setGraphData({ nodes: [], links: [] });
      setSelectedNode(null);
      setHoveredNode(null);
      setHoveredLink(null);
      setNodeChunks([]);
      setLinkJob("idle");
      toast.success(`Đã xóa toàn bộ node. ${result.contents_reset ?? 0} bài giảng đã chuyển về chưa index.`);
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Không thể xóa toàn bộ node.");
    } finally {
      setIsDeletingAll(false);
    }
  };

  const handleLinkClick = useCallback((link: any) => {
    if (connectMode) return;
    const srcId = link.source?.id ?? link.source, tgtId = link.target?.id ?? link.target;
    const srcNode = graphData.nodes.find((n: any) => n.id === srcId);
    const tgtNode = graphData.nodes.find((n: any) => n.id === tgtId);
    setEdgeModal({ mode: "edit", sourceNodeId: srcId, targetNodeId: tgtId,
      sourceNodeName: srcNode?.name ?? `#${srcId}`, targetNodeName: tgtNode?.name ?? `#${tgtId}`,
      relationType: link.type ?? "related", strength: link.strength ?? 0.85,
      bidirectional: false, existingType: link.type });
  }, [connectMode, graphData.nodes]);

  const handleEdgeSubmit = async () => {
    if (!edgeModal) return;
    setEdgeSubmitting(true);
    try {
      if (edgeModal.mode === "edit" && edgeModal.existingType && edgeModal.existingType !== edgeModal.relationType) {
        await aiService.deleteGraphEdge(courseId, {
          source_node_id: edgeModal.sourceNodeId, target_node_id: edgeModal.targetNodeId,
          relation_type: edgeModal.existingType,
        });
      }
      await aiService.upsertGraphEdge(courseId, {
        source_node_id: edgeModal.sourceNodeId, target_node_id: edgeModal.targetNodeId,
        relation_type: edgeModal.relationType, strength: edgeModal.strength,
        bidirectional: edgeModal.bidirectional,
      });
      setGraphData(prev => {
        const { sourceNodeId: si, targetNodeId: ti, relationType: rt, existingType: et, mode, bidirectional, strength } = edgeModal;
        let links = prev.links.filter((l: any) => {
          if (mode !== "edit" || !et) return true;
          return !((l.source?.id ?? l.source) === si && (l.target?.id ?? l.target) === ti && l.type === et);
        });
        const mk = (s: number, t: number) => ({ source: s, target: t, type: rt, strength, auto_generated: false });
        const ei = links.findIndex((l: any) => (l.source?.id ?? l.source) === si && (l.target?.id ?? l.target) === ti && l.type === rt);
        if (ei >= 0) links[ei] = mk(si, ti); else links = [...links, mk(si, ti)];
        if (bidirectional) {
          const ri = links.findIndex((l: any) => (l.source?.id ?? l.source) === ti && (l.target?.id ?? l.target) === si && l.type === rt);
          if (ri >= 0) links[ri] = mk(ti, si); else links = [...links, mk(ti, si)];
        }
        return { ...prev, links };
      });
      toast.success(edgeModal.mode === "create" ? "Đã tạo liên kết" : "Đã cập nhật liên kết");
      setEdgeModal(null);
    } catch (e: any) { toast.error(e.response?.data?.message || "Không thể lưu liên kết."); }
    finally { setEdgeSubmitting(false); }
  };

  const handleEdgeDelete = async () => {
    if (!edgeModal || !confirm("Xóa liên kết này?")) return;
    setEdgeSubmitting(true);
    try {
      await aiService.deleteGraphEdge(courseId, { source_node_id: edgeModal.sourceNodeId, target_node_id: edgeModal.targetNodeId, relation_type: edgeModal.relationType });
      setGraphData(p => ({ ...p, links: p.links.filter((l: any) => !((l.source?.id ?? l.source) === edgeModal.sourceNodeId && (l.target?.id ?? l.target) === edgeModal.targetNodeId && l.type === edgeModal.relationType)) }));
      toast.success("Đã xóa liên kết"); setEdgeModal(null);
    } catch { toast.error("Không thể xóa liên kết."); }
    finally { setEdgeSubmitting(false); }
  };

  const isNeighbor = useCallback((l: any) => {
    if (!selectedNode) return false;
    return (l.source?.id ?? l.source) === selectedNode.id || (l.target?.id ?? l.target) === selectedNode.id;
  }, [selectedNode]);

  const getLinkColor = useCallback((l: any) => {
    const c = getRelStyle(l.type).color;
    return selectedNode ? (isNeighbor(l) ? c : "rgba(148,163,184,0.15)") : c;
  }, [selectedNode, isNeighbor]);

  const getLinkWidth = useCallback((l: any) => {
    const base = l.strength ? 0.5 + l.strength * 2 : 1.5;
    return selectedNode ? (isNeighbor(l) ? base * 1.5 : 0.5) : (hoveredLink === l ? base * 2 : base);
  }, [selectedNode, hoveredLink, isNeighbor]);

  return (
    <div className="flex flex-col h-[82vh] w-full gap-0 font-sans">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border border-b-0 border-slate-200 dark:border-slate-800 rounded-t-xl bg-white dark:bg-slate-950">
        <button id="btn-link-isolated" onClick={handleLinkIsolated} disabled={linkJob === "queued"}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${linkJob === "queued" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"}`}>
          {linkJob === "queued" ? <><Loader2 size={14} className="animate-spin" /> Đang xử lý...</>
           : linkJob === "done" ? <><CheckCircle2 size={14} /> Link Graph {linkJobNewEdges != null ? `(+${linkJobNewEdges})` : ""}</>
           : <><GitMerge size={14} /> Link Graph</>}
        </button>
        <button id="btn-connect-mode" onClick={() => { setConnectMode(v => !v); setConnectSrc(null); }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${connectMode ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400 text-emerald-700 dark:text-emerald-400" : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
          <Plus size={14} />
          {connectMode ? (connectSrc ? "Chọn đích..." : "Chọn Node A") : "Thêm liên kết"}
        </button>
        <button id="btn-delete-all-nodes" onClick={handleDeleteAllNodes}
          disabled={isDeletingAll || graphData.nodes.length === 0}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-40 disabled:cursor-not-allowed">
          {isDeletingAll ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          {isDeletingAll ? "Đang xóa..." : "Xóa tất cả node"}
        </button>
        <div className="ml-auto text-[11px] text-slate-400">
          {graphData.nodes.length} nodes · {graphData.links.length} edges
          {connectMode && <span className="ml-2 text-emerald-500 font-medium animate-pulse"> Bấm 2 node để nối</span>}
        </div>
      </div>

      {/* Graph + panel */}
      <div className="flex flex-1 min-h-0 border border-slate-200 dark:border-slate-800 rounded-b-xl overflow-hidden bg-slate-50 dark:bg-slate-950 shadow-sm relative">
        <div ref={containerRef} className={`relative h-full overflow-hidden z-0 transition-all duration-300 ${selectedNode ? "w-2/3 border-r border-slate-200 dark:border-slate-800" : "w-full"}`}>
          <div className="absolute top-4 left-4 z-10 pointer-events-none">
            <Badge variant="outline" className="bg-white/80 dark:bg-slate-900/80 border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400">
              <BrainCircuit size={14} className="mr-2" /> AI Knowledge Network
            </Badge>
          </div>
          {activeTypes.length > 0 && (
            <div className="absolute bottom-4 left-4 z-10 bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 shadow-sm backdrop-blur-sm">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Loại liên kết</p>
              <div className="flex flex-col gap-1">
                {activeTypes.map(t => {
                  const s = getRelStyle(t);
                  return (
                    <div key={t} className="flex items-center gap-2">
                      <svg width="20" height="8"><line x1="0" y1="4" x2="16" y2="4" stroke={s.color} strokeWidth="2" strokeDasharray={s.dash?.join(",") ?? "none"} /><polygon points="14,1 20,4 14,7" fill={s.color} /></svg>
                      <span className="text-[10px] text-slate-600 dark:text-slate-300 font-medium">{s.labelVi}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {hoveredLink && (
            <div className="absolute top-4 right-4 z-10 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 shadow-md backdrop-blur-sm pointer-events-none">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{getRelStyle(hoveredLink.type).labelVi}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Độ mạnh: {((hoveredLink.strength ?? 0) * 100).toFixed(0)}% · {hoveredLink.auto_generated ? "AI tự tạo" : "Thủ công"}</p>
              <p className="text-[9px] text-slate-400 italic mt-0.5">Bấm cạnh để chỉnh sửa</p>
            </div>
          )}
          <ForceGraph2D
            ref={graphRef} width={dims.width} height={dims.height} graphData={graphData}
            nodeId="id" linkSource="source" linkTarget="target"
            linkColor={getLinkColor} linkWidth={getLinkWidth} linkCurvature={0.1}
            linkDirectionalArrowLength={5} linkDirectionalArrowRelPos={0.85} linkDirectionalArrowColor={getLinkColor}
            linkDirectionalParticles={(l: any) => selectedNode ? (isNeighbor(l) ? 2 : 0) : 1}
            linkDirectionalParticleWidth={1.5} linkDirectionalParticleSpeed={0.005} linkDirectionalParticleColor={getLinkColor}
            onNodeClick={handleNodeClick} onLinkClick={handleLinkClick}
            onBackgroundClick={() => { setSelectedNode(null); if (graphRef.current) graphRef.current.zoomToFit(800, 50); }}
            onNodeHover={n => setHoveredNode(n)} onLinkHover={l => setHoveredLink(l as any)}
            nodeCanvasObject={(node: any, ctx, gs) => {
              const label = node.name || `#${node.id}`;
              const fs = 12 / gs;
              ctx.font = `${fs}px Inter, sans-serif`;
              const isSel = selectedNode?.id === node.id;
              const isSrc = connectSrc?.id === node.id;
              const isNbr = selectedNode && graphData.links.some((l: any) =>
                ((l.source?.id ?? l.source) === selectedNode.id && (l.target?.id ?? l.target) === node.id) ||
                ((l.target?.id ?? l.target) === selectedNode.id && (l.source?.id ?? l.source) === node.id));
              const isHov = hoveredNode?.id === node.id;
              ctx.fillStyle = isSrc ? "#10b981" : isSel ? "#f59e0b" : isHov ? "#7c3aed" : isNbr ? "#2563eb" : "#64748b";
              ctx.beginPath(); ctx.arc(node.x, node.y, isSel ? 6 : isHov ? 5.5 : 4, 0, 2 * Math.PI); ctx.fill();
              if (isSrc) { ctx.strokeStyle = "#10b981"; ctx.lineWidth = 1.5 / gs; ctx.beginPath(); ctx.arc(node.x, node.y, 9, 0, 2 * Math.PI); ctx.stroke(); }
              if (isSel || isNbr || isHov || gs > 1.5) {
                ctx.textAlign = "center"; ctx.textBaseline = "top";
                ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.lineWidth = 2.5 / gs; ctx.strokeText(label, node.x, node.y + 6);
                ctx.fillStyle = isSel ? "#d97706" : "#334155"; ctx.fillText(label, node.x, node.y + 6);
              }
            }}
            linkCanvasObjectMode={() => "after"}
            linkCanvasObject={(link: any, ctx, gs) => {
              if (hoveredLink !== link && !isNeighbor(link)) return;
              if (!selectedNode && hoveredLink !== link) return;
              const { source: s, target: t } = link;
              if (!s?.x || !t?.x) return;
              const mx = (s.x + t.x) / 2, my = (s.y + t.y) / 2;
              const style = getRelStyle(link.type), lfs = 9 / gs;
              ctx.font = `600 ${lfs}px Inter, sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
              const tw = ctx.measureText(style.labelVi).width, p = 3 / gs;
              ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.fillRect(mx - tw / 2 - p, my - lfs / 2 - p, tw + p * 2, lfs + p * 2);
              ctx.fillStyle = style.color; ctx.fillText(style.labelVi, mx, my);
            }}
          />
        </div>

        {/* Side panel */}
        {selectedNode && (
          <div className="w-1/3 min-w-[320px] bg-white dark:bg-slate-900 flex flex-col relative z-30 shadow-2xl overflow-hidden border-l border-slate-200 dark:border-slate-800">
            <div className="flex items-start justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <Badge className="mb-2 bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400 font-medium">VERIFIED CONCEPT</Badge>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-tight">{selectedNode.name}</h3>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={handleDeleteNode} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 size={18} /></button>
                <button onClick={() => { setSelectedNode(null); if (graphRef.current) graphRef.current.zoomToFit(800, 50); }} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><X size={18} /></button>
              </div>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-5 space-y-6">
                {selectedNode.description && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Mô tả khái niệm</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{selectedNode.description}</p>
                  </div>
                )}
                {(() => {
                  const cl = graphData.links.filter((l: any) => (l.source?.id ?? l.source) === selectedNode.id || (l.target?.id ?? l.target) === selectedNode.id);
                  if (!cl.length) return <div className="p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-center text-xs text-slate-400">Node này chưa có liên kết nào.</div>;
                  return (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Liên kết kiến thức</p>
                      <div className="flex flex-wrap gap-2">
                        {cl.map((l: any, i: number) => {
                          const style = getRelStyle(l.type);
                          const si = l.source?.id ?? l.source, ti = l.target?.id ?? l.target;
                          const oid = si === selectedNode.id ? ti : si;
                          const on = graphData.nodes.find((n: any) => n.id === oid);
                          return (
                            <button key={i} onClick={() => handleLinkClick(l)}
                              className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full border font-medium transition-opacity hover:opacity-80"
                              style={{ borderColor: style.color + "40", color: style.color, backgroundColor: style.color + "08" }}>
                              {si === selectedNode.id ? "→" : "←"} {on?.name ?? `#${oid}`}
                              <span className="opacity-60">({style.labelVi})</span>
                              <Pencil size={9} className="opacity-50" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-sm"><Link2 size={16} className="text-blue-600" /> Dữ liệu gốc trích xuất</h4>
                  {isLoadingChunks ? (
                    <div className="space-y-3">{[1,2].map(i => <Card key={i} className="shadow-none animate-pulse"><CardContent className="p-4"><div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mb-3" /><div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-full mb-2" /><div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-5/6" /></CardContent></Card>)}</div>
                  ) : nodeChunks.length ? (
                    <div className="space-y-3">{nodeChunks.map((c, i) => (
                      <Card key={i} className="border-slate-200 dark:border-slate-700 shadow-none hover:border-blue-300 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex justify-between mb-3"><span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded"><BrainCircuit size={12} /></span><button className="text-slate-400 hover:text-blue-600"><ExternalLink size={14} /></button></div>
                          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic border-l-2 border-slate-300 pl-3">{c.chunk_text}</p>
                          {c.source && <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400"><BookOpen size={12} /><span>Trích từ: {c.source}</span></div>}
                        </CardContent>
                      </Card>
                    ))}</div>
                  ) : (
                    <div className="flex flex-col items-center p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50">
                      <BrainCircuit className="text-slate-300 mb-2" size={24} />
                      <p className="text-slate-500 text-sm font-medium">Chưa có dữ liệu gốc</p>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Edge Modal */}
      {edgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">{edgeModal.mode === "create" ? "Tạo liên kết mới" : "Chỉnh sửa liên kết"}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{edgeModal.sourceNodeName} → {edgeModal.targetNodeName}</p>
              </div>
              <button onClick={() => setEdgeModal(null)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"><X size={18} /></button>
            </div>
            <div className="px-6 py-5 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Loại quan hệ</label>
                <div className="grid grid-cols-2 gap-2">
                  {VALID_RELATION_TYPES.map(rt => {
                    const style = getRelStyle(rt), active = edgeModal.relationType === rt;
                    return (
                      <button key={rt} onClick={() => setEdgeModal(e => e ? { ...e, relationType: rt } : e)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${active ? "shadow-sm" : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300"}`}
                        style={active ? { backgroundColor: style.color + "18", borderColor: style.color + "60", color: style.color } : {}}>
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: style.color }} />{style.labelVi}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Độ mạnh: <span className="text-blue-600">{(edgeModal.strength * 100).toFixed(0)}%</span></label>
                <input type="range" min={0.5} max={1.0} step={0.05} value={edgeModal.strength} onChange={e => setEdgeModal(em => em ? { ...em, strength: parseFloat(e.target.value) } : em)} className="w-full accent-blue-600" />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1"><span>50%</span><span>100%</span></div>
              </div>
              {edgeModal.mode === "create" && (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={edgeModal.bidirectional} onChange={e => setEdgeModal(em => em ? { ...em, bidirectional: e.target.checked } : em)} className="w-4 h-4 rounded accent-blue-600" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Hai chiều (tạo cả chiều ngược lại)</span>
                </label>
              )}
            </div>
            <div className="flex items-center gap-2 px-6 pb-5">
              {edgeModal.mode === "edit" && (
                <button onClick={handleEdgeDelete} disabled={edgeSubmitting} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 dark:border-red-800 transition-colors mr-auto">
                  <Trash2 size={14} /> Xóa liên kết
                </button>
              )}
              <button onClick={() => setEdgeModal(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors ml-auto">Hủy</button>
              <button onClick={handleEdgeSubmit} disabled={edgeSubmitting} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 shadow-sm">
                {edgeSubmitting && <Loader2 size={14} className="animate-spin" />}
                {edgeModal.mode === "create" ? "Tạo liên kết" : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default KnowledgeGraph;
