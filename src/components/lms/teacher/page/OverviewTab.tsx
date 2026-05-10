import { Course, Section } from "@/types";

export function OverviewTab({ course, sections }: { course: Course; sections: Section[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-50">Thông tin khóa học</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-600 dark:text-slate-400">Trạng thái</p>
            <p className="font-semibold text-slate-900 dark:text-slate-50">{course.status === "PUBLISHED" ? "Đã xuất bản" : "Nháp"}</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-600 dark:text-slate-400">Mức độ</p>
            <p className="font-semibold text-slate-900 dark:text-slate-50">{course.level || "Chưa xác định"}</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-600 dark:text-slate-400">Danh mục</p>
            <p className="font-semibold text-slate-900 dark:text-slate-50">{course.category || "Chưa phân loại"}</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-600 dark:text-slate-400">Số chương</p>
            <p className="font-semibold text-slate-900 dark:text-slate-50">{sections.length}</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-50">Danh sách chương</h3>
        {sections.length === 0 ? (
          <p className="text-slate-600 dark:text-slate-400">Chưa có chương nào</p>
        ) : (
          <div className="space-y-2">
            {sections.map((section, index) => (
              <div key={section.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                <p className="font-medium text-slate-900 dark:text-slate-50">
                  Chương {index + 1}: {section.title}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{section.description || "Chưa có mô tả"}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}