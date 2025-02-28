import Link from 'next/link'; // ใช้ next/link สำหรับการนำทาง
import React from 'react';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-gray-800 p-6">
      <div className="container mx-auto">
        <ul className="flex items-center justify-end space-x-6 text-lg font-medium">
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
