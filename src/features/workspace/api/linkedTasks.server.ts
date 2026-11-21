import type { Session } from "next-auth";
export interface LinkedTask {
  id: number;
  title: string;
  columnId: string;
  priority: string;
  endDate?: string;
}
interface TaskResponse extends LinkedTask {
  createdBy?: { id: number };
  assignees?: { id: number }[];
}
export async function readableTasks(session: Session): Promise<LinkedTask[]> {
  const response = await fetch(
    `${process.env.BACKEND_URL || "http://backend:8080"}/api/tasks`,
    {
      headers: { Authorization: `Bearer ${session.accessToken}` },
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(15000),
    },
  );
  if (!response.ok) throw Error("Tasks unavailable");
  const tasks = (await response.json()) as TaskResponse[];
  return tasks
    .filter(
      (task) =>
        session.user.role === "ROLE_ADMIN" ||
        String(task.createdBy?.id) === String(session.user.id) ||
        task.assignees?.some(
          (member) => String(member.id) === String(session.user.id),
        ),
    )
    .slice(0, 500)
    .map(({ id, title, columnId, priority, endDate }) => ({
      id,
      title,
      columnId,
      priority,
      endDate,
    }));
}
