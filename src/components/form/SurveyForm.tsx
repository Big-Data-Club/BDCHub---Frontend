"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  SurveyHeader, 
  SurveyProgress, 
  SurveyFooter, 
  SurveySuccess 
} from './SurveyParts';
import {
  SingleChoiceQuestion, MultipleChoiceQuestion, ShortAnswerQuestion,
  LongAnswerQuestion, NumberQuestion, FillInTheBlankQuestion,
  CodeQuestion, MatchingQuestion, RatingQuestion,
  DateTimeQuestion, EmailQuestion, MatrixQuestion
} from './QuestionComponents';

declare global {
  interface Window {
    storage: {
      get: (key: string, shared?: boolean) => Promise<{ key: string; value: string; shared: boolean } | null>;
      set: (key: string, value: string, shared?: boolean) => Promise<{ key: string; value: string; shared: boolean } | null>;
      delete: (key: string, shared?: boolean) => Promise<{ key: string; deleted: boolean; shared: boolean } | null>;
      list: (prefix?: string, shared?: boolean) => Promise<{ keys: string[]; prefix?: string; shared: boolean } | null>;
    };
  }
}

export default function SurveyForm({ formData }: { formData: any }) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [checkingSubmission, setCheckingSubmission] = useState(true);

  const questions: any[] = formData.questions || [];
  const FORM_SUBMISSION_KEY = `form_submitted_${formData.formId}`;
  const questionsPerPage = 6;
  const totalPages = Math.ceil(questions.length / questionsPerPage);
  const currentQuestions = questions.slice(currentPage * questionsPerPage, (currentPage + 1) * questionsPerPage);

  useEffect(() => {
    const checkSubmissionStatus = async () => {
      try {
        if (typeof window !== 'undefined' && window.storage) {
          const result = await window.storage.get(FORM_SUBMISSION_KEY);
          if (result && result.value === 'true') {
            setHasSubmitted(true);
            setSubmitted(true);
          }
        }
      } catch (e) {
        console.warn("Storage check failed:", e);
      } finally {
        setCheckingSubmission(false);
      }
    };
    checkSubmissionStatus();
  }, [FORM_SUBMISSION_KEY]);

  const handleChange = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const validatePage = () => {
    const newErrors: Record<string, string> = {};
    
    currentQuestions.forEach(q => {
      if (q.required) {
        const answer = answers[q.id];
        if (!answer || (Array.isArray(answer) && answer.length === 0) || (typeof answer === 'object' && !Array.isArray(answer) && Object.keys(answer).length === 0) || answer === '') {
          newErrors[q.id] = 'Câu hỏi này là bắt buộc';
        }
        if (q.type === 'matrix' && typeof answer === 'object' && !Array.isArray(answer)) {
          if (Object.keys(answer).length < (q.rows?.length || 0)) newErrors[q.id] = 'Vui lòng đánh giá tất cả các tiêu chí';
        }
        if (q.type === 'multiple' && Array.isArray(answer) && q.constraints?.minChoices && answer.length < q.constraints.minChoices) {
          newErrors[q.id] = `Vui lòng chọn tối thiểu ${q.constraints.minChoices} mục`;
        }
      }
      if (q.type === 'email' && answers[q.id] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers[q.id])) {
        newErrors[q.id] = 'Email không hợp lệ';
      }
      if (q.type === 'number' && answers[q.id]) {
        const num = parseFloat(answers[q.id]);
        if (q.constraints?.min !== undefined && num < q.constraints.min) newErrors[q.id] = `Tối thiểu là ${q.constraints.min}`;
        if (q.constraints?.max !== undefined && num > q.constraints.max) newErrors[q.id] = `Tối đa là ${q.constraints.max}`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validatePage()) {
      setCurrentPage(prev => Math.min(prev + 1, totalPages - 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      alert('⚠ Vui lòng hoàn thành các câu hỏi bắt buộc trên trang này.');
    }
  };

  const handlePrev = () => {
    setCurrentPage(prev => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validatePage()) {
      alert('⚠ Vui lòng hoàn thành các câu hỏi bắt buộc.');
      return;
    }

    setLoading(true);
    try {
      const submissionData = {
        formId: formData.formId,
        formTitle: formData.formTitle,
        sheetName: formData.sheetName,
        formType: formData.formType,
        questions: questions,
        answers: answers,
        submittedAt: new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'
      };

      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      if (result.success) {
        if (typeof window !== 'undefined' && window.storage) {
          await window.storage.set(FORM_SUBMISSION_KEY, 'true');
        }
        setSubmitted(true);
        setHasSubmitted(true);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('❌ Có lỗi xảy ra khi gửi form. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setAnswers({});
    setErrors({});
    setSubmitted(false);
    setCurrentPage(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderQuestion = (question: any) => {
    const props = { question, value: answers[question.id], onChange: handleChange, error: errors[question.id] };
    switch (question.type) {
      case 'single': return <SingleChoiceQuestion key={question.id} {...props} />;
      case 'multiple': return <MultipleChoiceQuestion key={question.id} {...props} />;
      case 'short': return <ShortAnswerQuestion key={question.id} {...props} />;
      case 'long': return <LongAnswerQuestion key={question.id} {...props} />;
      case 'number': return <NumberQuestion key={question.id} {...props} />;
      case 'rating': return <RatingQuestion key={question.id} {...props} />;
      case 'fillblank': return <FillInTheBlankQuestion key={question.id} {...props} />;
      case 'code': return <CodeQuestion key={question.id} {...props} />;
      case 'matching': return <MatchingQuestion key={question.id} {...props} />;
      case 'date':
      case 'datetime':
      case 'time': return <DateTimeQuestion key={question.id} {...props} />;
      case 'email': return <EmailQuestion key={question.id} {...props} />;
      case 'matrix': return <MatrixQuestion key={question.id} {...props} />;
      default: return null;
    }
  };

  if (checkingSubmission) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (submitted) {
    return <SurveySuccess formData={formData} hasSubmitted={hasSubmitted} handleReset={handleReset} />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      <SurveyHeader title={formData.formTitle} description={formData.formDescription} />
      <SurveyProgress currentPage={currentPage} totalPages={totalPages} />

      <div className="space-y-6">
        {currentQuestions.map(q => renderQuestion(q))}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-10 mb-8 border-t border-slate-200 pt-8">
        <div className="w-full sm:w-auto flex gap-3">
          {currentPage > 0 && (
            <Button onClick={handlePrev} variant="outline" className="w-full sm:w-auto px-6 py-3 border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl font-medium">
              ← Trang trước
            </Button>
          )}
          <Button onClick={handleReset} variant="ghost" className="w-full sm:w-auto text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl">
            Xóa form
          </Button>
        </div>

        {currentPage < totalPages - 1 ? (
          <Button onClick={handleNext} className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm transition-all">
            Trang tiếp theo →
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading} className={`w-full sm:w-auto px-10 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition-all ${loading ? 'opacity-70 cursor-wait' : ''}`}>
            {loading ? 'Đang gửi...' : 'Gửi Khảo Sát'}
          </Button>
        )}
      </div>

      <SurveyFooter />
    </div>
  );
}