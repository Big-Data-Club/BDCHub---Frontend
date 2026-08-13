import Papa from "papaparse";
import * as XLSX from "xlsx";

export type ParsedRow = { name: string; email: string; roles?: string; lmsRoles?: string; team?: string; code?: string; type?: string; organizations?: string };

const cell = (value: unknown) => String(value ?? "").trim();

function normalizeHeader(value: string): string {
  return value
    .replace(/^\uFEFF/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

const HEADER_ALIASES: Record<keyof ParsedRow, string[]> = {
  name: ["name", "fullname", "hoten", "hovaten", "ten", "hotendaydu"],
  email: ["email", "mail", "emailaddress", "diachiemail"],
  code: ["code", "usercode", "maso", "masinhvien", "masv", "mssv", "manhanvien", "manv"],
  team: ["team", "teamcode", "nhom", "ban", "phongban", "bophan"],
  type: ["type", "typecode", "loai", "loainguoidung", "hedaotao", "chuongtrinh"],
  roles: ["role", "roles", "authrole", "authroles", "systemrole", "systemroles", "vaitro", "quyenhethong"],
  lmsRoles: ["lmsrole", "lmsroles", "vaitrolms", "quyenlms"],
  organizations: ["organization", "organizations", "org", "orgs", "tochuc", "tochucs", "donvi"],
};

function mapRow(r: Record<string, unknown>): ParsedRow {
  const normalized = Object.entries(r).reduce<Record<string, unknown>>((result, [key, value]) => {
    result[normalizeHeader(key)] = value;
    return result;
  }, {});
  const read = (field: keyof ParsedRow) => {
    const alias = HEADER_ALIASES[field].find(key => normalized[key] !== undefined);
    return alias ? cell(normalized[alias]) : "";
  };

  return {
    name: read("name"),
    email: read("email").toLowerCase(),
    roles: read("roles") || "ROLE_USER",
    lmsRoles: read("lmsRoles"),
    team: read("team"),
    code: read("code"),
    type: read("type"),
    organizations: read("organizations"),
  };
}

export function parseCsvFile(file: File): Promise<ParsedRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      transformHeader: (header: string) => header.replace(/^\uFEFF/, "").trim(),
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
        const matrix = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: "" });
        const knownHeaders = new Set(Object.values(HEADER_ALIASES).flat());
        const headerIndex = matrix.findIndex(row =>
          row.filter(value => knownHeaders.has(normalizeHeader(cell(value)))).length >= 2
        );
        if (headerIndex < 0) throw new Error("Không tìm thấy dòng tiêu đề hợp lệ trong file Excel");
        const headers = matrix[headerIndex].map(value => cell(value));
        const json = matrix.slice(headerIndex + 1)
          .filter(row => row.some(value => cell(value) !== ""))
          .map(row => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])));
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
  teams: Array<{ code: string; name: string }>,
  types: Array<{ code: string; name: string }>,
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
      roles: "ROLE_USER",
      lms_roles: "LMS:TEACHER,STUDENT",
      organizations: "bdc:MEMBER",
    },
  ]);
  users["!cols"] = [
    { wch: 24 }, { wch: 32 }, { wch: 16 }, { wch: 14 },
    { wch: 10 }, { wch: 24 }, { wch: 28 }, { wch: 42 },
  ];
  XLSX.utils.book_append_sheet(workbook, users, "Users");

  const instructions = XLSX.utils.aoa_to_sheet([
    ["Cột", "Bắt buộc", "Cách điền"],
    ["name", "Có", "Họ tên đầy đủ"],
    ["email", "Có", "Email duy nhất; hệ thống tự chuyển về chữ thường"],
    ["code", "Có", "Mã người dùng duy nhất; giữ định dạng Text nếu có số 0 đầu"],
    ["team", "Có", "Điền code hoặc tên trong sheet Teams hop le"],
    ["type", "Có", "Điền code hoặc tên trong sheet Types hop le"],
    ["roles", "Có", "Quyền hệ thống. Người dùng thông thường điền ROLE_USER"],
    ["lms_roles", "Không", "Quyền LMS độc lập. Ví dụ LMS:TEACHER,STUDENT (chấp nhận dấu , hoặc ;). Hợp lệ: ADMIN, TEACHER, STUDENT"],
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

  const teamSheet = XLSX.utils.json_to_sheet(teams.map(team => ({ code: team.code, name: team.name })));
  teamSheet["!cols"] = [{ wch: 24 }, { wch: 36 }];
  XLSX.utils.book_append_sheet(workbook, teamSheet, "Teams hop le");

  const typeSheet = XLSX.utils.json_to_sheet(types.map(type => ({ code: type.code, name: type.name })));
  typeSheet["!cols"] = [{ wch: 24 }, { wch: 36 }];
  XLSX.utils.book_append_sheet(workbook, typeSheet, "Types hop le");

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
