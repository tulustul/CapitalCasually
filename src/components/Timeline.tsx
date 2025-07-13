import clsx from "clsx";
import { useRef, useState, useEffect } from "react";

type Year = {
  year: string;
  quarters: Quarter[];
};

type Quarter = {
  year: string;
  quarter: string;
  datasetName: string;
};

type Props = {
  quarters: string[]; // e.g. 2025Q2
  value: string;
  onChange: (value: string) => void;
};

const QUARTER_WIDTH = 60;

function parseQuarters(quarters: string[]): Year[] {
  const yearMap = new Map<string, Quarter[]>();

  // Group quarters by year (preserving input order)
  quarters.forEach((quarter) => {
    const year = quarter.substring(0, 4);
    const quarterPart = quarter.substring(4);

    if (!yearMap.has(year)) {
      yearMap.set(year, []);
    }
    yearMap.get(year)!.push({
      year,
      quarter: quarterPart,
      datasetName: quarter,
    });
  });

  // Convert to Year[] format (preserving order)
  return Array.from(yearMap.entries()).map(([year, quartersList]) => ({
    year,
    quarters: quartersList,
  }));
}

export function Timeline({ quarters, value, onChange }: Props) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  const markerGrabPosition = useRef(0);
  const valueRef = useRef(value);
  const [isDragging, setIsDragging] = useState(false);

  const years = parseQuarters(quarters);

  useEffect(() => {
    if (!isDragging) {
      updateMarkerPosition();
    }
  }, [isDragging, value]);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  function handleMarkerMouseDown(e: React.MouseEvent) {
    setIsDragging(true);
    if (markerRef.current) {
      const rect = markerRef.current.getBoundingClientRect();
      markerGrabPosition.current = e.clientX - rect.left;
    }
    handleMouseMove(e.nativeEvent);
  }

  function handleTimelineMouseDown(e: React.MouseEvent) {
    setIsDragging(true);
    if (markerRef.current) {
      const rect = markerRef.current.getBoundingClientRect();
      markerGrabPosition.current = rect.width / 2;
    }
    setTimeout(() => {
      handleMouseMove(e.nativeEvent);
    });
  }

  function handleMouseMove(e: MouseEvent) {
    if (!timelineRef.current || !markerRef.current) {
      return;
    }

    const rect = timelineRef.current.getBoundingClientRect();
    const x = Math.max(
      0,
      Math.min(
        rect.width - QUARTER_WIDTH,
        e.clientX - rect.left - markerGrabPosition.current,
      ),
    );
    markerRef.current.style.left = `${x}px`;

    snapMarker();
  }

  function snapMarker() {
    if (!markerRef.current || !timelineRef.current) {
      return;
    }

    // Get marker position relative to timeline
    const markerRect = markerRef.current.getBoundingClientRect();
    const timelineRect = timelineRef.current.getBoundingClientRect();
    const markerX = markerRect.left - timelineRect.left;

    // Calculate which quarter this position corresponds to
    const quarterIndex = Math.round(markerX / QUARTER_WIDTH);
    const clampedIndex = Math.max(
      0,
      Math.min(quarters.length - 1, quarterIndex),
    );
    const closestQuarter = quarters[clampedIndex];

    console.log({ quarterIndex, l: quarters.length, closestQuarter });

    if (closestQuarter && closestQuarter !== valueRef.current) {
      onChange(closestQuarter);
    }
  }

  useEffect(() => {
    if (!isDragging) {
      return;
    }

    const handleGlobalMouseMove = (e: MouseEvent) => {
      handleMouseMove(e);
      e.preventDefault();
      e.stopPropagation();
    };
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleGlobalMouseMove);
    document.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDragging]);

  function getMarkerPosition() {
    const index = quarters.indexOf(value);
    if (index === -1) {
      return 0;
    }
    return index * QUARTER_WIDTH;
  }

  function updateMarkerPosition() {
    if (markerRef.current) {
      const markerPosition = getMarkerPosition();
      markerRef.current.style.left = `${markerPosition}px`;
    }
  }

  return (
    <div
      className="w-full select-none"
      style={{ width: `${QUARTER_WIDTH * quarters.length}px` }}
    >
      <div className="relative py-8 flex">
        {/* Timeline line */}

        <div
          ref={timelineRef}
          className="absolute top-1/2 left-0 right-0 h-16  transform -translate-y-1/2 cursor-pointer flex items-center"
          onMouseDown={handleTimelineMouseDown}
        >
          <div className="w-full h-2 bg-gray-600 rounded-full" />
        </div>

        {/* Draggable marker */}
        <div
          ref={markerRef}
          className={clsx(
            "absolute transform -translate-y-1/2 h-4 rounded-full cursor-grab active:cursor-grabbing shadow-lg transition-all z-10",
            isDragging
              ? "duration-0 scale-110 bg-blue-400"
              : "duration-200 hover:scale-110 bg-blue-500 hover:bg-blue-400",
          )}
          style={{
            width: `${QUARTER_WIDTH}px`,
          }}
          onMouseDown={handleMarkerMouseDown}
        />

        {/* Timeline ticks and labels */}
        {years.map((year, yearIndex) => {
          return (
            <div key={year.year} className="relative flex">
              {yearIndex > 0 && (
                <div className="absolute top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-6 bg-gray-400 pointer-events-none" />
              )}

              {/* Year label (below line, centered) */}
              <span
                className={`absolute w-full pt-2 pointer-events-none text-center ${
                  value.startsWith(year.year)
                    ? "text-blue-400 font-bold"
                    : "text-gray-400"
                }`}
              >
                {year.year}
              </span>

              {/* Quarter ticks and labels */}
              {year.quarters.map((quarter, quarterIndex) => {
                return (
                  <div
                    key={quarter.datasetName}
                    style={{ width: `${QUARTER_WIDTH}px` }}
                    className="relative flex"
                  >
                    {/* Quarter tick mark (smaller) - only if not first quarter of year */}
                    {quarterIndex > 0 && (
                      <div className="absolute top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-2 bg-gray-500 pointer-events-none" />
                    )}

                    {/* Quarter label (above line, centered) */}
                    <span
                      className={`absolute w-full pb-2 bottom-0 text-sm transition-colors pointer-events-none text-center ${
                        quarter.datasetName === value
                          ? "text-blue-400 font-bold"
                          : "text-gray-400 font-light"
                      }`}
                    >
                      {quarter.quarter}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
