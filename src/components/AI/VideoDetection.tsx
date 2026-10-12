import React, { useState, useRef, useEffect, useCallback } from 'react';

interface DetectionBBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface DetectionItem {
  id: number;
  class_id: number;
  class_name: string;
  confidence: number;
  bbox: DetectionBBox;
  center?: { x: number; y: number };
  area?: number;
}

interface FrameDetectionResponse {
  success: boolean;
  detections: DetectionItem[];
  vehicle_counts: Record<string, number>;
  total_vehicles: number;
  total_pcu_weight: number;
  recommended_green_time: number;
  congestion_level: 'low' | 'medium' | 'high' | 'critical';
  inference_time_ms: number;
  frame_width: number;
  frame_height: number;
  timestamp: string;
}

interface VideoAnalysis {
  video_info: {
    total_frames: number;
    video_fps: number;
    width: number;
    height: number;
    duration: number;
    processed_frames: number;
  };
  processing_summary: {
    total_frames_processed: number;
    total_detections: number;
    average_detections_per_frame: number;
    average_processing_time: number;
    processing_fps: number;
  };
  vehicle_analysis: {
    total_counts: {
      car: number;
      motorcycle: number;
      bus: number;
      truck: number;
      bicycle: number;
      person: number;
    };
    dominant_vehicle_type: string;
    vehicle_distribution: Record<string, number>;
  };
  quality_metrics: {
    average_confidence: number;
    high_confidence_detections: number;
    detection_quality: string;
  };
  density_analysis: {
    most_common_density: string;
    congestion_percentage: number;
  };
}

const CLASS_THEMES: Record<string, { stroke: string; bg: string; text: string; icon: string }> = {
  car: { stroke: '#06b6d4', bg: 'rgba(6, 182, 212, 0.9)', text: '#06b6d4', icon: '🚗' },
  truck: { stroke: '#f59e0b', bg: 'rgba(245, 158, 11, 0.9)', text: '#f59e0b', icon: '🚛' },
  bus: { stroke: '#10b981', bg: 'rgba(16, 185, 129, 0.9)', text: '#10b981', icon: '🚌' },
  motorcycle: { stroke: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.9)', text: '#8b5cf6', icon: '🏍️' },
  bicycle: { stroke: '#3b82f6', bg: 'rgba(59, 130, 246, 0.9)', text: '#3b82f6', icon: '🚲' },
  person: { stroke: '#f43f5e', bg: 'rgba(244, 63, 94, 0.9)', text: '#f43f5e', icon: '🚶' },
  auto_rickshaw: { stroke: '#eab308', bg: 'rgba(234, 179, 8, 0.9)', text: '#eab308', icon: '🛺' }
};

const API_BASE = 'http://127.0.0.1:8000';

const SAMPLE_VIDEOS = [
  {
    name: 'Highway Traffic (User Uploaded)',
    url: `${API_BASE}/uploads/video_20261012_204739_188613-883402208.mp4`,
    badge: 'Uploaded MP4'
  },
  {
    name: 'Urban Intersection Sample',
    url: `${API_BASE}/uploads/video_20261012_200719_video.mp4`,
    badge: 'Sample Video'
  }
];

