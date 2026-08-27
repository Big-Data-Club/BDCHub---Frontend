import React from "react";
import { User } from "lucide-react";
import { FormData, Errors, T, Lang, ACADEMIC_STATUS_OPTIONS, AcademicStatus } from "../types";
import { FIn, FSel } from "@/components/form/FormFields";
import universitiesData from "../../hpc-summer-school/universities.json";

interface Step1PersonalProps {
  form: FormData;
  onChange: (fields: Partial<FormData>) => void;
  errors: Errors;
  lang: Lang;
}

export const Step1Personal: React.FC<Step1PersonalProps> = ({ form, onChange, errors, lang }) => {
  const t = T[lang];
  const isVi = lang === "vi";

  const uniOptions = React.useMemo(() => {
    return universitiesData.map(uni => ({
      value: uni.value,
      label: isVi ? uni.labelVi : uni.labelEn,
      keywords: [
        uni.labelVi,
        uni.labelEn,
        uni.abbr,
        uni.fullNameVi,
        uni.value
      ].filter(Boolean) as string[]
    }));
  }, [isVi]);

  // If university has a value and it is not one of the predefined ones, it is custom (Other)
  const isPredefined = form.university === "" || universitiesData.some(
    uni => (uni.labelVi === form.university || uni.labelEn === form.university) && uni.value !== "Other"
  );
  const [showOtherInput, setShowOtherInput] = React.useState(!isPredefined);

  React.useEffect(() => {
    if (form.university !== "") {
      const isPredefinedVal = universitiesData.some(
        uni => (uni.labelVi === form.university || uni.labelEn === form.university) && uni.value !== "Other"
      );
      setShowOtherInput(!isPredefinedVal);
    }
  }, [form.university]);

  const handleDropdownChange = (val: string) => {
    if (val === "Other") {
      setShowOtherInput(true);
      onChange({ university: "" });
    } else if (val === "") {
      setShowOtherInput(false);
      onChange({ university: "" });
    } else {
      const option = uniOptions.find(o => o.value === val);
      if (option) {
        setShowOtherInput(false);
        onChange({ university: option.label });
      } else {
        // Custom value from "Search & Auto-fill"
        setShowOtherInput(true);
        onChange({ university: val });
      }
    }
  };

  const currentDropdownValue = (() => {
    if (showOtherInput) return "Other";
    if (!form.university) return "";
    const found = universitiesData.find(
      uni => (uni.labelVi === form.university || uni.labelEn === form.university) && uni.value !== "Other"
    );
    return found ? found.value : "";
  })();

  const academicStatusOptions = React.useMemo(() => {
    return ACADEMIC_STATUS_OPTIONS.map((opt) => ({
      value: opt.id,
      label: isVi ? opt.labelVi : opt.labelEn,
    }));
  }, [isVi]);

  const isPredefinedAcademicStatus =
    !form.academicStatus ||
    ACADEMIC_STATUS_OPTIONS.some((opt) => opt.id === form.academicStatus && opt.id !== "other");
  const [showOtherAcademicStatusInput, setShowOtherAcademicStatusInput] = React.useState(!isPredefinedAcademicStatus);

  React.useEffect(() => {
    if (form.academicStatus) {
      const isPredefinedVal = ACADEMIC_STATUS_OPTIONS.some(
        (opt) => opt.id === form.academicStatus && opt.id !== "other"
      );
      setShowOtherAcademicStatusInput(!isPredefinedVal);
    }
  }, [form.academicStatus]);

  const handleAcademicStatusChange = (val: string) => {
    if (val === "other") {
      setShowOtherAcademicStatusInput(true);
      onChange({ academicStatus: "other", academicStatusOther: form.academicStatusOther || "" });
    } else if (val === "") {
      setShowOtherAcademicStatusInput(false);
      onChange({ academicStatus: "" as AcademicStatus, academicStatusOther: "" });
    } else {
      const option = academicStatusOptions.find((o) => o.value === val);
      if (option) {
        setShowOtherAcademicStatusInput(false);
        onChange({ academicStatus: val as AcademicStatus, academicStatusOther: "" });
      } else {
        // Custom value from "Search & Auto-fill"
        setShowOtherAcademicStatusInput(true);
        onChange({ academicStatus: "other", academicStatusOther: val });
      }
    }
  };

  const currentAcademicStatusValue = (() => {
    if (showOtherAcademicStatusInput) return "other";
    if (!form.academicStatus) return "";
    const found = ACADEMIC_STATUS_OPTIONS.find((opt) => opt.id === form.academicStatus && opt.id !== "other");
    return found ? found.id : "";
  })();

  return (
    <div className="space-y-8">
      {/* Header section with refined editorial divider */}
      <div className="border-b border-slate-200 dark:border-slate-800/80 pb-4">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
          {t.step1Header}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{t.step1Desc}</p>
      </div>

      {/* Full Name & Phone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FIn
          label={t.fullName}
          type="text"
          value={form.fullName}
          onChange={(e) => onChange({ fullName: e.target.value })}
          placeholder={t.fullNamePh}
          error={errors.fullName}
        />

        <FIn
          label={t.phone}
          type="tel"
          value={form.phone}
          onChange={(e) => onChange({ phone: e.target.value })}
          placeholder={t.phonePh}
          error={errors.phone}
        />
      </div>

      {/* Confirmation Email & Personal Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FIn
          label={t.emailConfirmation}
          tooltipText={
            isVi
              ? "Kết quả vòng hồ sơ, xác nhận nộp đơn thành công và thông tin các vòng tiếp theo sẽ được gửi trực tiếp đến địa chỉ email này!"
              : "Screening results, application confirmation, and info on upcoming rounds will be sent directly to this email address!"
          }
          fieldKey="emailConfirmation"
          type="email"
          value={form.emailConfirmation}
          onChange={(e) => onChange({ emailConfirmation: e.target.value })}
          placeholder={t.emailConfirmationPh}
          error={errors.emailConfirmation}
        />

        <FIn
          label={t.emailPersonal}
          type="email"
          value={form.emailPersonal}
          onChange={(e) => onChange({ emailPersonal: e.target.value })}
          placeholder={t.emailPersonalPh}
          error={errors.emailPersonal}
        />
      </div>

      {/* School Email & Facebook / Social */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FIn
          label={t.emailSchool}
          type="email"
          value={form.emailSchool}
          onChange={(e) => onChange({ emailSchool: e.target.value })}
          placeholder={t.emailSchoolPh}
          error={errors.emailSchool}
        />

        <FIn
          label={t.facebookLink}
          tooltipText={
            isVi
              ? "BDC sẽ chủ động liên hệ với bạn qua tài khoản này khi cần thiết!"
              : "BDC will contact you directly via this account when necessary!"
          }
          fieldKey="facebookLink"
          type="url"
          value={form.facebookLink}
          onChange={(e) => onChange({ facebookLink: e.target.value })}
          placeholder={t.facebookLinkPh}
          error={errors.facebookLink}
        />
      </div>

      {/* University Selection */}
      <div>
        <div className={`transition-all duration-300 space-y-3.5 ${
          showOtherInput
            ? "p-4 bg-blue-50/70 dark:bg-blue-950/30 border-0 border-l-4 border-blue-600 dark:border-blue-500 rounded-none"
            : ""
        }`}>
          <FSel
            label={t.university}
            value={currentDropdownValue}
            onChange={handleDropdownChange}
            options={uniOptions}
            placeholder={isVi ? "-- Chọn trường học --" : "-- Select University --"}
            error={showOtherInput ? undefined : errors.university}
            searchable={true}
            isVi={isVi}
          />
          {showOtherInput && (
            <div className="animate-dropdown-fade-in pt-1">
              <FIn
                label={isVi ? "Nhập tên trường khác *" : "Specify your university *"}
                type="text"
                placeholder={isVi ? "Ví dụ: Trường Đại học Bách khoa, ĐHQG TP.HCM" : "e.g. HCMC University of Technology"}
                value={form.university}
                onChange={(e) => onChange({ university: e.target.value })}
                error={errors.university}
              />
            </div>
          )}
        </div>
      </div>

      {/* Faculty + MSSV */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FIn
          label={t.faculty}
          type="text"
          value={form.faculty}
          onChange={(e) => onChange({ faculty: e.target.value })}
          placeholder={t.facultyPh}
          error={errors.faculty}
        />

        <FIn
          label={t.studentId}
          type="text"
          value={form.studentId}
          onChange={(e) => onChange({ studentId: e.target.value })}
          placeholder={t.studentIdPh}
        />
      </div>

      {/* Academic Status */}
      <div>
        <div className={`transition-all duration-300 space-y-3.5 ${
          showOtherAcademicStatusInput
            ? "p-4 bg-blue-50/70 dark:bg-blue-950/30 border-0 border-l-4 border-blue-600 dark:border-blue-500 rounded-none"
            : ""
        }`}>
          <FSel
            label={t.academicStatus}
            value={currentAcademicStatusValue}
            onChange={handleAcademicStatusChange}
            options={academicStatusOptions}
            placeholder={isVi ? "-- Chọn năm học hiện tại --" : "-- Select Academic Status --"}
            error={showOtherAcademicStatusInput ? undefined : errors.academicStatus}
            isVi={isVi}
            searchable={true}
          />

          {showOtherAcademicStatusInput && (
            <div className="animate-dropdown-fade-in pt-1">
              <FIn
                label={isVi ? "Nhập chi tiết năm học / trình độ *" : "Specify your academic status *"}
                type="text"
                value={form.academicStatusOther}
                onChange={(e) => onChange({ academicStatusOther: e.target.value })}
                placeholder={t.academicStatusOtherPh}
                error={errors.academicStatus}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

