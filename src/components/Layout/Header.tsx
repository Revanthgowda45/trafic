import React from 'react';
import { TrafficCone as Traffic, Bell, Settings, User, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="flex-shrink-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm px-4 py-1.5 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-4 h-4" />
          </button>
          
          <div className="flex items-center space-x-2.5">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-1.5 rounded-md shadow-sm">
              <Traffic className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900">AI Traffic Optimizer</h1>
              <p className="text-xs text-gray-600">Smart India Hackathon 2025 🏆 Team Tech Titans</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Live Metrics - Perfect Size */}
          <div className="hidden lg:flex items-center space-x-2.5">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-2.5 py-1 rounded-md border border-green-200">
              <div className="text-center">
                <p className="font-bold text-green-700 text-sm">15.2%</p>
                <p className="text-green-600 text-xs">Commute Reduction</p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-violet-50 px-2.5 py-1 rounded-md border border-purple-200">
              <div className="text-center">
                <p className="font-bold text-purple-700 text-sm">99.8%</p>
                <p className="text-purple-600 text-xs">AI Accuracy</p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-2.5 py-1 rounded-md border border-blue-200">
              <div className="text-center">
                <p className="font-bold text-blue-700 text-sm">8.2ms</p>
                <p className="text-blue-600 text-xs">Response Time</p>
              </div>
            </div>
          </div>

          {/* Action Buttons - Compact */}
          <div className="flex items-center space-x-2">
            <button className="relative p-1.5 hover:bg-gray-100 rounded-lg transition-colors group">
              <Bell className="w-4 h-4 text-gray-600 group-hover:text-gray-800" />
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse">
                <div className="absolute inset-0 w-2.5 h-2.5 bg-red-400 rounded-full animate-ping"></div>
              </div>
            </button>
            
            <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors group">
              <Settings className="w-4 h-4 text-gray-600 group-hover:text-gray-800" />
            </button>
            
            <div className="h-4 w-px bg-gray-300"></div>
            
            <button className="flex items-center space-x-2 px-2 py-1.5 hover:bg-gray-100 rounded-lg transition-colors group">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-gray-700">Traffic Admin</p>
                <p className="text-xs text-gray-500">Bhubaneswar Control</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}