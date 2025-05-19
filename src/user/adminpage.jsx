import React from "react";
import AdminSidebar from "./adminsidebar";
import PromoTable from "./promotable";

const PromoPage = () => (
  <div className="min-h-screen bg-white flex">
    {/* Sidebar */}
    <AdminSidebar />
    {/* Main Content */}
    <main className="flex-1 min-h-screen bg-white rounded-tl-[2rem] p-10">
      <PromoTable />
    </main>
  </div>
);

export default AdminPage;