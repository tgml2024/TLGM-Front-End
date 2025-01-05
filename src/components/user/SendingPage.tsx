import React, { useState } from "react";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import SandMessage from "./SandMessage"; // Import the SandMessage component

const SendingPage: React.FC = () => {
  const [setTime, setSetTime] = useState<number>(5); // State สำหรับ Set Time

  const handleSetTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (value >= 1 && value <= 60) {
      setSetTime(value); // จำกัดค่าระหว่าง 1 ถึง 60 นาที
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-6">
          <PaperAirplaneIcon className="w-6 h-6 text-blue-600" />
          Message Sending
        </h1>

        {/* Status Section */}
        <div className="bg-white p-4 rounded-lg shadow mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-yellow-400 animate-pulse" />
            <span className="text-sm font-medium text-gray-600">
              Status: <span className="font-bold text-gray-800">IDLE</span>
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Panel: Control */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Control Panel
            </h3>

            {/* Set Time */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Set Time (minutes)
              </label>
              <input
                type="number"
                value={setTime}
                onChange={handleSetTimeChange}
                min={1}
                max={60}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter minutes"
              />
              <p className="text-sm text-gray-500 mt-2">
                Set a time between 1 and 60 minutes.
              </p>
            </div>

            {/* SandMessage Component */}
            <div className="mt-2 -mt-4"> {/* ปรับลดระยะห่างด้วย -mt-4 */}
              <SandMessage />
            </div>
          </div>

          {/* Right Panel: Group Info */}
          <div className="space-y-6">
            {/* Sending Group */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Sending Group
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg mb-2">
                <p className="text-sm text-gray-500">Group ID</p>
                <p className="text-gray-800 font-medium">-4698655368</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Group Name</p>
                <p className="text-gray-800 font-medium">Sending Group</p>
              </div>
            </div>

            {/* Receiving Group */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Receiving Group
              </h3>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                    <tr>
                      <th className="px-4 py-2">Group Name</th>
                      <th className="px-4 py-2">Group ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white hover:bg-gray-50">
                      <td className="px-4 py-2">Receiving Group 1</td>
                      <td className="px-4 py-2">1234567890</td>
                    </tr>
                    <tr className="bg-gray-50 hover:bg-gray-100">
                      <td className="px-4 py-2">Receiving Group 2</td>
                      <td className="px-4 py-2">0987654321</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendingPage;
