import { Metadata } from "next";
import { notFound } from "next/navigation";
import SurveyForm from "@/components/form/SurveyForm";

interface PageProps {
  params: Promise<{
    survey_name: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { survey_name } = await params;
  try {
    const formData = (await import(`@/data/forms/${survey_name}.json`)).default;
    return {
      title: `${formData.title}`,
      description: formData.description || "Khảo sát ý kiến từ Big Data Club - HCMUT.",
      alternates: {
        canonical: `/forms/survey/${survey_name}`,
      },
      openGraph: {
        title: `${formData.title} | BDC Hub`,
        description: formData.description || "Tham gia đóng góp ý kiến thông qua khảo sát trực tuyến.",
      }
    };
  } catch {
    return {
      title: "Khảo sát",
    };
  }
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