import Link from 'next/link'; // ใช้ next/link สำหรับการนำทาง
import React, { useState } from 'react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gray-800 p-6">
      <div className="container mx-auto">
        {/* Hamburger Button */}
        <button
          className="md:hidden text-white float-right"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Navigation Links */}
        <ul
          className={`${
            isOpen ? 'block' : 'hidden'
          } md:flex flex-col md:flex-row items-center md:justify-end space-y-4 md:space-y-0 md:space-x-6 text-lg font-medium mt-4 md:mt-0`}
        >
          <li>
            <Link href="/" className="text-white hover:text-gray-300">
              Home
            </Link>
          </li>
          <li>
            <Link href="/about" className="text-white hover:text-gray-300">
              About
            </Link>
          </li>
          <li>
            <Link href="/contact" className="text-white hover:text-gray-300">
              Contact
            </Link>
          </li>
          <li>
            <Link
              href="/login"
              className="text-white hover:text-gray-300 bg-blue-600 px-6 py-3 rounded-md"
            >
              Launch App
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
