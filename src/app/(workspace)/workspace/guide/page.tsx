import { WorkspaceGuide } from "@/features/workspace/components/WorkspaceGuide";
export const metadata = {
  title: "Hướng dẫn editor & LaTeX",
  robots: { index: false, follow: false },
};
export default function WorkspaceGuidePage() {
  return (
    <div className="h-full overflow-y-auto">
      <WorkspaceGuide />
    </div>
  );
}
