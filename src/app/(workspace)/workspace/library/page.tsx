import { Suspense } from "react";
import { WorkspaceLibrary } from "@/features/workspace/components/library/WorkspaceLibrary";
import { WorkspaceLoading } from "@/features/workspace/components/WorkspacePrimitives";
export const metadata = {
  title: "Thư viện · Workspace",
  robots: { index: false, follow: false },
};
export default function WorkspaceLibraryPage() {
  return (
    <Suspense fallback={<WorkspaceLoading />}>
      <WorkspaceLibrary />
    </Suspense>
  );
}
