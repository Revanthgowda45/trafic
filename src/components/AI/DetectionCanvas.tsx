import React, { useRef, useEffect } from 'react';

interface Detection {
  bbox: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
  class_name: string;
  confidence: number;
  center: {
    x: number;
    y: number;
  };
  width: number;
  height: number;
}

interface DetectionCanvasProps {
  imageUrl: string;
  detections: Detection[];
  isActive: boolean;
  showDetections: boolean;
  vehicleCount: number;
  timer: number;
  allocatedTime?: number;
  detectionStatus?: string;
  className?: string;
}

const DetectionCanvas: React.FC<DetectionCanvasProps> = ({
  imageUrl,
  detections,
  isActive,
  showDetections,
  vehicleCount,
  timer,
  allocatedTime,
  detectionStatus = "WAITING",
  className = ""
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Vehicle type colors
  const vehicleColors: { [key: string]: string } = {
    'car': '#00FF00',        // Bright green
    'truck': '#F59E0B',      // Amber
    'bus': '#3B82F6',        // Blue
    'motorcycle': '#10B981', // Emerald
    'bicycle': '#06B6D4',    // Cyan
    'person': '#EC4899',     // Pink
    'van': '#8B5CF6',        // Purple
    'minivan': '#8B5CF6',
    'pickup': '#F59E0B'
  };

  const drawDetections = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    
    if (!canvas || !image || !image.complete) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match image
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    // Draw the image
    ctx.drawImage(image, 0, 0);

    // Draw bounding boxes if detections exist and showDetections is true
    if (showDetections && detections && detections.length > 0) {
      detections.forEach((detection) => {
        const { bbox, class_name, confidence } = detection;
        const baseColor = vehicleColors[class_name] || (isActive ? '#00FF00' : '#38BDF8');
        const color = isActive ? baseColor : '#38BDF8';

        const width = bbox.x2 - bbox.x1;
        const height = bbox.y2 - bbox.y1;

        // Draw bounding box
        ctx.strokeStyle = color;
        ctx.lineWidth = isActive ? 3 : 2;
        ctx.strokeRect(bbox.x1, bbox.y1, width, height);

        // Draw filled background for label
        ctx.fillStyle = color;
        const label = `${class_name} ${(confidence * 100).toFixed(0)}%`;
        ctx.font = 'bold 12px Arial';
        const textWidth = ctx.measureText(label).width;
        ctx.fillRect(bbox.x1, Math.max(0, bbox.y1 - 20), textWidth + 8, 20);

        // Draw label text
        ctx.fillStyle = '#000000';
        ctx.fillText(label, bbox.x1 + 4, Math.max(14, bbox.y1 - 5));
      });
    }

    // Draw HUD status overlay (top-left)
    const totalDetected = detections && detections.length > 0 ? detections.length : vehicleCount;
    if (isActive) {
      ctx.fillStyle = 'rgba(6, 78, 59, 0.85)'; // Emerald dark glass
      ctx.fillRect(10, 10, 260, 105);
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 10, 260, 105);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 15px Arial';
      ctx.fillText(`🟢 GREEN LIGHT - ACTIVE`, 20, 32);
      
      ctx.font = '14px Arial';
      ctx.fillStyle = '#A7F3D0';
      ctx.fillText(`🚗 Detected: ${totalDetected} vehicles`, 20, 56);
      ctx.fillText(`⏱️ Green Countdown: ${timer}s`, 20, 78);
      
      ctx.font = '11px Arial';
      ctx.fillStyle = '#6EE7B7';
      ctx.fillText(`Status: ${detectionStatus}`, 20, 98);
    } else {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)'; // Slate dark glass
      ctx.fillRect(10, 10, 260, 80);
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 10, 260, 80);
      
      ctx.fillStyle = '#F87171';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(`🔴 RED LIGHT - WAITING`, 20, 32);
      
      ctx.font = '13px Arial';
      ctx.fillStyle = '#CBD5E1';
      ctx.fillText(`🚗 Queue Count: ${totalDetected} vehicles`, 20, 52);
      if (allocatedTime) {
        ctx.fillText(`⏱️ Allocated Green: ${allocatedTime}s`, 20, 72);
      }
    }
  };

  useEffect(() => {
    drawDetections();
  }, [detections, isActive, showDetections, vehicleCount, timer, allocatedTime]);

  useEffect(() => {
    const image = imageRef.current;
    if (image) {
      image.onload = drawDetections;
    }
  }, [imageUrl]);

  return (
    <div className={`relative ${className}`}>
      <img
        ref={imageRef}
        src={imageUrl}
        alt="Traffic"
        className="hidden"
        crossOrigin="anonymous"
      />
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain rounded-lg"
        style={{ 
          border: isActive ? '4px solid #00FF00' : '2px solid #666',
          boxShadow: isActive ? '0 0 20px #00FF00' : 'none'
        }}
      />
      
      {/* Status overlay */}
      <div className={`absolute top-2 right-2 px-3 py-1 rounded-lg text-sm font-bold ${
        isActive 
          ? 'bg-green-500 text-white animate-pulse' 
          : 'bg-red-500 text-white'
      }`}>
        {isActive ? '🟢 ACTIVE' : '🔴 WAITING'}
      </div>

      {/* Vehicle breakdown overlay (bottom) */}
      {isActive && showDetections && detections && detections.length > 0 && (
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white p-2 rounded text-xs">
          <div className="font-bold mb-1">Detected Vehicles:</div>
          {Object.entries(
            detections.reduce((acc: { [key: string]: number }, det) => {
              acc[det.class_name] = (acc[det.class_name] || 0) + 1;
              return acc;
            }, {})
          ).map(([type, count]) => (
            <div key={type} className="flex justify-between">
              <span>{type}:</span>
              <span className="ml-2 text-green-400">{count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DetectionCanvas;
