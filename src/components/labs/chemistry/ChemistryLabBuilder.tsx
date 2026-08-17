// frontend/src/components/labs/chemistry/ChemistryLabBuilder.tsx
"use client";

import { useState } from "react";
import type {
  ChemistryLabSpec,
  EquipmentItem,
  EvaluationStep,
  ReactionRule,
  Substance,
} from "@/types/chemistry";
import {
  Beaker,
  CheckCircle2,
  Plus,
  Trash2,
  FlaskConical,
  Save,
  Layers,
  Settings2,
} from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  initialSpec?: ChemistryLabSpec;
  onSave?: (spec: ChemistryLabSpec) => void | Promise<void>;
}

export function ChemistryLabBuilder({ initialSpec, onSave }: Props) {
  const [title, setTitle] = useState(
    initialSpec?.title || "Thí nghiệm Chuẩn độ Acid - Base"
  );
  const [description, setDescription] = useState(
    initialSpec?.description || "Xác định nồng độ axit HCl bằng dung dịch chuẩn NaOH 0.1M"
  );

  const [substances, setSubstances] = useState<Substance[]>(
    initialSpec?.substances || [
      {
        id: "hcl_sol",
        name: "Axit Clohidric (HCl)",
        formula: "HCl",
        state: "liquid",
        concentrationM: 0.1,
        initialPh: 1.0,
        color: "rgba(225, 245, 255, 0.4)",
      },
      {
        id: "naoh_sol",
        name: "Natri Hydroxith (NaOH)",
        formula: "NaOH",
        state: "liquid",
        concentrationM: 0.1,
        initialPh: 13.0,
        color: "rgba(240, 250, 255, 0.4)",
      },
      {
        id: "phenolphthalein",
        name: "Chỉ thị Phenolphthalein",
        formula: "C20H14O4",
        state: "indicator",
        color: "rgba(255, 255, 255, 0.0)",
        indicatorRanges: [
          { minPh: 0, maxPh: 8.2, color: "rgba(255, 255, 255, 0.0)" },
          { minPh: 8.2, maxPh: 10.0, color: "rgba(255, 105, 180, 0.7)" },
          { minPh: 10.0, maxPh: 14.0, color: "rgba(204, 0, 102, 0.9)" },
        ],
      },
    ]
  );

  const [equipments, setEquipments] = useState<EquipmentItem[]>(
    initialSpec?.equipments || [
      {
        id: "buret_1",
        type: "burette",
        capacityMl: 50,
        initialVolumeMl: 50,
        filledSubstanceId: "naoh_sol",
        x: 500,
        y: 150,
      },
      {
        id: "flask_1",
        type: "erlenmeyer_flask",
        capacityMl: 250,
        initialVolumeMl: 25,
        filledSubstanceId: "hcl_sol",
        x: 500,
        y: 420,
      },
    ]
  );

  const [reactions, setReactions] = useState<ReactionRule[]>(
    initialSpec?.reactions || [
      {
        id: "rxn_1",
        equation: "HCl + NaOH -> NaCl + H2O",
        type: "acid_base",
        reactants: [
          { substanceId: "hcl_sol", coeff: 1 },
          { substanceId: "naoh_sol", coeff: 1 },
        ],
        products: [],
        heatOfReactionKjPerMol: -57.1,
      },
    ]
  );

  const [criteria, setCriteria] = useState<EvaluationStep[]>(
    initialSpec?.evaluationCriteria || [
      {
        id: "step_1",
        stepName: "Thêm chỉ thị Phenolphthalein vào bình tam giác",
        targetEquipmentId: "flask_1",
        requiredSubstanceId: "phenolphthalein",
        minDrops: 2,
      },
      {
        id: "step_2",
        stepName: "Chuẩn độ đến mốc hồng nhạt (pH 8.2 - 9.5)",
        targetEquipmentId: "flask_1",
        targetPhMin: 8.2,
        targetPhMax: 9.5,
        targetVolumeDispensedMl: 25.0,
        toleranceMl: 0.3,
      },
    ]
  );

  const handleSave = async () => {
    const spec: ChemistryLabSpec = {
      labType: "CHEMISTRY",
      title,
      description,
      workspace: {
        viewMode: "2.5D",
        benchWidth: 1200,
        benchHeight: 700,
      },
      substances,
      equipments,
      reactions,
      evaluationCriteria: criteria,
    };

    if (onSave) {
      await onSave(spec);
    }
    toast.success("Đã lưu cấu hình Bài Lab Hóa Học thành công!");
  };

  return (
    <div className="space-y-6 rounded-2xl border border-slate-800 bg-slate-950 p-6 text-slate-100 shadow-2xl">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2 text-cyan-400">
            <FlaskConical className="h-5 w-5" />
            Bộ Cấu hình Bài Lab Hóa Học Ảo (Chemistry Lab Builder)
          </h2>
          <p className="text-xs text-slate-400">
            Thiết lập danh mục hóa chất, dụng cụ, quy tắc phản ứng và tiêu chí chấm điểm bài lab
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-xs font-bold text-white hover:bg-cyan-500 transition-all shadow-lg active:scale-95 cursor-pointer"
        >
          <Save className="h-4 w-4" />
          Lưu bài Lab
        </button>
      </div>

      {/* Basic Lab Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Tên bài thí nghiệm Hóa học
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Mô tả mục tiêu thí nghiệm
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Tab Sections: Substances, Equipments, Reactions, Evaluation */}
      <div className="space-y-6">
        {/* Section 1: Chemical Substances Catalog */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
              <Beaker className="h-4 w-4" />
              1. Danh mục Hóa chất & Dung dịch (Substances)
            </h3>
            <button
              onClick={() =>
                setSubstances([
                  ...substances,
                  {
                    id: `sub_${Date.now()}`,
                    name: "Hóa chất mới",
                    formula: "X",
                    state: "liquid",
                    concentrationM: 0.1,
                    color: "rgba(200, 230, 255, 0.4)",
                  },
                ])
              }
              className="flex items-center gap-1 text-xs text-cyan-400 hover:underline cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Thêm hóa chất
            </button>
          </div>

          <div className="divide-y divide-slate-800">
            {substances.map((sub, idx) => (
              <div key={sub.id} className="grid grid-cols-1 md:grid-cols-5 gap-3 py-2.5 items-center text-xs">
                <input
                  type="text"
                  placeholder="Tên hóa chất"
                  value={sub.name}
                  onChange={(e) => {
                    const next = [...substances];
                    next[idx].name = e.target.value;
                    setSubstances(next);
                  }}
                  className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-white"
                />
                <input
                  type="text"
                  placeholder="Công thức"
                  value={sub.formula}
                  onChange={(e) => {
                    const next = [...substances];
                    next[idx].formula = e.target.value;
                    setSubstances(next);
                  }}
                  className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-white"
                />
                <div className="flex items-center gap-1">
                  <span>CM:</span>
                  <input
                    type="number"
                    step="0.01"
                    value={sub.concentrationM || 0}
                    onChange={(e) => {
                      const next = [...substances];
                      next[idx].concentrationM = parseFloat(e.target.value) || 0;
                      setSubstances(next);
                    }}
                    className="w-20 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-white"
                  />
                  <span>M</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>pH đầu:</span>
                  <input
                    type="number"
                    step="0.1"
                    value={sub.initialPh || 7}
                    onChange={(e) => {
                      const next = [...substances];
                      next[idx].initialPh = parseFloat(e.target.value) || 7;
                      setSubstances(next);
                    }}
                    className="w-16 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-white"
                  />
                </div>
                <button
                  onClick={() => setSubstances(substances.filter((_, i) => i !== idx))}
                  className="text-rose-400 hover:text-rose-300 justify-self-end"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Equipment & Glassware Layout */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
              <Layers className="h-4 w-4" />
              2. Danh mục Dụng cụ trên Bàn thí nghiệm (Equipments)
            </h3>
            <button
              onClick={() =>
                setEquipments([
                  ...equipments,
                  {
                    id: `eq_${Date.now()}`,
                    type: "beaker",
                    capacityMl: 250,
                    initialVolumeMl: 50,
                    x: 400,
                    y: 300,
                  },
                ])
              }
              className="flex items-center gap-1 text-xs text-cyan-400 hover:underline cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Thêm dụng cụ
            </button>
          </div>

          <div className="divide-y divide-slate-800">
            {equipments.map((eq, idx) => (
              <div key={eq.id} className="grid grid-cols-1 md:grid-cols-5 gap-3 py-2.5 items-center text-xs">
                <select
                  value={eq.type}
                  onChange={(e) => {
                    const next = [...equipments];
                    next[idx].type = e.target.value as any;
                    setEquipments(next);
                  }}
                  className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-white"
                >
                  <option value="burette">Buret (Burette)</option>
                  <option value="erlenmeyer_flask">Bình tam giác (Flask)</option>
                  <option value="beaker">Cốc thủy tinh (Beaker)</option>
                  <option value="dropper">Ống nhỏ giọt (Dropper)</option>
                  <option value="ph_meter">Máy đo pH</option>
                  <option value="thermometer">Nhiệt kế</option>
                </select>

                <div className="flex items-center gap-1">
                  <span>Dung tích:</span>
                  <input
                    type="number"
                    value={eq.capacityMl || 250}
                    onChange={(e) => {
                      const next = [...equipments];
                      next[idx].capacityMl = parseInt(e.target.value, 10) || 250;
                      setEquipments(next);
                    }}
                    className="w-20 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-white"
                  />
                  <span>mL</span>
                </div>

                <div className="flex items-center gap-1">
                  <span>Hóa chất nạp:</span>
                  <select
                    value={eq.filledSubstanceId || ""}
                    onChange={(e) => {
                      const next = [...equipments];
                      next[idx].filledSubstanceId = e.target.value;
                      setEquipments(next);
                    }}
                    className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-white"
                  >
                    <option value="">Trống</option>
                    {substances.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <span>Thể tích ban đầu:</span>
                  <input
                    type="number"
                    value={eq.initialVolumeMl || 0}
                    onChange={(e) => {
                      const next = [...equipments];
                      next[idx].initialVolumeMl = parseInt(e.target.value, 10) || 0;
                      setEquipments(next);
                    }}
                    className="w-16 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-white"
                  />
                  <span>mL</span>
                </div>

                <button
                  onClick={() => setEquipments(equipments.filter((_, i) => i !== idx))}
                  className="text-rose-400 hover:text-rose-300 justify-self-end"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
