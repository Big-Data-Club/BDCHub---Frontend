import { NextRequest, NextResponse } from 'next/server';
import { GOOGLE_SCRIPT_URL } from '@/constants';

const RECRUITMENT_FORM_ID = 'bdc-recruitment-2026-participant';

async function queueRecruitmentConfirmation(body: Record<string, unknown>) {
  const answers = body.answers as Record<string, unknown> | undefined;
  const email = typeof answers?.email_confirmation === 'string' ? answers.email_confirmation.trim() : '';
  const fullName = typeof answers?.full_name === 'string' ? answers.full_name.trim() : '';
  const department = typeof answers?.department === 'string' ? answers.department.trim() : '';
  const wantsConfirmation = answers?.send_copy === 'Có';
  const backendUrl = process.env.BACKEND_URL;
  const internalSecret = process.env.AI_SERVICE_SECRET;

  if (!wantsConfirmation) return false;

  if (!email || !fullName || !backendUrl || !internalSecret) {
    console.warn('Recruitment confirmation was not queued: required mail configuration or applicant fields are missing.');
    return false;
  }

  try {
    const response = await fetch(`${backendUrl}/api/internal/recruitment/confirmation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Service-Secret': internalSecret,
      },
      body: JSON.stringify({ email, fullName, department }),
      signal: AbortSignal.timeout(8_000),
    });

    if (!response.ok) {
      console.error('Recruitment confirmation service rejected the request:', response.status);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Unable to queue recruitment confirmation email:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.formId || !body.answers) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Send to Google Sheets
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...body,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google Script error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });

      throw new Error(`Failed to submit to Google Sheets: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    const confirmationEmailQueued = body.formId === RECRUITMENT_FORM_ID
      ? await queueRecruitmentConfirmation(body)
      : false;

    return NextResponse.json({
      success: true,
      message: 'Form submitted successfully',
      data,
      confirmationEmailQueued,
    });

  } catch (error) {
    console.error('Form submission error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Form submission API is running',
    timestamp: new Date().toISOString()
  });
}
