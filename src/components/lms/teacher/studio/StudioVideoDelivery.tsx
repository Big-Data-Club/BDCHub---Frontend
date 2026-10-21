"use client";

import { useEffect, useState } from "react";
import { studioService, type SharedYoutubeStatus, type StudioProject, type StudioUpload } from "@/services/ai/studioService";

export function StudioVideoDelivery({ project, onReady }: { project: StudioProject; onReady: (id: string) => void }) {
  const [channel, setChannel] = useState<SharedYoutubeStatus | null>(null);
  const [upload, setUpload] = useState<StudioUpload | null>(null);
  const [title, setTitle] = useState(project.title.slice(0, 100));
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState("unlisted");
  const [madeForKids, setMadeForKids] = useState(false);
  const [synthetic, setSynthetic] = useState(true);
  const [approved, setApproved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());
  const mp4 = project.artifacts.find(a => a.type === "mp4");
  const expired = !mp4?.expires_at || Date.parse(mp4.expires_at) <= now;

  useEffect(() => {
    let stopped = false;
    studioService.youtubeStatus(project.id).then(status => {
      if (stopped) return;
      setChannel(status); setUpload(status.uploads[0] || null);
    }).catch(() => { if (!stopped) setError("Kênh chung chưa sẵn sàng. Bạn vẫn có thể tải MP4 trước khi hết hạn."); });
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => { stopped = true; clearInterval(timer); };
  }, [project.id]);

  const uploadId = upload?.id;
  useEffect(() => {
    if (!uploadId) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const result = await studioService.uploadStatus(project.id, uploadId);
        if (stopped) return;
        setUpload(result);
        if (result.status === "ready" && result.processing_status === "processed") {
          if (["unlisted", "public"].includes(result.actual_privacy || "")) onReady(result.id);
          return;
        }
        if (result.status === "failed" || ["failed", "rejected", "deleted"].includes(result.processing_status || "")) return;
        timer = setTimeout(poll, 5000);
      } catch { if (!stopped) setError("Chưa kiểm tra được YouTube. Mở lại dự án để kiểm tra trạng thái trước khi đăng lại."); }
    };
    void poll();
    return () => { stopped = true; clearTimeout(timer); };
  }, [project.id, uploadId, onReady]);

  const submit = async () => {
    if (!mp4?.asset_id || !channel?.channel_id) return;
    setBusy(true); setError("");
    try {
      const result = await studioService.uploadVideo(project.id, { asset_id: mp4.asset_id, channel_id: channel.channel_id,
        title, description, privacy, made_for_kids: madeForKids, contains_synthetic_media: synthetic });
      setUpload({ id: result.upload_id, title, privacy, status: "queued" });
    } catch (err) { setError(err instanceof Error ? err.message : "Chưa đăng được YouTube"); }
    finally { setBusy(false); }
  };

  const field = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900";
  const uploading = upload && ["queued", "running", "ready"].includes(upload.status);
  return <section className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700" aria-label="Tải về và đăng video">
    <p className="text-sm">MP4, audio và ZIP tự xóa sau 10 phút kể từ khi dựng xong. Storyboard và HTML được giữ trong dự án của khóa học để chỉnh sửa hoặc dựng lại.</p>
    <p className="text-sm font-medium" role="status">{expired ? "Bản video tạm đã hết hạn. Dựng lại để tải MP4 mới." : `Còn ${Math.max(0, Math.ceil((Date.parse(mp4!.expires_at!) - now) / 1000))} giây để tải về hoặc bắt đầu đăng YouTube.`}</p>
    <p className="text-sm">Muốn đăng lên kênh riêng: tải MP4 về và tự đăng. Đăng bên dưới sẽ dùng kênh chung: <strong>{channel?.channel_title || "chưa kết nối"}</strong>{channel?.channel_id ? ` (${channel.channel_id})` : ""}.</p>
    {channel?.connected && !uploading && <div className="space-y-3">
      <label className="block text-sm">Tiêu đề YouTube<input className={field} maxLength={100} value={title} onChange={e => setTitle(e.target.value)} /></label>
      <label className="block text-sm">Mô tả<textarea className={field} maxLength={5000} rows={3} value={description} onChange={e => setDescription(e.target.value)} /></label>
      <label className="block text-sm">Quyền riêng tư<select className={field} value={privacy} onChange={e => setPrivacy(e.target.value)}>
        <option value="private">Riêng tư — để kiểm tra trên kênh</option><option value="unlisted">Không công khai — ai có liên kết đều xem được</option><option value="public">Công khai trên YouTube</option>
      </select></label>
      <label className="flex gap-2 text-sm"><input type="checkbox" checked={madeForKids} onChange={e => setMadeForKids(e.target.checked)} />Nội dung được tạo dành riêng cho trẻ em</label>
      <label className="flex gap-2 text-sm"><input type="checkbox" checked={synthetic} onChange={e => setSynthetic(e.target.checked)} />Khai báo nội dung được tạo/chỉnh sửa tổng hợp với YouTube</label>
      <label className="flex gap-2 text-sm"><input type="checkbox" checked={approved} onChange={e => setApproved(e.target.checked)} />Tôi có quyền chia sẻ nội dung này và đồng ý đăng lên kênh chung với lựa chọn trên.</label>
      <button type="button" onClick={submit} disabled={busy || expired || !approved || !title.trim()} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">{busy ? "Đang gửi…" : "Đăng lên kênh YouTube chung"}</button>
    </div>}
    {upload && <p className="text-sm" role="status">YouTube: {upload.status} · {upload.processing_status || "đang chờ"} · quyền thực tế: {upload.actual_privacy || upload.privacy}. {upload.video_id && <a href={`https://www.youtube.com/watch?v=${upload.video_id}`} target="_blank" rel="noreferrer" className="underline">Mở video</a>}</p>}
    {upload?.status === "ready" && upload.actual_privacy === "private" && <p className="text-sm">Video riêng tư chưa dùng làm bài học được. Chuyển sang không công khai/công khai trong YouTube Studio rồi mở lại dự án để kiểm tra.</p>}
    {upload?.error && <p className="text-sm text-red-600">{upload.error}</p>}
    {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
  </section>;
}
