import { permanentRedirect } from "next/navigation";

export default function LegacyInstructionPage() {
  permanentRedirect("/projects/bdchub");
}
