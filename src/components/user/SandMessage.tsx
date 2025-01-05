import 'animate.css';

import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import React, { useState } from 'react';

const SandMessage: React.FC = () => {
  const [messages, setMessages] = useState<string[]>(() => {
    // Initialize messages from localStorage
    const savedMessages = localStorage.getItem('recentMessages');
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  const [input, setInput] = useState<string>('');
  const [setTime, setSetTime] = useState<number>(5);

  const handleSetTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (value >= 1 && value <= 60) {
      setSetTime(value);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      const newMessages = [...messages, input].slice(-5); // Keep only last 5 messages
      setMessages(newMessages);
      localStorage.setItem('recentMessages', JSON.stringify(newMessages));
      setInput('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);

    // Adjust height of the textarea dynamically
    e.target.style.height = 'auto'; // Reset height
    e.target.style.height = `${e.target.scrollHeight}px`; // Adjust height to fit content
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-6 animate__animated animate__fadeIn">
          <PaperAirplaneIcon className="w-6 h-6 text-blue-600" />
          Message Sending
        </h1>

        {/* Status Section */}
        <div className="bg-white p-4 rounded-lg shadow-lg mb-8 flex items-center justify-between animate__animated animate__fadeInDown">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-yellow-400 animate-pulse" />
            <span className="text-sm font-medium text-gray-600">
              Status: <span className="font-bold text-gray-800">IDLE</span>
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Panel */}
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 animate__animated animate__fadeInLeft">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Control Panel
            </h3>

            {/* Set Time Input */}
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

            {/* Chat Component */}
          </div>

          {/* Right Panel */}
          <div className="space-y-6 animate__animated animate__fadeInRight">
            {/* Sending Group */}
            <div className="bg-white shadow-lg rounded-lg w-full">
              <div className="bg-blue-600 text-white p-4 rounded-t-lg">
                <h1 className="text-xl font-bold">Messages</h1>
              </div>

              <div className="p-4 space-y-4 h-[500px] overflow-y-auto bg-gray-50">
                {messages.length === 0 ? (
                  <p className="text-center text-sm text-gray-500">
                    No messages yet
                  </p>
                ) : (
                  messages.map((msg, index) => (
                    <div
                      key={index}
                      className="flex justify-end mb-2 animate__animated animate__fadeInUp"
                    >
                      <div className="bg-blue-600 text-white px-6 py-3 rounded-[20px] max-w-[85%] break-words whitespace-pre-wrap shadow-sm">
                        {msg}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form
                className="p-4 bg-white border-t flex items-end gap-2"
                onSubmit={handleSubmit}
              >
                <div className="flex-grow relative">
                  <textarea
                    placeholder="Type your message..."
                    value={input}
                    onChange={handleInputChange}
                    rows={1}
                    className="w-full px-6 py-3 rounded-[24px] bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none min-h-[48px] max-h-[120px] overflow-y-auto pr-14"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 bottom-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 flex-shrink-0 w-10 h-10 flex items-center justify-center"
                  >
                    <PaperAirplaneIcon className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>

            {/* Receiving Group */}
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Receiving Group
              </h3>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 text-xs uppercase text-gray-700">
                    <tr>
                      <th className="px-4 py-3">Group Name</th>
                      <th className="px-4 py-3">Group ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-4 py-3">Receiving Group 1</td>
                      <td className="px-4 py-3">1234567890</td>
                    </tr>
                    <tr className="bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                      <td className="px-4 py-3">Receiving Group 2</td>
                      <td className="px-4 py-3">0987654321</td>
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

export default SandMessage;
