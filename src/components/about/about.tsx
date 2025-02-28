import Image from 'next/image';
import React from 'react';
import { FaFacebook, FaGithub, FaInstagram } from 'react-icons/fa';

import Navbar from '../navbar/navbar';

const About = () => {
  const teamMembers = [
    {
      name: 'ArthitDev',
      role: 'Developer',
      image: '/images/tit.jpg',
      social: {
        github: 'https://github.com/ArthitDev',
        facebook: 'https://facebook.com/member1',
        instagram: 'https://instagram.com/member1',
      },
    },
    {
      name: 'AnunDev',
      role: 'Developer',
      image: '/images/nun.jpg',
      social: {
        github: 'https://github.com/1xe1',
        facebook: 'https://facebook.com/member2',
        instagram: 'https://instagram.com/member2',
      },
    },
    {
      name: 'LarDev',
      role: 'Developer',
      image: '/images/lar.jpg',
      social: {
        github: 'https://github.com/SRK700',
        facebook: 'https://facebook.com/member3',
        instagram: 'https://instagram.com/member3',
      },
    },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black">
        {/* System Description */}
        <section className="py-16 bg-gray-900">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-center mb-8 text-yellow-500">
              Automated Telegram Messaging System
            </h1>
            <p className="text-xl text-gray-300 text-center max-w-3xl mx-auto">
              Our platform provides a seamless solution for automated message
              forwarding through Telegram. Streamline your communication
              workflow and manage your messages efficiently.
            </p>
          </div>
        </section>

        {/* Team Members */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-yellow-500">
              Our Team
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className="bg-gray-900 rounded-lg shadow-lg p-8 text-center border border-yellow-500/30 hover:border-yellow-500 transition-colors duration-300"
                >
                  <div className="mb-6 relative w-40 h-40 mx-auto">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="rounded-full object-cover border-2 border-yellow-500"
                    />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-yellow-500">
                    {member.name}
                  </h3>
                  <p className="text-gray-300 mb-6">{member.role}</p>
                  <div className="flex justify-center space-x-4">
                    <a
                      href={member.social.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-yellow-500 transition-colors duration-300"
                    >
                      <FaGithub size={24} />
                    </a>
                    <a
                      href={member.social.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-yellow-500 transition-colors duration-300"
                    >
                      <FaFacebook size={24} />
                    </a>
                    <a
                      href={member.social.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-yellow-500 transition-colors duration-300"
                    >
                      <FaInstagram size={24} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default About;
