import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Sankey } from "../charts/Sankey";
import type { CapitalMetadata, CapitalData } from "../dataTypes";
import { Timeline } from "../components/Timeline";
import { Spinner } from "../components/Spinner";
import { DatasetMetadata } from "../components/DatasetMetadata";
import { useState } from "react";

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
      const metadata: CapitalMetadata = await response.json();
      setDataset(metadata.datasets[metadata.datasets.length - 1]);
      return metadata;
    },
    enabled: !!path,
  });

  const [dataset, setDataset] = useState<string | null>(null);

  const {
    data: capitalData,
    isFetching: capitalDataFetching,
    error: dataError,
  } = useQuery({
    queryKey: ["capitalData", path, dataset],
    queryFn: async (): Promise<CapitalData> => {
      const response = await fetch(`/data/${path}/${dataset}.json`);
      if (!response.ok) {
        throw new Error("Failed to fetch dataset");
      }
      return response.json();
    },
    enabled: !!path && !!dataset,
    placeholderData: (previousData) => previousData,
    staleTime: Infinity,
  });

  const error = metadataError || dataError;

  if (metadataLoading) {
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

  if (!metadata) {
    return (
      <div className="p-8 w-full">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">No data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 w-full">
      <div className="w-full flex flex-col gap-6 items-center">
        <div className="flex gap-5 items-center">
          {metadata.logoSmall && (
            <img src={metadata.logoSmall} alt="Logo" className="h-12" />
          )}
          <h1 className="text-3xl font-bold text-white mb-2">
            {metadata.name}
          </h1>
        </div>
        {/* {metadata.description && (
          <p className="text-gray-300 mb-6 text-lg">{metadata.description}</p>
        )} */}

        {metadata.datasets.length > 1 && (
          <div className="relative">
            <Timeline
              quarters={metadata.datasets}
              value={dataset ?? metadata.datasets[metadata.datasets.length - 1]}
              onChange={setDataset}
            />
            {capitalDataFetching && (
              <div className="absolute w-full z-100 flex justify-center">
                <Spinner size="lg" />
              </div>
            )}
          </div>
        )}

        {capitalData?.flow && (
          <Sankey data={capitalData.flow} width={1400} height={600} />
        )}

        {capitalData && <DatasetMetadata capitalData={capitalData} />}
      </div>
    </div>
  );
}
