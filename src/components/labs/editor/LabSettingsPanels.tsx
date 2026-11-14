"use client";
import type { Lab, LabLevel } from "@/types/labs/lab";
import type { useLabSettings } from "@/hooks/labs/useLabSettings";
import type { Dispatch, SetStateAction, FormEvent } from "react";
import type { RuntimeTaskForm, RuntimeTaskSummary } from "@/types/labs/editor";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";

export function LabGeneralPanel({
  generalForm,
  setGeneralForm,
  savingGeneral,
  handleGeneralSubmit,
}: Pick<
  ReturnType<typeof useLabSettings>,
  "generalForm" | "setGeneralForm" | "savingGeneral" | "handleGeneralSubmit"
>) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 sm:p-8">
      <form onSubmit={handleGeneralSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Lab Title
          </label>
          <input
            type="text"
            required
            value={generalForm.title}
            onChange={(e) =>
              setGeneralForm((prev) => ({ ...prev, title: e.target.value }))
            }
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl
                             bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100
                             focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900
                             transition-all text-sm outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Description
          </label>
          <textarea
            rows={4}
            value={generalForm.description}
            onChange={(e) =>
              setGeneralForm((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl
                             bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100
                             focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900
                             transition-all text-sm outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Category
            </label>
            <input
              type="text"
              value={generalForm.category}
              onChange={(e) =>
                setGeneralForm((prev) => ({
                  ...prev,
                  category: e.target.value,
                }))
              }
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl
                               bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100
                               focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900
                               transition-all text-sm outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Difficulty Level
            </label>
            <select
              value={generalForm.level}
              onChange={(e) =>
                setGeneralForm((prev) => ({
                  ...prev,
                  level: e.target.value as LabLevel,
                }))
              }
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl
                               bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100
                               focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900
                               transition-all text-sm outline-none cursor-pointer"
            >
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
              <option value="ALL_LEVELS">All Levels</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Max Session Duration (Minutes)
            </label>
            <input
              type="number"
              value={generalForm.maxSessionDurationMin}
              onChange={(e) =>
                setGeneralForm((prev) => ({
                  ...prev,
                  maxSessionDurationMin: parseInt(e.target.value) || 0,
                }))
              }
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl
                               bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100
                               focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900
                               transition-all text-sm outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Max Concurrent Capacity (Containers)
            </label>
            <input
              type="number"
              value={generalForm.maxConcurrentSessions}
              onChange={(e) =>
                setGeneralForm((prev) => ({
                  ...prev,
                  maxConcurrentSessions: parseInt(e.target.value) || 0,
                }))
              }
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl
                               bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100
                               focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900
                               transition-all text-sm outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="submit"
            disabled={savingGeneral}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow active:scale-95 transition-all disabled:opacity-50"
          >
            {savingGeneral ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save size={15} />
            )}
            Save Configurations
          </button>
        </div>
      </form>
    </div>
  );
}

export function LabRuntimePanel({
  sandboxForm,
  setSandboxForm,
  savingSandbox,
  handleSandboxSubmit,
  lab,
  runtimeTasks,
  runtimeTaskForm,
  setRuntimeTaskForm,
  savingRuntimeTask,
  handleAddRuntimeTask,
  handleDeleteRuntimeTask,
}: Pick<
  ReturnType<typeof useLabSettings>,
  "sandboxForm" | "setSandboxForm" | "savingSandbox" | "handleSandboxSubmit"
> & {
  lab: Lab;
  runtimeTasks: RuntimeTaskSummary[];
  runtimeTaskForm: RuntimeTaskForm;
  setRuntimeTaskForm: Dispatch<SetStateAction<RuntimeTaskForm>>;
  savingRuntimeTask: boolean;
  handleAddRuntimeTask: (event: FormEvent) => Promise<void>;
  handleDeleteRuntimeTask: (id: number) => Promise<void>;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 sm:p-8 animate-in fade-in duration-200">
      <form onSubmit={handleSandboxSubmit} className="space-y-6">
        {lab.labType === "CODING" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200 mb-3">
                Supported Coding Languages
              </h3>
              <div className="flex flex-wrap gap-4">
                {["python", "java", "cpp", "c", "go", "rust", "scala"].map(
                  (lang) => (
                    <label
                      key={lang}
                      className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-350"
                    >
                      <input
                        type="checkbox"
                        checked={sandboxForm.supportedLanguages.includes(lang)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setSandboxForm((prev) => {
                            const list = checked
                              ? [...prev.supportedLanguages, lang]
                              : prev.supportedLanguages.filter(
                                  (l) => l !== lang,
                                );

                            const codeMap = { ...prev.starterCode };
                            if (checked && !codeMap[lang]) {
                              if (lang === "python")
                                codeMap[lang] =
                                  "def solution():\n    # TODO: Write solution\n    pass\n";
                              else if (lang === "java")
                                codeMap[lang] =
                                  "public class Main {\n    public static void main(String[] args) {\n        // TODO: Write solution\n    }\n}\n";
                              else if (lang === "cpp")
                                codeMap[lang] =
                                  "#include <iostream>\nusing namespace std;\n\nint main() {\n    // TODO: Write solution\n    return 0;\n}\n";
                              else if (lang === "c")
                                codeMap[lang] =
                                  "#include <stdio.h>\n\nint main() {\n    // TODO: Write solution\n    return 0;\n}\n";
                              else if (lang === "go")
                                codeMap[lang] =
                                  'package main\n\nimport "fmt"\n\nfunc main() {\n    // TODO: Write solution\n}\n';
                              else if (lang === "rust")
                                codeMap[lang] =
                                  "fn main() {\n    // TODO: Write solution\n}\n";
                              else if (lang === "scala")
                                codeMap[lang] =
                                  "object Main extends App {\n    // TODO: Write solution\n}\n";
                            }
                            return {
                              ...prev,
                              supportedLanguages: list,
                              starterCode: codeMap,
                            };
                          });
                        }}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      {lang.toUpperCase()}
                    </label>
                  ),
                )}
              </div>
            </div>

            {sandboxForm.supportedLanguages.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200">
                  Starter Templates Code (Custom / //TODO)
                </h3>
                {sandboxForm.supportedLanguages.map((lang) => (
                  <div key={lang} className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      {lang} Template
                    </label>
                    <textarea
                      rows={6}
                      value={sandboxForm.starterCode[lang] || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSandboxForm((prev) => ({
                          ...prev,
                          starterCode: {
                            ...prev.starterCode,
                            [lang]: val,
                          },
                        }));
                      }}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl
                                       bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono
                                       focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900
                                       transition-all text-xs outline-none"
                      placeholder={`// Write starter code template for ${lang}...`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {lab.labType === "DATABASE" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Target Database Engine
              </label>
              <select
                value={sandboxForm.dbType}
                onChange={(e) =>
                  setSandboxForm((prev) => ({
                    ...prev,
                    dbType: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl
                                 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100
                                 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900
                                 transition-all text-sm outline-none cursor-pointer"
              >
                <option value="POSTGRESQL">PostgreSQL</option>
                <option value="MYSQL" disabled>
                  MySQL (executor unavailable)
                </option>
                <option value="SQLSERVER" disabled>
                  Microsoft SQL Server (executor unavailable)
                </option>
                <option value="ORACLE" disabled>
                  Oracle Database (executor unavailable)
                </option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Database Initialization Schema (schema.sql)
              </label>
              <textarea
                rows={6}
                value={sandboxForm.schemaSql}
                onChange={(e) =>
                  setSandboxForm((prev) => ({
                    ...prev,
                    schemaSql: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl
                                 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono
                                 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900
                                 transition-all text-xs outline-none"
                placeholder="CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(100));"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Database Seed Data (seed.sql)
              </label>
              <textarea
                rows={6}
                value={sandboxForm.seedSql}
                onChange={(e) =>
                  setSandboxForm((prev) => ({
                    ...prev,
                    seedSql: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl
                                 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono
                                 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900
                                 transition-all text-xs outline-none"
                placeholder="INSERT INTO users VALUES (1, 'Alice'), (2, 'Bob');"
              />
            </div>
          </div>
        )}

        {(lab.labType === "WORKSPACE" ||
          lab.labType === "HPC" ||
          lab.labType === "CUSTOM") && (
          <div className="space-y-6">
            {lab.labType === "HPC" && (
              <div className="space-y-5 rounded-2xl border border-amber-200 bg-amber-50/70 p-5 dark:border-amber-900/60 dark:bg-amber-950/20">
                <div>
                  <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                    Trusted Slurm scheduler
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-amber-800/80 dark:text-amber-300/80">
                    Select the profile installed by the HPC operator, then
                    narrow the limits for this lab. Do not put an SSH host,
                    password, private key or arbitrary remote command in this
                    form.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      HPC profile ID
                    </label>
                    <input
                      required
                      value={sandboxForm.hpcProfileId}
                      onChange={(e) =>
                        setSandboxForm((prev) => ({
                          ...prev,
                          hpcProfileId: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      placeholder="e.g. hpcc-teaching-2026"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Maximum wall time
                    </label>
                    <input
                      required
                      value={sandboxForm.slurmMaxTime}
                      onChange={(e) =>
                        setSandboxForm((prev) => ({
                          ...prev,
                          slurmMaxTime: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-mono text-sm text-slate-900 outline-none transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      placeholder="01:00:00"
                    />
                  </div>
                  {(
                    [
                      ["Partition", "slurmPartition", "teaching"],
                      ["Slurm account", "slurmAccount", "students"],
                      ["QoS", "slurmQos", "teaching"],
                    ] as const
                  ).map(([label, key, placeholder]) => (
                    <div className="space-y-2" key={key}>
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {label}
                      </label>
                      <input
                        required
                        value={sandboxForm[key]}
                        onChange={(e) =>
                          setSandboxForm((prev) => ({
                            ...prev,
                            [key]: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        placeholder={placeholder}
                      />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                  {(
                    [
                      ["Max nodes", "maxNodes", 1, 1],
                      ["Max tasks", "maxTasks", 1, 1],
                      ["CPUs/task", "maxCpusPerTask", 1, 1],
                      ["Memory (MB)", "maxMemoryMb", 64, 512],
                      ["GPUs", "maxGpuCount", 0, 0],
                    ] as const
                  ).map(([label, key, min, placeholder]) => (
                    <div className="space-y-2" key={key}>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {label}
                      </label>
                      <input
                        type="number"
                        min={min}
                        value={sandboxForm[key]}
                        onChange={(e) =>
                          setSandboxForm((prev) => ({
                            ...prev,
                            [key]: Number(e.target.value),
                          }))
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        placeholder={String(placeholder)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Compute Backend
                </label>
                <select
                  value={sandboxForm.computeBackend}
                  onChange={(e) =>
                    setSandboxForm((prev) => ({
                      ...prev,
                      computeBackend: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl
                                   bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100
                                   focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900
                                   transition-all text-sm outline-none cursor-pointer"
                >
                  <option value="K8S">Kubernetes Sandbox Namespace</option>
                  <option value="SLURM">SLURM Partition Agent</option>
                  <option value="REMOTE_SSH">
                    Remote Linux Server (SSH VM)
                  </option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Docker Image Tag
                </label>
                <input
                  type="text"
                  value={sandboxForm.dockerImage}
                  onChange={(e) =>
                    setSandboxForm((prev) => ({
                      ...prev,
                      dockerImage: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl
                                   bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100
                                   focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900
                                   transition-all text-sm outline-none"
                  placeholder="ubuntu:22.04"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Exposed Allowed Ports (Comma-separated)
                </label>
                <input
                  type="text"
                  value={sandboxForm.portsInput}
                  onChange={(e) =>
                    setSandboxForm((prev) => ({
                      ...prev,
                      portsInput: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl
                                   bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100
                                   focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900
                                   transition-all text-sm outline-none"
                  placeholder="80, 8080, 443"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    CPU Allocation (Cores)
                  </label>
                  <input
                    type="number"
                    step={0.1}
                    min={0.1}
                    max={4.0}
                    value={sandboxForm.cpuCores}
                    onChange={(e) =>
                      setSandboxForm((prev) => ({
                        ...prev,
                        cpuCores: parseFloat(e.target.value) || 0.5,
                      }))
                    }
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl
                                     bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100
                                     focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900
                                     transition-all text-sm outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    RAM Memory (MB)
                  </label>
                  <input
                    type="number"
                    step={128}
                    min={128}
                    max={8192}
                    value={sandboxForm.memoryMb}
                    onChange={(e) =>
                      setSandboxForm((prev) => ({
                        ...prev,
                        memoryMb: parseInt(e.target.value) || 512,
                      }))
                    }
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl
                                     bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100
                                     focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900
                                     transition-all text-sm outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Custom Container Startup Shell Script
              </label>
              <textarea
                rows={6}
                value={sandboxForm.startupScript}
                onChange={(e) =>
                  setSandboxForm((prev) => ({
                    ...prev,
                    startupScript: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl
                                 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono
                                 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900
                                 transition-all text-xs outline-none"
                placeholder="#!/bin/bash&#10;apt-get update && apt-get install -y git docker.io"
              />
            </div>
          </div>
        )}

        {(lab.labType === "WORKSPACE" || lab.labType === "HPC") && (
          <section className="space-y-5 rounded-2xl border border-blue-200 bg-blue-50/60 p-5 dark:border-blue-900 dark:bg-blue-950/20">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Nhiệm vụ &amp; chấm hoàn thành
              </h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                Mỗi lần sinh viên kiểm tra, kết quả được lưu. Lab hoàn thành khi
                đạt ít nhất 80 điểm và qua mọi nhiệm vụ bắt buộc.
              </p>
            </div>

            <div className="space-y-2">
              {runtimeTasks.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500 dark:border-slate-700">
                  Chưa có nhiệm vụ chấm tự động.
                </p>
              ) : (
                runtimeTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {task.title}
                      </div>
                      <div className="mt-0.5 text-[11px] text-slate-500">
                        {task.verifier_type} · {task.weight} điểm
                        {task.is_required ? " · bắt buộc" : ""}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteRuntimeTask(task.id)}
                      className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                      aria-label={`Xóa ${task.title}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 border-t border-blue-200 pt-5 dark:border-blue-900 md:grid-cols-2">
              <input
                value={runtimeTaskForm.title}
                onChange={(e) =>
                  setRuntimeTaskForm((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                placeholder="Tên nhiệm vụ"
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900"
              />
              <select
                value={runtimeTaskForm.verifierType}
                onChange={(e) =>
                  setRuntimeTaskForm((prev) => ({
                    ...prev,
                    verifierType: e.target.value,
                  }))
                }
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900"
              >
                {lab.labType === "HPC" ? (
                  <>
                    <option value="HPC_JOB_SUBMITTED">Đã gửi Slurm job</option>
                    <option value="HPC_JOB_COMPLETED">
                      Slurm job hoàn tất
                    </option>
                  </>
                ) : (
                  <>
                    <option value="FILE_EXISTS">File tồn tại</option>
                    <option value="FILE_CONTAINS">File chứa nội dung</option>
                    <option value="COMMAND_EXIT">Lệnh chạy thành công</option>
                    <option value="COMMAND_OUTPUT">Output lệnh khớp</option>
                  </>
                )}
              </select>
              <textarea
                value={runtimeTaskForm.description}
                onChange={(e) =>
                  setRuntimeTaskForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Mô tả để sinh viên biết cần làm gì"
                rows={2}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900 md:col-span-2"
              />
              {runtimeTaskForm.verifierType.startsWith("FILE_") && (
                <input
                  value={runtimeTaskForm.path}
                  onChange={(e) =>
                    setRuntimeTaskForm((prev) => ({
                      ...prev,
                      path: e.target.value,
                    }))
                  }
                  placeholder="Đường dẫn trong workspace, ví dụ result/output.txt"
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-mono text-sm dark:border-slate-700 dark:bg-slate-900 md:col-span-2"
                />
              )}
              {runtimeTaskForm.verifierType === "FILE_CONTAINS" && (
                <input
                  value={runtimeTaskForm.contains}
                  onChange={(e) =>
                    setRuntimeTaskForm((prev) => ({
                      ...prev,
                      contains: e.target.value,
                    }))
                  }
                  placeholder="Nội dung file cần chứa"
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-mono text-sm dark:border-slate-700 dark:bg-slate-900 md:col-span-2"
                />
              )}
              {runtimeTaskForm.verifierType.startsWith("COMMAND_") && (
                <textarea
                  value={runtimeTaskForm.command}
                  onChange={(e) =>
                    setRuntimeTaskForm((prev) => ({
                      ...prev,
                      command: e.target.value,
                    }))
                  }
                  placeholder="Lệnh kiểm tra chạy trong container"
                  rows={2}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-mono text-sm dark:border-slate-700 dark:bg-slate-900 md:col-span-2"
                />
              )}
              {runtimeTaskForm.verifierType === "COMMAND_OUTPUT" && (
                <textarea
                  value={runtimeTaskForm.expected}
                  onChange={(e) =>
                    setRuntimeTaskForm((prev) => ({
                      ...prev,
                      expected: e.target.value,
                    }))
                  }
                  placeholder="Output mong đợi (so khớp chính xác sau khi trim)"
                  rows={2}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-mono text-sm dark:border-slate-700 dark:bg-slate-900 md:col-span-2"
                />
              )}
              <input
                type="number"
                min={1}
                max={1000}
                value={runtimeTaskForm.weight}
                onChange={(e) =>
                  setRuntimeTaskForm((prev) => ({
                    ...prev,
                    weight: Number(e.target.value) || 1,
                  }))
                }
                aria-label="Điểm nhiệm vụ"
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900"
              />
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={runtimeTaskForm.isRequired}
                  onChange={(e) =>
                    setRuntimeTaskForm((prev) => ({
                      ...prev,
                      isRequired: e.target.checked,
                    }))
                  }
                />{" "}
                Nhiệm vụ bắt buộc
              </label>
              <button
                type="button"
                onClick={handleAddRuntimeTask}
                disabled={savingRuntimeTask || !runtimeTaskForm.title.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50 md:col-span-2"
              >
                {savingRuntimeTask ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus size={15} />
                )}{" "}
                Thêm nhiệm vụ
              </button>
            </div>
          </section>
        )}

        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="submit"
            disabled={savingSandbox}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow active:scale-95 transition-all disabled:opacity-50"
          >
            {savingSandbox ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save size={15} />
            )}
            Save Sandbox Configurations
          </button>
        </div>
      </form>
    </div>
  );
}
