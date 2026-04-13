import React from "react";

export default function ReportCard({ title, value, icon }) {

  return (

    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">

      <div className="text-3xl">
        {icon}
      </div>

      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-semibold">{value}</p>
      </div>

    </div>

  );
}