'use client';
import { useParams } from '@/lib/tenant/navigation';
import { LabEditorView } from '@/components/labs/editor/LabEditorView';

export default function LabEditPage() {
  const { labId } = useParams<{ labId: string }>();
  return <LabEditorView key={labId} labId={Number(labId)} />;
}
