import React from "react";
import "../styles/ProgressChart.css";

interface ProgressChartProps {
  progress: number;
  target: number;
  size?: number;
  strokeWidth?: number;
}

const ProgressChart: React.FC<ProgressChartProps> = ({
  progress,
  target,
  size = 150,
  strokeWidth = 15,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = target > 0 ? (progress / target) * 100 : 0;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="progress-chart-container">
      <svg width={size} height={size} className="progress-chart-svg">
        <circle
          className="progress-background"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="progress-foreground"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <text x="50%" y="50%" className="progress-text">
          {`${Math.min(Math.round(percentage), 100)}%`}
        </text>
      </svg>
      <div className="progress-label">
        {`${progress.toLocaleString()} / ${target.toLocaleString()}`}
      </div>
    </div>
  );
};

export default ProgressChart;
