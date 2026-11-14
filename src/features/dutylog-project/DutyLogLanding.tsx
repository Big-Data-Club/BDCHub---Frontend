import Link from 'next/link';
import { ArrowDown, ArrowRight, ArrowUpRight, Check, ChevronLeft, DoorOpen, Fingerprint, Github, Layers3, MapPin, ScanLine, ShieldCheck, Smartphone, Users, Workflow } from 'lucide-react';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { PhoneDemo } from './PhoneDemo';
import { audiences, dutylogLinks, workflow } from './content';
import styles from './dutylog.module.css';

function Wordmark() {
  return <span className={styles.wordmark}><span className={styles.brandIcon}><ScanLine size={21} strokeWidth={2.2} /></span>Duty<span>Log</span></span>;
}

export function DutyLogLanding() {
  return <div className={styles.page} lang="vi">
    <a href="#overview" className={styles.skipLink}>Đến nội dung chính</a>
    <header className={styles.header}>
      <div className={styles.nav}>
        <Link href="/#projects" className={styles.backLink} aria-label="Về dự án BDC Hub"><ChevronLeft size={14} /><span>BDC HUB</span><span className={styles.navDivider} /></Link>
        <a href="#overview" aria-label="DutyLog — đầu trang"><Wordmark /></a>
        <nav className={styles.navLinks} aria-label="Nội dung dự án"><a href="#story">Ý tưởng</a><a href="#workflow">Cách hoạt động</a><a href="#model">Mô hình</a></nav>
        <div className={styles.navActions}><ThemeToggle size={17} /><a className={styles.navCta} href={dutylogLinks.figma} target="_blank" rel="noreferrer">Xem Figma <ArrowUpRight size={14} /></a></div>
      </div>
    </header>

    <section className={`${styles.container} ${styles.hero}`} id="overview" aria-labelledby="hero-title">
      <div className={styles.heroCopy}>
        <div className={styles.eyebrow}><span className={styles.projectBadge}>A BDC PROJECT</span><span>Built for campus life</span></div>
        <h1 id="hero-title" className={styles.heroTitle}>Phòng có mở?<br />Ai đang ở đó?<br /><span>DutyLog biết.</span></h1>
        <p className={styles.heroDescription}>Không gian chung. Thông tin rõ ràng.<br />DutyLog kết nối ca trực, lượt ra vào và trạng thái phòng để mỗi lần đến CLB đều đúng lúc.</p>
        <div className={styles.heroActions}><a href="#demo" className={styles.primaryButton}>Trải nghiệm ngay <ArrowUpRight size={18} /></a><a href="#story" className={styles.textButton}>Khám phá dự án <ArrowDown size={16} /></a></div>
        <div className={styles.heroMeta}><span><Smartphone size={15} />Mobile-first</span><span><Users size={15} />Dành cho CLB sinh viên</span></div>
        <div className={styles.heroFootnote}><span className={styles.line} /><p>Ít hỏi trong nhóm chat hơn.<br /><strong>Nhiều thời gian ở bên nhau hơn.</strong></p></div>
      </div>
      <PhoneDemo />
    </section>

    <div className={styles.contextStrip}><div className={styles.container}><span>ĐƯỢC THIẾT KẾ TỪ NHU CẦU CỦA</span><strong>Big Data Club <span>·</span> HCMUT</strong><span className={styles.contextLocation}><MapPin size={14} />B9 · C6 · H6</span></div></div>

    <section className={`${styles.container} ${styles.section}`} id="story" aria-labelledby="story-title">
      <div className={styles.sectionTop}><span className={styles.sectionLabel}>01 / THE PROBLEM</span><span className={styles.sectionAside}>Một câu hỏi nhỏ. Lặp lại mỗi ngày.</span></div>
      <div className={styles.storyGrid}>
        <div><h2 id="story-title">Không nên cần một<br />cuộc hội thoại<br />để biết <span>phòng có mở.</span></h2><p>Lịch nằm trong Sheet. Thông báo trôi trong chat. Danh sách ra vào lại ở một nơi khác. Khi thông tin rời rạc, một chuyến lên phòng cũng cần hỏi trước.</p></div>
        <div className={styles.beforeAfter}>
          <div className={styles.chatExample}><span className={styles.smallLabel}>MỘT TÌNH HUỐNG QUEN THUỘC</span><div className={styles.chatBubble}>Có ai ở phòng B9 không mọi người?</div><div className={styles.chatBubbleReply}>Hình như đổi ca rồi, để mình hỏi…</div><span className={styles.chatTime}>Thông tin vẫn đang chờ xác nhận.</span></div>
          <div className={styles.connectionLine}><ArrowDown size={17} /><span>Một nơi để cùng biết</span></div>
          <div className={styles.roomPreview}><div className={styles.roomPreviewIcon}><DoorOpen size={26} /></div><div><span className={styles.smallLabel}>DUTYLOG / MINH HỌA</span><strong>Phòng 303 · B9</strong><span>Minh An đang trực · 3 người có mặt</span></div><span className={styles.openBadge}><span />Đang mở</span></div>
        </div>
      </div>
    </section>

    <section className={styles.audienceSection} id="people" aria-labelledby="people-title"><div className={`${styles.container} ${styles.section}`}>
      <div className={styles.sectionTop}><span className={styles.sectionLabel}>02 / BUILT FOR PEOPLE</span><Users size={19} /></div>
      <div className={styles.sectionHeading}><h2 id="people-title">Ba góc nhìn.<br />Một không gian chung.</h2><p>Mỗi người cần một câu trả lời khác nhau.<br />DutyLog đưa chúng về cùng một nhịp.</p></div>
      <div className={styles.audienceGrid}>{audiences.map(person => <article key={person.number} className={styles.audience}><div className={styles.audienceTop}><span>{person.number}</span><h3>{person.name}</h3></div><blockquote>{person.quote}</blockquote><p>{person.description}</p></article>)}</div>
    </div></section>

    <section className={`${styles.container} ${styles.section}`} id="workflow" aria-labelledby="workflow-title">
      <div className={styles.sectionTop}><span className={styles.sectionLabel}>03 / THE WORKFLOW</span><Workflow size={19} /></div>
      <div className={styles.sectionHeading}><h2 id="workflow-title">Từ mở phòng<br />đến “hẹn gặp lại”.</h2><p>Một luồng xuyên suốt cho ca trực.<br />Rõ người thực hiện, rõ điều gì xảy ra tiếp theo.</p></div>
      <ol className={styles.workflow}>{workflow.map((step, i) => <li key={step.number}><div className={styles.workflowLine}><span>{step.number}</span>{i < workflow.length - 1 && <ArrowRight size={18} />}</div><h3>{step.title}</h3><p>{step.description}</p></li>)}</ol>
      <div className={styles.workflowBottom}><span><ScanLine size={16} />Người trực quét thẻ hoặc QR của thành viên tại phòng.</span><a href="#demo">Thử luồng trên điện thoại <ArrowUpRight size={16} /></a></div>
    </section>

    <section className={styles.featureSection} aria-labelledby="features-title"><div className={`${styles.container} ${styles.section}`}>
      <div className={styles.sectionTop}><span className={styles.sectionLabel}>04 / PRODUCT THINKING</span><span className={styles.sectionAside}>Nhỏ gọn ở bề mặt. Rõ ràng ở từng tương tác.</span></div>
      <h2 id="features-title">Công nghệ ở phía sau.<br /><span>Sự rõ ràng ở phía trước.</span></h2>
      <div className={styles.featureGrid}>
        <article className={styles.mainFeature}><Fingerprint size={34} strokeWidth={1.3} /><div><span className={styles.smallLabel}>PRESENCE, WITH CONTEXT</span><h3>Mỗi lượt vào ra<br />đều có ngữ cảnh.</h3><p>Ai được ghi nhận, ở phòng nào, vào hay ra. Kết quả cần đủ rõ để người trực hiểu ngay và xử lý khi có sai sót.</p></div><div className={styles.eventReceipt}><span><Check size={15} />Ghi nhận vào phòng</span><strong>Khánh Linh</strong><div><span>Phòng 303 B9</span><span>09:41</span></div><small>Dữ liệu minh họa</small></div></article>
        <article className={styles.smallFeature}><ScanLine size={25} /><h3>Quét không được?<br />Vẫn có lối tiếp.</h3><p>Nhập MSSV là phương án dự phòng khi thẻ, QR hoặc camera không dùng được.</p><div className={styles.sampleInput}><span>MSSV</span><strong>DEMO001</strong><ArrowRight size={16} /></div></article>
        <article className={styles.smallFeature}><ShieldCheck size={25} /><h3>Chưa xác nhận,<br />không báo thành công.</h3><p>Thông báo lỗi phải nói rõ điều gì chưa được ghi nhận và cách thử lại. Bạn có thể thử mất mạng trong demo.</p><span className={styles.errorExample}><span />Chưa ghi nhận · Thử lại</span></article>
      </div>
    </div></section>

    <section className={`${styles.container} ${styles.section}`} id="model" aria-labelledby="model-title">
      <div className={styles.sectionTop}><span className={styles.sectionLabel}>05 / BUSINESS MODEL</span><span className={styles.projectBadge}>COMMUNITY FIRST</span></div>
      <div className={styles.modelGrid}><div><h2 id="model-title">Bắt đầu từ một CLB.<br /><span>Tạo giá trị từ<br />việc dùng mỗi ngày.</span></h2><p>DutyLog là dự án học tập phục vụ vận hành không gian sinh hoạt chung. Trọng tâm hiện tại là thử nghiệm nhu cầu và tính hữu ích tại Big Data Club.</p><span className={styles.modelStatus}><span className={styles.liveDot} />Giai đoạn thử nghiệm · Chưa có doanh thu</span></div>
        <dl className={styles.modelRows}><div><dt>Người dùng</dt><dd>Thành viên và người trực phòng. Ban quản lý là bên dự kiến tổ chức triển khai.</dd></div><div><dt>Giá trị</dt><dd>Thông tin phòng tập trung, ghi nhận tại chỗ, giảm thao tác hỏi và đối chiếu thủ công.</dd></div><div><dt>Tiếp cận</dt><dd>Nhóm chat CLB, buổi sinh hoạt và hướng dẫn sử dụng tại phòng.</dd></div><div><dt>Nguồn lực</dt><dd>Nhóm phát triển BDC, điện thoại sẵn có và chi phí hạ tầng, bảo trì.</dd></div><div><dt>Kiểm chứng</dt><dd>Đo độ chính xác hiện diện, thời gian ghi nhận và mức độ sử dụng trong pilot.</dd></div></dl>
      </div>
    </section>

    <section className={styles.closingSection} id="design" aria-labelledby="design-title"><div className={styles.container}>
      <div className={styles.closingTop}><span className={styles.sectionLabel}>FROM IDEA TO INTERACTION</span><Layers3 size={22} /></div>
      <h2 id="design-title">Đừng chỉ đọc về DutyLog.<br /><span>Hãy thử một lần chạm.</span></h2>
      <p>Khám phá thiết kế, trải nghiệm luồng sử dụng<br />và xem cách dự án được xây dựng.</p>
      <div className={styles.closingActions}><a href={dutylogLinks.figma} target="_blank" rel="noreferrer" className={styles.primaryButton}>Mở prototype Figma <ArrowUpRight size={17} /></a>{dutylogLinks.behance ? <a href={dutylogLinks.behance} target="_blank" rel="noreferrer" className={styles.outlineButton}>Behance case study <ArrowUpRight size={16} /></a> : <span className={styles.comingSoon}>Behance case study <span>Sắp công bố</span></span>}</div>
      <a href={dutylogLinks.github} target="_blank" rel="noreferrer" className={styles.sourceLink}><Github size={15} />Khám phá mã nguồn <ArrowUpRight size={13} /></a>
    </div></section>

    <footer className={styles.footer}><div className={styles.container}><Link href="/#projects"><Wordmark /></Link><span>Một dự án của Big Data Club · HCMUT</span><a href="#overview">Về đầu trang <ArrowUpRight size={14} /></a></div></footer>
  </div>;
}
