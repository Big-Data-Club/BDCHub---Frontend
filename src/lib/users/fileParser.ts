import Papa from "papaparse";
import * as XLSX from "xlsx";

export type ParsedRow = { name: string; email: string; roles?: string; team?: string; code?: string; type?: string; organizations?: string };

const cell = (value: unknown) => String(value ?? "").trim();

function mapRow(r: Record<string, unknown>): ParsedRow {
  return {
    name: cell(r.name || r.fullname || r.Name),
    email: cell(r.email || r.Email).toLowerCase(),
    roles: cell(r.roles || r.Roles || r.role || r.Role || "ROLE_USER"),
    team: cell(r.team || r.Team || "RESEARCH"),
    code: cell(r.code || r.Code),
    type: cell(r.type || r.Type || "CLC"),
    organizations: cell(r.organizations || r.Organizations || r.organization || r.org || r.Org || r.Organization),
  };
}

export function parseCsvFile(file: File): Promise<ParsedRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: { data: any[]; }) => {
        const rows = (results.data as Record<string, unknown>[]).map(mapRow);
        resolve(rows);
      },
      error: (err: any) => reject(err),
    });
  });
}

export function parseXlsxFile(file: File): Promise<ParsedRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "array" });
        const wsName = workbook.SheetNames[0];
        const ws = workbook.Sheets[wsName];
        const json = XLSX.utils.sheet_to_json(ws, { defval: "" }) as any[];
        const rows = json.map(mapRow);
        resolve(rows);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

export function downloadUserImportTemplate(
  roles: Array<{ name: string; displayName?: string }>,
  organizations: Array<{ slug: string; name: string }>,
) {
  const workbook = XLSX.utils.book_new();
  const users = XLSX.utils.json_to_sheet([
    {
      name: "Nguyễn Văn A",
      email: "nguyenvana@example.com",
      code: "USER001",
      team: "RESEARCH",
      type: "CLC",
      roles: "ROLE_MANAGER;ROLE_USER",
      organizations: "bdc:MEMBER",
    },
  ]);
  users["!cols"] = [
    { wch: 24 }, { wch: 32 }, { wch: 16 }, { wch: 14 },
    { wch: 10 }, { wch: 34 }, { wch: 42 },
  ];
  XLSX.utils.book_append_sheet(workbook, users, "Users");

  const instructions = XLSX.utils.aoa_to_sheet([
    ["Cột", "Bắt buộc", "Cách điền"],
    ["name", "Có", "Họ tên đầy đủ"],
    ["email", "Có", "Email duy nhất; hệ thống tự chuyển về chữ thường"],
    ["code", "Có", "Mã người dùng duy nhất; giữ định dạng Text nếu có số 0 đầu"],
    ["team", "Có", "RESEARCH, ENGINEER, EVENT hoặc MEDIA"],
    ["type", "Có", "CLC, DT hoặc TN"],
    ["roles", "Có", "Một hoặc nhiều auth role, phân cách bằng dấu ;. Ví dụ ROLE_MANAGER;ROLE_USER"],
    ["organizations", "Không", "slug:org-role, nhiều tổ chức phân cách bằng ;. Org-role: MEMBER, ADMIN, OWNER"],
    [],
    ["Lưu ý", "Import là atomic: chỉ cần một dòng sai thì không user nào được tạo. Hãy sửa toàn bộ lỗi trong preview trước khi xác nhận."],
  ]);
  instructions["!cols"] = [{ wch: 22 }, { wch: 14 }, { wch: 100 }];
  XLSX.utils.book_append_sheet(workbook, instructions, "Huong dan");

  const roleSheet = XLSX.utils.json_to_sheet(roles.map(role => ({
    role: role.name,
    display_name: role.displayName ?? "",
  })));
  roleSheet["!cols"] = [{ wch: 28 }, { wch: 32 }];
  XLSX.utils.book_append_sheet(workbook, roleSheet, "Roles hop le");

  const orgSheet = XLSX.utils.json_to_sheet(organizations.map(org => ({ slug: org.slug, name: org.name })));
  orgSheet["!cols"] = [{ wch: 28 }, { wch: 42 }];
  XLSX.utils.book_append_sheet(workbook, orgSheet, "To chuc hop le");

  XLSX.writeFile(workbook, `mau-import-users-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export async function parseFile(file: File) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".csv")) return parseCsvFile(file);
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) return parseXlsxFile(file);
  throw new Error("Unsupported file type. Use .csv or .xlsx/.xls");
}
