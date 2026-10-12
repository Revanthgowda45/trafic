/**
 * YOLO Detection Canvas Component
 * Real YOLOv8 detection visualization with proper bounding boxes
 */

import React, { useRef, useEffect } from 'react';
import { FastAPIDetection } from '../../services/fastApiConnection';

interface YOLODetectionCanvasProps {
  imageUrl: string;
  detections: FastAPIDetection[];
  width?: number;
  height?: number;
}

const YOLODetectionCanvas: React.FC<YOLODetectionCanvasProps> = ({
  imageUrl,
  detections,
  width = 800,
  height = 600
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Color mapping for different vehicle types (YOLO standard colors)
  const getColorForClass = (className: string): string => {
    const colors: Record<string, string> = {
      'car': '#00FF00',        // Bright Green
      'motorcycle': '#FF0000', // Red
      'bus': '#0000FF',        // Blue
      'truck': '#FFFF00',      // Yellow
      'bicycle': '#FF00FF',    // Magenta
      'person': '#00FFFF',     // Cyan
      'traffic light': '#FFA500', // Orange
      'stop sign': '#800080'   // Purple
    };
    return colors[className] || '#FFFFFF'; // White as default
  };

  const drawDetections = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    
    if (!canvas || !image || !image.complete) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the image
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Calculate scaling factors
    const scaleX = canvas.width / image.naturalWidth;
    const scaleY = canvas.height / image.naturalHeight;

    // Draw detections
    detections.forEach((detection, index) => {
      const color = getColorForClass(detection.class_name);
      
      // Scale coordinates to canvas size
      const x = detection.bbox.x1 * scaleX;
      const y = detection.bbox.y1 * scaleY;
      const width = (detection.bbox.x2 - detection.bbox.x1) * scaleX;
      const height = (detection.bbox.y2 - detection.bbox.y1) * scaleY;

      // Draw bounding box
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, width, height);

      // Draw filled rectangle for label background
      const label = `${detection.class_name} ${(detection.confidence * 100).toFixed(0)}%`;
      ctx.font = 'bold 14px Arial';
      const textMetrics = ctx.measureText(label);
      const textWidth = textMetrics.width;
      const textHeight = 20;

      // Label background
      ctx.fillStyle = color;
      ctx.fillRect(x, y - textHeight - 2, textWidth + 8, textHeight + 4);

      // Label text
      ctx.fillStyle = '#000000'; // Black text
      ctx.fillText(label, x + 4, y - 6);

      // Draw confidence bar
      const barWidth = 60;
      const barHeight = 4;
      const barX = x + width - barWidth - 5;
      const barY = y + 5;
      
      // Background bar
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(barX, barY, barWidth, barHeight);
      
      // Confidence bar
      ctx.fillStyle = color;
      ctx.fillRect(barX, barY, barWidth * detection.confidence, barHeight);

      // Draw center point
      const centerX = x + width / 2;
      const centerY = y + height / 2;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 3, 0, 2 * Math.PI);
      ctx.fill();

      // Draw detection ID
      ctx.fillStyle = color;
      ctx.font = 'bold 12px Arial';
      ctx.fillText(`#${index + 1}`, x + width - 25, y + height - 5);
    });

    // Draw detection count
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 200, 30);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(`Detections: ${detections.length}`, 15, 30);
  };

  useEffect(() => {
    const image = imageRef.current;
    if (image) {
      if (image.complete) {
        drawDetections();
      } else {
        image.onload = drawDetections;
      }
    }
  }, [imageUrl, detections]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-auto border border-gray-300 rounded-lg shadow-lg"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      <img
        ref={imageRef}
        src={imageUrl}
        alt="Detection source"
        style={{ display: 'none' }}
        crossOrigin="anonymous"
      />
      
      {/* Detection Legend */}
      <div className="absolute top-2 right-2 bg-black/80 text-white p-2 rounded text-xs">
        <div className="font-bold mb-1">Detection Legend:</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500"></div>
            <span>Cars</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500"></div>
            <span>Motorcycles</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500"></div>
            <span>Buses</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500"></div>
            <span>Trucks</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500"></div>
            <span>Bicycles</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-cyan-500"></div>
            <span>Pedestrians</span>
          </div>
        </div>
      </div>

      {/* Detection Stats Overlay */}
      <div className="absolute bottom-2 left-2 bg-black/80 text-white p-2 rounded text-xs">
        <div className="font-bold">YOLOv8 Detection Stats:</div>
        <div>Total Objects: {detections.length}</div>
        <div>High Confidence: {detections.filter(d => d.confidence > 0.8).length}</div>
        <div>Medium Confidence: {detections.filter(d => d.confidence > 0.5 && d.confidence <= 0.8).length}</div>
        <div>Low Confidence: {detections.filter(d => d.confidence <= 0.5).length}</div>
      </div>
    </div>
  );
};

export default YOLODetectionCanvas;
