

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Ignore IDE flags, files will be made at build
import instadata from '../backend/input/instadata.json';
import wechatdata from '../backend/dummyinput/dummywechatdata.json';

const Index = () => {
  const [showDataTypesInfo, setShowDataTypesInfo] = useState(false);
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

  // Calculate derivatives for chart data
  const chartData = combinedData.map((item, index) => {
    let instagramFirstDerivative = null;
    let wechatFirstDerivative = null;
    let instagramSecondDerivative = null;
    let wechatSecondDerivative = null;

    if (index > 0 && item.instagram !== null) {
      const prevInstagram = combinedData[index - 1].instagram;
      if (prevInstagram !== null) {
        instagramFirstDerivative = item.instagram - prevInstagram;
      }
    }

    if (index > 0 && item.wechat !== null) {
      const prevWechat = combinedData[index - 1].wechat;
      if (prevWechat !== null) {
        wechatFirstDerivative = item.wechat - prevWechat;
      }
    }

    if (index > 1 && item.instagram !== null) {
      const prevInstagram = combinedData[index - 1].instagram;
      const prevPrevInstagram = combinedData[index - 2].instagram;
      if (prevInstagram !== null && prevPrevInstagram !== null) {
        const currentFirstDeriv = item.instagram - prevInstagram;
        const prevFirstDeriv = prevInstagram - prevPrevInstagram;
        instagramSecondDerivative = currentFirstDeriv - prevFirstDeriv;
      }
    }

    if (index > 1 && item.wechat !== null) {
      const prevWechat = combinedData[index - 1].wechat;
      const prevPrevWechat = combinedData[index - 2].wechat;
      if (prevWechat !== null && prevPrevWechat !== null) {
        const currentFirstDeriv = item.wechat - prevWechat;
        const prevFirstDeriv = prevWechat - prevPrevWechat;
        wechatSecondDerivative = currentFirstDeriv - prevFirstDeriv;
      }
    }

    return {
      ...item,
      instagramFirstDerivative,
      wechatFirstDerivative,
      instagramSecondDerivative,
      wechatSecondDerivative,
    };
  });

  // Calculate total period
  const startTime = new Date(allTimestamps[0]);
  const endTime = new Date(allTimestamps[allTimestamps.length - 1]);
  const totalHours = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60));
  // Format date and time with month/day/year and 12-hour clock without leading zeros
  const timeOptions: Intl.DateTimeFormatOptions = {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };
  const startTimeFormatted = startTime.toLocaleString('en-US', timeOptions).replace(',', '');
  const endTimeFormatted = endTime.toLocaleString('en-US', timeOptions).replace(',', '');

  // Split date and time for Total Period display
  const startDateFmt = startTime.toLocaleString('en-US', { month: 'short', day: 'numeric' });
  const endDateFmt   = endTime.toLocaleString('en-US',   { month: 'short', day: 'numeric' });
  const startTimeOnly = startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const endTimeOnly   = endTime.toLocaleTimeString('en-US',   { hour: 'numeric', minute: '2-digit', hour12: true });

  // Calculate separate stats for each platform
  const instaValues = instaData.map(item => item.hashtags).filter(val => val > 0);
  const wechatValues = wechatData.map(item => item.hashtags).filter(val => val > 0);
  
  const instaPeak = Math.max(...instaValues);
  const wechatPeak = Math.max(...wechatValues);
  const instaAverage = Math.round(instaValues.reduce((sum, val) => sum + val, 0) / instaValues.length);
  const wechatAverage = Math.round(wechatValues.reduce((sum, val) => sum + val, 0) / wechatValues.length);

  // Find peak times
  const instaPeakTime = instaData.find(item => item.hashtags === instaPeak)?.time || '';
  const wechatPeakTime = wechatData.find(item => item.hashtags === wechatPeak)?.time || '';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-sm">{`Time: ${label}`}</p>
          {payload.map((entry: any, index: number) => {
            if (entry.value !== null) {
              let label = '';
              let color = '';
              
              if (entry.dataKey === 'instagram') {
                label = 'Instagram';
                color = 'text-blue-400';
              } else if (entry.dataKey === 'wechat') {
                label = 'WeChat';
                color = 'text-red-400';
              } else if (entry.dataKey === 'instagramFirstDerivative') {
                label = 'Instagram 1st Derivative';
                color = 'text-blue-300';
              } else if (entry.dataKey === 'wechatFirstDerivative') {
                label = 'WeChat 1st Derivative';
                color = 'text-red-300';
              } else if (entry.dataKey === 'instagramSecondDerivative') {
                label = 'Instagram 2nd Derivative';
                color = 'text-blue-200';
              } else if (entry.dataKey === 'wechatSecondDerivative') {
                label = 'WeChat 2nd Derivative';
                color = 'text-red-200';
              }

              return (
                <p key={index} className={`font-semibold ${color}`}>
                  {`${label}: ${entry.value.toLocaleString()}`}
                </p>
              );
            }
            return null;
          })}
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
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-blue-400 font-bold text-lg">LVMH</span><br/>
                  <span className="text-sm text-blue-400 ml-2">on Instagram</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-white">{instaPeak.toLocaleString()}</span>
                  <p className="text-sm text-gray-400">at {instaPeakTime}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-red-400 font-bold text-lg">Guochao</span><br/>
                  <span className="text-sm text-red-400 ml-2">on WeChat</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-white">{wechatPeak.toLocaleString()}</span>
                  <p className="text-sm text-gray-400">at {wechatPeakTime}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 flex flex-col justify-between">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Average</h3>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-blue-400 font-bold text-lg">LVMH</span><br/>
                  <span className="text-sm text-blue-400 ml-2">on Instagram</span>
                </div>
                <span className="text-2xl font-bold text-white">{instaAverage.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-red-400 font-bold text-lg">Guochao</span><br/>
                  <span className="text-sm text-red-400 ml-2">on WeChat</span>
                </div>
                <span className="text-2xl font-bold text-white">{wechatAverage.toLocaleString()}</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 text-center mt-4">per 10min period</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Total Period</h3>
            <p className="text-2xl font-bold text-white">{totalHours} hrs</p>
            <div className="flex justify-between mt-4">
              <div>
                <p className="text-sm text-gray-400">
                  <strong>{startDateFmt}</strong>, {startTime.getFullYear()}
                </p>
                <p className="text-xs text-gray-400">
                  {startTimeOnly}
                </p>
              </div>
              <span className="mx-2 text-sm text-gray-400">↔</span>
              <div>
                <p className="text-sm text-gray-400">
                  <strong>{endDateFmt}</strong>, {endTime.getFullYear()}
                </p>
                <p className="text-xs text-gray-400">
                  {endTimeOnly}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-400">Data Types</h3>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-gray-400 cursor-pointer"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                onMouseEnter={() => setShowDataTypesInfo(true)}
                onMouseLeave={() => setShowDataTypesInfo(false)}
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </div>
            {showDataTypesInfo ? (
              <p className="text-gray-300 text-sm">
                For each brand, the data gathered includes the three most common variations of its associated hashtag (i.e. Louis Vuitton: “#louisvuitton”, “#louisv”, and “#lv”).
              </p>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex items-center">
                    <span className="text-blue-400 font-medium">LVMH:</span>
                    <span className="text-white ml-1">Instagram hashtags</span>
                  </div>
                  <ul className="mt-1 ml-4 text-gray-300">
                    <li>• Louis Vuitton</li>
                    <li>• Christian Dior</li>
                    <li>• Fendi</li>
                  </ul>
                </div>
                <div>
                  <div className="flex items-center">
                    <span className="text-red-400 font-medium">Guochao:</span>
                    <span className="text-white ml-1">WeChat hashtags</span>
                  </div>
                  <ul className="mt-1 ml-4 text-gray-300">
                    <li>• M Essential</li>
                    <li>• Uma Wang</li>
                    <li>• Samuel Gui Yang</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chart */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">Engagement Timeline</h2>
            <p className="text-gray-400 text-sm">Instagram and WeChat hashtag mentions over 10-minute intervals with derivatives</p>
          </div>
          
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
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
                  connectNulls={true}
                />
                <Line 
                  type="monotone" 
                  dataKey="wechat" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  dot={{ fill: '#EF4444', strokeWidth: 2, r: 1 }}
                  activeDot={{ r: 3, fill: '#F87171' }}
                  connectNulls={true}
                />
                <Line 
                  type="monotone" 
                  dataKey="instagramFirstDerivative" 
                  stroke="#60A5FA" 
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  dot={{ fill: '#60A5FA', strokeWidth: 1, r: 0.5 }}
                  activeDot={{ r: 2, fill: '#93C5FD' }}
                  connectNulls={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="wechatFirstDerivative" 
                  stroke="#F87171" 
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  dot={{ fill: '#F87171', strokeWidth: 1, r: 0.5 }}
                  activeDot={{ r: 2, fill: '#FCA5A5' }}
                  connectNulls={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="instagramSecondDerivative" 
                  stroke="#93C5FD" 
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  dot={{ fill: '#93C5FD', strokeWidth: 1, r: 0.3 }}
                  activeDot={{ r: 1.5, fill: '#DBEAFE' }}
                  connectNulls={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="wechatSecondDerivative" 
                  stroke="#FCA5A5" 
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  dot={{ fill: '#FCA5A5', strokeWidth: 1, r: 0.3 }}
                  activeDot={{ r: 1.5, fill: '#FEE2E2' }}
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
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Instagram Count</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">WeChat Count</th>
                </tr>
              </thead>
              <tbody>
                {combinedData.map((item, index) => (
                  <tr key={index} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="py-3 px-4 text-gray-300">{item.timestamp}</td>
                    <td className="py-3 px-4 text-white font-medium">{item.time}</td>
                    <td className="py-3 px-4 text-blue-400 font-semibold">
                      {item.instagram != null ? item.instagram.toLocaleString() : '-'}
                    </td>
                    <td className="py-3 px-4 text-red-400 font-semibold">
                      {item.wechat != null ? item.wechat.toLocaleString() : '-'}
                    </td>
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

