"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Send, 
  Plus, 
  X, 
  Mail, 
  Sparkles, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle,
  Loader2,
  Bold,
  Italic,
  Underline,
  Palette
} from "lucide-react";
import toast from "react-hot-toast";
import bdclogo from "@/assets/bdclogo.png";
import { sendAdminMail, SendMailData } from "@/lib/admin/mailApi";

export default function AdminMailPage() {
  const [to, setTo] = useState("");
  const [ccInput, setCcInput] = useState("");
  const [ccList, setCcList] = useState<string[]>([]);
  const [bccInput, setBccInput] = useState("");
  const [bccList, setBccList] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [signatureType, setSignatureType] = useState<"bdc-1" | "none">("bdc-1");
  const [templateType, setTemplateType] = useState<"cosmic" | "plain">("cosmic");
  
  const [isSending, setIsSending] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertFormatting = (tagOpen: string, tagClose: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    const replacement = `${tagOpen}${selectedText}${tagClose}`;
    
    const newBody = text.substring(0, start) + replacement + text.substring(end);
    setBody(newBody);

    // Focus back and select formatted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tagOpen.length, start + tagOpen.length + selectedText.length);
    }, 0);
  };

  const handleAddCc = () => {
    const trimmed = ccInput.trim();
    if (!trimmed) return;
    if (ccList.includes(trimmed)) {
      toast.error("Email already in CC list");
      return;
    }
    // simple email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Invalid email format");
      return;
    }
    setCcList([...ccList, trimmed]);
    setCcInput("");
  };

  const handleRemoveCc = (email: string) => {
    setCcList(ccList.filter(item => item !== email));
  };

  const handleAddBcc = () => {
    const trimmed = bccInput.trim();
    if (!trimmed) return;
    if (bccList.includes(trimmed)) {
      toast.error("Email already in BCC list");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Invalid email format");
      return;
    }
    setBccList([...bccList, trimmed]);
    setBccInput("");
  };

  const handleRemoveBcc = (email: string) => {
    setBccList(bccList.filter(item => item !== email));
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!to.trim()) {
      toast.error("Recipient email is required");
      return;
    }
    if (!subject.trim()) {
      toast.error("Subject is required");
      return;
    }
    if (!body.trim()) {
      toast.error("Email content is required");
      return;
    }

    setIsSending(true);
    const loadingToast = toast.loading("Launching email transaction via Virtual Threads...");

    try {
      const payload: SendMailData = {
        to: to.trim(),
        cc: ccList.length > 0 ? ccList : undefined,
        bcc: bccList.length > 0 ? bccList : undefined,
        subject: subject.trim(),
        body: body.trim(),
        signatureType,
        templateType
      };

      await sendAdminMail(payload);
      
      toast.success("Cosmic mail dispatched successfully!", { id: loadingToast });
      // Clear form
      setTo("");
      setSubject("");
      setBody("");
      setCcList([]);
      setBccList([]);
    } catch (err: any) {
      toast.error(err.message || "Failed to launch cosmic mail. Check server logs.", { id: loadingToast });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 py-6 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
      {/* Background gradients */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/20 via-slate-50 to-slate-50 dark:from-blue-950/20 dark:via-slate-950 dark:to-slate-950 pointer-events-none" />
      <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-blue-500/5 dark:bg-blue-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-purple-500/5 dark:bg-purple-500/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link 
              href="/settings"
              className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group mb-2"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Control Center</span>
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              <span className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
                <Mail className="h-6 w-6 text-white" />
              </span>
              Mail Dispatcher
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl">
              Construct system emails wrapped in premium templates, powered by high-performance Java 21 virtual threads.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center">
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold transition-all active:scale-95 shadow-sm"
            >
              <Eye className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              <span>{isPreviewMode ? "Edit Composer" : "Full Live Preview"}</span>
            </button>
          </div>
        </div>

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Composer */}
          <div className={`lg:col-span-7 space-y-6 ${isPreviewMode ? "hidden lg:block" : ""}`}>
            <form onSubmit={handleSend} className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-xl dark:shadow-2xl space-y-6">
              
              {/* Recipient */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 tracking-wide uppercase">Recipient (To)</label>
                <input 
                  type="email"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full bg-slate-55 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-500/80 transition-all font-medium"
                />
              </div>

              {/* CC & BCC Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* CC list */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 tracking-wide uppercase">Carbon Copy (CC)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={ccInput}
                      onChange={(e) => setCcInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCc())}
                      placeholder="cc@example.com"
                      className="flex-1 bg-slate-55 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-500/80 transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleAddCc}
                      className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors border border-slate-200 dark:border-transparent"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  {ccList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {ccList.map(email => (
                        <span key={email} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-500/20 text-xs font-semibold">
                          <span>{email}</span>
                          <button type="button" onClick={() => handleRemoveCc(email)} className="hover:text-red-500">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* BCC list */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 tracking-wide uppercase">Blind CC (BCC)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={bccInput}
                      onChange={(e) => setBccInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddBcc())}
                      placeholder="bcc@example.com"
                      className="flex-1 bg-slate-55 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-500/80 transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleAddBcc}
                      className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors border border-slate-200 dark:border-transparent"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  {bccList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {bccList.map(email => (
                        <span key={email} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20 text-xs font-semibold">
                          <span>{email}</span>
                          <button type="button" onClick={() => handleRemoveBcc(email)} className="hover:text-red-500">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 tracking-wide uppercase">Subject</label>
                <input 
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Official Club Announcement"
                  required
                  className="w-full bg-slate-55 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-500/80 transition-all font-medium"
                />
              </div>

              {/* Email Content */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 tracking-wide uppercase">Email Body (HTML/Text)</label>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-medium italic font-sans">HTML tags are supported</span>
                </div>

                {/* Formatting Helper Toolbar */}
                <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-t-xl border-b-0">
                  <button
                    type="button"
                    onClick={() => insertFormatting("<strong>", "</strong>")}
                    className="p-2 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200/60 dark:border-transparent transition-colors"
                    title="Bold"
                  >
                    <Bold className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("<em>", "</em>")}
                    className="p-2 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200/60 dark:border-transparent transition-colors"
                    title="Italic"
                  >
                    <Italic className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("<u>", "</u>")}
                    className="p-2 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200/60 dark:border-transparent transition-colors"
                    title="Underline"
                  >
                    <Underline className="h-4 w-4" />
                  </button>
                  
                  <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

                  {/* Cosmic Color Selection */}
                  <span className="text-xs text-slate-500 font-semibold flex items-center gap-1 mr-1">
                    <Palette className="h-3.5 w-3.5" />
                    <span>Colors:</span>
                  </span>
                  {[
                    { name: "Sky Blue", value: "#38bdf8" },
                    { name: "Nebula Purple", value: "#a78bfa" },
                    { name: "Supernova Rose", value: "#fb7185" },
                    { name: "Aurora Green", value: "#34d399" },
                    { name: "Solar Gold", value: "#fbbf24" }
                  ].map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => insertFormatting(`<span style="color: ${color.value}">`, "</span>")}
                      className="w-5 h-5 rounded-full border border-slate-300/40 hover:scale-110 active:scale-95 transition-all"
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>

                <textarea 
                  ref={textareaRef}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Type your message here... Highlight text and click buttons above to format."
                  required
                  rows={8}
                  className="w-full bg-slate-55 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-b-xl rounded-t-none px-4 py-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-500/80 transition-all font-mono text-sm leading-relaxed resize-y"
                />
              </div>

              {/* Template & Signature Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-100/50 dark:bg-slate-950/40 p-4 border border-slate-200/60 dark:border-slate-800/60 rounded-xl">
                {/* Template Selection */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wide uppercase">Theme Style</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTemplateType("cosmic")}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-all ${
                        templateType === "cosmic" 
                          ? "bg-blue-600/10 dark:bg-blue-600/15 border-blue-500 text-blue-600 dark:text-blue-300" 
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      🚀 Cosmic Dark
                    </button>
                    <button
                      type="button"
                      onClick={() => setTemplateType("plain")}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-all ${
                        templateType === "plain" 
                          ? "bg-blue-600/10 dark:bg-blue-600/15 border-blue-500 text-blue-600 dark:text-blue-300" 
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      📄 Plain Text
                    </button>
                  </div>
                </div>

                {/* Signature toggle */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wide uppercase">Signature</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSignatureType("bdc-1")}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-all ${
                        signatureType === "bdc-1" 
                          ? "bg-blue-600/10 dark:bg-blue-600/15 border-blue-500 text-blue-600 dark:text-blue-300" 
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      🖋️ bdc-1 Sign
                    </button>
                    <button
                      type="button"
                      onClick={() => setSignatureType("none")}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-all ${
                        signatureType === "none" 
                          ? "bg-blue-600/10 dark:bg-blue-600/15 border-blue-500 text-blue-600 dark:text-blue-300" 
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      ❌ No Signature
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSending}
                className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold tracking-wide shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Launching via Virtual Threads...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Dispatch Cosmic Mail</span>
                  </>
                )}
              </button>

            </form>
          </div>

          {/* Live Template Preview */}
          <div className={`lg:col-span-5 space-y-6 ${!isPreviewMode ? "hidden lg:block" : "w-full"}`}>
            <div className="sticky top-6 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-455 dark:text-slate-400 tracking-wide uppercase px-1">
                <Eye className="h-4 w-4 text-blue-500" />
                <span>Live Email Output Rendering</span>
              </div>

              {/* Mock mail client browser box */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl dark:shadow-2xl">
                {/* Browser control bar */}
                <div className="bg-slate-50 dark:bg-slate-950/80 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-400/60 dark:bg-red-500/60" />
                    <span className="w-3 h-3 rounded-full bg-yellow-400/60 dark:bg-yellow-500/60" />
                    <span className="w-3 h-3 rounded-full bg-green-400/60 dark:bg-green-500/60" />
                  </div>
                  <div className="flex-1 max-w-xs mx-auto bg-slate-100 dark:bg-slate-900/80 rounded-md border border-slate-200 dark:border-slate-800 py-1 text-center text-[10px] text-slate-400 dark:text-slate-500 truncate font-mono">
                    mail.google.com/inbox/preview
                  </div>
                </div>

                {/* Email headers display */}
                <div className="bg-slate-50/50 dark:bg-slate-900/50 p-4 border-b border-slate-200/60 dark:border-slate-800/60 text-xs space-y-2">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500">From: </span>
                    <span className="text-slate-700 dark:text-slate-300 font-semibold">BDC Hub Admin &lt;admin@bdc.hpcc.vn&gt;</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500">To: </span>
                    <span className="text-slate-700 dark:text-slate-300 truncate">{to || "(recipient email)"}</span>
                  </div>
                  {ccList.length > 0 && (
                    <div>
                      <span className="text-slate-400 dark:text-slate-500">CC: </span>
                      <span className="text-slate-600 dark:text-slate-400">{ccList.join(", ")}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-400 dark:text-slate-500">Subject: </span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">{subject || "(subject empty)"}</span>
                  </div>
                </div>

                {/* Main Email Template Body Preview */}
                <div className="p-6 overflow-y-auto max-h-[550px] bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans border-t border-slate-200 dark:border-slate-900">
                  {templateType === "cosmic" ? (
                    /* Cosmic Theme Preview (always dark template outputs for emails) */
                    <div className="max-w-[500px] mx-auto bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl text-left">
                      {/* Gradient top bar */}
                      <div className="h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                      
                      {/* BDC header badge */}
                      <div className="px-6 pt-8 pb-4 text-center">
                        <span className="inline-block bg-gradient-to-br from-blue-950 to-slate-900 border border-blue-500 px-4 py-2 rounded-xl text-xs font-bold tracking-widest text-blue-400 shadow-lg shadow-blue-500/5">
                          BDC HUB
                        </span>
                        <h2 className="text-lg font-bold text-white mt-4 tracking-tight leading-tight">
                          {subject || "Your Cosmic Subject"}
                        </h2>
                      </div>

                      {/* Main Message content */}
                      <div className="px-6 py-4 text-sm text-slate-300 leading-relaxed font-sans min-h-[120px]">
                        {body ? (
                          <div 
                            style={{ whiteSpace: "pre-wrap" }}
                            dangerouslySetInnerHTML={{ __html: body }}
                          />
                        ) : (
                          <span className="text-slate-600 italic">Type mail content in the composer...</span>
                        )}

                        {/* Signature section in template */}
                        {signatureType === "bdc-1" && (
                          <div className="mt-8 pt-4 border-t border-slate-800/80 flex gap-4 text-left">
                            <div className="flex-shrink-0 mt-0.5">
                              <Image 
                                src={bdclogo} 
                                alt="BDC Logo" 
                                className="w-12 h-12 rounded-lg border border-blue-500"
                              />
                            </div>
                            <div className="leading-tight">
                              <div className="text-sm font-bold text-blue-400">Big Data Club</div>
                              <div className="text-[11px] font-semibold text-slate-400 mt-0.5">Trường Đại học Bách Khoa</div>
                              <div className="text-[10px] text-slate-500">Đại học Quốc gia Thành phố Hồ Chí Minh</div>
                              <div className="flex gap-2.5 mt-2 text-[11px] font-bold">
                                <a href="https://www.facebook.com/BDCofHCMUT" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                  Facebook
                                </a>
                                <span className="text-slate-700">|</span>
                                <a href="https://bdc.hpcc.vn" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                  Website
                                </a>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Cosmic template footer */}
                      <div className="bg-slate-950 px-6 py-6 border-t border-slate-800 text-center">
                        <div className="text-xs font-semibold text-slate-500">Big Data Club (BDC) App</div>
                        <div className="text-[10px] text-slate-600 mt-1 leading-normal">
                          Đây là email được gửi từ Ban Quản Trị hệ thống BDC Hub.<br />
                          © 2026 Big Data Club. All rights reserved.
                        </div>
                      </div>

                    </div>
                  ) : (
                    /* Plain Text Mode Preview */
                    <div className="font-mono text-sm leading-relaxed text-slate-700 dark:text-slate-300 max-w-[500px] mx-auto min-h-[250px] flex flex-col justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-left">
                      <div>
                        {body ? (
                          <div style={{ whiteSpace: "pre-wrap" }}>{body}</div>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-600 italic">Type plain email content...</span>
                        )}
                      </div>

                      {signatureType === "bdc-1" && (
                        <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 font-sans text-xs">
                          <div className="font-bold text-slate-800 dark:text-slate-300">Big Data Club</div>
                          <div className="text-slate-500 dark:text-slate-400">Trường Đại học Bách Khoa</div>
                          <div className="text-slate-600 dark:text-slate-500">ĐHQG Thành phố Hồ Chí Minh</div>
                          <div className="text-blue-600 dark:text-blue-400 mt-1">
                            fb: https://www.facebook.com/BDCofHCMUT | web: bdc.hpcc.vn
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
