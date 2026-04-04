import React from "react";
import { FaUserCircle, FaPhone, FaBriefcase, FaShieldAlt } from "react-icons/fa";

export default function ProfileCard({ name, phone, platform, plan }) {

  return (

    <div className="bg-white rounded-xl shadow-sm p-6 max-w-xl">

      <div className="flex items-center gap-4 mb-6">

        <FaUserCircle className="text-5xl text-green-500" />

        <div>
          <h3 className="text-lg font-semibold">{name}</h3>
          <p className="text-sm text-gray-500">Gig Worker</p>
        </div>

      </div>


      <div className="space-y-4">

        <div className="flex items-center gap-3">
          <FaPhone className="text-gray-500" />
          <span>{phone}</span>
        </div>

        <div className="flex items-center gap-3">
          <FaBriefcase className="text-gray-500" />
          <span>Platform: {platform}</span>
        </div>

        <div className="flex items-center gap-3">
          <FaShieldAlt className="text-gray-500" />
          <span>Active Plan: {plan}</span>
        </div>

      </div>

      <button className="mt-6 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
        Edit Profile
      </button>

    </div>

  );
}