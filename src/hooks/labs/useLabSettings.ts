"use client";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import type { Lab, LabLevel } from "@/types/labs/lab";
import { labService } from "@/services/labs/labService";
import { useRouter } from "@/lib/tenant/navigation";
import toast from "react-hot-toast";

export function useLabSettings(labId: number, enabled: boolean) {
  const router = useRouter();
  const request = useRef<AbortController | null>(null);
  const [lab, setLab] = useState<Lab | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [savingSandbox, setSavingSandbox] = useState(false);
  const [generalForm, setGeneralForm] = useState({
    title: "",
    description: "",
    category: "",
    level: "BEGINNER" as LabLevel,
    maxSessionDurationMin: 120,
    maxConcurrentSessions: 50,
  });

  const [sandboxForm, setSandboxForm] = useState({
    computeBackend: "K8S",
    dockerImage: "ubuntu:22.04",
    cpuCores: 0.5,
    memoryMb: 512,
    startupScript: "",
    allowedPorts: [] as number[],
    portsInput: "",
    supportedLanguages: [] as string[],
    starterCode: {} as Record<string, string>,
    dbType: "POSTGRESQL",
    schemaSql: "",
    seedSql: "",
    hpcProfileId: "",
    slurmPartition: "",
    slurmAccount: "",
    slurmQos: "",
    slurmMaxTime: "01:00:00",
    maxNodes: 1,
    maxTasks: 1,
    maxCpusPerTask: 1,
    maxMemoryMb: 512,
    maxGpuCount: 0,
  });

  const fetchLabDetails = useCallback(async () => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    try {
      setLoading(true);
      const res = await labService.getAuthoringLab(labId, controller.signal);
      if (controller.signal.aborted) return;
      if (res.data) {
        setLab(res.data);
        setGeneralForm({
          title: res.data.title,
          description: res.data.description || "",
          category: res.data.category || "",
          level: res.data.level || "BEGINNER",
          maxSessionDurationMin: res.data.maxSessionDurationMin || 120,
          maxConcurrentSessions: res.data.maxConcurrentSessions || 50,
        });

        const runtime = res.data.runtimeConfig || {};
        setSandboxForm({
          computeBackend: runtime.compute_backend || "K8S",
          dockerImage: runtime.docker_image || "ubuntu:22.04",
          cpuCores: runtime.cpu_cores || 0.5,
          memoryMb: runtime.memory_mb || 512,
          startupScript: runtime.startup_script || "",
          allowedPorts: runtime.allowed_ports || [],
          portsInput: (runtime.allowed_ports || []).join(", "),
          supportedLanguages: runtime.supported_languages || [],
          starterCode: runtime.starter_code || {},
          dbType: runtime.db_type || "POSTGRESQL",
          schemaSql: runtime.schema_sql || "",
          seedSql: runtime.seed_sql || "",
          hpcProfileId: runtime.hpc_profile_id || "",
          slurmPartition: runtime.slurm_partition || "",
          slurmAccount: runtime.slurm_account || "",
          slurmQos: runtime.slurm_qos || "",
          slurmMaxTime: runtime.slurm_max_time || "01:00:00",
          maxNodes: runtime.max_nodes || 1,
          maxTasks: runtime.max_tasks || 1,
          maxCpusPerTask: runtime.max_cpus_per_task || 1,
          maxMemoryMb: runtime.max_memory_mb || 512,
          maxGpuCount: runtime.max_gpu_count || 0,
        });
      }
    } catch {
      if (controller.signal.aborted) return;
      toast.error("Failed to load virtual lab details.");
      router.push("/labs/manage");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [labId, router]);
  const handleSandboxSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!lab) return;
    try {
      setSavingSandbox(true);

      const parsedPorts = sandboxForm.portsInput
        .split(",")
        .map((p) => parseInt(p.trim()))
        .filter((p) => !isNaN(p));

      const updatedConfig = {
        ...lab.runtimeConfig,
        compute_backend: sandboxForm.computeBackend,
        docker_image: sandboxForm.dockerImage,
        cpu_cores: parseFloat(sandboxForm.cpuCores.toString()) || 0.5,
        memory_mb: parseInt(sandboxForm.memoryMb.toString()) || 512,
        startup_script: sandboxForm.startupScript,
        allowed_ports: parsedPorts,
        supported_languages: sandboxForm.supportedLanguages,
        starter_code: sandboxForm.starterCode,
        db_type: sandboxForm.dbType,
        schema_sql: sandboxForm.schemaSql,
        seed_sql: sandboxForm.seedSql,
        hpc_profile_id: sandboxForm.hpcProfileId,
        slurm_partition: sandboxForm.slurmPartition,
        slurm_account: sandboxForm.slurmAccount,
        slurm_qos: sandboxForm.slurmQos,
        slurm_max_time: sandboxForm.slurmMaxTime,
        max_nodes: Number(sandboxForm.maxNodes) || 1,
        max_tasks: Number(sandboxForm.maxTasks) || 1,
        max_cpus_per_task: Number(sandboxForm.maxCpusPerTask) || 1,
        max_memory_mb: Number(sandboxForm.maxMemoryMb) || 512,
        max_gpu_count: Number(sandboxForm.maxGpuCount) || 0,
      };

      await labService.updateLab(labId, {
        title: generalForm.title,
        description: generalForm.description,
        category: generalForm.category,
        level: generalForm.level,
        maxSessionDurationMin: generalForm.maxSessionDurationMin,
        maxConcurrentSessions: generalForm.maxConcurrentSessions,
        runtimeConfig: updatedConfig,
      });

      toast.success("Sandbox & Runtime configuration updated!");
      await fetchLabDetails();
    } catch {
      toast.error("Failed to update sandbox configurations.");
    } finally {
      setSavingSandbox(false);
    }
  };

  const handleGeneralSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!lab) return;
    try {
      setSavingGeneral(true);
      await labService.updateLab(labId, {
        title: generalForm.title,
        description: generalForm.description,
        category: generalForm.category,
        level: generalForm.level,
        maxSessionDurationMin: generalForm.maxSessionDurationMin,
        maxConcurrentSessions: generalForm.maxConcurrentSessions,
      });
      toast.success("General configurations updated!");
      await fetchLabDetails();
    } catch {
      toast.error("Failed to update general configurations.");
    } finally {
      setSavingGeneral(false);
    }
  };

  useEffect(() => {
    if (enabled && labId) void fetchLabDetails();
    return () => request.current?.abort();
  }, [enabled, labId, fetchLabDetails]);
  return {
    lab,
    loading,
    generalForm,
    setGeneralForm,
    sandboxForm,
    setSandboxForm,
    savingGeneral,
    savingSandbox,
    fetchLabDetails,
    handleGeneralSubmit,
    handleSandboxSubmit,
  };
}
