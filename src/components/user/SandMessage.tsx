import React, { useState } from "react";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";

const SandMessage: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState<string>("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      setMessages([...messages, input]);
      setInput("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);

    // Adjust height of the textarea dynamically
    e.target.style.height = "auto"; // Reset height
    e.target.style.height = `${e.target.scrollHeight}px`; // Adjust height to fit content
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-4 rounded-t-lg flex justify-between items-center">
          <h1 className="text-lg font-bold">Messages</h1>
        </div>

        {/* Chat Messages */}
        <div className="p-4 space-y-2 h-64 overflow-y-auto border-b">
          {messages.length === 0 ? (
            <p className="text-center text-sm text-gray-500">No messages yet</p>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className="flex justify-end mb-2">
                <div className="bg-blue-500 text-white px-4 py-2 rounded-full max-w-xs">
                  {msg}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Box */}
        <form className="p-4 flex items-center space-x-2" onSubmit={handleSubmit}>
          <textarea
            placeholder="Start typing..."
            value={input}
            onChange={handleInputChange}
            rows={1}
            className="flex-grow border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
          >
            <PaperAirplaneIcon className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default SandMessage;