export const VideoDetection: React.FC = () => {
  // Backend direct health polling
  const [isBackendConnected, setIsBackendConnected] = useState(true);

  // Left card: Video playback & detection state
  const [videoPreview, setVideoPreview] = useState<string>(SAMPLE_VIDEOS[0].url);
  const [videoFileName, setVideoFileName] = useState<string>('188613-883402208.mp4');
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Left card: Controls & metrics
  const [leftDetectEnabled, setLeftDetectEnabled] = useState(true);
  const [leftConfidence, setLeftConfidence] = useState(0.28);
  const [leftShowLabels, setLeftShowLabels] = useState(true);
  const [leftShowCrosshairs, setLeftShowCrosshairs] = useState(true);
  const [leftFrame, setLeftFrame] = useState<FrameDetectionResponse | null>(null);

  // Right card: Live Stream state & controls
  const [streamSource, setStreamSource] = useState<'video_sim' | 'webcam'>('video_sim');
  const [isLiveStreaming, setIsLiveStreaming] = useState(false);
  const [streamDetectEnabled, setStreamDetectEnabled] = useState(true);
  const [streamConfidence, setStreamConfidence] = useState(0.25);
  const [streamShowLabels, setStreamShowLabels] = useState(true);
  const [streamShowCrosshairs, setStreamShowCrosshairs] = useState(true);
  const [streamFrameData, setStreamFrameData] = useState<FrameDetectionResponse | null>(null);

  // Refs for left video
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const leftOffscreenRef = useRef<HTMLCanvasElement | null>(null);
  const leftDetectingRef = useRef<boolean>(false);
  const leftLastTimeRef = useRef<number>(0);
  const leftAnimIdRef = useRef<number | null>(null);

  // Refs for right Live Stream
  const streamVideoRef = useRef<HTMLVideoElement>(null);
  const streamCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamOffscreenRef = useRef<HTMLCanvasElement | null>(null);
  const streamStreamRef = useRef<MediaStream | null>(null);
  const streamDetectingRef = useRef<boolean>(false);
  const streamLastTimeRef = useRef<number>(0);
  const streamAnimIdRef = useRef<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // -------------------------------------------------------------
  // Backend Heartbeat Check
  // -------------------------------------------------------------
  useEffect(() => {
    let active = true;
    const checkBackend = async () => {
      try {
        const res = await fetch(`${API_BASE}/health`);
        if (active) setIsBackendConnected(res.ok);
      } catch {
        if (active) setIsBackendConnected(false);
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 3500);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // -------------------------------------------------------------
  // Precise Letterbox-Aware Canvas Bounding Box Renderer
  // -------------------------------------------------------------
  const drawDetections = useCallback((
    canvas: HTMLCanvasElement,
    video: HTMLVideoElement,
    detections: DetectionItem[],
    frameW: number,
    frameH: number,
    options: {
      showLabels: boolean;
      showCrosshairs: boolean;
      title: string;
      vehicles?: number;
      latencyMs?: number;
      congestion?: string;
      recGreen?: number;
    }
  ) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get actual container dimensions
    const containerW = canvas.clientWidth || video.clientWidth || 640;
    const containerH = canvas.clientHeight || video.clientHeight || 360;

    if (canvas.width !== containerW || canvas.height !== containerH) {
      canvas.width = containerW;
      canvas.height = containerH;
    }

    ctx.clearRect(0, 0, containerW, containerH);

    // Calculate exact video render rect inside container (handling letterbox if any)
    const vidW = frameW > 0 ? frameW : (video.videoWidth || 640);
    const vidH = frameH > 0 ? frameH : (video.videoHeight || 360);
    const vidAspect = vidW / vidH;
    const containerAspect = containerW / containerH;

    let renderW = containerW;
    let renderH = containerH;
    let offsetX = 0;
    let offsetY = 0;

    if (Math.abs(containerAspect - vidAspect) > 0.02) {
      if (containerAspect > vidAspect) {
        renderW = containerH * vidAspect;
        offsetX = (containerW - renderW) / 2;
      } else {
        renderH = containerW / vidAspect;
        offsetY = (containerH - renderH) / 2;
      }
    }

    // Render each detection
    detections.forEach((det) => {
      const clsKey = det.class_name?.toLowerCase() || 'car';
      const theme = CLASS_THEMES[clsKey] || CLASS_THEMES.car;
      const { x1, y1, x2, y2 } = det.bbox;

      // Perfectly scaled and offset coordinates
      const bx = offsetX + (x1 / vidW) * renderW;
      const by = offsetY + (y1 / vidH) * renderH;
      const bw = ((x2 - x1) / vidW) * renderW;
      const bh = ((y2 - y1) / vidH) * renderH;

      ctx.save();
      // Glowing neon stroke
      ctx.shadowColor = theme.stroke;
      ctx.shadowBlur = 10;
      ctx.strokeStyle = theme.stroke;
      ctx.lineWidth = 2.5;

      ctx.fillStyle = theme.stroke + '20';
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeRect(bx, by, bw, bh);

      // Cyberpunk corner brackets
      const corner = Math.min(12, bw / 3, bh / 3);
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#ffffff';

      ctx.beginPath();
      ctx.moveTo(bx, by + corner);
      ctx.lineTo(bx, by);
      ctx.lineTo(bx + corner, by);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(bx + bw - corner, by);
      ctx.lineTo(bx + bw, by);
      ctx.lineTo(bx + bw, by + corner);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(bx, by + bh - corner);
      ctx.lineTo(bx, by + bh);
      ctx.lineTo(bx + corner, by + bh);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(bx + bw - corner, by + bh);
      ctx.lineTo(bx + bw, by + bh);
      ctx.lineTo(bx + bw, by + bh - corner);
      ctx.stroke();

      // Center crosshair / tracking dot
      if (options.showCrosshairs) {
        const cx = bx + bw / 2;
        const cy = by + bh / 2;
        ctx.fillStyle = theme.stroke;
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Class badge
      if (options.showLabels) {
        const label = `${theme.icon} ${det.class_name.toUpperCase()} ${(det.confidence * 100).toFixed(0)}%`;
        ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
        const textMetrics = ctx.measureText(label);
        const textW = textMetrics.width;
        const pad = 6;
        const labelH = 18;
        const badgeY = Math.max(offsetY, by - labelH - 2);

        ctx.fillStyle = theme.bg;
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(bx, badgeY, textW + pad * 2, labelH, 4) : ctx.fillRect(bx, badgeY, textW + pad * 2, labelH);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.fillText(label, bx + pad, badgeY + 13);
      }

      ctx.restore();
    });

    // Top-left HUD badge overlay directly on canvas
    if (options.vehicles !== undefined) {
      ctx.save();
      const hudX = Math.max(14, offsetX + 10);
      const hudY = Math.max(14, offsetY + 10);
      const hudW = 210;
      const hudH = 54;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.90)';
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(hudX, hudY, hudW, hudH, 8) : ctx.fillRect(hudX, hudY, hudW, hudH);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(hudX + 16, hudY + 18, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px system-ui';
      ctx.fillText(options.title, hudX + 28, hudY + 22);

      ctx.font = 'bold 13px system-ui';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`🚗 In Frame: ${options.vehicles} vehicles`, hudX + 14, hudY + 42);

      if (options.latencyMs) {
        ctx.font = '10px system-ui';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`⚡ ${options.latencyMs}ms`, hudX + 160, hudY + 42);
      }

      // Top right signal timing recommendation
      if (options.recGreen !== undefined) {
        const sigW = 160;
        const sigX = Math.min(containerW - sigW - 14, offsetX + renderW - sigW - 10);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.90)';
        ctx.strokeStyle = '#10b981';
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(sigX, hudY, sigW, hudH, 8) : ctx.fillRect(sigX, hudY, sigW, hudH);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 11px system-ui';
        ctx.fillText('🚦 SIGNAL TIMING', sigX + 14, hudY + 20);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px system-ui';
        ctx.fillText(`Allocated Green: ${options.recGreen}s`, sigX + 14, hudY + 42);
      }

      ctx.restore();
    }
  }, []);

  // -------------------------------------------------------------
  // Left Card: Frame Capture & Detection
  // -------------------------------------------------------------
  const captureAndDetectLeft = useCallback(async (force = false) => {
    const video = videoRef.current;
    if (!video || (!force && (video.paused || video.ended || !leftDetectEnabled))) return;
    if (leftDetectingRef.current) return;

    const now = Date.now();
    if (!force && now - leftLastTimeRef.current < 55) return;
    leftLastTimeRef.current = now;

    const vidW = video.videoWidth;
    const vidH = video.videoHeight;
    if (!vidW || !vidH) return;

    leftDetectingRef.current = true;
    try {
      if (!leftOffscreenRef.current) {
        leftOffscreenRef.current = document.createElement('canvas');
      }
      const off = leftOffscreenRef.current;
      const targetW = Math.min(vidW, 480);
      const targetH = Math.round(targetW * (vidH / vidW));
      off.width = targetW;
      off.height = targetH;
      const offCtx = off.getContext('2d');
      if (!offCtx) return;

      offCtx.drawImage(video, 0, 0, targetW, targetH);
      const frameDataUrl = off.toDataURL('image/jpeg', 0.55);

      const response = await fetch(`${API_BASE}/api/detect-frame`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: frameDataUrl,
          confidence: leftConfidence
        })
      });

      if (!response.ok) return;

      const data: FrameDetectionResponse = await response.json();
      if (data.success && canvasRef.current && videoRef.current) {
        setLeftFrame(data);
        drawDetections(
          canvasRef.current,
          videoRef.current,
          data.detections,
          data.frame_width,
          data.frame_height,
          {
            showLabels: leftShowLabels,
            showCrosshairs: leftShowCrosshairs,
            title: 'LIVE AI DETECTION',
            vehicles: data.total_vehicles,
            latencyMs: data.inference_time_ms,
            congestion: data.congestion_level,
            recGreen: data.recommended_green_time
          }
        );
      }
    } catch (err) {
      console.warn('Left detect error:', err);
    } finally {
      leftDetectingRef.current = false;
    }
  }, [drawDetections, leftConfidence, leftDetectEnabled, leftShowCrosshairs, leftShowLabels]);

  // Left card playback animation frame loop
  useEffect(() => {
    let active = true;
    const loop = () => {
      if (!active) return;
      captureAndDetectLeft(false);
      leftAnimIdRef.current = requestAnimationFrame(loop);
    };
    leftAnimIdRef.current = requestAnimationFrame(loop);
    return () => {
      active = false;
      if (leftAnimIdRef.current) cancelAnimationFrame(leftAnimIdRef.current);
    };
  }, [captureAndDetectLeft]);

  // Left card initial frame detection on video load
  const handleLeftInitialLoad = () => {
    setTimeout(() => {
      leftDetectingRef.current = false;
      captureAndDetectLeft(true);
    }, 250);
  };

  // -------------------------------------------------------------
  // Right Card: Live Stream Frame Capture & Detection
  // -------------------------------------------------------------
  const captureAndDetectStream = useCallback(async () => {
    const vid = streamVideoRef.current;
    const cvs = streamCanvasRef.current;
    if (!vid || !cvs || vid.paused || !isLiveStreaming || !streamDetectEnabled) return;
    if (streamDetectingRef.current) return;

    const now = Date.now();
    if (now - streamLastTimeRef.current < 55) return;
    streamLastTimeRef.current = now;

    const vidW = vid.videoWidth;
    const vidH = vid.videoHeight;
    if (!vidW || !vidH) return;

    streamDetectingRef.current = true;
    try {
      if (!streamOffscreenRef.current) {
        streamOffscreenRef.current = document.createElement('canvas');
      }
      const off = streamOffscreenRef.current;
      const targetW = Math.min(vidW, 480);
      const targetH = Math.round(targetW * (vidH / vidW));
      off.width = targetW;
      off.height = targetH;
      const offCtx = off.getContext('2d');
      if (!offCtx) return;

      offCtx.drawImage(vid, 0, 0, targetW, targetH);
      const frameDataUrl = off.toDataURL('image/jpeg', 0.55);

      const response = await fetch(`${API_BASE}/api/detect-frame`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: frameDataUrl,
          confidence: streamConfidence
        })
      });

      if (!response.ok) return;

      const data: FrameDetectionResponse = await response.json();
      if (data.success && streamCanvasRef.current && streamVideoRef.current) {
        setStreamFrameData(data);
        drawDetections(
          streamCanvasRef.current,
          streamVideoRef.current,
          data.detections,
          data.frame_width,
          data.frame_height,
          {
            showLabels: streamShowLabels,
            showCrosshairs: streamShowCrosshairs,
            title: 'LIVE CCTV STREAM',
            vehicles: data.total_vehicles,
            latencyMs: data.inference_time_ms,
            congestion: data.congestion_level,
            recGreen: data.recommended_green_time
          }
        );
      }
    } catch (err) {
      console.warn('Stream detect error:', err);
    } finally {
      streamDetectingRef.current = false;
    }
  }, [drawDetections, isLiveStreaming, streamConfidence, streamDetectEnabled, streamShowCrosshairs, streamShowLabels]);

  // Right card continuous stream loop
  useEffect(() => {
    let active = true;
    const loop = () => {
      if (!active) return;
      if (isLiveStreaming) {
        captureAndDetectStream();
      }
      streamAnimIdRef.current = requestAnimationFrame(loop);
    };
    streamAnimIdRef.current = requestAnimationFrame(loop);
    return () => {
      active = false;
      if (streamAnimIdRef.current) cancelAnimationFrame(streamAnimIdRef.current);
    };
  }, [captureAndDetectStream, isLiveStreaming]);

  // -------------------------------------------------------------
  // Right Card: Start & Stop Stream Functions
  // -------------------------------------------------------------
  const startLiveStream = async () => {
    setError(null);
    const vid = streamVideoRef.current;
    if (!vid) return;

    vid.muted = true;

    if (streamSource === 'webcam') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        streamStreamRef.current = stream;
        vid.srcObject = stream;
        await vid.play();
        setIsLiveStreaming(true);
      } catch {
        setError('Webcam denied or unavailable. Switched to CCTV Camera Loop Simulation mode.');
        setStreamSource('video_sim');
        vid.srcObject = null;
        vid.src = videoPreview || SAMPLE_VIDEOS[0].url;
        vid.loop = true;
        await vid.play().catch(() => {});
        setIsLiveStreaming(true);
      }
    } else {
      const targetUrl = videoPreview || SAMPLE_VIDEOS[0].url;
      vid.crossOrigin = 'anonymous';
      vid.srcObject = null;
      vid.src = targetUrl;
      vid.loop = true;
      try {
        await vid.play();
        setIsLiveStreaming(true);
      } catch (playErr) {
        console.warn('Play error:', playErr);
        vid.muted = true;
        await vid.play().catch(() => {});
        setIsLiveStreaming(true);
      }
    }

    // Immediate initial frame detect on stream launch
    setTimeout(() => {
      streamDetectingRef.current = false;
      captureAndDetectStream();
    }, 200);
  };

  const stopLiveStream = () => {
    setIsLiveStreaming(false);
    if (streamStreamRef.current) {
      streamStreamRef.current.getTracks().forEach((t) => t.stop());
      streamStreamRef.current = null;
    }
    if (streamVideoRef.current) {
      streamVideoRef.current.pause();
      streamVideoRef.current.srcObject = null;
    }
    if (streamCanvasRef.current) {
      const ctx = streamCanvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, streamCanvasRef.current.width, streamCanvasRef.current.height);
    }
    setStreamFrameData(null);
  };

  // -------------------------------------------------------------
  // Video File Upload Handler
  // -------------------------------------------------------------
  const handleVideoUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setError('Please select a valid video file (MP4, AVI, MOV)');
      return;
    }

    setVideoFileName(file.name);
    setError(null);

    const previewUrl = URL.createObjectURL(file);
    setVideoPreview(previewUrl);

    try {
      setIsProcessingUpload(true);
      setUploadProgress(0);

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 92) return prev;
          return prev + Math.random() * 12;
        });
      }, 400);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE}/api/upload-video`, {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();
      if (data.success) {
        setAnalysis(data.analysis);
        if (data.video_url) {
          setVideoPreview(data.video_url);
        }
      } else {
        setError(data.detail || 'Failed to process video');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error processing video');
    } finally {
      setIsProcessingUpload(false);
      setUploadProgress(0);
    }
  }, []);

  const getCongestionBadgeClass = (level?: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse';
      case 'high':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/40 to-slate-950 p-6 text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-purple-800/30 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎥</span>
              <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-300 to-pink-400">
                Real-Time Video AI Traffic Analyzer
              </h1>
            </div>
            <p className="text-gray-400 text-sm mt-1">
              Live continuous YOLOv8 vehicle detection, dynamic Webster signal allocation & live CCTV streaming
            </p>
          </div>

          {/* Connection status badge */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium ${
              isBackendConnected
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${isBackendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
            <span>{isBackendConnected ? 'YOLO Backend Connected (Port 8000)' : 'Backend Disconnected (Port 8000)'}</span>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-xs text-red-400 hover:text-white underline">
              Dismiss
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* Main Grid: Upload & Live Video on Left, Live Stream on Right */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* ======================================================== */}
          {/* LEFT CARD: Video Upload & Live Detection Overlay Player */}
          {/* ======================================================== */}
          <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-6 border border-purple-500/20 shadow-2xl space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📹</span>
                <h2 className="text-xl font-bold text-white">Video Detection & AI Overlay</h2>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {videoFileName}
              </span>
            </div>

            {/* Quick Sample Selector */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-400 font-medium">Quick Load:</span>
              {SAMPLE_VIDEOS.map((sample, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setVideoPreview(sample.url);
                    setVideoFileName(sample.name);
                    setTimeout(() => captureAndDetectLeft(true), 300);
                  }}
                  className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-purple-900/50 text-cyan-300 border border-slate-700 hover:border-purple-500/50 transition-all"
                >
                  {sample.name}
                </button>
              ))}
            </div>

            {/* File Upload Button */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  disabled={isProcessingUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessingUpload}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm rounded-xl shadow-lg transition-all flex items-center gap-2"
                >
                  <span>📁</span>
                  <span>Choose Another Video</span>
                </button>
                <span className="text-xs text-gray-400">Supports MP4, AVI, MOV</span>
              </div>

              {/* Upload Progress Bar */}
              {isProcessingUpload && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-purple-300">
                    <span>Uploading and analyzing video...</span>
                    <span>{uploadProgress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-400 to-purple-500 h-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Live Video Player with Canvas Overlay */}
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden bg-black border border-cyan-500/30 shadow-2xl aspect-video flex items-center justify-center">
                <video
                  ref={videoRef}
                  src={videoPreview}
                  controls
                  crossOrigin="anonymous"
                  onLoadedData={handleLeftInitialLoad}
                  onCanPlay={handleLeftInitialLoad}
                  onPause={() => setTimeout(() => captureAndDetectLeft(true), 100)}
                  onSeeked={() => setTimeout(() => captureAndDetectLeft(true), 100)}
                  className="w-full h-full object-contain"
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                />
              </div>

              {/* Video AI Controls Bar */}
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-white">
                    <input
                      type="checkbox"
                      checked={leftDetectEnabled}
                      onChange={(e) => {
                        setLeftDetectEnabled(e.target.checked);
                        if (e.target.checked) captureAndDetectLeft(true);
                      }}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-slate-700 border-slate-600"
                    />
                    <span className={leftDetectEnabled ? 'text-cyan-400' : 'text-gray-400'}>
                      {leftDetectEnabled ? '🔴 Live AI Detection ON' : '⚪ Live AI OFF'}
                    </span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer text-gray-300">
                    <input
                      type="checkbox"
                      checked={leftShowLabels}
                      onChange={(e) => setLeftShowLabels(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-purple-600"
                    />
                    <span>Labels</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer text-gray-300">
                    <input
                      type="checkbox"
                      checked={leftShowCrosshairs}
                      onChange={(e) => setLeftShowCrosshairs(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-purple-600"
                    />
                    <span>Crosshairs</span>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Conf:</span>
                  <input
                    type="range"
                    min="0.15"
                    max="0.70"
                    step="0.05"
                    value={leftConfidence}
                    onChange={(e) => {
                      setLeftConfidence(parseFloat(e.target.value));
                      captureAndDetectLeft(true);
                    }}
                    className="w-20 accent-cyan-400 cursor-pointer"
                  />
                  <span className="text-cyan-300 font-mono">{(leftConfidence * 100).toFixed(0)}%</span>
                </div>
              </div>

              {/* Real-time Dynamic Vehicle Counter */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-gradient-to-br from-cyan-950/40 to-slate-800 rounded-xl border border-cyan-500/30">
                  <div className="text-xs text-cyan-300 font-medium">🚗 In-Frame Total</div>
                  <div className="text-2xl font-black text-cyan-400 mt-0.5">
                    {leftFrame ? leftFrame.total_vehicles : 0}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    {leftFrame?.inference_time_ms ? `${leftFrame.inference_time_ms}ms latency` : 'Play or scrub'}
                  </div>
                </div>

                <div className="p-3 bg-gradient-to-br from-amber-950/40 to-slate-800 rounded-xl border border-amber-500/30">
                  <div className="text-xs text-amber-300 font-medium">⚖️ Traffic PCU Weight</div>
                  <div className="text-2xl font-black text-amber-400 mt-0.5">
                    {leftFrame ? leftFrame.total_pcu_weight : 0}
                  </div>
                  <div className="text-[10px] text-gray-400">Webster factor</div>
                </div>

                <div className="p-3 bg-gradient-to-br from-emerald-950/40 to-slate-800 rounded-xl border border-emerald-500/30">
                  <div className="text-xs text-emerald-300 font-medium">⏱️ Webster Green Time</div>
                  <div className="text-2xl font-black text-emerald-400 mt-0.5">
                    {leftFrame ? `${leftFrame.recommended_green_time}s` : '15s'}
                  </div>
                  <div className="text-[10px] text-gray-400">Dynamic green req.</div>
                </div>

                <div className="p-3 bg-gradient-to-br from-purple-950/40 to-slate-800 rounded-xl border border-purple-500/30">
                  <div className="text-xs text-purple-300 font-medium">🚦 Congestion Status</div>
                  <div className="mt-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-md font-bold uppercase border ${getCongestionBadgeClass(
                        leftFrame?.congestion_level
                      )}`}
                    >
                      {leftFrame?.congestion_level || 'ANALYZING'}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">Live tracking</div>
                </div>
              </div>

              {/* Class Breakdown Chips */}
              {leftFrame && leftFrame.vehicle_counts && (
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-gray-400 font-medium mr-1">Class Breakdown:</span>
                  {Object.entries(leftFrame.vehicle_counts).map(([cls, count]) => {
                    if (count === 0) return null;
                    const theme = CLASS_THEMES[cls] || CLASS_THEMES.car;
                    return (
                      <div
                        key={cls}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium"
                        style={{
                          backgroundColor: theme.stroke + '22',
                          color: theme.stroke,
                          border: `1px solid ${theme.stroke}44`
                        }}
                      >
                        <span>{theme.icon}</span>
                        <span className="capitalize">{cls}:</span>
                        <span className="font-bold">{count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT CARD: Live Stream AI Detection (Matched Aspect & Boxes) */}
          {/* ======================================================== */}
          <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-6 border border-pink-500/20 shadow-2xl space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📡</span>
                <h2 className="text-xl font-bold text-white">Live Stream AI Detection</h2>
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 ${
                  isLiveStreaming
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                    : 'bg-gray-800 text-gray-400 border border-gray-700'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isLiveStreaming ? 'bg-red-400 animate-ping' : 'bg-gray-500'}`} />
                {isLiveStreaming ? 'STREAM ACTIVE' : 'STREAM STANDBY'}
              </span>
            </div>

            {/* Stream Mode Selector */}
            <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60 text-xs">
              <button
                onClick={() => {
                  if (isLiveStreaming) stopLiveStream();
                  setStreamSource('video_sim');
                }}
                className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all ${
                  streamSource === 'video_sim'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🎥 CCTV Camera Loop Simulation
              </button>
              <button
                onClick={() => {
                  if (isLiveStreaming) stopLiveStream();
                  setStreamSource('webcam');
                }}
                className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all ${
                  streamSource === 'webcam'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                📹 Webcam / Physical Camera
              </button>
            </div>

            {/* Stream Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={startLiveStream}
                disabled={isLiveStreaming}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                <span>▶️</span>
                <span>Start Live Stream</span>
              </button>

              <button
                onClick={stopLiveStream}
                disabled={!isLiveStreaming}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                <span>⏹️</span>
                <span>Stop Stream</span>
              </button>
            </div>

            {/* Live Stream Viewport & Canvas - Exact 16:9 Aspect Video to Match Left Card */}
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden bg-black border border-pink-500/30 shadow-2xl aspect-video flex items-center justify-center">
                <video
                  ref={streamVideoRef}
                  crossOrigin="anonymous"
                  playsInline
                  muted
                  autoPlay
                  className="w-full h-full object-contain"
                />
                <canvas
                  ref={streamCanvasRef}
                  className="absolute inset-0 w-full h-full pointer-events-none z-10"
                />

                {!isLiveStreaming && (
                  <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-purple-900/30 border border-purple-500/30 flex items-center justify-center mx-auto text-3xl">
                      📹
                    </div>
                    <h3 className="font-semibold text-gray-200">Live CCTV Stream Standby</h3>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto">
                      Click <strong className="text-emerald-400">Start Live Stream</strong> to stream live frames through the YOLO detector with real-time bounding boxes.
                    </p>
                  </div>
                )}
              </div>

              {/* Stream AI Controls Bar */}
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-white">
                    <input
                      type="checkbox"
                      checked={streamDetectEnabled}
                      onChange={(e) => {
                        setStreamDetectEnabled(e.target.checked);
                        if (e.target.checked) captureAndDetectStream();
                      }}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-slate-700 border-slate-600"
                    />
                    <span className={streamDetectEnabled ? 'text-pink-400' : 'text-gray-400'}>
                      {streamDetectEnabled ? '🔴 Stream AI Detection ON' : '⚪ Stream AI OFF'}
                    </span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer text-gray-300">
                    <input
                      type="checkbox"
                      checked={streamShowLabels}
                      onChange={(e) => setStreamShowLabels(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-purple-600"
                    />
                    <span>Labels</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer text-gray-300">
                    <input
                      type="checkbox"
                      checked={streamShowCrosshairs}
                      onChange={(e) => setStreamShowCrosshairs(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-purple-600"
                    />
                    <span>Crosshairs</span>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Conf:</span>
                  <input
                    type="range"
                    min="0.15"
                    max="0.55"
                    step="0.05"
                    value={streamConfidence}
                    onChange={(e) => {
                      setStreamConfidence(parseFloat(e.target.value));
                      captureAndDetectStream();
                    }}
                    className="w-20 accent-pink-400 cursor-pointer"
                  />
                  <span className="text-pink-300 font-mono">{(streamConfidence * 100).toFixed(0)}%</span>
                </div>
              </div>

              {/* Stream Telemetry Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-gradient-to-br from-pink-950/40 to-slate-800 rounded-xl border border-pink-500/30">
                  <div className="text-xs text-pink-300 font-medium">🚗 In-Stream Total</div>
                  <div className="text-2xl font-black text-pink-400 mt-0.5">
                    {streamFrameData ? streamFrameData.total_vehicles : 0}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    {streamFrameData?.inference_time_ms ? `${streamFrameData.inference_time_ms}ms latency` : 'Click Start Stream'}
                  </div>
                </div>

                <div className="p-3 bg-gradient-to-br from-amber-950/40 to-slate-800 rounded-xl border border-amber-500/30">
                  <div className="text-xs text-amber-300 font-medium">⚖️ Stream PCU Weight</div>
                  <div className="text-2xl font-black text-amber-400 mt-0.5">
                    {streamFrameData ? streamFrameData.total_pcu_weight : 0}
                  </div>
                  <div className="text-[10px] text-gray-400">Webster factor</div>
                </div>

                <div className="p-3 bg-gradient-to-br from-emerald-950/40 to-slate-800 rounded-xl border border-emerald-500/30">
                  <div className="text-xs text-emerald-300 font-medium">⏱️ Stream Green Time</div>
                  <div className="text-2xl font-black text-emerald-400 mt-0.5">
                    {streamFrameData ? `${streamFrameData.recommended_green_time}s` : '15s'}
                  </div>
                  <div className="text-[10px] text-gray-400">Allocated signal</div>
                </div>

                <div className="p-3 bg-gradient-to-br from-purple-950/40 to-slate-800 rounded-xl border border-purple-500/30">
                  <div className="text-xs text-purple-300 font-medium">🚦 Congestion Status</div>
                  <div className="mt-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-md font-bold uppercase border ${getCongestionBadgeClass(
                        streamFrameData?.congestion_level
                      )}`}
                    >
                      {streamFrameData?.congestion_level || (isLiveStreaming ? 'ANALYZING' : 'STANDBY')}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">Live CCTV stream</div>
                </div>
              </div>

              {/* Stream Breakdown Chips */}
              {streamFrameData && streamFrameData.vehicle_counts && (
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-gray-400 font-medium mr-1">Stream Breakdown:</span>
                  {Object.entries(streamFrameData.vehicle_counts).map(([cls, count]) => {
                    if (count === 0) return null;
                    const theme = CLASS_THEMES[cls] || CLASS_THEMES.car;
                    return (
                      <div
                        key={cls}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium"
                        style={{
                          backgroundColor: theme.stroke + '22',
                          color: theme.stroke,
                          border: `1px solid ${theme.stroke}44`
                        }}
                      >
                        <span>{theme.icon}</span>
                        <span className="capitalize">{cls}:</span>
                        <span className="font-bold">{count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* COMPREHENSIVE VIDEO ANALYSIS SUMMARY CARDS */}
        {/* ======================================================== */}
        {analysis && (
          <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-6 border border-purple-500/20 shadow-2xl space-y-6">
            <div className="flex items-center gap-2 border-b border-purple-800/30 pb-4">
              <span className="text-2xl">📊</span>
              <h2 className="text-xl font-bold text-white">Full Video Analytics & Ingestion Report</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Video Info */}
              <div className="p-4 bg-gradient-to-br from-blue-950/40 to-slate-800 rounded-xl border border-blue-500/30 space-y-2">
                <h3 className="font-semibold text-blue-300 text-sm flex items-center gap-1.5">
                  <span>📹</span> Video Specifications
                </h3>
                <div className="text-xs space-y-1.5 text-gray-300">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration:</span>
                    <span className="font-mono font-bold text-white">
                      {Math.floor(analysis.video_info.duration)}s
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Frames:</span>
                    <span className="font-mono font-bold text-white">
                      {analysis.video_info.total_frames.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Resolution:</span>
                    <span className="font-mono font-bold text-white">
                      {analysis.video_info.width} × {analysis.video_info.height}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">FPS:</span>
                    <span className="font-mono font-bold text-white">
                      {analysis.video_info.video_fps.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Processing Summary */}
              <div className="p-4 bg-gradient-to-br from-emerald-950/40 to-slate-800 rounded-xl border border-emerald-500/30 space-y-2">
                <h3 className="font-semibold text-emerald-300 text-sm flex items-center gap-1.5">
                  <span>⚡</span> YOLO Inference Metrics
                </h3>
                <div className="text-xs space-y-1.5 text-gray-300">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Frames Sampled:</span>
                    <span className="font-mono font-bold text-white">
                      {analysis.processing_summary.total_frames_processed}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Detections:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {analysis.processing_summary.total_detections.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg Detections/Frame:</span>
                    <span className="font-mono font-bold text-white">
                      {analysis.processing_summary.average_detections_per_frame}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Processing Rate:</span>
                    <span className="font-mono font-bold text-white">
                      {analysis.processing_summary.processing_fps} FPS
                    </span>
                  </div>
                </div>
              </div>

              {/* Quality Metrics */}
              <div className="p-4 bg-gradient-to-br from-purple-950/40 to-slate-800 rounded-xl border border-purple-500/30 space-y-2">
                <h3 className="font-semibold text-purple-300 text-sm flex items-center gap-1.5">
                  <span>🎯</span> Quality & Accuracy
                </h3>
                <div className="text-xs space-y-1.5 text-gray-300">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Average Confidence:</span>
                    <span className="font-mono font-bold text-purple-300">
                      {(analysis.quality_metrics.average_confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">High Confidence (&gt;80%):</span>
                    <span className="font-mono font-bold text-white">
                      {analysis.quality_metrics.high_confidence_detections.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Detection Rating:</span>
                    <span className="font-bold text-emerald-400 uppercase">
                      {analysis.quality_metrics.detection_quality}
                    </span>
                  </div>
                </div>
              </div>

              {/* Traffic Density & Congestion */}
              <div className="p-4 bg-gradient-to-br from-amber-950/40 to-slate-800 rounded-xl border border-amber-500/30 space-y-2">
                <h3 className="font-semibold text-amber-300 text-sm flex items-center gap-1.5">
                  <span>🚦</span> Congestion Index
                </h3>
                <div className="text-xs space-y-1.5 text-gray-300">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Most Common Level:</span>
                    <span className="font-bold capitalize text-amber-300">
                      {analysis.density_analysis.most_common_density.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Congestion Rate:</span>
                    <span className="font-mono font-bold text-rose-400">
                      {analysis.density_analysis.congestion_percentage}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Dominant Vehicle:</span>
                    <span className="font-bold capitalize text-cyan-300">
                      {analysis.vehicle_analysis.dominant_vehicle_type}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Fleet Breakdown */}
            <div className="p-5 bg-slate-800/60 rounded-xl border border-slate-700/80">
              <h3 className="font-semibold text-white text-sm mb-4">🚗 Total Vehicle Fleet Breakdown Across Video</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {Object.entries(analysis.vehicle_analysis.total_counts).map(([type, count]) => {
                  const theme = CLASS_THEMES[type] || CLASS_THEMES.car;
                  const pct = analysis.vehicle_analysis.vehicle_distribution[type] || 0;
                  return (
                    <div
                      key={type}
                      className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center space-y-1"
                    >
                      <div className="text-2xl">{theme.icon}</div>
                      <div className="text-xl font-bold text-white">{count.toLocaleString()}</div>
                      <div className="text-xs text-gray-400 capitalize">{type}s</div>
                      <div className="text-[10px] text-cyan-400 font-mono">{pct}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoDetection;
