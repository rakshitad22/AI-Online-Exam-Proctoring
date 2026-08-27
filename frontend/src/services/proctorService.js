import api from './api';

export const analyzeFrame = async (examId, studentId, frameDataBase64) => {
  const response = await api.post('/proctoring/analyze-frame', {
    exam_id: examId,
    student_id: studentId,
    frame_data: frameDataBase64,
    timestamp: Date.now() / 1000,
  });
  return response.data;
};

export const logViolation = async (violationData) => {
  const response = await api.post('/proctoring/violations', violationData);
  return response.data;
};

export const fetchProctoringStatus = async (examId = 'all') => {
  const response = await api.get(`/proctoring/status/${examId}`);
  return response.data;
};

export const fetchViolations = async (examId = null) => {
  const response = await api.get('/proctoring/violations', {
    params: examId ? { exam_id: examId } : {},
  });
  return response.data;
};

export const fetchReportsSummary = async () => {
  const response = await api.get('/reports/summary');
  return response.data;
};

export const fetchAllExams = async () => {
  const response = await api.get('/exams');
  return response.data;
};

export const submitExamAnswers = async (submissionPayload) => {
  const response = await api.post('/exams/submit', submissionPayload);
  return response.data;
};
