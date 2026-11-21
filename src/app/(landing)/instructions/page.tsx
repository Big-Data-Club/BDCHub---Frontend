import { permanentRedirect } from "next/navigation";

export default function LegacyInstructionsPage() {
  permanentRedirect("/projects/bdchub");
}
