import { Outlet } from "react-router-dom";
import { Explorer } from "./components/Explorer";
import "./App.css";

export function App() {
  return (
    <div className="min-h-screen bg-gray-900 flex w-screen">
      <Explorer />
      
      {/* Main Content Area */}
      <main className="flex-1 bg-gray-900">
        <Outlet />
      </main>
    </div>
  );
}
