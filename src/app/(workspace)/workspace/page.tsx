import { Suspense } from 'react';
import { WorkspaceClient } from '@/features/workspace/components/WorkspaceClient';
import { WorkspaceLoading } from '@/features/workspace/components/WorkspacePrimitives';

export const metadata = { title: 'Workspace', robots: { index: false, follow: false } };
export default function WorkspacePage() { return <Suspense fallback={<WorkspaceLoading />}><WorkspaceClient /></Suspense>; }
