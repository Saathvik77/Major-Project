import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function HealthRing({ percentage = 82, className = '' }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg className="w-40 h-40 transform -rotate-90">
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          fill="transparent"
          className="text-white/20"
        />
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke="url(#healthGradient)"
          strokeWidth="12"
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-in-out drop-shadow-md"
        />
        <defs>
          <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2DD4BF" />
            <stop offset="100%" stopColor="#80EECE" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-4xl font-bold tracking-tight text-white">{percentage}%</span>
        <div className="flex items-center text-sm font-medium text-gray-400 mt-1 cursor-pointer hover:text-gray-200 transition-colors">
          Health <ChevronRight className="w-4 h-4 ml-1" />
        </div>
      </div>
    </div>
  );
}
