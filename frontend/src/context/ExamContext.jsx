import React, { createContext, useState } from 'react';

export const ExamContext = createContext();

const formatCleanViolationInfo = (violation) => {
  const raw = String(violation.detected_class || violation.activity || violation.type || '').toUpperCase();
  
  if (raw.includes('EXTERNAL_DEVICE') || raw.includes('MOBILE') || raw.includes('PHONE')) {
    return {
      type: 'External Device Detected',
      message: 'Mobile phone / external device detected',
    };
  }
  if (raw.includes('MULTIPLE_PERSONS') || raw.includes('MULTIPLE') || raw.includes('PERSONS')) {
    return {
      type: 'Multiple Persons Detected',
      message: 'More than one person detected',
    };
  }
  if (raw.includes('HEAD_MOVEMENT') || raw.includes('HEAD')) {
    return {
      type: 'Unusual Head Movement',
      message: 'Unusual head movement detected',
    };
  }
  if (raw.includes('TALKING') || raw.includes('BACKGROUND_NOISE') || raw.includes('AUDIO')) {
    return {
      type: 'Talking / Background Noise Detected',
      message: 'Talking or abnormal audio detected',
    };
  }
  return {
    type: 'Normal Activity Detected',
    message: 'Normal examination activity',
  };
};

export const ExamProvider = ({ children }) => {
  const [activeExam, setActiveExam] = useState(null);
  const [warningsCount, setWarningsCount] = useState(0);
  const [violationsLog, setViolationsLog] = useState([]);
  const [examStatus, setExamStatus] = useState('NOT_STARTED'); // NOT_STARTED, IN_PROGRESS, SUBMITTED

  const resetExamState = () => {
    setActiveExam(null);
    setWarningsCount(0);
    setViolationsLog([]);
    setExamStatus('NOT_STARTED');
  };

  const addWarning = (violation) => {
    const cleanInfo = formatCleanViolationInfo(violation);
    setWarningsCount((prev) => prev + 1);
    setViolationsLog((prev) => [
      {
        id: Date.now(),
        type: cleanInfo.type,
        confidence: violation.confidence || 0.9,
        timestamp: new Date().toLocaleTimeString(),
        message: violation.warning_message || cleanInfo.message,
      },
      ...prev,
    ]);
  };

  return (
    <ExamContext.Provider
      value={{
        activeExam,
        setActiveExam,
        warningsCount,
        setWarningsCount,
        violationsLog,
        addWarning,
        examStatus,
        setExamStatus,
        resetExamState,
      }}
    >
      {children}
    </ExamContext.Provider>
  );
};
