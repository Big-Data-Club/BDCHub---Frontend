"use client";
import { useEffect, useState } from "react";
import { workspaceService } from "../api/workspaceService";
import type { DatabaseField, WorkspacePage } from "../types";
export function useRelationOptions(fields: DatabaseField[]) {
  const keys = [
    ...new Set(
      fields
        .filter((field) => field.type === "relation")
        .map((field) => field.relation_page_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ]
    .sort()
    .join(",");
  const [options, setOptions] = useState<Record<string, WorkspacePage[]>>({});
  const [schemas, setSchemas] = useState<Record<string, DatabaseField[]>>({});
  useEffect(() => {
    let cancelled = false;
    setOptions({});
    setSchemas({});
    void Promise.all(
      keys
        .split(",")
        .filter(Boolean)
        .map(async (id) => {
          try {
            const result = await workspaceService.database(id);
            return { id, records: result.records, fields: result.fields };
          } catch {
            return { id, records: [], fields: [] };
          }
        }),
    ).then((results) => {
      if (!cancelled) {
        setOptions(
          Object.fromEntries(results.map((item) => [item.id, item.records])),
        );
        setSchemas(
          Object.fromEntries(results.map((item) => [item.id, item.fields])),
        );
      }
    });
    return () => {
      cancelled = true;
    };
  }, [keys]);
  return { options, schemas };
}
