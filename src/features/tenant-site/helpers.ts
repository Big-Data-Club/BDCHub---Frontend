export function hexToRgb(hex: string): string {
  const clean = (hex || "").replace("#", "").trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) return `${r}, ${g}, ${b}`;
  }
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) return `${r}, ${g}, ${b}`;
  }
  return "7, 89, 133";
}

/**
 * Normalizes Markdown input so that accidental 4-space or tab indents (common in Vietnamese
 * paragraph indentation or pasted Word content) do NOT get turned into raw `<pre><code>` blocks.
 * Preserves actual fenced code blocks (``` ... ```).
 */
export function normalizeMarkdown(text: string): string {
  if (!text) return "";
  const lines = text.split("\n");
  let inFencedCode = false;
  const result: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Toggle fenced code block
    if (/^\s*```/.test(line)) {
      inFencedCode = !inFencedCode;
      result.push(line);
      continue;
    }

    if (inFencedCode) {
      result.push(line);
      continue;
    }

    // Outside fenced code:
    // If line has leading tabs, convert to spaces
    let processed = line.replace(/^\t+/, m => "  ".repeat(m.length));

    // If line starts with 4 or more spaces:
    // In CommonMark, 4 leading spaces without an active list turns into an indented code block!
    if (/^ {4,}(?=[^\s])/.test(processed)) {
      // 1) Numbered list item: '    1. Đào tạo' -> '1. Đào tạo'
      if (/^ {4,}(\d+[\.\)]\s+)/.test(processed)) {
        processed = processed.replace(/^ {4,}/, "");
      }
      // 2) Bullet list item: '    - Item' -> '  - Item' (allow sublist)
      else if (/^ {4,}([-*+]\s+)/.test(processed)) {
        processed = processed.replace(/^ {4,}/, "  ");
      }
      // 3) Normal paragraph with 4 spaces indent (Vietnamese lùi đầu dòng) -> strip indent
      else {
        processed = processed.replace(/^ {4,}/, "");
      }
    }

    result.push(processed);
  }

  return result.join("\n");
}

export interface PersonnelMember {
  id: string;
  name: string;
  role: string;
  phone?: string;
  email?: string;
  website?: string;
  other?: string;
  initials: string;
  tier: 1 | 2 | 3 | 4;
}

/**
 * Parses personnel text (freeform or markdown bullet list) into structured hierarchy nodes.
 */
export function parsePersonnel(text: string): PersonnelMember[] | null {
  if (!text) return null;

  const lines = text.split("\n");
  const members: Omit<PersonnelMember, "id" | "initials" | "tier">[] = [];

  // Check if bullet list format: "- **PGS TS. Thoại Nam** - Giám đốc"
  const isBulletFormat = lines.some(l => /^\s*[-*+]\s+/.test(l));

  if (isBulletFormat) {
    let current: Omit<PersonnelMember, "id" | "initials" | "tier"> | null = null;
    for (const rawLine of lines) {
      const isSubBullet = /^\s{2,}[-*+]\s+/.test(rawLine);
      const line = rawLine.trim();
      if (!line) continue;

      if (!isSubBullet && /^[-*+]\s+/.test(line)) {
        const content = line.replace(/^[-*+]\s+/, "");
        const parts = content.split(/\s*[-–—|:]\s*/);
        if (parts.length >= 2) {
          if (current) members.push(current);
          const name = parts[0].replace(/\*\*/g, "").trim();
          const role = parts.slice(1).join(" - ").replace(/\*\*/g, "").trim();
          current = { name, role, phone: "", email: "", website: "", other: "" };
          continue;
        }
      }

      if (current) {
        const cleanLine = line.replace(/^[-*+]\s+/, "");
        if (/@/.test(cleanLine)) {
          const m = cleanLine.match(/([^\s,;]+@[^\s,;]+)/);
          if (m) current.email = m[1];
        }
        if (/điện thoại|sđt|phone/i.test(cleanLine)) {
          const m = cleanLine.match(/(?:điện thoại|sđt|phone):\s*(.+)$/i);
          if (m) current.phone = m[1].trim();
        }
        if (/website|web/i.test(cleanLine)) {
          const m = cleanLine.match(/(?:website|web):\s*(.+)$/i);
          if (m) current.website = m[1].trim();
        }
        if (/thông tin khác|chuyên ngành/i.test(cleanLine)) {
          const m = cleanLine.match(/(?:thông tin khác|chuyên ngành):\s*(.+)$/i);
          if (m) current.other = m[1].trim();
        }
      }
    }
    if (current) members.push(current);
  }

  // Fallback to paragraph/block format (e.g. from the admin's unformatted input)
  if (members.length < 2) {
    const blocks = text.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
    for (const block of blocks) {
      if (!/chức vụ/i.test(block) && !/@/.test(block) && !/giám đốc|trưởng phòng|kế toán/i.test(block)) continue;
      const nameMatch = block.match(/^([^:\n]+?)(?=\s+(?:Chức vụ|Chức danh|Chức vụ:))/i) ||
                        block.match(/^([^:\n]+?)(?=\s*\n\s*(?:Chức vụ|Chức danh))/i);
      const roleMatch = block.match(/(?:Chức vụ|Chức danh):\s*([^:\n]+?)(?=\s+(?:Điện thoại|Email|Website|Thông tin khác|$|\n))/i);
      const phoneMatch = block.match(/Điện thoại:\s*([^:\n]+?)(?=\s+(?:Email|Website|Thông tin khác|$|\n))/i);
      const emailMatch = block.match(/Email:\s*([^\s,;]+@[^\s,;]+)/i);
      const webMatch = block.match(/Website:\s*([^:\n]+?)(?=\s+(?:Thông tin khác|$|\n))/i);
      const otherMatch = block.match(/Thông tin khác:\s*([\s\S]+)$/i);

      let name = nameMatch ? nameMatch[1].trim() : "";
      if (!name) {
        const firstLine = block.split("\n")[0].trim();
        name = firstLine.replace(/^(?:[-*+]\s*|\d+[\.\)]\s*)/, "").replace(/\*\*/g, "").trim();
      }
      name = name.replace(/^(?:Họ và tên|Họ tên|Tên):\s*/i, "").trim();

      const role = roleMatch ? roleMatch[1].trim() : "";
      let phone = phoneMatch ? phoneMatch[1].trim() : "";
      if (phone.toLowerCase() === "liên hệ" || phone === "-") phone = "";
      const email = emailMatch ? emailMatch[1].trim() : "";
      let website = webMatch ? webMatch[1].trim() : "";
      if (website.toLowerCase() === "thông tin khác:" || website === "-") website = "";
      const other = otherMatch ? otherMatch[1].trim() : "";

      if (name && (role || email)) {
        members.push({ name, role: role || "Cán bộ", phone, email, website, other });
      }
    }
  }

  if (members.length < 2) return null;

  return members.map((m, idx) => {
    let tier: 1 | 2 | 3 | 4 = 4;
    const rLower = m.role.toLowerCase();
    if (/giám đốc|hiệu trưởng|viện trưởng|chủ tịch|trưởng trung tâm|director|dean|ceo/i.test(rLower) && !/phó|deputy|vice/i.test(rLower)) {
      tier = 1;
    } else if (/phó giám đốc|phó hiệu trưởng|phó viện trưởng|phó trưởng|phó chủ tịch|deputy|vice/i.test(rLower)) {
      tier = 2;
    } else if (/trưởng phòng|kế toán trưởng|trưởng ban|trưởng bộ môn|head|lead|quản lý/i.test(rLower)) {
      tier = 3;
    }

    const cleanName = m.name.replace(/^(?:PGS\.?\s*TS\.?|TS\.?|ThS\.?|CN\.?|GS\.?|Thạc sĩ|Tiến sĩ|Giáo sư|Kỹ sư|KS\.?)\s+/i, "");
    const words = cleanName.trim().split(/\s+/);
    const initials = words.length > 1 ? (words[0][0] + words[words.length - 1][0]).toUpperCase() : cleanName.slice(0, 2).toUpperCase();

    return {
      id: `person-${idx + 1}`,
      name: m.name,
      role: m.role,
      phone: m.phone,
      email: m.email,
      website: m.website,
      other: m.other,
      initials,
      tier,
    };
  });
}

export function isPersonnelPage(slug?: string, title?: string): boolean {
  const target = `${slug || ""} ${title || ""}`.toLowerCase();
  return /nhan-su|to-chuc|ban-lanh-dao|so-do|nhân sự|tổ chức|lãnh đạo/.test(target);
}
