import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { tenantPath } from "./paths";

export async function tenantRedirect(path: string): Promise<never> {
  const candidate = (await headers()).get("x-bdc-tenant");
  const slug = candidate && /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,99}$/.test(candidate) ? candidate : undefined;
  redirect(tenantPath(path, slug));
}
