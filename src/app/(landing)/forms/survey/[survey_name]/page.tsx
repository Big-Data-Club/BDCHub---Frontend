import { notFound } from "next/navigation";
import SurveyForm from "@/components/form/SurveyForm";

interface PageProps {
  params: Promise<{
    survey_name: string;
  }>;
}

export default async function DynamicSurveyPage({ params }: PageProps) {
  const { survey_name } = await params;
  let formData = null;

  try {
    formData = (await import(`@/data/forms/${survey_name}.json`)).default;
  } catch {
    notFound();
  }

  return <SurveyForm formData={formData} />;
}