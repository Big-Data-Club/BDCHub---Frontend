"use client";

import { useEffect, useState } from "react";
import { tenantSiteApi } from "../api";
import { defaultSite } from "../defaults";
import { organizationService } from "@/services/admin/organizationService";
import type { SiteDocument } from "../types";

export function useSiteEditor(id: number, name: string) {
  const [document, setDocument] = useState<SiteDocument | null>(null);
  const [revision, setRevision] = useState(0);
  const [snapshot, setSnapshot] = useState("");
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    let active = true;
    setLoading(true);
    tenantSiteApi.get(id).then(result => {
      if (!active) return;
      const value = result.draft || defaultSite(name);
      setDocument(value); setSnapshot(JSON.stringify(value)); setRevision(result.revision); setPublishedAt(result.publishedAt);
    }).catch(err => { if (active) setError(String(err.message)); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, name]);
  const dirty = document !== null && JSON.stringify(document) !== snapshot;
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = ""; } };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  async function run(action: "save" | "publish" | "unpublish") {
    if (!document || busy) return;
    setBusy(true); setError(""); setMessage("");
    try {
      let result;
      if (action === "unpublish") result = await tenantSiteApi.unpublish(id, revision);
      else {
        result = await tenantSiteApi.save(id, revision, document);
        setRevision(result.revision); setSnapshot(JSON.stringify(document));
        if (action === "publish") result = await tenantSiteApi.publish(id, result.revision);
      }
      setRevision(result.revision); setPublishedAt(result.publishedAt);
      setMessage(action === "save" ? "Đã lưu nháp. Trang công khai chưa thay đổi." : action === "publish" ? "Đã xuất bản. Trang public cập nhật trong tối đa 30 giây." : "Đã gỡ bản xuất bản. Trang quay về mẫu mặc định.");
    } catch (err) { const text = err instanceof Error ? err.message : "Không thể lưu website"; setError(text.includes("409") ? "Có người vừa sửa trang này. Hãy tải lại trước khi lưu để tránh ghi đè." : text); }
    finally { setBusy(false); }
  }
  async function upload(file: File) {
    setBusy(true); setError("");
    try { return await organizationService.uploadLogo(file); }
    catch (err) { setError(err instanceof Error ? err.message : "Không thể tải ảnh"); throw err; }
    finally { setBusy(false); }
  }
  return { document, setDocument, revision, publishedAt, loading, busy, dirty, error, message, run, upload };
}
