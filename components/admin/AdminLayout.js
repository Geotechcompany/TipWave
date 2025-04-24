import { useState } from "react";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({ children }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <AdminHeader />
      
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onCollapseChange={setSidebarCollapsed}
      />
      
      <main 
        className={`transition-all duration-300 ease-in-out pt-16 ${
          sidebarCollapsed ? 'ml-16' : 'ml-56'
        }`}
      >
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
} 