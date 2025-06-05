'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaPlay, FaArrowRight, FaGithub, FaTwitter, FaDiscord } from 'react-icons/fa';

const HomePage = () => {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const gridRef = useRef(null);
  
  // Animation for staggered text
  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };
  
  // Handle grid animation
  useEffect(() => {
    setIsLoaded(true);
    
    // Setup interactive grid background
    if (gridRef.current && typeof window !== 'undefined') {
      const handleMouseMove = (e) => {
        if (!gridRef.current) return;
        
        const rect = gridRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        gridRef.current.style.setProperty('--mouse-x', `${x}px`);
        gridRef.current.style.setProperty('--mouse-y', `${y}px`);
      };
      
      gridRef.current.addEventListener('mousemove', handleMouseMove);
      
      return () => {
        if (gridRef.current) {
          gridRef.current.removeEventListener('mousemove', handleMouseMove);
        }
      };
    }
  }, []);
  
  // Example workflows to showcase
  const exampleWorkflows = [
    {
      title: "Cross-chain Arbitrage",
      description: "Automatically execute trades across parachains to profit from price differences",
      background: "bg-gradient-to-br from-blue-600 to-purple-700",
    },
    {
      title: "Yield Optimizer",
      description: "Automatically move funds between yield farms to maximize returns",
      background: "bg-gradient-to-br from-green-600 to-teal-700",
    },
    {
      title: "DCA Strategy",
      description: "Schedule regular investments to reduce impact of volatility",
      background: "bg-gradient-to-br from-amber-500 to-orange-700",
    }
  ];
  
  return (
    <div className="min-h-screen bg-[#0D0E12] text-white overflow-x-hidden">
      {/* Interactive Background */}
      <div 
        ref={gridRef}
        className="fixed inset-0 z-0 grid-background"
      />
      
      {/* Gradient Overlay */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-[#0D0E12] via-transparent to-[#0D0E12] opacity-80"></div>
      
      {/* Header */}
      <header className="relative z-10 py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text"
          >
            Polkadot DeFi Flow
          </motion.div>
          
          <motion.nav 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden md:flex items-center space-x-8"
          >
            <Link href="#features" className="text-gray-300 hover:text-white transition-colors">Features</Link>
            <Link href="#workflows" className="text-gray-300 hover:text-white transition-colors">Workflows</Link>
            <Link href="#" className="text-gray-300 hover:text-white transition-colors">Documentation</Link>
            <button
              onClick={() => router.push('/flow-builder')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium transition-colors"
            >
              Launch App
            </button>
          </motion.nav>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="relative z-10 pt-16 md:pt-24 lg:pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight"
            >
              <span className="block text-white">Create Cross-Chain</span>
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">DeFi Automations</span>
              <span className="block text-white">Without Code</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-6 text-gray-400 text-lg max-w-lg"
            >
              Build, automate, and execute sophisticated cross-chain DeFi strategies with our visual workflow builder for the Polkadot ecosystem.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <button
                onClick={() => router.push('/flow-builder')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-white font-medium flex items-center transition-all shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40"
              >
                <FaPlay className="mr-2" /> Start Building
              </button>
              <button
                onClick={() => router.push('/flow-builder?template=demo')}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-medium flex items-center transition-colors"
              >
                Try Demo
              </button>
            </motion.div>
          </div>
          
          {/* Hero Graphic - Animated Flow Chart Placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="hidden md:block relative"
          >
            <div className="aspect-square max-w-lg mx-auto relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-3xl blur-2xl"></div>
              
              {/* Simplified Flow Chart Visualization */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg width="100%" height="100%" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Nodes */}
                  <g className="nodes">
                    <circle cx="200" cy="80" r="30" fill="#3B82F6" />
                    <circle cx="100" cy="200" r="25" fill="#10B981" />
                    <circle cx="300" cy="200" r="25" fill="#8B5CF6" />
                    <circle cx="200" cy="320" r="30" fill="#F97316" />
                  </g>
                  
                  {/* Edges */}
                  <g className="edges" strokeWidth="3" strokeLinecap="round">
                    <path d="M190 105 L115 180" stroke="#3B82F6" strokeDasharray={isLoaded ? "0" : "200"} className="animate-flow-1" />
                    <path d="M210 105 L285 180" stroke="#3B82F6" strokeDasharray={isLoaded ? "0" : "200"} className="animate-flow-2" />
                    <path d="M115 220 L185 305" stroke="#10B981" strokeDasharray={isLoaded ? "0" : "200"} className="animate-flow-3" />
                    <path d="M285 220 L215 305" stroke="#8B5CF6" strokeDasharray={isLoaded ? "0" : "200"} className="animate-flow-4" />
                  </g>
                </svg>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="relative z-10 py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold text-center mb-12"
        >
          Key Features
        </motion.h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              title: "Visual Workflow Builder",
              description: "Drag-and-drop interface to create complex DeFi strategies with no coding required",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
              )
            },
            {
              title: "Cross-Chain Operations",
              description: "Seamlessly move assets between Polkadot parachains using XCM protocol",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="18" r="3"></circle>
                  <circle cx="6" cy="6" r="3"></circle>
                  <path d="M13 6h3a2 2 0 0 1 2 2v7"></path>
                  <path d="M11 18H8a2 2 0 0 1-2-2V9"></path>
                </svg>
              )
            },
            {
              title: "Automated Strategies",
              description: "Set up conditional logic to automate your DeFi operations based on market conditions",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                </svg>
              )
            },
            {
              title: "Real-time Analytics",
              description: "Monitor performance with integrated oracle feeds and price data across chains",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
              )
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-[#13141A] p-6 rounded-xl border border-gray-800 hover:border-blue-500 transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-blue-600/20 text-blue-400 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
      
      {/* Example Workflows Section */}
      <section id="workflows" className="relative z-10 py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold text-center mb-4"
        >
          Example Workflows
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-12 text-gray-400 max-w-2xl mx-auto"
        >
          Get started with pre-built templates or create your own custom workflows
        </motion.p>
        
        <div className="grid md:grid-cols-3 gap-6">
          {exampleWorkflows.map((workflow, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className={`${workflow.background} p-6 rounded-xl cursor-pointer relative overflow-hidden h-64 flex flex-col justify-between`}
            >
              {/* Abstract Path Background */}
              <svg className="absolute top-0 right-0 w-full h-full opacity-10" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <path fill="#FFFFFF" d="M34.2,-57.1C45.3,-51.1,56.1,-44.1,62.2,-33.9C68.3,-23.7,69.7,-11.8,68.8,-0.5C68,10.8,64.9,21.6,58.8,30.5C52.7,39.4,43.5,46.3,33.7,53.1C23.9,59.9,11.9,66.6,-0.6,67.5C-13.2,68.4,-26.4,63.5,-38.5,56.2C-50.7,49,-61.9,39.3,-67.4,27.1C-72.9,14.9,-72.7,0.1,-69.1,-12.9C-65.5,-25.9,-58.5,-37.2,-48.5,-43.7C-38.5,-50.3,-25.6,-52.2,-13.1,-59.7C-0.6,-67.2,11.4,-80.4,22.2,-77.2C33,-74,45.5,-54.3,54.7,-43.9C63.9,-33.5,69.8,-22.4,75.2,-9.6C80.7,3.3,85.7,17.9,83.5,31.3C81.3,44.6,72,56.8,59.4,62.9C46.9,69,31.1,69,16.6,70.1C2.1,71.1,-11,73.1,-24.8,71.2C-38.6,69.3,-53.2,63.4,-64.9,53.2C-76.6,43.1,-85.5,28.5,-88.1,12.8C-90.7,-2.9,-87,-19.9,-79.4,-34.2C-71.8,-48.5,-60.3,-60.3,-46.3,-68.2C-32.3,-76.1,-16.1,-80.1,-1.2,-78.3C13.8,-76.6,27.6,-69,39.2,-60.1C50.8,-51.3,60.2,-41.1,62.8,-29.6C65.3,-18,61,-5,59.7,8.5C58.3,22,59.9,36,55.3,47.6C50.8,59.3,40.1,68.6,27.9,70.2C15.6,71.9,1.7,65.8,-10.7,61.2C-23,56.5,-33.9,53.2,-47,48.2C-60.1,43.2,-75.5,36.4,-80.8,25.2C-86,14,-81.2,-1.6,-76.7,-16.8C-72.2,-31.9,-68,-46.5,-58.3,-56.5C-48.7,-66.4,-33.7,-71.7,-18.1,-75.4C-2.6,-79.1,13.5,-81.2,26.2,-76.3C38.9,-71.4,48.2,-59.5,59.3,-48.4C70.4,-37.3,83.3,-27,87.4,-14.2C91.5,-1.4,86.8,13.8,81,28.3C75.2,42.7,68.3,56.3,57.2,63.8C46.2,71.3,30.9,72.6,17.4,68.6C3.8,64.5,-7.9,55.1,-20.6,50.7C-33.4,46.3,-47.1,46.9,-58.1,41.5C-69.2,36,-77.5,24.6,-80.9,11.4C-84.3,-1.7,-82.8,-16.7,-77.2,-29.7C-71.7,-42.7,-62.1,-53.7,-50.1,-59.9C-38.1,-66,-23.7,-67.3,-8.2,-72.1C7.3,-76.9,24,-85.2,35.4,-82C46.7,-78.8,52.9,-64.1,60.1,-50.7C67.3,-37.3,75.5,-25.1,77.2,-12C78.9,1.1,74.1,15.1,67.6,26.9C61.2,38.8,53.1,48.4,43.1,56.5C33,64.5,21,70.9,7.5,73.9C-6,76.8,-21,76.2,-33.3,70.7C-45.6,65.1,-55.3,54.6,-64,43.3C-72.8,32,-80.6,19.9,-84.7,5.9C-88.9,-8.1,-89.3,-24,-83.1,-37.2C-77,-50.4,-64.2,-61,-50.2,-67.3C-36.3,-73.6,-21.1,-75.6,-5.7,-77.7C9.7,-79.9,25.5,-82.1,38,-77.4C50.5,-72.7,59.9,-61.1,65.7,-48.4C71.4,-35.7,73.4,-22,75.6,-7.8C77.9,6.3,80.4,21,77.7,35.2C75,49.4,67.1,63.2,55.8,73.1C44.4,83,29.6,89.1,14.5,90.6C-0.6,92.2,-16,89.2,-30.6,84.4C-45.2,79.7,-59.1,73.2,-70.1,63.2C-81.2,53.1,-89.5,39.5,-91.1,25.4C-92.8,11.3,-87.9,-3.3,-80.3,-15.4C-72.8,-27.6,-62.6,-37.2,-51.2,-44.7C-39.8,-52.2,-27.2,-57.6,-13.5,-59.1C0.1,-60.7,14.8,-58.5,29.9,-56.5C44.9,-54.4,60.3,-52.6,70.6,-44.5C80.8,-36.4,86.1,-22,87.1,-7.6C88.2,6.9,85,21.4,79.2,34.4C73.3,47.3,64.8,58.6,53.9,69C43,79.3,29.6,88.6,14.9,90.7C0.1,92.9,-16.1,87.9,-31.2,82.2C-46.4,76.6,-60.6,70.4,-71.2,60C-81.8,49.6,-88.9,35.1,-92.6,19.7C-96.4,4.4,-96.7,-11.7,-93,-27C-89.2,-42.3,-81.4,-56.9,-69.7,-67.6C-58,-78.2,-42.5,-85,-26,-90.9C-9.6,-96.8,7.9,-101.8,23.4,-97.8C38.9,-93.9,52.5,-81.1,60.5,-67.2C68.5,-53.2,70.9,-38,75.1,-22.3C79.4,-6.6,85.5,9.6,84.1,24.5C82.7,39.4,73.9,53,62.4,63.8C50.9,74.7,36.7,82.8,21.8,87C6.9,91.1,-8.7,91.4,-23.9,88.4C-39,85.5,-53.8,79.3,-67.6,70.2C-81.3,61.1,-93.9,49.2,-96.8,35.3C-99.7,21.3,-92.8,5.3,-88,-10.1C-83.3,-25.4,-80.5,-40.1,-72.3,-51.5C-64.1,-62.9,-50.4,-71.2,-36.2,-75.1C-21.9,-79,-7.1,-78.6,6.9,-76.7C21,-74.8,34.1,-71.4,46.9,-66.6C59.8,-61.7,72.3,-55.3,80.2,-45.1C88.1,-34.9,91.4,-21,88.3,-8.7C85.1,3.5,75.6,15.1,68.4,27.4C61.2,39.8,56.3,52.9,47.3,63.3C38.3,73.7,25.1,81.3,10.9,84.1C-3.4,86.8,-18.8,84.6,-33,80.4C-47.3,76.2,-60.5,69.9,-71.9,60.5C-83.3,51,-92.9,38.3,-98,24C-103,9.7,-103.3,-6.2,-99.4,-20.9C-95.6,-35.7,-87.5,-49.3,-76.6,-60.7C-65.6,-72.1,-51.8,-81.4,-37.1,-87.1C-22.3,-92.7,-6.6,-94.8,9,-97C24.5,-99.2,40,-101.5,53.9,-96.9C67.9,-92.4,80.2,-81,84.4,-67.3C88.6,-53.5,84.7,-37.5,82.8,-22.9C80.8,-8.3,80.8,5,81.7,19.4C82.6,33.7,84.3,49.1,76.7,57.8C69.1,66.5,52.2,68.6,36.8,70.7C21.4,72.8,7.5,75,0,75C-7.6,75,-8.8,72.8,-22.8,72.1C-36.8,71.3,-63.7,71.9,-78.4,62.1C-93.2,52.4,-95.9,32.2,-91.8,16C-87.6,-0.2,-76.6,-12.5,-67.4,-24.9C-58.1,-37.4,-50.5,-50,-40.4,-58.5C-30.4,-67,-17.7,-71.3,-4.3,-72.8C9.2,-74.3,23.3,-72.9,36.4,-68.5C49.5,-64.1,61.5,-56.7,72.6,-46.9C83.8,-37.1,94,-25,96.6,-11.8C99.1,1.5,94,15.7,88.3,29.6C82.7,43.5,76.5,57,65.9,64.8C55.4,72.7,40.5,74.8,26.2,76.8C11.9,78.7,-1.9,80.5,-15.3,78.6C-28.7,76.6,-41.8,70.9,-52.7,62.5C-63.6,54.1,-72.4,43.1,-80.2,30.4C-88,17.8,-94.7,3.5,-95.1,-10.9C-95.5,-25.2,-89.7,-39.5,-82,-52.8C-74.4,-66.2,-65.1,-78.5,-52.9,-85.3C-40.6,-92.2,-25.4,-93.5,-10.6,-95.3C4.2,-97,18.7,-99.2,32.1,-94.6C45.6,-90.1,58.1,-78.9,68.8,-66.8C79.6,-54.6,88.6,-41.5,89.4,-27.8C90.1,-14.2,82.7,-0.1,73.5,10.2C64.3,20.6,53.3,27.2,45.7,38.3C38,49.4,33.7,65,23.8,74.4C13.9,83.7,-1.6,86.8,-19.2,89.1" transform="translate(100 100)" />
              </svg>
              
              <div>
                <h3 className="text-xl font-bold mb-2 text-white">{workflow.title}</h3>
                <p className="text-white text-opacity-80 text-sm">{workflow.description}</p>
              </div>
              
              <button className="mt-4 self-start flex items-center text-white text-sm font-medium hover:gap-2 transition-all">
                Try workflow <FaArrowRight className="ml-2" />
              </button>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            onClick={() => router.push('/flow-builder')}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-medium inline-flex items-center transition-colors"
          >
            Explore All Templates <FaArrowRight className="ml-2" />
          </motion.button>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="relative z-10 py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 shadow-xl overflow-hidden relative">
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 h-full w-full opacity-20">
            <svg width="100%" height="100%" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 0 10 L 40 10 M 10 0 L 10 40" stroke="white" strokeWidth="1" fill="none" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          
          <div className="relative z-10 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold text-white mb-4"
            >
              Ready to Build Your DeFi Strategy?
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-white text-opacity-90 mb-8 max-w-2xl mx-auto"
            >
              Start creating automated cross-chain workflows with our visual builder. No coding required.
            </motion.p>
            
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => router.push('/flow-builder')}
              className="px-8 py-3 bg-white text-blue-600 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
            >
              <FaPlay className="inline mr-2" /> Launch Flow Builder
            </motion.button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="relative z-10 py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">Polkadot DeFi Flow</h3>
              <p className="text-gray-400 mb-4">
                Build, automate, and execute cross-chain DeFi strategies with a visual workflow builder.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <FaTwitter size={20} />
                </a>
                <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                  <FaDiscord size={20} />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <FaGithub size={20} />
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Tutorials</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">GitHub Repository</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Ecosystem</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Polkadot</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Kusama</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Parachains</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">XCM Protocol</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} Polkadot DeFi Flow. All rights reserved.</p>
          </div>
        </div>
      </footer>
      
      {/* Custom CSS for animations and effects */}
      <style jsx global>{`
        .grid-background {
          background-size: 40px 40px;
          background-image: 
            radial-gradient(circle, rgba(59, 130, 246, 0.2) 1px, transparent 1px);
          mask-image: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), 
                      rgba(0, 0, 0, 0.8) 0%, 
                      rgba(0, 0, 0, 0) 60%);
          opacity: 0.4;
        }
        
        @keyframes flow-animation {
          0% {
            stroke-dashoffset: 200;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        
        .animate-flow-1 {
          animation: flow-animation 2s ease-out 0.2s forwards;
        }
        
        .animate-flow-2 {
          animation: flow-animation 2s ease-out 0.5s forwards;
        }
        
        .animate-flow-3 {
          animation: flow-animation 2s ease-out 0.8s forwards;
        }
        
        .animate-flow-4 {
          animation: flow-animation 2s ease-out 1.1s forwards;
        }
      `}</style>
    </div>
  );
};

export default HomePage;