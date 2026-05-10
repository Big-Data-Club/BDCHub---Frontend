import { useCallback, useEffect, useState } from "react";
import {
  llmConfigService,
  type LlmApiKey,
  type LlmBinding,
  type LlmCatalogue,
  type LlmModel,
  type LlmProvider,
} from "@/services/llmConfigService";

export interface LlmConfigState {
  catalogue: LlmCatalogue | null;
  providers: LlmProvider[];
  models: LlmModel[];
  keys: LlmApiKey[];
  bindings: LlmBinding[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useLlmConfig(): LlmConfigState {
  const [catalogue, setCatalogue] = useState<LlmCatalogue | null>(null);
  const [providers, setProviders] = useState<LlmProvider[]>([]);
  const [models, setModels] = useState<LlmModel[]>([]);
  const [keys, setKeys] = useState<LlmApiKey[]>([]);
  const [bindings, setBindings] = useState<LlmBinding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cat, provs, mods, ks, binds] = await Promise.all([
        llmConfigService.getCatalogue(),
        llmConfigService.listProviders(),
        llmConfigService.listModels(),
        llmConfigService.listApiKeys(),
        llmConfigService.listBindings(),
      ]);
      setCatalogue(cat);
      setProviders(provs);
      setModels(mods);
      setKeys(ks);
      setBindings(binds);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { catalogue, providers, models, keys, bindings, loading, error, refresh };
}