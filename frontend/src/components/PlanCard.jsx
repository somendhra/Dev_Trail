import React from "react";
import { FaShieldAlt } from "react-icons/fa";

export default function PlanCard({ plan, price, coverage, onBuy }) {

  return (

    <div className="bg-white rounded-xl border shadow-sm hover:shadow-lg transition duration-200 p-6 flex flex-col justify-between">

      {/* Plan Header */}
      <div className="flex items-center gap-3 mb-4">

        <div className="w-10 h-10 flex items-center justify-center bg-green-100 text-green-600 rounded-lg">
          <FaShieldAlt />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {plan}
          </h3>

          <p className="text-sm text-gray-500">
            Coverage up to ₹{coverage}
          </p>
        </div>

      </div>


      {/* Price */}
      <div className="mb-5">

        <div className="text-3xl font-bold text-green-600">
          ₹{price}
        </div>

        <span className="text-sm text-gray-500">
          per week
        </span>

      </div>


      {/* Buy Button */}
      <button
        onClick={onBuy}
        className="w-full py-2.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition"
      >
        Buy Plan
      </button>

    </div>

  );
}