import React, { useState } from "react";
import { FormData, Errors, Translation } from "../types";
import { FL, FIn, FSel } from "./FormFields";
import universitiesData from "../universities.json";

interface Step2Props {
  t: Translation;
  data: FormData;
  errors: Errors;
  onChange: (f: keyof FormData, v: string) => void;
}

export function Step2({ t, data, errors, onChange }: Step2Props) {
  const isVi = t.langToggle === "English";

  const uniOptions = universitiesData.map(uni => ({
    value: uni.value,
    label: isVi ? uni.labelVi : uni.labelEn
  }));

  // If university has a value and it is not one of the predefined ones, it is custom (Other)
  const isPredefined = data.university === "" || uniOptions.some(opt => opt.label === data.university && opt.value !== "Other");
  const [showOtherInput, setShowOtherInput] = useState(!isPredefined);

  const handleDropdownChange = (val: string) => {
    if (val === "Other") {
      setShowOtherInput(true);
      onChange("university", "");
    } else if (val === "") {
      setShowOtherInput(false);
      onChange("university", "");
    } else {
      setShowOtherInput(false);
      const option = uniOptions.find(o => o.value === val);
      if (option) {
        onChange("university", option.label);
      }
    }
  };

  const currentDropdownValue = (() => {
    if (showOtherInput) return "Other";
    if (!data.university) return "";
    const found = uniOptions.find(opt => opt.label === data.university && opt.value !== "Other");
    return found ? found.value : "";
  })();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-0.5">{t.step2Title}</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">{t.step2Desc}</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div><FL req>{t.fullName}</FL><FIn type="text" placeholder={t.fullNamePh} value={data.fullName} onChange={e => onChange("fullName", e.target.value)} error={errors.fullName} /></div>
        <div><FL>{t.dob}</FL><FIn type="date" value={data.dob} onChange={e => onChange("dob", e.target.value)} /></div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div><FL req>{t.studentId}</FL><FIn type="text" placeholder={t.studentIdPh} value={data.studentId} onChange={e => onChange("studentId", e.target.value)} error={errors.studentId} /></div>
        <div><FL req>{t.phone}</FL><FIn type="tel" placeholder={t.phonePh} value={data.phone} onChange={e => onChange("phone", e.target.value)} error={errors.phone} /></div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div><FL req>{t.emailUni}</FL><FIn type="email" placeholder={t.emailUniPh} value={data.emailUni} onChange={e => onChange("emailUni", e.target.value)} error={errors.emailUni} /></div>
        <div><FL>{t.emailPersonal}</FL><FIn type="email" placeholder={t.emailPersonalPh} value={data.emailPersonal} onChange={e => onChange("emailPersonal", e.target.value)} /></div>
      </div>
      <div>
        <FL req>{t.university}</FL>
        <FSel
          value={currentDropdownValue}
          onChange={handleDropdownChange}
          options={uniOptions}
          placeholder={isVi ? "-- Chọn trường học --" : "-- Select University --"}
          error={showOtherInput ? undefined : errors.university}
        />
        {showOtherInput && (
          <div className="mt-3.5 animate-fadeIn">
            <FL req>{isVi ? "Nhập tên trường khác" : "Specify your university"}</FL>
            <FIn
              type="text"
              placeholder={isVi ? "Ví dụ: Trường Đại học Bách khoa, ĐHQG TP.HCM" : "e.g. HCMC University of Technology"}
              value={data.university}
              onChange={e => onChange("university", e.target.value)}
              error={errors.university}
            />
          </div>
        )}
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="sm:col-span-1"><FL req>{t.major}</FL><FIn type="text" placeholder={t.majorPh} value={data.major} onChange={e => onChange("major", e.target.value)} error={errors.major} /></div>
        <div>
          <FL req>{t.yearOfStudy}</FL>
          <FSel
            value={data.year}
            onChange={v => onChange("year", v)}
            options={t.years.map(y => ({ value: y, label: y }))}
            placeholder={t.yearPh}
            error={errors.year}
          />
        </div>
        <div><FL req>{t.gpa}</FL><FIn type="text" placeholder={t.gpaPh} value={data.gpa} onChange={e => onChange("gpa", e.target.value)} error={errors.gpa} /></div>
      </div>
    </div>
  );
}
