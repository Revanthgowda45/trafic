import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Play, Square, Upload, Settings, Activity, Eye, Target, Wifi, WifiOff, Signal } from 'lucide-react';
import { usePerfectRealTime } from '../../hooks/usePerfectRealTime';

interface LocalDetectionArea {
  area_id: number;
  name: string;
  polygon: Array<[number, number]>;
  active: boolean;
  color: string;
}

interface StreamData {
  stream_id: string;
  timestamp: number;
  frame_data: string;
  detection_data: {
    total_detections: number;
    detections_by_class: Record<string, number>;
    fps: number;
    area_analysis: Record<string, any>;
  };
}

interface LiveDetectionStats {
  total_vehicles: number;
  cars: number;
  motorcycles: number;
  buses: number;
  trucks: number;
  persons: number;
  fps: number;
  processing_time: number;
}

const TrafficAreaSelector: React.FC = () => {
  // State management
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [detectionAreas, setDetectionAreas] = useState<LocalDetectionArea[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentArea, setCurrentArea] = useState<Array<[number, number]>>([]);
  const [selectedSource, setSelectedSource] = useState<string>('webcam');
  const [detectionSettings, setDetectionSettings] = useState({
    confidence_threshold: 0.5,
    show_bboxes: true,
    show_labels: true,
    show_tracking: true
  });

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Perfect real-time connection
  const {
    connectionStatus,
    isConnected,
    currentFrame,
    detectionStats,
    activeStreams,
    createAndStartStream,
    stopStream,
    addDetectionArea,
    removeDetectionArea,
    resetStats
  } = usePerfectRealTime();

  // Area colors
  const AREA_COLORS = [
    '#00ff00', '#ff0000', '#0000ff', '#ffff00', 
    '#ff00ff', '#00ffff', '#ffa500', '#800080'
  ];

  // Convert detection stats to live stats format
  const liveStats = {
    total_vehicles: detectionStats.totalVehicles,
    cars: detectionStats.vehiclesByType.car || 0,
    motorcycles: detectionStats.vehiclesByType.motorcycle || 0,
    buses: detectionStats.vehiclesByType.bus || 0,
    trucks: detectionStats.vehiclesByType.truck || 0,
    persons: detectionStats.vehiclesByType.person || 0,
    fps: detectionStats.fps,
    processing_time: detectionStats.processingTime
  };


  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setIsLiveMode(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Start live detection with perfect connection
  const startLiveDetection = async () => {
    if (!isConnected) {
      console.warn('⚠️ Not connected to server');
      return;
    }

    try {
      console.log('🚀 Starting perfect live detection...');
      
      const source = selectedSource === 'webcam' ? 0 : selectedSource;
      const config = {
        width: 640,
        height: 480,
        fps: 30,
        quality: 85,
        detection_interval: 1
      };

      const success = await createAndStartStream('live_detection', source, config);
      if (success) {
        setIsLiveMode(true);
        setSelectedImage(null);
        console.log('✅ Perfect live detection started successfully');
      } else {
        console.error('❌ Failed to start live detection');
      }
    } catch (error) {
      console.error('💥 Failed to start live detection:', error);
    }
  };

  // Stop live detection with perfect cleanup
  const stopLiveDetection = async () => {
    try {
      console.log('⏹️ Stopping perfect live detection...');
      
      const success = await stopStream('live_detection');
      if (success) {
        setIsLiveMode(false);
        setSelectedImage(null);
        resetStats();
        console.log('✅ Perfect live detection stopped successfully');
      } else {
        console.error('❌ Failed to stop live detection');
      }
    } catch (error) {
      console.error('💥 Failed to stop live detection:', error);
    }
  };

  // Canvas drawing functions
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setCurrentArea(prev => [...prev, [x, y]]);
  };

  const startDrawingArea = () => {
    setIsDrawing(true);
    setCurrentArea([]);
  };

  const finishDrawingArea = () => {
    if (currentArea.length < 3) return;

    const newArea: LocalDetectionArea = {
      area_id: Date.now(),
      name: `Lane ${detectionAreas.length + 1}`,
      polygon: currentArea,
      active: true,
      color: AREA_COLORS[detectionAreas.length % AREA_COLORS.length]
    };

    setDetectionAreas(prev => [...prev, newArea]);
    setCurrentArea([]);
    setIsDrawing(false);

    // Send to backend with perfect connection
    addDetectionArea(newArea);
    console.log('🎯 Detection area added:', newArea.name);
  };

  const removeArea = async (areaId: number) => {
    try {
      const removed = await removeDetectionArea(areaId);
      if (removed) {
        setDetectionAreas(prev => prev.filter(area => area.area_id !== areaId));
        console.log('🗑️ Detection area removed:', areaId);
      }
    } catch (error) {
      console.error('💥 Failed to remove area:', error);
    }
  };

  const toggleArea = (areaId: number) => {
    setDetectionAreas(prev =>
      prev.map(area =>
        area.area_id === areaId ? { ...area, active: !area.active } : area
      )
    );
  };

  // Draw areas on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw existing areas
    detectionAreas.forEach(area => {
      if (area.polygon.length > 2) {
        ctx.beginPath();
        ctx.moveTo(area.polygon[0][0], area.polygon[0][1]);
        area.polygon.forEach(([x, y]) => ctx.lineTo(x, y));
        ctx.closePath();
        
        ctx.strokeStyle = area.active ? area.color : '#666666';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.fillStyle = area.active ? area.color + '20' : '#66666620';
        ctx.fill();

        // Draw area name
        const centerX = area.polygon.reduce((sum, [x]) => sum + x, 0) / area.polygon.length;
        const centerY = area.polygon.reduce((sum, [, y]) => sum + y, 0) / area.polygon.length;
        
        ctx.fillStyle = area.color;
        ctx.font = '14px Arial';
        ctx.fillText(area.name, centerX - 20, centerY);
      }
    });

    // Draw current area being drawn
    if (currentArea.length > 0) {
      ctx.beginPath();
      ctx.moveTo(currentArea[0][0], currentArea[0][1]);
      currentArea.forEach(([x, y]) => ctx.lineTo(x, y));
      
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw points
      currentArea.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      });
    }
  }, [detectionAreas, currentArea]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Target className="text-teal-400" />
            Traffic Area Selector
            <span className="text-lg font-normal text-gray-300">- Live AI Detection</span>
          </h1>
          <p className="text-gray-300">
            Select monitoring areas and start real-time traffic analysis with advanced YOLOv8 detection
          </p>
        </div>

        {/* Perfect Connection Status */}
        <div className="mb-6 flex items-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            connectionStatus.connected ? 'bg-green-500/20 text-green-400' : 
            connectionStatus.reconnecting ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {connectionStatus.connected ? <Wifi className="w-4 h-4" /> : 
             connectionStatus.reconnecting ? <Signal className="w-4 h-4 animate-pulse" /> : <WifiOff className="w-4 h-4" />}
            <span>
              {connectionStatus.connected ? 'Connected' : 
               connectionStatus.reconnecting ? 'Reconnecting...' : 'Disconnected'}
            </span>
            {connectionStatus.connected && connectionStatus.latency > 0 && (
              <span className="text-xs opacity-75">({connectionStatus.latency}ms)</span>
            )}
          </div>
          
          {isLiveMode && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg">
              <Activity className="w-4 h-4" />
              Live Detection Active
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Detection Area */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Eye className="text-teal-400" />
                  Detection View
                </h2>
                
                <div className="flex gap-2">
                  {!isLiveMode ? (
                    <>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        Upload Image
                      </button>
                      <button
                        onClick={startLiveDetection}
                        disabled={!connectionStatus.connected}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                        title={!connectionStatus.connected ? 'Not connected to server' : 'Start live detection'}
                      >
                        <Play className="w-4 h-4" />
                        Start Live
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={stopLiveDetection}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    >
                      <Square className="w-4 h-4" />
                      Stop Live
                    </button>
                  )}
                </div>
              </div>

              {/* Detection Display */}
              <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
                {isLiveMode && currentFrame ? (
                  <img
                    src={currentFrame}
                    alt="Perfect Live Detection"
                    className="w-full h-full object-cover"
                  />
                ) : selectedImage ? (
                  <img
                    src={selectedImage}
                    alt="Selected"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>Upload an image or start live detection</p>
                    </div>
                  </div>
                )}

                {/* Canvas overlay for area selection */}
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={480}
                  className="absolute inset-0 w-full h-full cursor-crosshair"
                  onClick={handleCanvasClick}
                />
              </div>

              {/* Area Drawing Controls */}
              <div className="mt-4 flex gap-2">
                {!isDrawing ? (
                  <button
                    onClick={startDrawingArea}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
                  >
                    <Target className="w-4 h-4" />
                    Draw Area
                  </button>
                ) : (
                  <>
                    <button
                      onClick={finishDrawingArea}
                      disabled={currentArea.length < 3}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white rounded-lg transition-colors"
                    >
                      Finish Area
                    </button>
                    <button
                      onClick={() => {
                        setIsDrawing(false);
                        setCurrentArea([]);
                      }}
                      className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Control Panel */}
          <div className="space-y-6">
            {/* Live Statistics */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Activity className="text-teal-400" />
                Live Statistics
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Total Vehicles:</span>
                  <span className="text-2xl font-bold text-white">{liveStats.total_vehicles}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">🚗 Cars:</span>
                    <span className="text-green-400 font-semibold">{liveStats.cars}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">🏍️ Bikes:</span>
                    <span className="text-blue-400 font-semibold">{liveStats.motorcycles}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">🚌 Buses:</span>
                    <span className="text-red-400 font-semibold">{liveStats.buses}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">🚛 Trucks:</span>
                    <span className="text-yellow-400 font-semibold">{liveStats.trucks}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/20">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">FPS:</span>
                    <span className="text-teal-400 font-semibold">{liveStats.fps.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Processing:</span>
                    <span className="text-purple-400 font-semibold">{(liveStats.processing_time * 1000).toFixed(0)}ms</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Detection Areas */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Detection Areas</h3>
              
              <div className="space-y-2">
                {detectionAreas.map((area) => (
                  <div
                    key={area.area_id}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: area.color }}
                      />
                      <span className="text-white">{area.name}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleArea(area.area_id)}
                        className={`px-2 py-1 text-xs rounded ${
                          area.active
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-500 text-gray-300'
                        }`}
                      >
                        {area.active ? 'ON' : 'OFF'}
                      </button>
                      <button
                        onClick={() => removeArea(area.area_id)}
                        className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                
                {detectionAreas.length === 0 && (
                  <p className="text-gray-400 text-center py-4">
                    No detection areas defined
                  </p>
                )}
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Settings className="text-teal-400" />
                Settings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Video Source</label>
                  <select
                    value={selectedSource}
                    onChange={(e) => setSelectedSource(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  >
                    <option value="webcam">Webcam</option>
                    <option value="http://example.com/stream">IP Camera</option>
                    <option value="rtsp://example.com/stream">RTSP Stream</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Confidence Threshold: {detectionSettings.confidence_threshold}
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={detectionSettings.confidence_threshold}
                    onChange={(e) => setDetectionSettings(prev => ({
                      ...prev,
                      confidence_threshold: parseFloat(e.target.value)
                    }))}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  {Object.entries({
                    show_bboxes: 'Show Bounding Boxes',
                    show_labels: 'Show Labels',
                    show_tracking: 'Show Tracking'
                  }).map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 text-sm text-gray-300">
                      <input
                        type="checkbox"
                        checked={detectionSettings[key as keyof typeof detectionSettings] as boolean}
                        onChange={(e) => setDetectionSettings(prev => ({
                          ...prev,
                          [key]: e.target.checked
                        }))}
                        className="rounded"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficAreaSelector;
