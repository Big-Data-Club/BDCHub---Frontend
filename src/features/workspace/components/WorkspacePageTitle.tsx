"use client";
import { useState, useEffect, useRef } from "react";
import type { WorkspacePage } from "../types";
import { WorkspaceErrorBanner } from "./WorkspacePrimitives";
export function WorkspacePageTitle({
  page,
  editable,
  onSave,
}: {
  page: WorkspacePage;
  editable: boolean;
  onSave: (title: string, version: number) => Promise<unknown>;
}) {
  const [value, setValue] = useState(page.title),
    [error, setError] = useState<string | null>(null),
    focused = useRef(false),
    editVersion = useRef(page.version),
    dirty = useRef(false);
  useEffect(() => {
    if (!focused.current && !dirty.current) setValue(page.title);
  }, [page.title]);
  return (
    <>
      <input
        aria-label="Tiêu đề trang"
        readOnly={!editable}
        value={value}
        maxLength={300}
        onFocus={() => {
          focused.current = true;
          editVersion.current = page.version;
        }}
        onChange={(event) => {
          dirty.current = true;
          setValue(event.target.value);
        }}
        onBlur={() => {
          focused.current = false;
          if (dirty.current && value.trim() && value !== page.title)
            void onSave(value.trim(), editVersion.current)
              .then(() => {
                dirty.current = false;
                setError(null);
              })
              .catch((reason) => setError(reason.message));
          else if (!value.trim() || !dirty.current) {
            dirty.current = false;
            setValue(page.title);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
        className="w-full min-w-0 border-0 bg-transparent text-3xl font-bold tracking-tight outline-none sm:text-4xl"
      />
      <WorkspaceErrorBanner
        message={error}
        retry={() =>
          void onSave(value.trim(), page.version)
            .then(() => {
              dirty.current = false;
              setError(null);
            })
            .catch((reason) => setError(reason.message))
        }
      />
    </>
  );
}
