import React, { createContext, useState } from 'react';

export const ExamContext = createContext();

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
    setWarningsCount((prev) => prev + 1);
    setViolationsLog((prev) => [
      {
        id: Date.now(),
        type: violation.detected_class || 'Abnormal Activity',
        confidence: violation.confidence || 0.9,
        timestamp: new Date().toLocaleTimeString(),
        message: violation.warning_message || 'Suspicious behavior detected',
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
