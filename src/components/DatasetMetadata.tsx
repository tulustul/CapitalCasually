import { ExternalLink } from "lucide-react";
import type { CapitalData } from "../dataTypes";

interface DatasetMetadataProps {
  capitalData: CapitalData;
}

function shortenUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace(/^www\./, '');
    const path = urlObj.pathname;
    
    if (path.length <= 20) {
      return `${domain}${path}`;
    }
    
    return `${domain}${path.slice(0, 17)}...`;
  } catch {
    return url.length > 30 ? `${url.slice(0, 27)}...` : url;
  }
}

export function DatasetMetadata({ capitalData }: DatasetMetadataProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      {capitalData?.sources && capitalData.sources.length > 0 && (
        <div>
          <p className="text-sm text-gray-400 mb-2">Data sources:</p>
          <div className="flex flex-col gap-2">
            {capitalData.sources.map((source, index) => (
              <a
                key={index}
                href={source}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2 transition-colors"
              >
                <ExternalLink size={14} className="flex-shrink-0" />
                <span>{shortenUrl(source)}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
