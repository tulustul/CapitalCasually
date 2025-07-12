import { useParams } from "react-router-dom";

export function DataSet() {
  const params = useParams();
  const path = params["*"];

  return (
    <div className="p-8 w-full">
      <div className="w-full">
        <h1 className="text-3xl font-bold text-white mb-4">
          DataSet: {path}
        </h1>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <p className="text-gray-300">
            This is a placeholder for the DataSet page. Here you would display
            financial data for: <span className="font-medium text-white">{path}</span>
          </p>
          <div className="mt-4 text-sm text-gray-400">
            Future implementation will load and visualize data from:
            <br />
            <code className="bg-gray-700 text-gray-200 px-2 py-1 rounded mt-2 inline-block">
              /data/{path}/
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}