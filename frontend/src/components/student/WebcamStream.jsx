import React, { useRef, useEffect, useState } from 'react';
import { Camera, ShieldAlert, Mic, MicOff, Volume2 } from 'lucide-react';
import { analyzeFrame, logViolation } from '../../services/proctorService';

export const formatCleanLabel = (rawText) => {
  if (!rawText) return 'Normal Activity';
  const str = String(rawText).toUpperCase();
  if (str.includes('EXTERNAL_DEVICE') || str.includes('MOBILE') || str.includes('PHONE') || str.includes('CV2')) {
    return 'External Device Detected';
  }
  if (str.includes('MULTIPLE_PERSONS') || str.includes('MULTIPLE') || str.includes('PERSONS')) {
    return 'Multiple Persons Detected';
  }
  if (str.includes('HEAD_MOVEMENT') || str.includes('GAZE') || str.includes('HEAD')) {
    return 'Unusual Head Movement';
  }
  if (str.includes('TALKING') || str.includes('BACKGROUND_NOISE') || str.includes('SPEECH') || str.includes('AUDIO')) {
    return 'Talking / Background Noise Detected';
  }
  if (str.includes('NORMAL') || str.includes('CLEAR')) {
    return 'Normal Activity';
  }
  return 'Normal Activity';
};

