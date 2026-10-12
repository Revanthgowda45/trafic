import React from 'react';

interface LineChartProps {
  data: Array<{ month: string; commute: number; emergency: number; rage: number; weather: number }>;
}

export const SimpleLineChart: React.FC<LineChartProps> = ({ data }) => {
  const maxValue = Math.max(...data.flatMap(d => [d.commute, d.emergency, d.rage, d.weather]));
  
  return (
    <div className="w-full h-64 p-4">
      <div className="relative h-full">
        {/* Y-axis */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
          <span>{maxValue.toFixed(0)}%</span>
          <span>{(maxValue * 0.75).toFixed(0)}%</span>
          <span>{(maxValue * 0.5).toFixed(0)}%</span>
          <span>{(maxValue * 0.25).toFixed(0)}%</span>
          <span>0%</span>
        </div>
        
        {/* Chart area */}
        <div className="ml-8 h-full relative">
          {/* Grid lines */}
          <div className="absolute inset-0">
            {[0, 25, 50, 75, 100].map((percent) => (
              <div
                key={percent}
                className="absolute w-full border-t border-gray-200"
                style={{ top: `${100 - percent}%` }}
              />
            ))}
          </div>
          
          {/* Data visualization */}
          <div className="relative h-full flex items-end justify-between px-4">
            {data.map((item) => (
              <div key={item.month} className="flex flex-col items-center space-y-2">
                {/* Bars */}
                <div className="flex space-x-1">
                  <div
                    className="w-3 bg-green-500 rounded-t"
                    style={{ height: `${(item.commute / maxValue) * 200}px` }}
                    title={`Commute: ${item.commute}%`}
                  />
                  <div
                    className="w-3 bg-red-500 rounded-t"
                    style={{ height: `${(item.emergency / maxValue) * 200}px` }}
                    title={`Emergency: ${item.emergency}%`}
                  />
                  <div
                    className="w-3 bg-purple-500 rounded-t"
                    style={{ height: `${(item.rage / maxValue) * 200}px` }}
                    title={`Road Rage: ${item.rage}%`}
                  />
                  <div
                    className="w-3 bg-blue-500 rounded-t"
                    style={{ height: `${(item.weather / maxValue) * 200}px` }}
                    title={`Weather: ${item.weather}%`}
                  />
                </div>
                {/* Month label */}
                <span className="text-xs text-gray-600">{item.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex justify-center space-x-4 mt-4 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Commute Reduction</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span>Emergency Response</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-purple-500 rounded"></div>
          <span>Road Rage Reduction</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>Weather Safety</span>
        </div>
      </div>
    </div>
  );
};

interface PieChartProps {
  data: Array<{ name: string; value: number; color: string }>;
}

export const SimplePieChart: React.FC<PieChartProps> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <div className="w-full h-64 flex items-center justify-center">
      <div className="relative">
        {/* Pie chart using CSS conic-gradient simulation */}
        <div className="w-48 h-48 rounded-full relative overflow-hidden">
          {data.map((item, itemIndex) => {
            const percentage = (item.value / total) * 100;
            const previousPercentages = data.slice(0, itemIndex).reduce((sum, prev) => sum + (prev.value / total) * 100, 0);
            
            return (
              <div
                key={item.name}
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(from ${previousPercentages * 3.6}deg, ${item.color} 0deg, ${item.color} ${percentage * 3.6}deg, transparent ${percentage * 3.6}deg)`,
                  clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((previousPercentages + percentage) * 3.6 * Math.PI / 180)}% ${50 - 50 * Math.sin((previousPercentages + percentage) * 3.6 * Math.PI / 180)}%, 50% 50%)`
                }}
              />
            );
          })}
          
          {/* Center circle */}
          <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">AI Features</div>
              <div className="text-sm text-gray-600">Usage</div>
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-4 space-y-2">
          {data.map((item) => (
            <div key={item.name} className="flex items-center space-x-2 text-sm">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-700">{item.name}</span>
              <span className="text-gray-500">({item.value}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
