"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  FlaskConical, 
  ChevronLeft, 
  Code2, 
  Play, 
  Send, 
  Loader2, 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  Terminal,
  Trophy,
  History,
  Activity,
  Cpu,
  Database as DbIcon
} from "lucide-react";
import { labService } from "@/services/labService";
import { getAccessToken } from "@/services/authToken";
import type { Lab, LabSubmission } from "@/types";
import toast from "react-hot-toast";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import MarkdownRenderer from "@/components/markdown/MarkdownRenderer";

export default function LabDetailPage() {
  const params = useParams();
  const labId = Number(params.labId);

  const [lab, setLab] = useState<Lab | null>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [sectionContents, setSectionContents] = useState<Record<number, any[]>>({});
  
  const [loading, setLoading] = useState(true);
  const [loadingContent, setLoadingContent] = useState(false);

  // Coding playground states
  const [selectedLang, setSelectedLang] = useState("python");
  const [code, setCode] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResult, setRunResult] = useState<any | null>(null);
  const [submitResult, setSubmitResult] = useState<any | null>(null);
  const [submissions, setSubmissions] = useState<LabSubmission[]>([]);
  const [activeTab, setActiveTab] = useState<"instructions" | "submissions">("instructions");

  // Virtual terminal workspace states
  const [terminalSessionActive, setTerminalSessionActive] = useState(false);
  const [terminalProvisioning, setTerminalProvisioning] = useState(false);
  const [provisionStep, setProvisionStep] = useState(0);
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    "Welcome to BDC Virtual Lab Terminal Console v1.0.0",
    "Allocated workspace container session: bdc-container-node-01e4a",
    "Type 'help' to see list of available commands.",
    ""
  ]);
  const [commandInput, setCommandInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const wsRef = React.useRef<WebSocket | null>(null);

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const commandSuggestions = [
    "help",
    "ls",
    "ls -la",
    "cat README.md",
    "cat run.sh",
    "cat main.py",
    "whoami",
    "env",
    "./run.sh",
    "clear",
    "exit"
  ];

  // Fetch Lab info, sections, and user submissions
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const labRes = await labService.getLabById(labId);
      setLab(labRes.data);

      // Set starter code if configured in runtimeConfig
      const runtimeConfig = labRes.data.runtimeConfig || {};
      const starterCodeMap = runtimeConfig.starter_code || {};
      const defaultLang = runtimeConfig.supported_languages?.[0] || "python";
      setSelectedLang(labRes.data.labType === "DATABASE" ? "sql" : defaultLang);
      setCode(starterCodeMap[defaultLang] || "");

      const sectionsRes = await labService.getLabSections(labId);
      const sortedSections = (sectionsRes.data || []).sort((a: any, b: any) => (a.orderIndex || 0) - (b.orderIndex || 0));
      setSections(sortedSections);
      
      if (sortedSections.length > 0) {
        setSelectedSectionId(sortedSections[0].id);
      }

      // Load my submissions
      const subRes = await labService.getMySubmissions(labId);
      setSubmissions(subRes.items || []);
    } catch (err) {
      console.error("Failed to load lab workspace data", err);
      toast.error("Error loading lab details.");
    } finally {
      setLoading(false);
    }
  }, [labId]);

  useEffect(() => {
    if (labId) loadData();
  }, [labId, loadData]);

  // Load section content with caching and refetch capabilities
  const loadSectionContent = useCallback(async (secId: number, force = false) => {
    if (!secId) return;
    if (!force && sectionContents[secId]) return; // Cache hit

    setLoadingContent(true);
    try {
      const res = await labService.getSectionContent(secId);
      setSectionContents(prev => ({
        ...prev,
        [secId]: res.data || []
      }));
    } catch (err) {
      console.error("Failed to load section content", err);
      toast.error("Failed to load guidelines. Click tab to retry.");
    } finally {
      setLoadingContent(false);
    }
  }, [sectionContents]);

  // Fetch section contents when selected section changes
  useEffect(() => {
    if (selectedSectionId) {
      loadSectionContent(selectedSectionId);
    }
  }, [selectedSectionId, loadSectionContent]);

  const handleSectionClick = (secId: number) => {
    if (selectedSectionId === secId) {
      loadSectionContent(secId, true);
    } else {
      setSelectedSectionId(secId);
    }
  };

  // Handle changing language and mapping its starter code
  const handleLangChange = (lang: string) => {
    setSelectedLang(lang);
    const starterCodeMap = lab?.runtimeConfig?.starter_code || {};
    setCode(starterCodeMap[lang] || "");
  };

  // Run code against sample tests
  const handleRunCode = async () => {
    if (!code.trim()) {
      toast.error("Please write some code before running.");
      return;
    }
    setIsRunning(true);
    setRunResult(null);
    try {
      const res = await labService.runCode(labId, { language: selectedLang, code });
      setRunResult(res.data);
      toast.success("Execution completed!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || "Failed to execute code.");
    } finally {
      setIsRunning(false);
    }
  };

  // Submit code for grading
  const handleSubmitCode = async () => {
    if (!code.trim()) {
      toast.error("Please write some code before submitting.");
      return;
    }
    setIsSubmitting(true);
    setSubmitResult(null);
    try {
      const res = await labService.submitCode(labId, { language: selectedLang, code });
      setSubmitResult(res.data);
      if (res.data.status === "ACCEPTED") {
        toast.success("Accepted! All test cases passed!");
      } else {
        toast.error(`Solution Status: ${res.data.status}`);
      }
      // Reload submissions list
      const subRes = await labService.getMySubmissions(labId);
      setSubmissions(subRes.items || []);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || "Failed to submit code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Connect to real WebSocket terminal
  const connectWebSocket = async () => {
    try {
      const token = await getAccessToken();
      const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsHost = window.location.host;
      const wsUrl = `${wsProtocol}//${wsHost}/labapiv1/labs/${labId}/session/terminal/ws?token=${encodeURIComponent(token || "")}`;
      
      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setTerminalProvisioning(false);
        setTerminalSessionActive(true);
        setTerminalHistory([
          "*** Connected to sandbox container workspace ***",
          "*** Interactive shell terminal active ***",
          ""
        ]);
        toast.success("Sandbox session started!");
      };

      socket.onmessage = async (event) => {
        let text = "";
        if (event.data instanceof Blob) {
          text = await event.data.text();
        } else {
          text = event.data;
        }

        setTerminalHistory(prev => {
          const lines = text.split(/\r?\n/);
          if (lines.length === 0) return prev;
          const newHistory = [...prev];
          
          if (newHistory.length > 0) {
            newHistory[newHistory.length - 1] += lines[0];
          } else {
            newHistory.push(lines[0]);
          }

          for (let i = 1; i < lines.length; i++) {
            newHistory.push(lines[i]);
          }

          if (newHistory.length > 300) {
            return newHistory.slice(newHistory.length - 300);
          }
          return newHistory;
        });
      };

      socket.onclose = () => {
        setTerminalSessionActive(false);
        setTerminalHistory(prev => [
          ...prev,
          "",
          "*** Terminal session disconnected ***",
          ""
        ]);
        wsRef.current = null;
      };

      socket.onerror = (err) => {
        console.error("WebSocket Terminal Error:", err);
      };
    } catch (err) {
      console.error("Failed to connect websocket terminal:", err);
      setTerminalProvisioning(false);
      toast.error("Failed to connect workspace terminal.");
    }
  };

  // Simulated Terminal Provisioner with backend call
  const startTerminalSession = async () => {
    setTerminalProvisioning(true);
    setProvisionStep(0);
    
    try {
      // Call actual backend start session API
      await labService.startSession(labId);
      
      setProvisionStep(1); // "Spawning container..."
      setTimeout(() => {
        setProvisionStep(2); // "Connecting terminal..."
        setTimeout(() => {
          connectWebSocket();
        }, 800);
      }, 800);
    } catch (err: any) {
      console.error(err);
      setTerminalProvisioning(false);
      toast.error(err.response?.data?.message || err.message || "Failed to start container session.");
    }
  };

  // Terminal commands interpreter
  const runTerminalCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    // Track command history locally for Up/Down arrow keys
    setCommandHistory(prev => {
      if (prev.length > 0 && prev[prev.length - 1] === trimmed) return prev;
      return [...prev, trimmed];
    });
    setHistoryIndex(-1);

    // Send the command directly to the real terminal over WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(trimmed + "\n");
    } else {
      setTerminalHistory(prev => [...prev, `$ ${trimmed}`, "Error: Terminal not connected.", ""]);
    }
    setCommandInput("");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">Loading lab workspace...</p>
        </div>
      </div>
    );
  }

  if (!lab) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-sm">
          <FlaskConical className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-slate-900 dark:text-slate-100 font-bold mb-2">Lab Not Found</h3>
          <Link
            href="/labs"
            className="mt-4 inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-4 py-2.5 active:scale-95 transition-all text-xs"
          >
            <ChevronLeft size={14} /> Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const supportedLanguages = lab.runtimeConfig?.supported_languages || ["python"];
  const isCodingOrDb = lab.labType === "CODING" || lab.labType === "DATABASE";

  return (
    <div className="min-h-screen bg-transparent p-4 lg:p-6" id="lab-workspace">
      <div className="max-w-[1700px] mx-auto space-y-6 flex flex-col h-[calc(100vh-60px)]">
        
        {/* Workspace Nav Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <Link 
              href="/labs"
              className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft size={16} className="text-slate-600 dark:text-slate-400" />
            </Link>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 leading-tight">
                {lab.title}
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                Type: {lab.labType} · Category: {lab.category}
              </p>
            </div>
          </div>
          
          {/* Active Worksite Switchers */}
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            <button
              onClick={() => setActiveTab("instructions")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === "instructions"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-100"
              }`}
            >
              <BookOpen size={13} />
              Instructions
            </button>
            <button
              onClick={() => setActiveTab("submissions")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === "submissions"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-100"
              }`}
            >
              <History size={13} />
              Submissions ({submissions.length})
            </button>
          </div>
        </div>

        {/* Dynamic Split Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 overflow-hidden">
          
          {/* LEFT SIDE PANEL (Instructions / Submissions) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col min-h-0 overflow-hidden">
            
            {activeTab === "instructions" ? (
              <div className="flex flex-col flex-1 min-h-0">
                {/* Sections Sidebar Menu */}
                {sections.length > 0 && (
                  <div className="flex gap-1.5 p-3 overflow-x-auto border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
                    {sections.map((sec) => (
                      <button
                        key={sec.id}
                        onClick={() => handleSectionClick(sec.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                          selectedSectionId === sec.id
                            ? "bg-blue-600 text-white"
                            : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {sec.title}
                      </button>
                    ))}
                  </div>
                )}

                {/* Content Panel */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                  {loadingContent ? (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    </div>
                  ) : selectedSectionId && sectionContents[selectedSectionId]?.length > 0 ? (
                    sectionContents[selectedSectionId].map((content) => (
                      <div key={content.id} className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-350 text-sm leading-relaxed">
                        {content.contentType === "TEXT" && (
                          <MarkdownRenderer content={content.textValue || ""} />
                        )}
                        {content.contentType === "FILE" && (
                          <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900">
                            <span className="font-semibold block">{content.title}</span>
                            <a 
                              href={`/files/${content.fileKey}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-500 hover:underline text-xs mt-1 inline-block"
                            >
                              Download attached file
                            </a>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-450 dark:text-slate-500 text-sm text-center py-20">
                      Select a section step tab above to read instructions.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              // SUBMISSIONS HISTORIES
              <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 flex items-center gap-1.5">
                  <History size={16} /> Submission History
                </h3>
                {submissions.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-20">You haven&apos;t submitted any solutions yet.</p>
                ) : (
                  <div className="space-y-3">
                    {submissions.map((sub) => (
                      <div 
                        key={sub.id} 
                        className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900 flex justify-between items-center"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              sub.status === "ACCEPTED" 
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                            }`}>
                              {sub.status}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">Lang: {sub.language}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">
                            Submitted: {new Date(sub.submittedAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Score: {sub.score}/{sub.maxScore}</p>
                          <p className="text-[10px] text-slate-400 mt-1">Passed: {sub.passedTests}/{sub.totalTests}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT SIDE PANEL (Code Playground / Compiler / Terminal Sandbox) */}
          <div className="lg:col-span-7 bg-slate-900 text-slate-100 border border-slate-800 rounded-2xl flex flex-col min-h-0 overflow-hidden">
            
            {isCodingOrDb ? (
              // ── Option A: Solution Editor (For CODING and DATABASE labs) ──
              <>
                {/* Header Toolbars */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    {lab.labType === "DATABASE" ? (
                      <DbIcon className="text-blue-500 h-4 w-4" />
                    ) : (
                      <Code2 className="text-blue-500 h-4 w-4" />
                    )}
                    <span className="text-xs font-semibold text-slate-300">
                      {lab.labType === "DATABASE" ? "SQL Query Sandbox" : "Solution Editor"}
                    </span>
                  </div>
                  
                  {lab.labType === "DATABASE" ? (
                    <span className="inline-flex px-2.5 py-1 rounded-xl text-xs bg-slate-800 text-slate-400 font-mono border border-slate-700">
                      Language: SQL
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Language:</span>
                      <select
                        value={selectedLang}
                        onChange={(e) => handleLangChange(e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                      >
                        {supportedLanguages.map((lang: string) => (
                          <option key={lang} value={lang}>
                            {lang.charAt(0).toUpperCase() + lang.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Code Input Area */}
                <div className="flex-1 min-h-0 relative">
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-full p-5 bg-slate-950 text-slate-100 font-mono text-sm leading-relaxed 
                               focus:outline-none resize-none no-scrollbar placeholder:text-slate-700"
                    placeholder={lab.labType === "DATABASE" ? "-- Write your SQL query here...\nSELECT * FROM users;" : "// Write your code solution here..."}
                    spellCheck="false"
                  />
                </div>

                {/* Run & Submit Console Toolbars */}
                <div className="flex items-center justify-between px-5 py-3 bg-slate-950 border-t border-slate-800 flex-shrink-0">
                  <div className="flex gap-2">
                    <button
                      onClick={handleRunCode}
                      disabled={isRunning || isSubmitting}
                      className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold
                                 rounded-xl px-4 py-2 text-xs shadow-sm active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isRunning ? <Loader2 size={13} className="animate-spin" /> : <Play size={12} />}
                      Run Tests
                    </button>
                    <button
                      onClick={handleSubmitCode}
                      disabled={isRunning || isSubmitting}
                      className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold
                                 rounded-xl px-4 py-2 text-xs shadow-sm active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={12} />}
                      Submit Solution
                    </button>
                  </div>
                </div>

                {/* Output / Results Area */}
                {(runResult || submitResult || isRunning || isSubmitting) && (
                  <div className="border-t border-slate-800 bg-slate-950 max-h-[220px] overflow-y-auto p-5 space-y-3 flex-shrink-0 no-scrollbar">
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                      <Terminal size={14} className="text-slate-500" />
                      <span className="text-xs font-semibold text-slate-400">Execution Console</span>
                    </div>

                    {isRunning && (
                      <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                        <Loader2 size={14} className="animate-spin text-blue-500" />
                        <span>Running sample test cases...</span>
                      </div>
                    )}

                    {isSubmitting && (
                      <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                        <Loader2 size={14} className="animate-spin text-blue-500" />
                        <span>Submitting solution for auto-grading...</span>
                      </div>
                    )}

                    {/* RUN RESULTS */}
                    {runResult && !isRunning && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-semibold text-slate-400">Run Status:</span>
                          <span className={`font-bold uppercase ${
                            runResult.status === "ACCEPTED" ? "text-emerald-500" : "text-red-500"
                          }`}>
                            {runResult.status}
                          </span>
                        </div>
                        {runResult.compilerOutput && (
                          <pre className="p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-[11px] text-red-400 max-h-[80px] overflow-y-auto">
                            {runResult.compilerOutput}
                          </pre>
                        )}
                        {/* Test results loop */}
                        {runResult.testResults && (
                          <div className="flex flex-wrap gap-2 text-[10px]">
                            {runResult.testResults.map((tr: any, idx: number) => (
                              <div 
                                key={idx}
                                className={`px-2 py-1 rounded flex items-center gap-1 border ${
                                  tr.status === "PASSED"
                                    ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/60"
                                    : "bg-red-950/40 text-red-400 border-red-900/60"
                                }`}
                              >
                                {tr.status === "PASSED" ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                                <span>Test {idx + 1}: {tr.status} ({tr.runtimeMs}ms)</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* SUBMIT RESULTS */}
                    {submitResult && !isSubmitting && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-400">Submission Status:</span>
                            <span className={`font-bold uppercase ${
                              submitResult.status === "ACCEPTED" ? "text-emerald-500" : "text-red-500"
                            }`}>
                              {submitResult.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                            <Trophy size={13} className="text-yellow-500" />
                            <span>Score: {submitResult.score}/{submitResult.maxScore}</span>
                          </div>
                        </div>
                        {submitResult.compilerOutput && (
                          <pre className="p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-[11px] text-red-400 max-h-[80px] overflow-y-auto">
                            {submitResult.compilerOutput}
                          </pre>
                        )}
                        {submitResult.testResults && (
                          <div className="flex flex-wrap gap-2 text-[10px]">
                            {submitResult.testResults.map((tr: any, idx: number) => (
                              <div 
                                key={idx}
                                className={`px-2 py-1 rounded flex items-center gap-1 border ${
                                  tr.status === "PASSED"
                                    ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/60"
                                    : "bg-red-950/40 text-red-400 border-red-900/60"
                                }`}
                              >
                                {tr.status === "PASSED" ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                                <span>Test {idx + 1}: {tr.status} ({tr.runtimeMs}ms)</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              // ── Option B: Sandbox Interactive Terminal (For WORKSPACE and HPC labs) ──
              <>
                {/* Header Toolbars */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <Terminal className="text-blue-500 h-4 w-4" />
                    <span className="text-xs font-semibold text-slate-300">
                      Sandbox Interactive Terminal ({lab.labType})
                    </span>
                  </div>
                  <span className="inline-flex px-2 py-0.5 rounded text-[10px] bg-slate-850 text-slate-400 font-mono border border-slate-800">
                    Status: {terminalSessionActive ? "Connected" : "Idle"}
                  </span>
                </div>

                {/* Main Content Area */}
                {!terminalSessionActive && !terminalProvisioning ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
                    <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 animate-pulse">
                      <Terminal className="w-12 h-12 text-blue-500" />
                    </div>
                    <div className="max-w-md space-y-2">
                      <h3 className="text-lg font-bold text-slate-200">Interactive Environment Sandbox</h3>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        Provision a dedicated container session for this exercise. The container is isolated and secure, pre-configured with the workspace dependencies.
                      </p>
                    </div>

                    {/* Allocation metadata */}
                    <div className="bg-slate-950/40 rounded-2xl border border-slate-800/80 p-4 max-w-sm w-full grid grid-cols-2 gap-4 text-left font-mono text-[10px] text-slate-450">
                      <div>
                        <span className="text-slate-650 block text-[9px] uppercase font-semibold">Compute Backend</span>
                        <span className="text-slate-300 font-bold">{lab.runtimeConfig?.compute_backend || "K8S Pod"}</span>
                      </div>
                      <div>
                        <span className="text-slate-650 block text-[9px] uppercase font-semibold">Docker Image</span>
                        <span className="text-slate-300 font-bold truncate max-w-[120px] block" title={lab.runtimeConfig?.docker_image || "ubuntu:22.04"}>
                          {lab.runtimeConfig?.docker_image || "ubuntu:22.04"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-650 block text-[9px] uppercase font-semibold flex items-center gap-1">
                          <Cpu size={10} /> Allocated CPU
                        </span>
                        <span className="text-slate-300 font-bold">0.5 Cores</span>
                      </div>
                      <div>
                        <span className="text-slate-650 block text-[9px] uppercase font-semibold flex items-center gap-1">
                          <Activity size={10} /> Allocated RAM
                        </span>
                        <span className="text-slate-300 font-bold">512 MB</span>
                      </div>
                    </div>

                    <button
                      onClick={startTerminalSession}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs active:scale-95 transition-all shadow-md flex items-center gap-2"
                    >
                      <Play size={13} fill="white" />
                      Launch Sandbox Session
                    </button>
                  </div>
                ) : null}

                {/* Provisioning state */}
                {terminalProvisioning ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-300">Starting Sandbox Container...</h4>
                      <p className="text-xs text-slate-500 font-mono">
                        {provisionStep === 0 && "Allocating namespace resources..."}
                        {provisionStep === 1 && "Spawning isolated sandbox K8s pod..."}
                        {provisionStep === 2 && "Connecting terminal agent tunnel..."}
                      </p>
                    </div>
                  </div>
                ) : null}

                {/* Terminal Active (Simulated Console) */}
                {terminalSessionActive ? (
                  <div className="flex-1 flex flex-col min-h-0 bg-slate-950 font-mono text-xs text-slate-300 overflow-hidden">
                    {/* Console output display */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-1.5 no-scrollbar">
                      {terminalHistory.map((line, idx) => (
                        <div key={idx} className="min-h-[1.2rem] whitespace-pre-wrap">
                          {line}
                        </div>
                      ))}
                    </div>
                    
                    {/* Console input prompt */}
                    <div className="border-t border-slate-900 bg-slate-950/80 px-5 py-3 flex items-center gap-2 flex-shrink-0">
                      <span className="text-emerald-500 font-semibold flex-shrink-0">$</span>
                      <input
                        type="text"
                        value={commandInput}
                        onChange={(e) => setCommandInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            runTerminalCommand(commandInput);
                          } else if (e.key === "ArrowUp") {
                            e.preventDefault();
                            if (commandHistory.length > 0) {
                              const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
                              setHistoryIndex(newIndex);
                              setCommandInput(commandHistory[newIndex]);
                            }
                          } else if (e.key === "ArrowDown") {
                            e.preventDefault();
                            if (historyIndex !== -1) {
                              if (historyIndex < commandHistory.length - 1) {
                                const newIndex = historyIndex + 1;
                                setHistoryIndex(newIndex);
                                setCommandInput(commandHistory[newIndex]);
                              } else {
                                setHistoryIndex(-1);
                                setCommandInput("");
                              }
                            }
                          } else if (e.key === "Tab") {
                            e.preventDefault();
                            if (commandInput.trim()) {
                              const currentInput = commandInput.trim().toLowerCase();
                              const matches = commandSuggestions.filter(s => s.startsWith(currentInput));
                              if (matches.length === 1) {
                                setCommandInput(matches[0]);
                              } else if (matches.length > 1) {
                                setTerminalHistory(prev => [
                                  ...prev,
                                  `$ ${commandInput}`,
                                  matches.join("    "),
                                  ""
                                ]);
                              }
                            }
                          }
                        }}
                        className="flex-1 bg-transparent text-slate-100 outline-none border-none caret-blue-550"
                        placeholder="Type command (e.g. 'help', 'ls', './run.sh') and press Enter..."
                        autoFocus
                      />
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