const WebcamStream = ({ examId, studentId, onWarning }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streamActive, setStreamActive] = useState(false);
  const [aiStatus, setAiStatus] = useState('NORMAL');
  const [currentClass, setCurrentClass] = useState('Normal Activity');
  const [bboxes, setBboxes] = useState([]);
  
  // Audio state
  const [audioLevel, setAudioLevel] = useState(0);
  const [audioWarningActive, setAudioWarningActive] = useState(false);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const audioHistoryRef = useRef([]);
  const lastWarningTimeRef = useRef(0);

  useEffect(() => {
    let intervalId;
    let audioAnimFrameId;
    let streamInstance = null;

    const startMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
          audio: true,
        });

        streamInstance = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setStreamActive(true);
        }

        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          const audioCtx = new AudioContextClass();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);
          analyserRef.current = analyser;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);

          const monitorAudio = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteTimeDomainData(dataArray);

            let sumSquares = 0;
            for (let i = 0; i < dataArray.length; i++) {
              const normalized = (dataArray[i] - 128) / 128.0;
              sumSquares += normalized * normalized;
            }
            const rms = Math.sqrt(sumSquares / dataArray.length);
            const levelPct = Math.min(100, Math.round(rms * 250));
            setAudioLevel(levelPct);

            if (rms > 0.28) {
              audioHistoryRef.current.push(Date.now());
            } else {
              audioHistoryRef.current = audioHistoryRef.current.filter((t) => Date.now() - t < 1500);
            }

            const now = Date.now();
            if (audioHistoryRef.current.length > 14 && now - lastWarningTimeRef.current > 4000) {
              lastWarningTimeRef.current = now;
              setAudioWarningActive(true);
              setAiStatus('SUSPICIOUS');
              setCurrentClass('Talking / Background Noise Detected');

              logViolation({
                exam_id: examId,
                student_id: studentId,
                violation_type: 'BACKGROUND_NOISE',
                severity: 'MEDIUM',
                confidence: 0.88,
                details: 'Talking or abnormal audio activity detected',
              }).catch(() => {});

              if (onWarning) {
                onWarning({
                  activity: 'BACKGROUND_NOISE',
                  detected_class: 'Talking / Background Noise Detected',
                  warning_message: 'Talking / Background Noise Detected',
                  warning_triggered: true,
                  confidence: 0.88,
                });
              }

              audioHistoryRef.current = [];
              setTimeout(() => setAudioWarningActive(false), 4000);
            }

            audioAnimFrameId = requestAnimationFrame(monitorAudio);
          };

          audioAnimFrameId = requestAnimationFrame(monitorAudio);
        }
      } catch (err) {
        console.error('Webcam/Microphone permission error:', err);
        setAiStatus('ERROR');
      }
    };

    startMedia();

    // Frame sampling every 2.5 seconds
    intervalId = setInterval(async () => {
      if (videoRef.current && canvasRef.current && streamActive) {
        const canvas = canvasRef.current;
        const video = videoRef.current;

        if (video.videoWidth === 0 || video.videoHeight === 0) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const frameData = canvas.toDataURL('image/jpeg', 0.6);

        try {
          const res = await analyzeFrame(examId, studentId, frameData);
          const cleanName = formatCleanLabel(res.detected_class || res.activity);
          setCurrentClass(cleanName);
          setBboxes(res.detections || res.bounding_boxes || []);

          const now = Date.now();
          if ((res.is_violation || res.is_suspicious) && now - lastWarningTimeRef.current > 4000) {
            lastWarningTimeRef.current = now;
            setAiStatus('SUSPICIOUS');
            if (onWarning) {
              onWarning({
                ...res,
                detected_class: cleanName,
                warning_triggered: true,
              });
            }
          } else if (!audioWarningActive && now - lastWarningTimeRef.current > 4000) {
            setAiStatus('NORMAL');
          }
        } catch (err) {
          console.warn('Proctor frame API call fallback');
        }
      }
    }, 2500);

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (audioAnimFrameId) cancelAnimationFrame(audioAnimFrameId);
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
      if (streamInstance) {
        streamInstance.getTracks().forEach((track) => track.stop());
      }
    };
  }, [examId, studentId, streamActive]);

  return (
    <div className="glass-card rounded-2xl p-4 border border-slate-800 relative overflow-hidden space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Camera className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold text-slate-200">Live AI Video & Audio Proctor</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                aiStatus === 'SUSPICIOUS' ? 'bg-rose-400 opacity-75' : 'bg-emerald-400 opacity-75'
              }`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                aiStatus === 'SUSPICIOUS' ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
            ></span>
          </span>
          <span
            className={`text-[10px] font-extrabold uppercase tracking-wider ${
              aiStatus === 'SUSPICIOUS' ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {aiStatus === 'SUSPICIOUS' ? 'FLAGGED' : 'PROCTORING LIVE'}
          </span>
        </div>
      </div>

      {/* Video Container */}
      <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-video flex items-center justify-center border border-slate-800">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover transform -scale-x-100"
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* AI Bounding Boxes Overlay */}
        {bboxes.map((box, idx) => {
          const cleanBoxLabel = formatCleanLabel(box.label);
          return (
            <div
              key={idx}
              className="absolute border-2 border-rose-500 bg-rose-500/10 pointer-events-none rounded transition-all"
              style={{
                left: `${box.x1 * 100}%`,
                top: `${box.y1 * 100}%`,
                width: `${(box.x2 - box.x1) * 100}%`,
                height: `${(box.y2 - box.y1) * 100}%`,
              }}
            >
              <span className="absolute -top-6 left-0 px-1.5 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold shadow whitespace-nowrap">
                {cleanBoxLabel} ({(box.confidence * 100).toFixed(0)}%)
              </span>
            </div>
          );
        })}

        {!streamActive && (
          <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-4 text-center">
            <Camera className="w-8 h-8 text-indigo-400 mb-2 animate-bounce" />
            <p className="text-xs text-slate-300 font-medium">Requesting camera & mic access...</p>
            <p className="text-[10px] text-slate-500 mt-1">Allow permissions to begin proctored exam</p>
          </div>
        )}
      </div>

      {/* Live Audio Level Meter Bar */}
      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center space-x-1.5">
            <Volume2 className={`w-3.5 h-3.5 ${audioLevel > 50 ? 'text-amber-400' : 'text-slate-400'}`} />
            <span className="text-slate-300 font-medium">Microphone RMS Level:</span>
          </div>
          <span
            className={`font-mono font-bold text-[10px] ${
              audioLevel > 60 ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {audioLevel}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-100 ${
              audioLevel > 60
                ? 'bg-rose-500'
                : audioLevel > 35
                ? 'bg-amber-400'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${audioLevel}%` }}
          />
        </div>
      </div>

      {/* Live AI Status Bar */}
      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-indigo-400" />
          <span className="text-slate-400">Class:</span>
          <span className="font-semibold text-slate-200">{currentClass}</span>
        </div>
        <span className="text-[10px] text-indigo-400 font-medium">Auto sampling active</span>
      </div>
    </div>
  );
};

export default WebcamStream;
