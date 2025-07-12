import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Sankey } from "../charts/Sankey";
import type { CapitalMetadata, CapitalData } from "../dataTypes";

export function DataSet() {
  const params = useParams();
  const path = params["*"];

  const {
    data: metadata,
    isLoading: metadataLoading,
    error: metadataError,
  } = useQuery({
    queryKey: ["metadata", path],
    queryFn: async (): Promise<CapitalMetadata> => {
      const response = await fetch(`/data/${path}/metadata.json`);
      if (!response.ok) {
        throw new Error("Failed to fetch metadata");
      }
      return response.json();
    },
    enabled: !!path,
  });

  // Use the first available dataset from metadata
  const datasetName = metadata?.datasets?.[0];

  const {
    data: capitalData,
    isLoading: dataLoading,
    error: dataError,
  } = useQuery({
    queryKey: ["capitalData", path, datasetName],
    queryFn: async (): Promise<CapitalData> => {
      const response = await fetch(`/data/${path}/${datasetName}.json`);
      if (!response.ok) {
        throw new Error("Failed to fetch dataset");
      }
      return response.json();
    },
    enabled: !!path && !!datasetName,
  });

  const isLoading = metadataLoading || dataLoading;
  const error = metadataError || dataError;

  if (isLoading) {
    return (
      <div className="p-8 w-full">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">Loading dataset...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 w-full">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-400">Error loading dataset</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 w-full">
      <div className="w-full">
        <h1 className="text-3xl font-bold text-white mb-2">
          {metadata?.name || path}
        </h1>
        {metadata?.description && (
          <p className="text-gray-300 mb-6 text-lg">{metadata.description}</p>
        )}

        {capitalData?.flow && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              Financial Flow
            </h2>
            <Sankey data={capitalData.flow} width={1400} height={600} />
          </div>
        )}

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <p className="text-gray-300">
            This Sankey diagram shows financial flows for:{" "}
            <span className="font-medium text-white">
              {metadata?.name || path}
            </span>
          </p>
          {metadata?.datasets && metadata.datasets.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-400 mb-2">Available datasets:</p>
              <div className="flex flex-wrap gap-2">
                {metadata.datasets.map((dataset) => (
                  <span
                    key={dataset}
                    className="bg-gray-700 text-gray-200 px-3 py-1 rounded text-sm"
                  >
                    {dataset}
                  </span>
                ))}
              </div>
            </div>
          )}
          {capitalData?.sources && capitalData.sources.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-400 mb-2">Data sources:</p>
              <div className="flex flex-col gap-1">
                {capitalData.sources.map((source, index) => (
                  <a
                    key={index}
                    href={source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm underline"
                  >
                    {source}
                  </a>
                ))}
              </div>
            </div>
          )}
          <div className="mt-4 text-sm text-gray-400">
            Data visualization powered by D3.js. Displaying data from:
            <br />
            <code className="bg-gray-700 text-gray-200 px-2 py-1 rounded mt-2 inline-block">
              /data/{path}/{datasetName}.json
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
