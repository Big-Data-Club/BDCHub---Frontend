import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.error) redirect('/login');
  return <div className="flex h-dvh min-h-0 flex-col bg-white text-slate-900 dark:bg-lms-bg dark:text-slate-100"><div className="shrink-0 md:hidden"><MobileNav /></div><div className="flex min-h-0 flex-1"><Sidebar /><div className="min-w-0 flex-1">{children}</div></div></div>;
}
