
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Ignore IDE flags, files will be made at build
import instadata from '../backend/runfiles/instadata.json';
import wechatdata from '../backend/runfiles/wechatdata.json';

const Index = () => {
  // Build instaData from instadata.json
  const instaData = Object.entries(instadata).map(
    ([timestamp, count]) => ({
      time: timestamp.slice(11),
      timestamp,
      hashtags: count,
    })
  );

  // Build wechatData from wechatdata.json
  const wechatData = Object.entries(wechatdata).map(
    ([timestamp, count]) => ({
      time: timestamp.slice(11),
      timestamp,
      hashtags: count,
    })
  );

  // Get all unique timestamps from both datasets and sort them
  const allTimestamps = [...new Set([
    ...instaData.map(item => item.timestamp),
    ...wechatData.map(item => item.timestamp)
  ])].sort();

  // Create combined data covering the full time range
  const combinedData = allTimestamps.map((timestamp) => {
    const instaItem = instaData.find(item => item.timestamp === timestamp);
    const wechatItem = wechatData.find(item => item.timestamp === timestamp);
    
    return {
      time: timestamp.slice(11),
      timestamp,
      instagram: instaItem ? instaItem.hashtags : null,
      wechat: wechatItem ? wechatItem.hashtags : null,
    };
  });

  // Calculate total period
  const startTime = new Date(allTimestamps[0]);
  const endTime = new Date(allTimestamps[allTimestamps.length - 1]);
  const totalHours = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60));
  const startTimeFormatted = startTime.toTimeString().slice(0, 5);
  const endTimeFormatted = endTime.toTimeString().slice(0, 5);

  // Calculate separate stats for each platform
  const instaValues = instaData.map(item => item.hashtags).filter(val => val > 0);
  const wechatValues = wechatData.map(item => item.hashtags).filter(val => val > 0);
  
  const instaPeak = Math.max(...instaValues);
  const wechatPeak = Math.max(...wechatValues);
  const instaAverage = Math.round(instaValues.reduce((sum, val) => sum + val, 0) / instaValues.length);
  const wechatAverage = Math.round(wechatValues.reduce((sum, val) => sum + val, 0) / wechatValues.length);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-sm">{`Time: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            entry.value !== null && (
              <p key={index} className={`font-semibold ${entry.dataKey === 'instagram' ? 'text-blue-400' : 'text-red-400'}`}>
                {`${entry.dataKey === 'instagram' ? 'Instagram' : 'WeChat'}: ${entry.value.toLocaleString()}`}
              </p>
            )
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-850">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-white mb-2">LVMH vs Guochao</h1>
          <p className="text-gray-400">Social Media Engagement Statistics</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Peak Engagement</h3>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-blue-400 text-sm">Instagram</span>
                <span className="text-xl font-bold text-white">{instaPeak.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-red-400 text-sm">WeChat</span>
                <span className="text-xl font-bold text-white">{wechatPeak.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Average</h3>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-blue-400 text-sm">Instagram</span>
                <span className="text-xl font-bold text-white">{instaAverage.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-red-400 text-sm">WeChat</span>
                <span className="text-xl font-bold text-white">{wechatAverage.toLocaleString()}</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1">per 10min period</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Total Period</h3>
            <p className="text-2xl font-bold text-white">{totalHours} hrs</p>
            <p className="text-xs text-gray-400 mt-1">{startTimeFormatted} - {endTimeFormatted}</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Data Types</h3>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-blue-400 font-medium">LVMH:</span>
                <p className="text-gray-300">Instagram hashtags for Louis Vuitton, Christian Dior, and Fendi</p>
              </div>
              <div>
                <span className="text-red-400 font-medium">Guochao:</span>
                <p className="text-gray-300">WeChat hashtags for M Essential, Uma Wang, and Samuel Gui Yang</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">Engagement Timeline</h2>
            <p className="text-gray-400 text-sm">Instagram and WeChat hashtag mentions over 10-minute intervals</p>
          </div>
          
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={combinedData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="time" 
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="instagram" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 1 }}
                  activeDot={{ r: 3, fill: '#60A5FA' }}
                  connectNulls={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="wechat" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  dot={{ fill: '#EF4444', strokeWidth: 2, r: 1 }}
                  activeDot={{ r: 3, fill: '#F87171' }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mt-8">
          <h2 className="text-xl font-semibold text-white mb-4">Raw Data</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Timestamp</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Time</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Hashtag Count</th>
                </tr>
              </thead>
              <tbody>
                {instaData.map((item, index) => (
                  <tr key={index} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="py-3 px-4 text-gray-300">{item.timestamp}</td>
                    <td className="py-3 px-4 text-white font-medium">{item.time}</td>
                    <td className="py-3 px-4 text-blue-400 font-semibold">{item.hashtags.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
