/**
 * Frontend AI Service Integration
 * Smart India Hackathon 2025 - AI Traffic Optimizer
 * Connects React frontend to AI backend services
 */

export interface TrafficDetectionResult {
  success: boolean;
  data: {
    intersection_id: string;
    detections: Array<{
      id: string;
      class_name: string;
      vehicle_type: string;
      confidence: number;
      bbox: {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
        width: number;
        height: number;
      };
      estimated_speed: number;
      is_emergency: boolean;
    }>;
    traffic_analysis: {
      vehicle_count: number;
      pedestrian_count: number;
      emergency_count: number;
      average_speed: number;
      traffic_density: 'low' | 'medium' | 'high' | 'critical';
      congestion_level: 'free_flow' | 'light' | 'moderate' | 'severe';
      ai_recommendation: string;
      emergency_alert: boolean;
    };
  };
  timestamp: string;
  model: string;
}

export interface EmotionDetectionResult {
  success: boolean;
  data: {
    intersection_id: string;
    faces_detected: number;
    face_emotions: Array<{
      face_id: string;
      emotion: string;
      confidence: number;
      road_rage_risk: number;
      traffic_analysis: {
        driving_safety: 'safe' | 'risky' | 'dangerous';
        recommended_action: string;
        alert_level: 'normal' | 'medium' | 'high' | 'critical';
      };
    }>;
    overall_analysis: {
      road_rage_percentage: number;
      stress_percentage: number;
      calm_percentage: number;
      safety_score: number;
      alert_level: 'normal' | 'medium' | 'high' | 'critical';
      recommendations: string[];
    };
  };
  timestamp: string;
  model: string;
}

export interface AIAnalysisResult {
  intersection_id: string;
  timestamp: string;
  traffic_analysis: TrafficDetectionResult['data'];
  emotion_analysis: EmotionDetectionResult['data'];
  ai_recommendation: {
    priority_level: 'normal' | 'medium' | 'high' | 'critical';
    signal_adjustment: number;
    recommendations: string[];
    confidence: number;
  };
  model_status: {
    yolov8: { active: boolean; accuracy: number };
    emotion: { active: boolean; accuracy: number };
    audio: { active: boolean; accuracy: number };
  };
}

export interface AIStats {
  model_status: {
    yolov8: { active: boolean; lastCheck: string | null; accuracy: number };
    emotion: { active: boolean; lastCheck: string | null; accuracy: number };
    audio: { active: boolean; lastCheck: string | null; accuracy: number };
  };
  is_initialized: boolean;
  active_models: number;
  last_health_check: string;
}

class AIService {
  private baseUrl: string;
  
  constructor() {
    this.baseUrl = 'http://localhost:3001/api/ai';
  }
  
  // Check AI system health
  async checkHealth(): Promise<{ status: string; ai_service: AIStats }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('AI health check failed:', error);
      throw error;
    }
  }
  
  // YOLOv8 Traffic Detection
  async detectTraffic(imageFile: File, intersectionId: string): Promise<TrafficDetectionResult> {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('intersectionId', intersectionId);
      
      const response = await fetch(`${this.baseUrl}/detect-traffic`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Traffic detection failed:', error);
      throw error;
    }
  }
  
  // Emotion Detection for Road Rage Prevention
  async detectEmotions(imageFile: File, intersectionId: string): Promise<EmotionDetectionResult> {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('intersectionId', intersectionId);
      
      const response = await fetch(`${this.baseUrl}/detect-emotions`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Emotion detection failed:', error);
      throw error;
    }
  }
  
  // Combined AI Analysis (YOLOv8 + Emotions)
  async analyzeIntersection(imageFile: File, intersectionId: string): Promise<AIAnalysisResult> {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('intersectionId', intersectionId);
      
      const response = await fetch(`${this.baseUrl}/analyze-intersection`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Intersection analysis failed:', error);
      throw error;
    }
  }
  
  // Generate Demo Data
  async generateDemoData(scenario: 'normal' | 'road_rage' | 'stress' | 'calm' = 'normal'): Promise<EmotionDetectionResult> {
    try {
      const response = await fetch(`${this.baseUrl}/demo-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scenario }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Demo data generation failed:', error);
      throw error;
    }
  }
  
  // Get AI Statistics
  async getStats(): Promise<AIStats> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get AI stats:', error);
      throw error;
    }
  }
  
  // Convert image file to base64 for display
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }
  
  // Utility function to get emotion color coding
  getEmotionColor(emotion: string): string {
    const emotionColors: Record<string, string> = {
      'angry': '#ef4444',      // Red
      'aggressive': '#dc2626', // Dark red
      'frustrated': '#f97316', // Orange
      'fear': '#eab308',       // Yellow
      'sad': '#6b7280',        // Gray
      'neutral': '#10b981',    // Green
      'happy': '#22c55e',      // Light green
      'calm': '#3b82f6',       // Blue
      'surprise': '#8b5cf6',   // Purple
    };
    
    return emotionColors[emotion] || '#6b7280';
  }
  
  // Get priority level color
  getPriorityColor(priority: string): string {
    const priorityColors: Record<string, string> = {
      'normal': '#10b981',   // Green
      'medium': '#f59e0b',   // Yellow
      'high': '#f97316',     // Orange
      'critical': '#ef4444', // Red
    };
    
    return priorityColors[priority] || '#6b7280';
  }
  
  // Format AI recommendations for display
  formatRecommendations(recommendations: string[]): string[] {
    return recommendations.map(rec => {
      // Add emojis and formatting
      if (rec.includes('EMERGENCY')) return `🚨 ${rec}`;
      if (rec.includes('ROAD RAGE')) return `⚠️ ${rec}`;
      if (rec.includes('CONGESTION')) return `🚦 ${rec}`;
      if (rec.includes('STRESS')) return `😰 ${rec}`;
      if (rec.includes('NORMAL')) return `✅ ${rec}`;
      return rec;
    });
  }
}

// Create singleton instance
export const aiService = new AIService();

// Export types for use in components
export type {
  TrafficDetectionResult,
  EmotionDetectionResult,
  AIAnalysisResult,
  AIStats,
};
