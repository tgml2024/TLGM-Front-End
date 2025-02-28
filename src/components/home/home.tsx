import { motion, useInView } from 'framer-motion';
import HomeLayout from 'layout/HomeLayout';
import Link from 'next/link';
import React, { useRef } from 'react';

const Home = () => {
  const previewRef = useRef(null);
  const isPreviewInView = useInView(previewRef, {
    once: true,
    margin: '-100px',
  });

  return (
    <HomeLayout>
      <div className="w-full bg-[#0A0A0A]">
        {/* Welcome Section - Full Height */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="min-h-screen w-full flex flex-col justify-center items-center p-4 relative"
        >
          {/* Logo with Animation */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-12 relative group w-[300px] h-[120px] md:w-[400px] md:h-[160px]"
          >
            {/* Outer glow ring */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-yellow-500/30 to-red-500/30 
              rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-300 animate-spin-slow scale-150"
            ></div>

            {/* Inner rotating gradient */}
            <div
              className="absolute inset-0 bg-gradient-conic from-yellow-500 via-blue-500 to-red-500 
              rounded-2xl blur-xl opacity-75 group-hover:opacity-90 animate-spin-reverse scale-125"
            ></div>

            <img
              src="/images/logo.png"
              alt="Logo"
              className="w-full h-full
                object-contain
                relative z-10
                animate-pulse-subtle
                hover:scale-110
                drop-shadow-[0_0_25px_rgba(255,215,0,0.4)]
                group-hover:drop-shadow-[0_0_35px_rgba(255,215,0,0.6)]
                group-hover:rotate-[360deg] transition-all duration-[3000ms]
                rounded-xl"
            />
          </motion.div>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 relative group">
              <span
                className="bg-gradient-to-r from-[#FFD700] via-[#D4AF37] to-[#B8860B] 
                text-transparent bg-clip-text
                drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]
                transition-all duration-300 hover:drop-shadow-[0_0_20px_rgba(212,175,55,0.6)]
                cursor-default
                before:content-[''] before:absolute before:w-full before:h-full 
                before:bg-white/5 before:blur-xl before:scale-x-0
                hover:before:scale-x-100 before:transition-transform"
              >
                Welcome to TLGM
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-8 hover:text-gray-300 transition-colors">
              Auto Forward and Send Message
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex justify-center"
          >
            <Link
              href="/login"
              className="text-white hover:text-gray-300 bg-blue-600 px-6 py-3 rounded-md
                  transform hover:scale-105 transition-all duration-300"
            >
              Launch App
            </Link>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="absolute bottom-8 animate-bounce"
          >
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </motion.div>
        </motion.section>

        {/* Preview Section - Full Height */}
        <motion.section
          ref={previewRef}
          initial={{ opacity: 0, y: 50 }}
          animate={
            isPreviewInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }
          }
          transition={{ duration: 0.8 }}
          className="min-h-screen w-full flex flex-col justify-center items-center p-4 relative"
        >
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={
              isPreviewInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
            }
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold mb-12 text-center"
          >
            <span
              className="bg-gradient-to-r from-[#FFD700] via-[#D4AF37] to-[#B8860B] 
              text-transparent bg-clip-text"
            >
              See It In Action
            </span>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={
              isPreviewInView
                ? { opacity: 1, scale: 1 }
                : { opacity: 0, scale: 0.9 }
            }
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-full max-w-4xl mx-auto"
          >
            <div className="relative rounded-lg overflow-hidden shadow-2xl group">
              <img
                src="/images/preview.gif"
                alt="TLGM Preview"
                className="w-full h-auto object-cover 
                  transform transition-transform duration-700 
                  group-hover:scale-105"
              />
              <div
                className="absolute inset-0 bg-black/30 group-hover:bg-black/20 
                transition-colors duration-300"
              ></div>
            </div>
          </motion.div>
        </motion.section>

        {/* Footer Section */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={isPreviewInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="w-full bg-[#0A0A0A] border-t border-gray-800"
        >
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Company Info */}
              <div className="space-y-4">
                <img
                  src="/images/logo.png"
                  alt="TLGM Logo"
                  className="h-12 w-auto"
                />
                <p className="text-gray-400">
                  Automate your Telegram messaging and forwarding with ease.
                </p>
                <div className="flex space-x-4">
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.11.819-.26.819-.578 0-.284-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.386-1.332-1.755-1.332-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-white font-semibold text-lg mb-4">
                  Quick Links
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/about"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/features"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/pricing"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="text-white font-semibold text-lg mb-4">
                  Contact Us
                </h3>
                <ul className="space-y-2">
                  <li className="text-gray-400">
                    <span className="block">Email:</span>
                    <a
                      href="mailto:support@tlgm.com"
                      className="hover:text-white transition-colors"
                    >
                      support@tlgm.com
                    </a>
                  </li>
                  <li className="text-gray-400">
                    <span className="block">Telegram:</span>
                    <a
                      href="https://t.me/tlgm_support"
                      className="hover:text-white transition-colors"
                    >
                      @tlgm_support
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-gray-800 mt-12 pt-8 text-center">
              <p className="text-gray-400">
                © {new Date().getFullYear()} TLGM. All rights reserved.
              </p>
            </div>
          </div>
        </motion.footer>

        {/* Decorative Elements - Now spans all sections */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-1/4 left-1/4 w-2 h-2 
            bg-[#D4AF37] rounded-full animate-ping opacity-30"
          ></div>
          <div
            className="absolute bottom-1/4 right-1/4 w-2 h-2 
            bg-[#FFD700] rounded-full animate-ping delay-300 opacity-30"
          ></div>
          <div
            className="absolute top-1/2 right-1/3 w-2 h-2 
            bg-[#B8860B] rounded-full animate-ping delay-700 opacity-30"
          ></div>
        </div>
      </div>
    </HomeLayout>
  );
};

export default Home;
