// src/components/contact/contact.tsx
import emailjs from '@emailjs/browser';
import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { FaEnvelope, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';

import Navbar from '../navbar/navbar';

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await emailjs.sendForm(
        'service_vkv4k75', // จาก EmailJS
        'template_11jy0mm', // จาก EmailJS
        e.currentTarget,
        'MFXpAQvy8jWauCkYd' // จาก EmailJS
      );

      setSubmitStatus({
        type: 'success',
        message: 'Message sent successfully!',
      });
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'Failed to send message. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-gold-500 mb-4">
              Contact Us
            </h1>
            <p className="text-lg text-gray-300">
              Get in touch with us for any questions or concerns
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-gray-900 rounded-lg shadow-lg p-8 border border-gold-500"
            >
              <h2 className="text-2xl font-semibold text-gold-500 mb-6">
                Contact Information
              </h2>

              <div className="space-y-6">
                <div className="flex items-center">
                  <FaMapMarkerAlt className="text-gold-500 text-xl mr-4" />
                  <div>
                    <h3 className="font-medium text-gold-500">Address</h3>
                    <p className="text-gray-300">
                      97 Ratchaphruek Street, Bangkok 10000, Thailand
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <FaPhone className="text-gold-500 text-xl mr-4" />
                  <div>
                    <h3 className="font-medium text-gold-500">Phone</h3>
                    <p className="text-gray-300">+66 12 345 6789</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <FaEnvelope className="text-gold-500 text-xl mr-4" />
                  <div>
                    <h3 className="font-medium text-gold-500">Email</h3>
                    <p className="text-gray-300">tgmlxyz@gmail.com</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-gray-900 rounded-lg shadow-lg p-8 border border-gold-500"
            >
              <h2 className="text-2xl font-semibold text-gold-500 mb-6">
                Send us a Message
              </h2>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gold-500 mb-2"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="mt-1 block w-full rounded-md bg-gray-800 border border-gold-500 text-white shadow-sm focus:border-gold-500 focus:ring-gold-500 px-4 py-2 placeholder-gray-400"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gold-500 mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="mt-1 block w-full rounded-md bg-gray-800 border border-gold-500 text-white shadow-sm focus:border-gold-500 focus:ring-gold-500 px-4 py-2 placeholder-gray-400"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gold-500 mb-2"
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    className="mt-1 block w-full rounded-md bg-gray-800 border border-gold-500 text-white shadow-sm focus:border-gold-500 focus:ring-gold-500 px-4 py-2 placeholder-gray-400"
                    placeholder="What is this about?"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gold-500 mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    className="mt-1 block w-full rounded-md bg-gray-800 border border-gold-500 text-white shadow-sm focus:border-gold-500 focus:ring-gold-500 px-4 py-2 placeholder-gray-400 resize-none"
                    placeholder="Your message here..."
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full ${
                      isSubmitting
                        ? 'bg-gray-500 cursor-not-allowed'
                        : 'bg-gold-500 hover:bg-gold-600'
                    } text-black py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 transition-colors duration-300`}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </div>

                {submitStatus.type && (
                  <div
                    className={`text-center p-2 rounded ${
                      submitStatus.type === 'success'
                        ? 'text-green-500'
                        : 'text-red-500'
                    }`}
                  >
                    {submitStatus.message}
                  </div>
                )}
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
