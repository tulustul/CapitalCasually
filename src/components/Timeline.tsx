type Props = {
  quarters: string[]; // e.g. 2025Q2
  value: string;
  onChange: (value: string) => void;
};

import { useRef, useState, useEffect, type ReactElement } from "react";

export function Timeline({ quarters, value, onChange }: Props) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const getYear = (quarter: string) => quarter.substring(0, 4);
  const getQuarter = (quarter: string) => quarter.substring(4);

  const currentIndex = quarters.indexOf(value);

  const getMarkerPosition = () => {
    if (quarters.length <= 1) return 0;
    return (currentIndex / (quarters.length - 1)) * 100;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleMouseMove(e);
  };

  const handleMouseMove = (e: React.MouseEvent | MouseEvent) => {
    if (!timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));

    // Find closest quarter
    const index = Math.round((percentage / 100) * (quarters.length - 1));
    const closestQuarter = quarters[index];

    if (closestQuarter && closestQuarter !== value) {
      onChange(closestQuarter);
    }
  };

  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        handleMouseMove(e);
        e.preventDefault();
        e.stopPropagation();
      };
      const handleGlobalMouseUp = () => setIsDragging(false);

      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleGlobalMouseMove);
        document.removeEventListener("mouseup", handleGlobalMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <div className="w-full max-w-4xl">
      <div className="relative py-8">
        {/* Timeline line */}
        <div
          ref={timelineRef}
          className="absolute top-1/2 left-0 right-0 h-2 bg-gray-600 transform -translate-y-1/2 cursor-pointer rounded-full"
          onMouseDown={handleMouseDown}
        />

        {/* Draggable marker */}
        <div
          className="absolute top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-blue-500 rounded-full cursor-grab active:cursor-grabbing shadow-lg transition-all duration-200 hover:scale-110"
          style={{ left: `${getMarkerPosition()}%` }}
          onMouseDown={handleMouseDown}
        />

        {/* Timeline tick marks */}
        <div className="flex justify-between relative items-start pointer-events-none">
          {quarters.map((quarter, index) => {
            return (
              <div key={quarter} className="flex flex-col items-center">
                {/* Small tick mark */}
                <div className="w-0.5 h-2 bg-gray-500" />
              </div>
            );
          })}
        </div>

        {/* Quarter labels positioned above each quarter */}
        <div className="absolute top-0 left-0 right-0 pointer-events-none">
          {quarters.map((quarter, index) => {
            const position =
              quarters.length > 1 ? (index / (quarters.length - 1)) * 100 : 50;

            return (
              <span
                key={quarter}
                className={`absolute text-sm transform -translate-x-1/2 transition-colors ${
                  quarter === value
                    ? "text-blue-400 font-medium"
                    : "text-gray-400"
                }`}
                style={{ left: `${position}%` }}
              >
                {getQuarter(quarter)}
              </span>
            );
          })}
        </div>

        {/* Year labels positioned in the middle of each year */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          {(() => {
            const yearLabels: ReactElement[] = [];
            const processedYears = new Set();

            quarters.forEach((quarter) => {
              const currentYear = getYear(quarter);

              if (!processedYears.has(currentYear)) {
                processedYears.add(currentYear);

                // Find all quarters in this year
                const yearQuarters = quarters.filter(
                  (q) => getYear(q) === currentYear,
                );
                const firstYearIndex = quarters.indexOf(yearQuarters[0]);
                const lastYearIndex = quarters.indexOf(
                  yearQuarters[yearQuarters.length - 1],
                );

                // Calculate middle position
                const middleIndex = (firstYearIndex + lastYearIndex) / 2;
                const position =
                  quarters.length > 1
                    ? (middleIndex / (quarters.length - 1)) * 100
                    : 50;

                yearLabels.push(
                  <span
                    key={currentYear}
                    className="absolute text-sm text-gray-400 transform -translate-x-1/2"
                    style={{ left: `${position}%` }}
                  >
                    {currentYear}
                  </span>,
                );
              }
            });

            return yearLabels;
          })()}
        </div>
      </div>
    </div>
  );
}
