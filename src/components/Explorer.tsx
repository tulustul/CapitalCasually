import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import type { DataIndex, DataIndexSection } from "../dataTypes";
import logo from "../assets/logo.png";

export function Explorer() {
  const [navigationStack, setNavigationStack] = useState<DataIndexSection[]>(
    [],
  );
  const navigate = useNavigate();
  const location = useLocation();

  const {
    data: dataIndex,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dataIndex"],
    queryFn: async (): Promise<DataIndex> => {
      const response = await fetch("/data/dataIndex.json");
      if (!response.ok) {
        throw new Error("Failed to fetch data index");
      }
      return response.json();
    },
  });

  const currentSection = navigationStack[navigationStack.length - 1];
  const currentSections = currentSection
    ? currentSection.sections
    : dataIndex?.sections;

  const handleSectionClick = (section: DataIndexSection) => {
    if (section.path) {
      navigate(`/dataset/${section.path}`);
    } else if (section.sections) {
      setNavigationStack((prev) => [...prev, section]);
      if (location.pathname.startsWith("/dataset/")) {
        navigate("/");
      }
    }
  };

  const handleBackClick = () => {
    setNavigationStack((prev) => prev.slice(0, -1));
    if (location.pathname.startsWith("/dataset/")) {
      navigate("/");
    }
  };

  return (
    <div className="w-64 border-r border-gray-700 bg-gray-800 min-w-60">
      <div className="p-4 border-b border-gray-700">
        <a href="/" className="block hover:opacity-80 transition-opacity">
          <img src={logo} alt="Logo" className="h-16 mb-2" />
        </a>
        <p className="text-xs text-gray-400 mt-1">Explore financial data</p>
      </div>

      {/* Back button */}
      {navigationStack.length > 0 && (
        <div className="p-2 border-b border-gray-700">
          <button
            onClick={handleBackClick}
            className="w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors border-none flex items-center gap-3 bg-gray-700 text-gray-200 hover:bg-gray-600 hover:text-white cursor-pointer"
          >
            <ArrowLeft size={16} className="flex-shrink-0" />
            <span>Back</span>
          </button>
        </div>
      )}

      {/* Current section header */}
      {currentSection && (
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-md font-medium text-white">
            {currentSection.name}
          </h3>
          {currentSection.description && (
            <p className="text-sm text-gray-400 mt-1">
              {currentSection.description}
            </p>
          )}
        </div>
      )}

      <div className="p-2">
        {isLoading ? (
          <div className="px-3 py-2 text-gray-400">Loading...</div>
        ) : error ? (
          <div className="px-3 py-2 text-red-400">Error loading data</div>
        ) : currentSections && currentSections.length > 0 ? (
          <nav className="space-y-1">
            {currentSections.map((section) => {
              const isActive =
                section.path &&
                location.pathname === `/dataset/${section.path}`;

              return (
                <button
                  key={section.name}
                  onClick={() => handleSectionClick(section)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors border-none flex items-center gap-3 cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-200 hover:bg-gray-600 hover:text-white"
                  }`}
                >
                  {section.logoSmall && (
                    <img
                      src={`/data/${section.logoSmall}`}
                      alt={`${section.name} logo`}
                      className="w-5 h-5 object-contain flex-shrink-0"
                    />
                  )}
                  <span>{section.name}</span>
                </button>
              );
            })}
          </nav>
        ) : (
          <div className="px-3 py-2 text-gray-400">No items</div>
        )}
      </div>
    </div>
  );
}
