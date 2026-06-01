"use client";

import React, { useEffect, useState } from "react";
import { 
  ArrowLeft, 
  FlaskConical, 
  Loader2, 
  Save, 
  Plus, 
  Trash2, 
  Settings, 
  BookOpen, 
  CheckSquare, 
  PlusCircle, 
  Eye, 
  AlertCircle,
  HelpCircle,
  FileText,
  Edit2,
  Cpu
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { labService } from "@/services/labService";
import type { Lab, LabLevel, LabType } from "@/types";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import MarkdownRenderer from "@/components/markdown/MarkdownRenderer";


export default function LabEditPage() {
  const { user, isAdmin, isManager } = useAuth();
  const router = useRouter();
  const params = useParams();
  const labId = parseInt(params.labId as string) || 0;
  
  const isAuthorized = isAdmin || isManager || user?.role === "ROLE_TEACHER";

  const [activeTab, setActiveTab] = useState<"general" | "sections" | "testcases" | "sandbox">("general");
  const [lab, setLab] = useState<Lab | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingGeneral, setSavingGeneral] = useState(false);

  // Tab 1: General Details Form State
  const [generalForm, setGeneralForm] = useState({
    title: "",
    description: "",
    category: "",
    level: "BEGINNER" as LabLevel,
    maxSessionDurationMin: 120,
    maxConcurrentSessions: 50,
  });

  // Tab 2: Sections State
  const [sections, setSections] = useState<any[]>([]);
  const [loadingSections, setLoadingSections] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [addingSection, setAddingSection] = useState(false);

  // Inside Section Add Content state
  const [addingContentMap, setAddingContentMap] = useState<Record<number, boolean>>({});
  const [contentForms, setContentForms] = useState<Record<number, { title: string; description: string; type: string }>>({});

  // Tab 3: Test Cases State
  const [testCases, setTestCases] = useState<any[]>([]);
  const [loadingTestCases, setLoadingTestCases] = useState(false);
  const [addingTestCase, setAddingTestCase] = useState(false);
  const [newTestCase, setNewTestCase] = useState({
    name: "",
    weight: 10,
    isSample: false,
    isHidden: true,
    input: "",
    expected: "",
    explanation: ""
  });

  // Editing States
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState("");
  const [editingContentId, setEditingContentId] = useState<number | null>(null);
  const [editingTestCaseId, setEditingTestCaseId] = useState<number | null>(null);

  // Sandbox Form State
  const [savingSandbox, setSavingSandbox] = useState(false);
  const [sandboxForm, setSandboxForm] = useState({
    computeBackend: "K8S",
    dockerImage: "ubuntu:22.04",
    cpuCores: 0.5,
    memoryMb: 512,
    startupScript: "",
    allowedPorts: [] as number[],
    portsInput: "",
    supportedLanguages: [] as string[],
    starterCode: {} as Record<string, string>,
    dbType: "POSTGRESQL",
    schemaSql: "",
    seedSql: ""
  });

  const fetchLabDetails = async () => {
    try {
      setLoading(true);
      const res = await labService.getLabById(labId);
      if (res.data) {
        setLab(res.data);
        setGeneralForm({
          title: res.data.title,
          description: res.data.description || "",
          category: res.data.category || "",
          level: res.data.level || "BEGINNER",
          maxSessionDurationMin: res.data.maxSessionDurationMin || 120,
          maxConcurrentSessions: res.data.maxConcurrentSessions || 50,
        });

        const runtime = res.data.runtimeConfig || {};
        setSandboxForm({
          computeBackend: runtime.compute_backend || "K8S",
          dockerImage: runtime.docker_image || "ubuntu:22.04",
          cpuCores: runtime.cpu_cores || 0.5,
          memoryMb: runtime.memory_mb || 512,
          startupScript: runtime.startup_script || "",
          allowedPorts: runtime.allowed_ports || [],
          portsInput: (runtime.allowed_ports || []).join(", "),
          supportedLanguages: runtime.supported_languages || [],
          starterCode: runtime.starter_code || {},
          dbType: runtime.db_type || "POSTGRESQL",
          schemaSql: runtime.schema_sql || "",
          seedSql: runtime.seed_sql || ""
        });
      }
    } catch (err) {
      toast.error("Failed to load virtual lab details.");
      router.push("/labs/manage");
    } finally {
      setLoading(false);
    }
  };

  const handleSandboxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lab) return;
    try {
      setSavingSandbox(true);
      
      const parsedPorts = sandboxForm.portsInput
        .split(",")
        .map(p => parseInt(p.trim()))
        .filter(p => !isNaN(p));

      const updatedConfig = {
        ...lab.runtimeConfig,
        compute_backend: sandboxForm.computeBackend,
        docker_image: sandboxForm.dockerImage,
        cpu_cores: parseFloat(sandboxForm.cpuCores.toString()) || 0.5,
        memory_mb: parseInt(sandboxForm.memoryMb.toString()) || 512,
        startup_script: sandboxForm.startupScript,
        allowed_ports: parsedPorts,
        supported_languages: sandboxForm.supportedLanguages,
        starter_code: sandboxForm.starterCode,
        db_type: sandboxForm.dbType,
        schema_sql: sandboxForm.schemaSql,
        seed_sql: sandboxForm.seedSql
      };

      await labService.updateLab(labId, {
        title: generalForm.title,
        description: generalForm.description,
        category: generalForm.category,
        level: generalForm.level,
        maxSessionDurationMin: generalForm.maxSessionDurationMin,
        maxConcurrentSessions: generalForm.maxConcurrentSessions,
        runtimeConfig: updatedConfig
      });
      
      toast.success("Sandbox & Runtime configuration updated!");
      fetchLabDetails();
    } catch (err) {
      toast.error("Failed to update sandbox configurations.");
    } finally {
      setSavingSandbox(false);
    }
  };

  const fetchSectionsAndContent = async () => {
    if (!labId) return;
    try {
      setLoadingSections(true);
      const sectionRes = await labService.getLabSections(labId);
      const sectionList = sectionRes.data || [];
      
      // Fetch contents for each section
      const sectionsWithContent = await Promise.all(
        sectionList.map(async (sec: any) => {
          try {
            const contentRes = await labService.getSectionContent(sec.id);
            return { ...sec, content: contentRes.data || [] };
          } catch {
            return { ...sec, content: [] };
          }
        })
      );
      
      // Sort sections by order_index
      sectionsWithContent.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
      setSections(sectionsWithContent);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load sections.");
    } finally {
      setLoadingSections(false);
    }
  };

  const fetchTestCasesList = async () => {
    if (!labId || (lab?.labType !== "CODING" && lab?.labType !== "DATABASE")) return;
    try {
      setLoadingTestCases(true);
      const res = await labService.getTestCases(labId);
      // Go backend returns SuccessResponse with .data as test cases array
      setTestCases(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load grading test cases.");
    } finally {
      setLoadingTestCases(false);
    }
  };

  useEffect(() => {
    if (isAuthorized && labId) {
      fetchLabDetails();
    }
  }, [user, isAuthorized, labId]);

  useEffect(() => {
    if (activeTab === "sections") {
      fetchSectionsAndContent();
    } else if (activeTab === "testcases") {
      fetchTestCasesList();
    }
  }, [activeTab]);

  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lab) return;
    try {
      setSavingGeneral(true);
      await labService.updateLab(labId, {
        title: generalForm.title,
        description: generalForm.description,
        category: generalForm.category,
        level: generalForm.level,
        maxSessionDurationMin: generalForm.maxSessionDurationMin,
        maxConcurrentSessions: generalForm.maxConcurrentSessions,
      });
      toast.success("General configurations updated!");
      fetchLabDetails();
    } catch (err) {
      toast.error("Failed to update general configurations.");
    } finally {
      setSavingGeneral(false);
    }
  };

  // Section CRUD Functions
  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionTitle.trim()) return;
    try {
      setAddingSection(true);
      await labService.createSection(labId, {
        title: newSectionTitle,
        orderIndex: sections.length
      });
      toast.success("Section added successfully!");
      setNewSectionTitle("");
      fetchSectionsAndContent();
    } catch (err) {
      toast.error("Failed to add section.");
    } finally {
      setAddingSection(false);
    }
  };

  const handleDeleteSection = async (secId: number) => {
    if (!confirm("Are you sure you want to delete this section and all its contents?")) return;
    try {
      await labService.deleteSection(secId);
      toast.success("Section deleted successfully!");
      fetchSectionsAndContent();
    } catch (err) {
      toast.error("Failed to delete section.");
    }
  };

  const handleUpdateSectionTitle = async (secId: number) => {
    if (!editingSectionTitle.trim()) return;
    try {
      await labService.updateSection(secId, { title: editingSectionTitle });
      toast.success("Section updated successfully!");
      setEditingSectionId(null);
      fetchSectionsAndContent();
    } catch (err) {
      toast.error("Failed to update section.");
    }
  };


  // Section Content creation / update
  const handleSaveContent = async (secId: number) => {
    const form = contentForms[secId];
    if (!form || !form.title.trim()) {
      toast.error("Please provide a step title.");
      return;
    }

    try {
      if (editingContentId) {
        await labService.updateContent(editingContentId, {
          title: form.title,
          description: form.description
        });
        toast.success("Step instruction updated successfully!");
      } else {
        await labService.createContent(secId, {
          type: form.type,
          title: form.title,
          description: form.description,
          orderIndex: sections.find(s => s.id === secId)?.content?.length || 0,
          isMandatory: true,
          metadata: {}
        });
        toast.success("Step instruction added successfully!");
      }

      // Reset form
      setContentForms(prev => ({
        ...prev,
        [secId]: { title: "", description: "", type: "TEXT" }
      }));
      setAddingContentMap(prev => ({ ...prev, [secId]: false }));
      setEditingContentId(null);
      fetchSectionsAndContent();
    } catch (err) {
      toast.error("Failed to save step instruction.");
    }
  };

  const handleDeleteContent = async (itemId: number) => {
    if (!confirm("Are you sure you want to delete this step instruction?")) return;
    try {
      await labService.deleteContent(itemId);
      toast.success("Step instruction deleted!");
      fetchSectionsAndContent();
    } catch (err) {
      toast.error("Failed to delete step instruction.");
    }
  };


  // Test Case creation / update
  const handleSaveTestCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestCase.name.trim()) return;
    try {
      setAddingTestCase(true);
      if (editingTestCaseId) {
        await labService.updateTestCase(editingTestCaseId, {
          name: newTestCase.name,
          weight: newTestCase.weight,
          isSample: newTestCase.isSample,
          isHidden: newTestCase.isHidden,
          input: newTestCase.input,
          expected: newTestCase.expected,
          explanation: newTestCase.explanation
        });
        toast.success("Test case updated successfully!");
      } else {
        await labService.createTestCase(labId, {
          name: newTestCase.name,
          weight: newTestCase.weight,
          is_sample: newTestCase.isSample,
          is_hidden: newTestCase.isHidden,
          input: newTestCase.input,
          expected: newTestCase.expected,
          explanation: newTestCase.explanation
        });
        toast.success("Test case added successfully!");
      }
      setEditingTestCaseId(null);
      setNewTestCase({
        name: "",
        weight: 10,
        isSample: false,
        isHidden: true,
        input: "",
        expected: "",
        explanation: ""
      });
      fetchTestCasesList();
    } catch (err) {
      toast.error("Failed to save test case.");
    } finally {
      setAddingTestCase(false);
    }
  };


  const handleDeleteTestCase = async (id: number) => {
    if (!confirm("Are you sure you want to delete this test case?")) return;
    try {
      await labService.deleteTestCase(id);
      toast.success("Test case deleted!");
      fetchTestCasesList();
    } catch (err) {
      toast.error("Failed to delete test case.");
    }
  };

  // Guard Clause for unauthorized roles
  if (user && !isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] px-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl max-w-md w-full text-center shadow-lg space-y-6">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">Access Denied</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 leading-relaxed">
              Only teachers, managers, and administrators have permission to access the Lab Management Panel.
            </p>
          </div>
          <Link
            href="/labs"
            className="inline-flex items-center justify-center w-full gap-2 px-5 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-2xl active:scale-95 transition-all shadow-md"
          >
            <ArrowLeft size={16} />
            Back to Virtual Lab
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-3" />
        <p className="text-slate-500 dark:text-slate-400 text-sm">Loading virtual lab configurations...</p>
      </div>
    );
  }

  if (!lab) return null;

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6 lg:p-8" id="lab-editor-dashboard">
      <div className="max-w-[1100px] mx-auto space-y-8">
        
        {/* Navigation Breadcrumb & Header */}
        <div className="flex flex-col gap-4">
          <Link
            href="/labs/manage"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-fit"
          >
            <ArrowLeft size={12} />
            Back to Dashboard
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 p-3 rounded-2xl shadow-md text-white">
                <FlaskConical className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 leading-tight">
                  Editor: {lab.title}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                  Type: <span className="font-semibold text-slate-700 dark:text-slate-350">{lab.labType}</span> | Status: <span className="font-semibold text-slate-700 dark:text-slate-350">{lab.status}</span>
                </p>
              </div>
            </div>

            <Link
              href={`/labs/${lab.id}`}
              className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300
                         bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800
                         rounded-xl px-4 py-2.5 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-850 active:scale-95 transition-all duration-200"
            >
              <Eye size={15} />
              Preview Lab Catalog
            </Link>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
          <button
            onClick={() => setActiveTab("general")}
            className={`pb-3.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "general"
                ? "border-blue-600 text-blue-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-850 hover:border-slate-300 dark:hover:text-slate-300"
            }`}
          >
            <Settings size={16} />
            General Config
          </button>
          
          <button
            onClick={() => setActiveTab("sections")}
            className={`pb-3.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "sections"
                ? "border-blue-600 text-blue-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-850 hover:border-slate-300 dark:hover:text-slate-300"
            }`}
          >
            <BookOpen size={16} />
            Sections & Content ({sections.length})
          </button>

          {(lab.labType === "CODING" || lab.labType === "DATABASE") && (
            <button
              onClick={() => setActiveTab("testcases")}
              className={`pb-3.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === "testcases"
                  ? "border-blue-600 text-blue-600 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-850 hover:border-slate-300 dark:hover:text-slate-300"
              }`}
            >
              <CheckSquare size={16} />
              Grading Test Cases ({testCases.length})
            </button>
          )}

          <button
            onClick={() => setActiveTab("sandbox")}
            className={`pb-3.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "sandbox"
                ? "border-blue-600 text-blue-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-850 hover:border-slate-300 dark:hover:text-slate-300"
            }`}
          >
            <Cpu size={16} />
            Sandbox & Runtime
          </button>
        </div>

        {/* Tab 1: General Details */}
        {activeTab === "general" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 sm:p-8">
            <form onSubmit={handleGeneralSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Lab Title</label>
                <input
                  type="text"
                  required
                  value={generalForm.title}
                  onChange={(e) => setGeneralForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl
                             bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100
                             focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900
                             transition-all text-sm outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  rows={4}
                  value={generalForm.description}
                  onChange={(e) => setGeneralForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl
                             bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100
                             focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900
                             transition-all text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Category</label>
                  <input
                    type="text"
                    value={generalForm.category}
                    onChange={(e) => setGeneralForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl
                               bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100
                               focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900
                               transition-all text-sm outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Difficulty Level</label>
                  <select
                    value={generalForm.level}
                    onChange={(e) => setGeneralForm(prev => ({ ...prev, level: e.target.value as LabLevel }))}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl
                               bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100
                               focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900
                               transition-all text-sm outline-none cursor-pointer"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                    <option value="ALL_LEVELS">All Levels</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Max Session Duration (Minutes)</label>
                  <input
                    type="number"
                    value={generalForm.maxSessionDurationMin}
                    onChange={(e) => setGeneralForm(prev => ({ ...prev, maxSessionDurationMin: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl
                               bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100
                               focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900
                               transition-all text-sm outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Max Concurrent Capacity (Containers)</label>
                  <input
                    type="number"
                    value={generalForm.maxConcurrentSessions}
                    onChange={(e) => setGeneralForm(prev => ({ ...prev, maxConcurrentSessions: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl
                               bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100
                               focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900
                               transition-all text-sm outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  disabled={savingGeneral}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow active:scale-95 transition-all disabled:opacity-50"
                >
                  {savingGeneral ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={15} />}
                  Save Configurations
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Sections & Content */}
        {activeTab === "sections" && (
          <div className="space-y-6">
            {/* Create Section Input */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6">
              <form onSubmit={handleAddSection} className="flex gap-4">
                <input
                  type="text"
                  placeholder="Create new learning slide section (e.g. 1. Introduction, 2. Challenge Instructions)"
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl
                             bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100
                             placeholder:text-slate-400 dark:placeholder:text-slate-500
                             focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900
                             transition-all text-sm outline-none"
                />
                <button
                  type="submit"
                  disabled={addingSection || !newSectionTitle.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-850 dark:bg-slate-50 dark:hover:bg-slate-150 dark:text-slate-900 rounded-xl shadow active:scale-95 transition-all disabled:opacity-50"
                >
                  {addingSection ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus size={15} />}
                  Add Section
                </button>
              </form>
            </div>

            {/* List of Sections */}
            {loadingSections ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : sections.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400 text-sm">No sections created yet. Add a section above to create task instructions.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {sections.map((sec, index) => {
                  const showAddContent = addingContentMap[sec.id] || false;
                  const form = contentForms[sec.id] || { title: "", description: "", type: "TEXT" };
                  
                  return (
                    <div 
                      key={sec.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden"
                    >
                      {/* Section Header */}
                      <div className="bg-slate-50 dark:bg-slate-800/40 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        {editingSectionId === sec.id ? (
                          <div className="flex items-center gap-3 flex-1 mr-4">
                            <span className="w-6 h-6 bg-slate-200 dark:bg-slate-800 text-slate-650 dark:text-slate-350 rounded-lg flex items-center justify-center text-xs font-bold font-mono">
                              {index + 1}
                            </span>
                            <input
                              type="text"
                              value={editingSectionTitle}
                              onChange={(e) => setEditingSectionTitle(e.target.value)}
                              className="flex-1 px-3 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                              autoFocus
                            />
                            <button
                              onClick={() => handleUpdateSectionTitle(sec.id)}
                              className="px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded shadow transition-all active:scale-95"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingSectionId(null)}
                              className="px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-700 rounded transition-all active:scale-95"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 bg-slate-200 dark:bg-slate-800 text-slate-650 dark:text-slate-350 rounded-lg flex items-center justify-center text-xs font-bold font-mono">
                              {index + 1}
                            </span>
                            <span className="text-sm font-bold text-slate-900 dark:text-slate-50">
                              {sec.title}
                            </span>
                            <button
                              onClick={() => {
                                setEditingSectionId(sec.id);
                                setEditingSectionTitle(sec.title);
                              }}
                              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                              title="Edit Section Name"
                            >
                              <Edit2 size={12} />
                            </button>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setAddingContentMap(prev => ({ ...prev, [sec.id]: !showAddContent }));
                              setEditingContentId(null);
                              if (!contentForms[sec.id]) {
                                setContentForms(prev => ({
                                  ...prev,
                                  [sec.id]: { title: "", description: "", type: "TEXT" }
                                }));
                              }
                            }}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-950/40 rounded-lg px-2.5 py-1.5 transition-all active:scale-95"
                          >
                            Add Step Instruction
                          </button>
                          <button
                            onClick={() => handleDeleteSection(sec.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-all active:scale-90"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Section Body */}
                      <div className="p-6 space-y-4">
                        {/* Section Content items */}
                        {(!sec.content || sec.content.length === 0) && !showAddContent ? (
                          <p className="text-xs text-slate-400 dark:text-slate-500 italic">No instructional pages in this section yet.</p>
                        ) : (
                          <div className="space-y-3">
                            {sec.content?.map((item: any, stepIdx: number) => (
                              <div 
                                key={item.id}
                                className="flex items-start justify-between border border-slate-100 dark:border-slate-800 p-4 rounded-xl hover:bg-slate-50/20 dark:hover:bg-slate-800/10 transition-colors"
                              >
                                <div className="space-y-1 flex-1 mr-4">
                                  <div className="flex items-center gap-2">
                                    <FileText size={12} className="text-slate-400" />
                                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                      Step {stepIdx + 1}: {item.title}
                                    </span>
                                    <span className="inline-flex px-1.5 py-0.5 text-[9px] rounded font-mono bg-slate-100 dark:bg-slate-800 text-slate-500">
                                      {item.type}
                                    </span>
                                  </div>
                                  {item.type === "TEXT" ? (
                                    <div className="pl-4.5 max-w-2xl text-xs mt-1 text-slate-700 dark:text-slate-300">
                                      <MarkdownRenderer content={item.description || ""} variant="chat" />
                                    </div>
                                  ) : (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 pl-4.5 max-w-2xl whitespace-pre-wrap leading-relaxed">
                                      {item.description}
                                    </p>
                                  )}
                                </div>

                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => {
                                      setEditingContentId(item.id);
                                      setContentForms(prev => ({
                                        ...prev,
                                        [sec.id]: {
                                          title: item.title,
                                          description: item.description || "",
                                          type: item.type
                                        }
                                      }));
                                      setAddingContentMap(prev => ({ ...prev, [sec.id]: true }));
                                    }}
                                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-blue-950/40 rounded-lg transition-all active:scale-90"
                                    title="Edit Step"
                                  >
                                    <Edit2 size={13} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteContent(item.id)}
                                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-all active:scale-90"
                                    title="Delete Step"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Inline Form to Add Content */}
                        {showAddContent && (
                          <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-dashed border-slate-350 dark:border-slate-800 space-y-4 mt-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500">Step Title</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Instructions & Guidelines"
                                  value={form.title}
                                  onChange={(e) => setContentForms(prev => ({
                                    ...prev,
                                    [sec.id]: { ...form, title: e.target.value }
                                  }))}
                                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-xs outline-none focus:border-blue-500"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500">Content Type</label>
                                <select
                                  value={form.type}
                                  onChange={(e) => setContentForms(prev => ({
                                    ...prev,
                                    [sec.id]: { ...form, type: e.target.value }
                                  }))}
                                  disabled={!!editingContentId}
                                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-xs outline-none cursor-pointer disabled:opacity-60"
                                >
                                  <option value="TEXT">Markdown Slide Text</option>
                                  <option value="CODE_TEMPLATE">Starting Code Template</option>
                                </select>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-slate-500">Description / Code Content</label>
                              <textarea
                                rows={5}
                                placeholder={form.type === "CODE_TEMPLATE" ? "Paste starter code here..." : "Describe the instructions using Markdown format..."}
                                value={form.description}
                                onChange={(e) => setContentForms(prev => ({
                                  ...prev,
                                  [sec.id]: { ...form, description: e.target.value }
                                }))}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-xs font-mono outline-none focus:border-blue-500"
                              />
                            </div>

                            <div className="flex items-center justify-end gap-2 text-xs">
                              <button
                                onClick={() => {
                                  setAddingContentMap(prev => ({ ...prev, [sec.id]: false }));
                                  setEditingContentId(null);
                                  setContentForms(prev => ({
                                    ...prev,
                                    [sec.id]: { title: "", description: "", type: "TEXT" }
                                  }));
                                }}
                                className="px-3 py-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveContent(sec.id)}
                                className="px-3.5 py-1.5 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg active:scale-95 transition-all shadow"
                              >
                                {editingContentId ? "Update Step" : "Save Step"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Grading Test Cases */}
        {activeTab === "testcases" && (
          <div className="space-y-6">
            
            {/* Create Test Case Form */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 mb-4 flex items-center gap-2">
                {editingTestCaseId ? <Edit2 className="text-blue-500 w-4 h-4" /> : <PlusCircle className="text-blue-500 w-4 h-4" />}
                {editingTestCaseId ? "Edit Grading Test Case" : "Add Grading Test Case"}
              </h3>
              
              <form onSubmit={handleSaveTestCase} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Test Case Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Test Array Sum Positive"
                      required
                      value={newTestCase.name}
                      onChange={(e) => setNewTestCase(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Grading Weight</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      required
                      value={newTestCase.weight}
                      onChange={(e) => setNewTestCase(prev => ({ ...prev, weight: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center gap-4 pt-5">
                    <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs text-slate-600 dark:text-slate-400">
                      <input
                        type="checkbox"
                        checked={newTestCase.isSample}
                        onChange={(e) => setNewTestCase(prev => ({ ...prev, isSample: e.target.checked }))}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      Is Sample Case
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs text-slate-600 dark:text-slate-400">
                      <input
                        type="checkbox"
                        checked={newTestCase.isHidden}
                        onChange={(e) => setNewTestCase(prev => ({ ...prev, isHidden: e.target.checked }))}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      Is Hidden Case
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Standard Input (stdin)</label>
                    <textarea
                      rows={3}
                      placeholder="e.g. 5\n1 2 3 4 5"
                      value={newTestCase.input}
                      onChange={(e) => setNewTestCase(prev => ({ ...prev, input: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs font-mono outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Expected Output (stdout)</label>
                    <textarea
                      rows={3}
                      placeholder="e.g. 15"
                      required
                      value={newTestCase.expected}
                      onChange={(e) => setNewTestCase(prev => ({ ...prev, expected: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs font-mono outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Explanation / Error Hints</label>
                  <textarea
                    rows={2}
                    placeholder="Provide a clue to show students when their program fails this test case..."
                    value={newTestCase.explanation}
                    onChange={(e) => setNewTestCase(prev => ({ ...prev, explanation: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end items-center gap-2 pt-2">
                  {editingTestCaseId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTestCaseId(null);
                        setNewTestCase({
                          name: "",
                          weight: 10,
                          isSample: false,
                          isHidden: true,
                          input: "",
                          expected: "",
                          explanation: ""
                        });
                      }}
                      className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={addingTestCase}
                    className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow active:scale-95 transition-all disabled:opacity-50"
                  >
                    {addingTestCase ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingTestCaseId ? <Save size={14} /> : <Plus size={14} />)}
                    {editingTestCaseId ? "Update Test Case" : "Save Test Case"}
                  </button>
                </div>
              </form>
            </div>

            {/* List of Test Cases */}
            {loadingTestCases ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : testCases.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <CheckSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400 text-sm">No test cases registered. Add a test case above to enable automated grading.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                        <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Test Name</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Weight</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Is Sample</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Is Hidden</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Inputs / Expected</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
                      {testCases.map((tc) => (
                        <tr key={tc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                          <td className="px-6 py-4">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {tc.name || "Test Case"}
                            </span>
                            {tc.explanation && (
                              <p className="text-[10px] text-slate-400 mt-0.5">{tc.explanation}</p>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 font-mono">
                              {tc.weight} pts
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold ${tc.is_sample ? 'bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                              {tc.is_sample ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold ${tc.is_hidden ? 'bg-amber-100 dark:bg-amber-950/20 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                              {tc.is_hidden ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1 font-mono text-[10px] leading-relaxed max-w-sm">
                              {tc.input && (
                                <div className="text-slate-500">
                                  <span className="font-semibold text-slate-400 dark:text-slate-500">in: </span> 
                                  {tc.input.replace(/\n/g, ' ')}
                                </div>
                              )}
                              <div>
                                <span className="font-semibold text-slate-400 dark:text-slate-500">out: </span> 
                                {tc.expected?.replace(/\n/g, ' ')}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => {
                                  setEditingTestCaseId(tc.id);
                                  setNewTestCase({
                                    name: tc.name || "",
                                    weight: tc.weight || 10,
                                    isSample: tc.is_sample || false,
                                    isHidden: tc.is_hidden || false,
                                    input: tc.input || "",
                                    expected: tc.expected || "",
                                    explanation: tc.explanation || ""
                                  });
                                  document.getElementById("lab-editor-dashboard")?.scrollIntoView({ behavior: "smooth" });
                                }}
                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-blue-950/40 rounded-lg transition-all active:scale-90"
                                title="Edit Test Case"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteTestCase(tc.id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-all active:scale-90"
                                title="Delete Test Case"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            </div>
          )}
        </div>
      )}
        {/* Tab 4: Sandbox & Runtime Settings */}
        {activeTab === "sandbox" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 sm:p-8 animate-in fade-in duration-200">
            <form onSubmit={handleSandboxSubmit} className="space-y-6">
              
              {lab.labType === "CODING" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200 mb-3">Supported Coding Languages</h3>
                    <div className="flex flex-wrap gap-4">
                      {["python", "java", "cpp", "c", "go", "rust", "scala"].map(lang => (
                        <label key={lang} className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-350">
                          <input
                            type="checkbox"
                            checked={sandboxForm.supportedLanguages.includes(lang)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setSandboxForm(prev => {
                                const list = checked 
                                  ? [...prev.supportedLanguages, lang]
                                  : prev.supportedLanguages.filter(l => l !== lang);
                                
                                const codeMap = { ...prev.starterCode };
                                if (checked && !codeMap[lang]) {
                                  if (lang === "python") codeMap[lang] = "def solution():\n    # TODO: Write solution\n    pass\n";
                                  else if (lang === "java") codeMap[lang] = "public class Main {\n    public static void main(String[] args) {\n        // TODO: Write solution\n    }\n}\n";
                                  else if (lang === "cpp") codeMap[lang] = "#include <iostream>\nusing namespace std;\n\nint main() {\n    // TODO: Write solution\n    return 0;\n}\n";
                                  else if (lang === "c") codeMap[lang] = "#include <stdio.h>\n\nint main() {\n    // TODO: Write solution\n    return 0;\n}\n";
                                  else if (lang === "go") codeMap[lang] = "package main\n\nimport \"fmt\"\n\nfunc main() {\n    // TODO: Write solution\n}\n";
                                  else if (lang === "rust") codeMap[lang] = "fn main() {\n    // TODO: Write solution\n}\n";
                                  else if (lang === "scala") codeMap[lang] = "object Main extends App {\n    // TODO: Write solution\n}\n";
                                }
                                return { ...prev, supportedLanguages: list, starterCode: codeMap };
                              });
                            }}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          {lang.toUpperCase()}
                        </label>
                      ))}
                    </div>
                  </div>

                  {sandboxForm.supportedLanguages.length > 0 && (
                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200">Starter Templates Code (Custom / //TODO)</h3>
                      {sandboxForm.supportedLanguages.map(lang => (
                        <div key={lang} className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase">{lang} Template</label>
                          <textarea
                            rows={6}
                            value={sandboxForm.starterCode[lang] || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSandboxForm(prev => ({
                                ...prev,
                                starterCode: {
                                  ...prev.starterCode,
                                  [lang]: val
                                }
                              }));
                            }}
                            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl
                                       bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono
                                       focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900
                                       transition-all text-xs outline-none"
                            placeholder={`// Write starter code template for ${lang}...`}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {lab.labType === "DATABASE" && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Target Database Engine</label>
                    <select
                      value={sandboxForm.dbType}
                      onChange={(e) => setSandboxForm(prev => ({ ...prev, dbType: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl
                                 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100
                                 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900
                                 transition-all text-sm outline-none cursor-pointer"
                    >
                      <option value="POSTGRESQL">PostgreSQL</option>
                      <option value="MYSQL">MySQL</option>
                      <option value="SQLSERVER">Microsoft SQL Server</option>
                      <option value="ORACLE">Oracle Database</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Database Initialization Schema (schema.sql)</label>
                    <textarea
                      rows={6}
                      value={sandboxForm.schemaSql}
                      onChange={(e) => setSandboxForm(prev => ({ ...prev, schemaSql: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl
                                 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono
                                 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900
                                 transition-all text-xs outline-none"
                      placeholder="CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(100));"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Database Seed Data (seed.sql)</label>
                    <textarea
                      rows={6}
                      value={sandboxForm.seedSql}
                      onChange={(e) => setSandboxForm(prev => ({ ...prev, seedSql: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl
                                 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono
                                 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900
                                 transition-all text-xs outline-none"
                      placeholder="INSERT INTO users VALUES (1, 'Alice'), (2, 'Bob');"
                    />
                  </div>
                </div>
              )}

              {(lab.labType === "WORKSPACE" || lab.labType === "HPC" || lab.labType === "CUSTOM") && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Compute Backend</label>
                      <select
                        value={sandboxForm.computeBackend}
                        onChange={(e) => setSandboxForm(prev => ({ ...prev, computeBackend: e.target.value }))}
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl
                                   bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100
                                   focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900
                                   transition-all text-sm outline-none cursor-pointer"
                      >
                        <option value="K8S">Kubernetes Sandbox Namespace</option>
                        <option value="SLURM">SLURM Partition Agent</option>
                        <option value="REMOTE_SSH">Remote Linux Server (SSH VM)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Docker Image Tag</label>
                      <input
                        type="text"
                        value={sandboxForm.dockerImage}
                        onChange={(e) => setSandboxForm(prev => ({ ...prev, dockerImage: e.target.value }))}
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl
                                   bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100
                                   focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900
                                   transition-all text-sm outline-none"
                        placeholder="ubuntu:22.04"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Exposed Allowed Ports (Comma-separated)</label>
                      <input
                        type="text"
                        value={sandboxForm.portsInput}
                        onChange={(e) => setSandboxForm(prev => ({ ...prev, portsInput: e.target.value }))}
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl
                                   bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100
                                   focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900
                                   transition-all text-sm outline-none"
                        placeholder="80, 8080, 443"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">CPU Allocation (Cores)</label>
                        <input
                          type="number"
                          step={0.1}
                          min={0.1}
                          max={4.0}
                          value={sandboxForm.cpuCores}
                          onChange={(e) => setSandboxForm(prev => ({ ...prev, cpuCores: parseFloat(e.target.value) || 0.5 }))}
                          className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl
                                     bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100
                                     focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900
                                     transition-all text-sm outline-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">RAM Memory (MB)</label>
                        <input
                          type="number"
                          step={128}
                          min={128}
                          max={8192}
                          value={sandboxForm.memoryMb}
                          onChange={(e) => setSandboxForm(prev => ({ ...prev, memoryMb: parseInt(e.target.value) || 512 }))}
                          className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl
                                     bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100
                                     focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900
                                     transition-all text-sm outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Custom Container Startup Shell Script</label>
                    <textarea
                      rows={6}
                      value={sandboxForm.startupScript}
                      onChange={(e) => setSandboxForm(prev => ({ ...prev, startupScript: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl
                                 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono
                                 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900
                                 transition-all text-xs outline-none"
                      placeholder="#!/bin/bash&#10;apt-get update && apt-get install -y git docker.io"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  disabled={savingSandbox}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow active:scale-95 transition-all disabled:opacity-50"
                >
                  {savingSandbox ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={15} />}
                  Save Sandbox Configurations
                </button>
              </div>

            </form>
          </div>
        )}
      </div>
    </div>
  );
}
