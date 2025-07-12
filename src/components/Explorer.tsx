import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import type { DataIndex, DataIndexSection } from "../dataTypes";
import logo from "../assets/logo.png";

export function Explorer() {
  const [selectedSection, setSelectedSection] =
    useState<DataIndexSection | null>(null);
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

  const handleSectionClick = (section: DataIndexSection) => {
    if (section.path) {
      navigate(`/dataset/${section.path}`);
    } else if (section.sections) {
      setSelectedSection(section);
      if (location.pathname.startsWith("/dataset/")) {
        navigate("/");
      }
    }
  };

  const handleSubsectionClick = (subsection: DataIndexSection) => {
    if (subsection.path) {
      navigate(`/dataset/${subsection.path}`);
    }
  };

  const mainSidebarWidth = selectedSection?.sections ? "w-48" : "w-64";

  return (
    <>
      {/* Main Sidebar */}
      <div
        className={`${mainSidebarWidth} border-r border-gray-700 bg-gray-800 transition-all duration-200`}
      >
        <div className="p-4 border-b border-gray-700">
          <a href="/" className="block hover:opacity-80 transition-opacity">
            <img src={logo} alt="Logo" className="h-12 mb-2" />
          </a>
          <p className="text-xs text-gray-400 mt-1">Explore financial data</p>
        </div>

        <div className="p-2">
          {isLoading ? (
            <div className="px-3 py-2 text-gray-400">Loading...</div>
          ) : error ? (
            <div className="px-3 py-2 text-red-400">Error loading data</div>
          ) : (
            <nav className="space-y-1">
              {dataIndex?.sections.map((section) => (
                <button
                  key={section.name}
                  onClick={() => handleSectionClick(section)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors border-none ${
                    selectedSection?.name === section.name
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-200 hover:bg-gray-600 hover:text-white"
                  }`}
                >
                  {section.name}
                </button>
              ))}
            </nav>
          )}
        </div>
      </div>

      {/* Secondary Sidebar for Subsections */}
      {selectedSection?.sections && (
        <div className="w-64 border-r border-gray-700 bg-gray-800">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-md font-medium text-white">
              {selectedSection.name}
            </h3>
            {selectedSection.description && (
              <p className="text-sm text-gray-400 mt-1">
                {selectedSection.description}
              </p>
            )}
          </div>
          <nav className="space-y-1 px-2 py-2">
            {selectedSection.sections.map((subsection) => (
              <button
                key={subsection.name}
                onClick={() => handleSubsectionClick(subsection)}
                className="w-full text-left px-3 py-2 rounded-md text-sm bg-gray-700 text-gray-200 hover:bg-gray-600 hover:text-white transition-colors border-none"
              >
                {subsection.name}
              </button>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
