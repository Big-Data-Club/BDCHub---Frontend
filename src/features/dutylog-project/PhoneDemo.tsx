'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, BatteryFull, CircleCheck, Home, MapPin, MousePointer2, QrCode, RotateCcw, ScanLine, Signal, Wifi, WifiOff } from 'lucide-react';
import styles from './dutylog.module.css';

const scenes = [
  { id: 'home', label: 'Tổng quan', Icon: Home, hint: 'Ca đang diễn ra, số người có mặt và hoạt động gần đây — ngay trên trang chủ.' },
  { id: 'rooms', label: 'Phòng', Icon: MapPin, hint: 'Chọn giữa B9, C6 và H6. Thông tin hiển thị theo phòng bạn chọn.' },
  { id: 'scan', label: 'Quét thẻ', Icon: ScanLine, hint: 'Chạm “Quét thẻ mẫu DEMO001” hoặc nhập DEMO001. Chọn “Rời phòng” để thử check-out.' },
  { id: 'qr', label: 'Mã QR', Icon: QrCode, hint: 'Mở QR cá nhân từ chính màn hình của ứng dụng. Mã ở đây chỉ dùng minh họa.' },
] as const;

export function PhoneDemo() {
  const iframe = useRef<HTMLIFrameElement>(null);
  const [scene, setScene] = useState('home');
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [offline, setOffline] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  function command(action: string, value?: boolean) {
    iframe.current?.contentWindow?.postMessage({ type: 'dutylog:command', action, value }, window.location.origin);
  }
  useEffect(() => {
    const listen = (event: MessageEvent) => {
      if (event.source !== iframe.current?.contentWindow || event.origin !== window.location.origin) return;
      if (event.data?.type === 'dutylog:ready') { setReady(true); setFailed(false); }
      if (event.data?.type === 'dutylog:screen' && typeof event.data.screen === 'string') setScene(event.data.screen === 'picker' ? 'rooms' : event.data.screen);
    };
    window.addEventListener('message', listen);
    command('hello');
    const timeout = window.setTimeout(() => setFailed(true), 20000);
    return () => { window.removeEventListener('message', listen); window.clearTimeout(timeout); };
  }, [resetKey]);
  const active = scenes.find(s => s.id === scene);
  return <div className={styles.demo} id="demo">
    <div className={styles.demoTabs} role="group" aria-label="Chọn màn hình demo">
      {scenes.map(({ id, label, Icon }) => <button key={id} type="button" aria-pressed={scene === id} onClick={() => command(id)} disabled={!ready} className={scene === id ? styles.demoTabActive : ''}><Icon size={14} />{label}</button>)}
    </div>
    <div className={styles.phoneStage}>
      <div className={styles.orbit} aria-hidden="true" />
      <div className={styles.phone}>
        <div className={styles.phoneStatus} aria-hidden="true"><span>9:41</span><i /><span><Signal size={12} /><Wifi size={12} /><BatteryFull size={17} /></span></div>
        {!ready && <div className={styles.demoLoading} role="status">{failed ? <><strong>Chưa tải được demo</strong><button type="button" onClick={() => { setFailed(false); setResetKey(k => k + 1); }}>Thử lại</button></> : <><ScanLine size={30} /><span>Đang mở DutyLog…</span></>}</div>}
        <iframe key={resetKey} ref={iframe} title="DutyLog — ứng dụng demo tương tác với dữ liệu mẫu" src="/dutylog-demo/index.html" onLoad={() => command('hello')} className={styles.demoFrame} allow="camera 'none'; microphone 'none'" />
        <div className={styles.phoneHome} aria-hidden="true"><i /></div>
      </div>
      <div className={styles.floatingNote}><span className={styles.noteIcon}><CircleCheck size={19} /></span><div><strong>Ghi nhận rõ ràng.</strong><span>Kết nối mọi người.</span></div><ArrowUpRight size={16} /></div>
      <span className={styles.stageLabel}><MousePointer2 size={14} />Chạm để khám phá</span>
    </div>
    <p className={styles.demoHint} aria-live="polite">{active?.hint || 'Tiếp tục khám phá các tab và thao tác ngay trong điện thoại.'}</p>
    <div className={styles.demoTools}>
      <span><span className={styles.liveDot} />Demo tương tác · Dữ liệu mẫu</span>
      <div><button type="button" disabled={!ready} aria-pressed={offline} onClick={() => { command('offline', !offline); setOffline(v => !v); }} title="Thử lỗi mạng trong bản demo">{offline ? <WifiOff size={13} /> : <Wifi size={13} />}{offline ? 'Mất mạng' : 'Có mạng'}</button><button type="button" disabled={!ready} onClick={() => { command('reset'); setOffline(false); }} aria-label="Đặt lại demo"><RotateCcw size={13} />Đặt lại</button></div>
    </div>
  </div>;
}
