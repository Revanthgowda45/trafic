import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Play, Square, Target, Zap, RotateCcw } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface AreaSelection {
  id: string;
  name: string;
  direction: string;
  points: Point[];
  color: string;
  isComplete: boolean;
}

interface DetectionResult {
  direction: string;
  area: AreaSelection;
  detections: any[];
  vehicle_count: number;
  processing_time: number;
}

const FourDirectionAnalyzer: React.FC = () => {
  const [uploadedImages, setUploadedImages] = useState<{[key: string]: string}>({});
  const [imageFiles, setImageFiles] = useState<{[key: string]: File}>({});
  const [currentDirection, setCurrentDirection] = useState<string>('north');
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const [areas, setAreas] = useState<AreaSelection[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [results, setResults] = useState<DetectionResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [liveTimers, setLiveTimers] = useState<{[key: string]: number}>({});
  const [isLiveMode, setIsLiveMode] = useState<boolean>(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const directions = [
    { id: 'north', name: 'North Direction', color: '#3B82F6', icon: '⬆️' },
    { id: 'south', name: 'South Direction', color: '#EF4444', icon: '⬇️' },
    { id: 'east', name: 'East Direction', color: '#10B981', icon: '➡️' },
    { id: 'west', name: 'West Direction', color: '#F59E0B', icon: '⬅️' }
  ];

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    setImageFile(file);
    setError(null);
    setAreas([]);
    setResults([]);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image || !uploadedImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match image
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    
    // Draw image
    ctx.drawImage(image, 0, 0);
    
    // Draw existing areas
    areas.forEach(area => {
      if (area.points.length > 0) {
        drawArea(ctx, area);
      }
    });
  }, [uploadedImage, areas]);

  const drawArea = (ctx: CanvasRenderingContext2D, area: AreaSelection) => {
    if (area.points.length === 0) return;

    ctx.strokeStyle = area.color;
    ctx.fillStyle = area.color + '20';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(area.points[0].x, area.points[0].y);
    
    for (let i = 1; i < area.points.length; i++) {
      ctx.lineTo(area.points[i].x, area.points[i].y);
    }
    
    if (area.points.length === 4) {
      ctx.closePath();
      ctx.fill();
    }
    
    ctx.stroke();

    // Draw points
    area.points.forEach((point, index) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = area.color;
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw point number
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText((index + 1).toString(), point.x, point.y + 4);
    });

    // Draw direction label
    if (area.points.length > 0) {
      const centerX = area.points.reduce((sum, p) => sum + p.x, 0) / area.points.length;
      const centerY = area.points.reduce((sum, p) => sum + p.y, 0) / area.points.length;
      
      ctx.fillStyle = area.color;
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(area.name, centerX, centerY - 10);
    }
  };

  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isSelecting) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    const direction = directions.find(d => d.id === currentDirection);
    if (!direction) return;

    setAreas(prevAreas => {
      const existingAreaIndex = prevAreas.findIndex(a => a.direction === currentDirection);
      
      if (existingAreaIndex >= 0) {
        const existingArea = prevAreas[existingAreaIndex];
        if (existingArea.points.length >= 4) {
          // Reset if already complete
          const newArea: AreaSelection = {
            id: currentDirection,
            name: direction.name,
            direction: currentDirection,
            points: [{ x, y }],
            color: direction.color,
            isComplete: false
          };
          const newAreas = [...prevAreas];
          newAreas[existingAreaIndex] = newArea;
          return newAreas;
        } else {
          // Add point to existing area
          const newPoints = [...existingArea.points, { x, y }];
          const updatedArea: AreaSelection = {
            ...existingArea,
            points: newPoints,
            isComplete: newPoints.length === 4
          };
          const newAreas = [...prevAreas];
          newAreas[existingAreaIndex] = updatedArea;
          return newAreas;
        }
      } else {
        // Create new area
        const newArea: AreaSelection = {
          id: currentDirection,
          name: direction.name,
          direction: currentDirection,
          points: [{ x, y }],
          color: direction.color,
          isComplete: false
        };
        return [...prevAreas, newArea];
      }
    });
  }, [isSelecting, currentDirection, directions]);

  const startAreaSelection = (direction: string) => {
    setCurrentDirection(direction);
    setIsSelecting(true);
    setError(null);
  };

  const stopAreaSelection = () => {
    setIsSelecting(false);
  };

  const clearArea = (direction: string) => {
    setAreas(prevAreas => prevAreas.filter(a => a.direction !== direction));
  };

  const processAllAreas = async () => {
    if (!imageFile || areas.length === 0) {
      setError('Please upload an image and select at least one area');
      return;
    }

    const completeAreas = areas.filter(a => a.isComplete);
    if (completeAreas.length === 0) {
      setError('Please complete at least one area selection (4 points required)');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResults([]);

    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      
      // Add area data
      const areasData = completeAreas.map(area => ({
        area_id: area.id,
        name: area.name,
        direction: area.direction,
        polygon: area.points.map(p => [p.x, p.y]),
        color: area.color
      }));
      
      formData.append('areas', JSON.stringify(areasData));

      const response = await fetch('http://localhost:8000/api/analyze-areas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: uploadedImage,
          areas: areasData
        })
      });

      const data = await response.json();

      if (data.success) {
        const processedResults: DetectionResult[] = completeAreas.map(area => ({
          direction: area.direction,
          area: area,
          detections: data.results?.[area.id]?.detections || [],
          vehicle_count: data.results?.[area.id]?.vehicle_count || 0,
          processing_time: data.results?.[area.id]?.processing_time || 0
        }));
        
        setResults(processedResults);
        console.log('Four-direction analysis completed:', processedResults);
      } else {
        setError(data.detail || 'Failed to process areas');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error processing areas');
      console.error('Area processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (uploadedImage) {
      const timer = setTimeout(initializeCanvas, 100);
      return () => clearTimeout(timer);
    }
  }, [uploadedImage, initializeCanvas]);

  useEffect(() => {
    initializeCanvas();
  }, [areas, initializeCanvas]);

  // Live mode timer effect
  useEffect(() => {
    if (!isLiveMode || results.length === 0) return;

    const interval = setInterval(() => {
      setLiveTimers(prev => {
        const newTimers = { ...prev };
        results.forEach(result => {
          if (result.vehicle_count > 0) {
            const currentTime = newTimers[result.direction] || 30;
            newTimers[result.direction] = Math.max(0, currentTime - 1);
          }
        });
        return newTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLiveMode, results]);

  const getDirectionStatus = (direction: string) => {
    const area = areas.find(a => a.direction === direction);
    if (!area) return { status: 'empty', points: 0 };
    if (area.isComplete) return { status: 'complete', points: 4 };
    return { status: 'partial', points: area.points.length };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🎯 4-Direction Traffic Analyzer
          </h1>
          <p className="text-gray-300">
            Upload image, select 4-point areas for each direction, and analyze traffic with YOLOv11x
          </p>
        </div>

        {/* Image Upload Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">📸 Image Upload</h2>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-300 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600"
          />

          {error && (
            <div className="text-red-400 text-sm mt-2 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
              Error: {error}
            </div>
          )}
        </div>

        {uploadedImage && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Image Canvas Section */}
            <div className="lg:col-span-2">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h2 className="text-2xl font-semibold text-white mb-4">🖼️ Area Selection Canvas</h2>
                
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <img
                    ref={imageRef}
                    src={uploadedImage}
                    alt="Traffic"
                    className="hidden"
                    onLoad={initializeCanvas}
                  />
                  <canvas
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                    className={`max-w-full h-auto ${isSelecting ? 'cursor-crosshair' : 'cursor-default'}`}
                    style={{ maxHeight: '600px' }}
                  />
                  
                  {isSelecting && (
                    <div className="absolute top-4 left-4 bg-blue-500/90 text-white px-3 py-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        <span>Selecting: {directions.find(d => d.id === currentDirection)?.name}</span>
                      </div>
                      <div className="text-xs mt-1">Click 4 points to create area</div>
                    </div>
                  )}
                </div>

                {/* Canvas Controls */}
                <div className="flex gap-4 mt-4">
                  <button
                    onClick={stopAreaSelection}
                    disabled={!isSelecting}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                  >
                    <Square className="w-4 h-4" />
                    Stop Selection
                  </button>
                  
                  <button
                    onClick={() => setAreas([])}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Clear All
                  </button>
                </div>
              </div>
            </div>

            {/* Direction Controls */}
            <div className="space-y-6">
              {/* Direction Selection */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-4">🧭 Direction Controls</h3>
                
                <div className="space-y-3">
                  {directions.map(direction => {
                    const status = getDirectionStatus(direction.id);
                    return (
                      <div key={direction.id} className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{direction.icon}</div>
                          <div>
                            <div className="text-white font-medium">{direction.name}</div>
                            <div className="text-sm text-gray-400">
                              Points: {status.points}/4
                              {status.status === 'complete' && <span className="text-green-400 ml-2">✓ Complete</span>}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => startAreaSelection(direction.id)}
                            disabled={isProcessing}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
                          >
                            {status.status === 'empty' ? 'Select' : 'Edit'}
                          </button>
                          
                          {status.status !== 'empty' && (
                            <button
                              onClick={() => clearArea(direction.id)}
                              disabled={isProcessing}
                              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-sm"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Process Button */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-4">⚡ Analysis</h3>
                
                <button
                  onClick={processAllAreas}
                  disabled={isProcessing || areas.filter(a => a.isComplete).length === 0}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing with YOLOv11x...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Process All Areas ({areas.filter(a => a.isComplete).length} ready)
                    </>
                  )}
                </button>

                <button
                  onClick={() => setIsLiveMode(!isLiveMode)}
                  disabled={results.length === 0}
                  className={`w-full flex items-center justify-center gap-2 py-3 mt-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${
                    isLiveMode 
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700' 
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                  }`}
                >
                  {isLiveMode ? (
                    <>
                      <Square className="w-4 h-4" />
                      Stop Live Mode
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Start Live Mode
                    </>
                  )}
                </button>

                <div className="mt-4 text-sm text-gray-400">
                  Complete areas: {areas.filter(a => a.isComplete).length}/4
                  {isLiveMode && <span className="text-green-400 ml-2">🔴 LIVE</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lane Results - 4 Lane Layout */}
        {results.length > 0 && (
          <div className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(laneNumber => {
                const laneDirections = ['north', 'south', 'east', 'west'];
                const directionId = laneDirections[laneNumber - 1];
                const result = results.find(r => r.direction === directionId);
                const direction = directions.find(d => d.id === directionId);
                const isActive = result && result.vehicle_count > 0;
                const timeLeft = liveTimers[directionId] || (isActive ? Math.floor(Math.random() * 30) : 0);
                
                return (
                  <div key={laneNumber} className={`relative rounded-2xl p-4 border-4 ${
                    isActive 
                      ? 'border-green-400 bg-gradient-to-br from-green-900/30 to-green-800/20' 
                      : 'border-orange-400 bg-gradient-to-br from-orange-900/30 to-orange-800/20'
                  }`}>
                    {/* Lane Header */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white">Lane {laneNumber}</h3>
                      <div className={`px-4 py-1 rounded-full text-sm font-bold ${
                        isActive 
                          ? 'bg-green-500 text-white' 
                          : 'bg-orange-500 text-white'
                      }`}>
                        {isActive ? 'ACTIVE' : 'WAITING'}
                      </div>
                    </div>

                    {/* Time Left Indicator */}
                    {isActive && (
                      <div className="absolute top-4 right-20 bg-green-500/90 text-white px-2 py-1 rounded text-sm">
                        Time Left: {timeLeft}s
                      </div>
                    )}

                    {/* Image with Detection Overlay */}
                    <div className="relative bg-black rounded-lg overflow-hidden mb-4" style={{ height: '200px' }}>
                      {uploadedImage && (
                        <img 
                          src={uploadedImage} 
                          alt={`Lane ${laneNumber}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                      
                      {/* Detection Area Overlay */}
                      {result && (
                        <div className="absolute inset-0">
                          {/* Simulated detection boxes */}
                          {result.detections.slice(0, 8).map((detection, idx) => (
                            <div
                              key={idx}
                              className="absolute border-2 border-green-400 bg-green-400/20"
                              style={{
                                left: `${10 + (idx % 4) * 20}%`,
                                top: `${20 + Math.floor(idx / 4) * 30}%`,
                                width: '15%',
                                height: '20%'
                              }}
                            >
                              <div className="bg-green-400 text-black text-xs px-1 font-bold">
                                {detection.class_name}
                              </div>
                            </div>
                          ))}
                          
                          {/* Area Selection Polygon */}
                          <svg className="absolute inset-0 w-full h-full">
                            <polygon
                              points="20,40 80,40 90,80 10,80"
                              fill="rgba(34, 197, 94, 0.1)"
                              stroke="rgb(34, 197, 94)"
                              strokeWidth="2"
                              strokeDasharray="5,5"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Vehicle Count */}
                      <div className="bg-black/40 rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <span className="text-2xl">🚗</span>
                          <span className="text-2xl font-bold text-white">
                            {result ? result.vehicle_count : 0}
                          </span>
                        </div>
                        <div className="text-sm text-gray-300">Vehicles</div>
                      </div>

                      {/* Timer */}
                      <div className="bg-black/40 rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <span className="text-2xl">⏱️</span>
                          <span className="text-2xl font-bold text-white">
                            {isActive ? `${timeLeft}s` : '0s'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-300">Timer</div>
                      </div>
                    </div>

                    {/* Direction Label */}
                    <div className="mt-3 text-center">
                      <div className="inline-flex items-center gap-2 bg-black/50 px-3 py-1 rounded-full">
                        <span className="text-lg">{direction?.icon}</span>
                        <span className="text-white font-medium">{direction?.name}</span>
                      </div>
                    </div>

                    {/* Processing Status */}
                    {result && (
                      <div className="mt-2 text-center text-xs text-gray-400">
                        Processed in {result.processing_time.toFixed(2)}s
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-gradient-to-r from-cyan-900/30 to-blue-900/30 p-6 rounded-xl border border-cyan-500/30">
          <h3 className="text-xl font-semibold text-white mb-3">📋 How to Use</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-300">
            <div>
              <h4 className="font-semibold text-white mb-2">1. Upload Image:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Click "Choose File" and select traffic image</li>
                <li>Supported formats: JPG, PNG, WebP</li>
                <li>Image will appear on canvas</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">2. Select Areas:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Click "Select" for each direction</li>
                <li>Click 4 points on image to create area</li>
                <li>Complete all 4 directions or select specific ones</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">3. Process:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Click "Process All Areas" button</li>
                <li>YOLOv11x will analyze each selected area</li>
                <li>View detailed results for each direction</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">4. Results:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Vehicle counts per direction</li>
                <li>Detailed detection breakdown</li>
                <li>Processing time statistics</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FourDirectionAnalyzer;
