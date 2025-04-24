"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link"; // Removed unused import: useRouter
import Image from "next/image";
import { ChevronRight } from "lucide-react";

const LandingPage = () => {
  // Remove unused state variables
  // const [stats, setStats] = useState({ users: 12500, bids: 74600, djs: 850 });
  
  // Parallax background effect
  const parallaxRef = useRef(null);
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!parallaxRef.current) return;
      const x = (window.innerWidth - e.pageX) / 100;
      const y = (window.innerHeight - e.pageY) / 100;
      parallaxRef.current.style.transform = `translateX(${x}px) translateY(${y}px)`;
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative overflow-hidden bg-black text-white">
      {/* Neural network particle background */}
      <div className="fixed inset-0 z-0 opacity-40">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-black"></div>
        <div ref={parallaxRef} className="w-full h-full">
          <Image src="https://images.unsplash.com/photo-1484417894907-623942c8ee29?q=80&w=2940&auto=format&fit=crop"
            alt="Neural Network"
            layout="fill"
            objectFit="cover"
            quality={100}
            className="opacity-20"
          />
        </div>
      </div>
      
      {/* Neon accents */}
      <div className="fixed top-0 left-0 w-1/3 h-1 bg-gradient-to-r from-blue-500 to-purple-500 blur-sm"></div>
      <div className="fixed top-0 right-0 w-1/2 h-1 bg-gradient-to-l from-pink-500 to-purple-500 blur-sm"></div>
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur-sm"></div>
      
      <div className="relative z-10">
        <Header />
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <CallToAction />
        <PricingSection />
        <Footer />
      </div>
    </div>
  );
};

const Header = () => {
  // Modify this component to remove the unused session variable
  // const { data: session } = useSession();
  // const router = useRouter();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-lg border-b border-white/10">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/">
          <span className="text-2xl font-bold">TipWave</span>
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-white/80 hover:text-white transition-colors duration-300">Features</a>
          <a href="#how-it-works" className="text-white/80 hover:text-white transition-colors duration-300">How It Works</a>
          <a href="#testimonials" className="text-white/80 hover:text-white transition-colors duration-300">Testimonials</a>
          
          {/* {status === "authenticated" ? (
            <div className="flex items-center gap-4">
              <Link href="/dashboard/user">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium"
                >
                  Dashboard
                </motion.button>
              </Link>
              <motion.button
                onClick={handleSignOut}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2.5 rounded-full border border-purple-500/50 text-white/90 font-medium"
              >
                Sign Out
              </motion.button>
            </div>
          ) : (
            <motion.button
              onClick={handleSignIn}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium"
            >
              Sign In
            </motion.button>
          )} */}
        </div>

        {/* Mobile menu button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-white/80 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </motion.button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/80 backdrop-blur-lg border-b border-white/10"
          >
            <div className="px-6 py-4 space-y-4">
              <a href="#features" className="block text-white/80 hover:text-white transition-colors duration-300">Features</a>
              <a href="#how-it-works" className="block text-white/80 hover:text-white transition-colors duration-300">How It Works</a>
              <a href="#testimonials" className="block text-white/80 hover:text-white transition-colors duration-300">Testimonials</a>
              
              <div className="pt-4">
                {/* {status === "authenticated" ? (
                  <div className="flex flex-col space-y-3">
                    <Link href="/dashboard/user">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="w-full px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </motion.button>
                    </Link>
                    <motion.button
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full px-4 py-2 rounded-full border border-purple-500/50 text-white/90 font-medium"
                    >
                      Sign Out
                    </motion.button>
                  </div>
                ) : (
                  <motion.button
                    onClick={() => {
                      handleSignIn();
                      setIsMenuOpen(false);
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium"
                  >
                    Sign In
                  </motion.button>
                )} */}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

const Hero = () => {
  // const { data: session } = useSession();
  const videoRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 1.1]);
  const yPosAnim = useTransform(scrollYProgress, [0, 0.3], [0, 100]);
  
  return (
    <motion.section
      style={{ opacity }}
      className="relative h-screen flex flex-col justify-center items-center text-center p-6 overflow-hidden"
      id="hero"
    >
      <motion.div style={{ scale }} className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/banner.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black"></div>
      </motion.div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ y: yPosAnim }}
          className="space-y-8"
        >
          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          >
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
              Shape the Night
            </span>
            <span className="block">with TipWave</span>
          </motion.h1>
          
          <motion.p
            className="text-xl md:text-2xl mb-8 text-white/80 max-w-2xl mx-auto"
          >
            Elevate your nightlife experience. Bid on your favorite songs and 
            influence the DJ&apos;s playlist in real-time.
          </motion.p>
          
          <div className="flex justify-center gap-4 mt-8">
            {/* {session ? (
              <Link href="/dashboard/user">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(139, 92, 246, 0.7)" }}
                  whileTap={{ scale: 0.95 }}
                  className="relative group px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full text-white font-bold text-lg overflow-hidden"
                >
                  <span className="relative flex items-center justify-center">
                    Go to Dashboard
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </span>
                </motion.button>
              </Link>
            ) : (
              <motion.button
                onClick={() => signIn()}
                whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(139, 92, 246, 0.7)" }}
                whileTap={{ scale: 0.95 }}
                className="relative group px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full text-white font-bold text-lg overflow-hidden"
              >
                <span className="relative flex items-center justify-center">
                  Start Bidding Now
                  <ChevronRight className="ml-2 h-5 w-5" />
                </span>
              </motion.button>
            )} */}
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="pt-20 flex flex-wrap justify-center gap-12 text-center"
          >
            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
                {new Intl.NumberFormat().format(12500)}+
              </span>
              <span className="text-white/60 text-sm uppercase tracking-wider mt-2">Active Users</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600">
                {new Intl.NumberFormat().format(74600)}+
              </span>
              <span className="text-white/60 text-sm uppercase tracking-wider mt-2">Songs Played</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-pink-600">
                {new Intl.NumberFormat().format(850)}+
              </span>
              <span className="text-white/60 text-sm uppercase tracking-wider mt-2">Partner DJs</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
      
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10">
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <a href="#features" className="flex flex-col items-center text-white/60 hover:text-white/90 transition-colors">
            <span className="text-xs uppercase tracking-widest mb-2">Discover More</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>
        </motion.div>
      </div>
    </motion.section>
  );
};

const Features = () => {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0.1, 0.2, 0.3, 0.4], [0, 1, 1, 0]);
  
  const features = [
    {
      title: "Real-time Bidding",
      description: "Place bids on songs you want to hear next and watch as the DJ's playlist updates in real-time.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      image: "https://images.unsplash.com/photo-1642078834515-ec885ec26fa6?q=80&w=2400&auto=format&fit=crop"
    },
    {
      title: "Smart DJ Analytics",
      description: "DJs receive detailed analytics about song popularity and audience preferences to optimize their sets.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      image: "https://images.unsplash.com/photo-1624384562382-1f8ed7b97e65?q=80&w=2370&auto=format&fit=crop"
    },
    {
      title: "Secure Payments",
      description: "All transactions are processed securely, so you can focus on enjoying the music.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      image: "https://images.unsplash.com/photo-1604594849809-dfedbc827105?q=80&w=2370&auto=format&fit=crop"
    }
  ];
  
  return (
    <motion.section
      style={{ opacity }}
      id="features"
      className="py-24 px-6 relative"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
              Revolutionary Features
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-white/70 max-w-2xl mx-auto"
          >
            Experience the future of nightlife with our cutting-edge platform that
            connects party-goers directly with DJs.
          </motion.p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-10">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative h-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
                <div className="h-48 relative overflow-hidden">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    layout="fill"
                    objectFit="cover"
                    className="group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-black/20"></div>
                </div>
                <div className="p-6">
                  <div className="rounded-full w-16 h-16 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm border border-white/10 mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-white/70">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Create an Account",
      description: "Sign up in seconds and join the TipWave community.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      number: "02",
      title: "Discover Events",
      description: "Find nearby venues and events that use TipWave.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      number: "03",
      title: "Place Your Bids",
      description: "Browse the song library and bid on your favorites.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      number: "04",
      title: "Enjoy the Music",
      description: "Dance to your song when it gets played by the DJ.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      )
    }
  ];
  
  return (
    <section id="how-it-works" className="py-24 px-6 relative">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/10 to-black"></div>
        <Image
          src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2370&auto=format&fit=crop"
          alt="DJ Background"
          layout="fill"
          objectFit="cover"
          quality={90}
          className="opacity-20"
        />
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              How It Works
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-white/70 max-w-2xl mx-auto"
          >
            It&apos;s that simple to get your music played.
          </motion.p>
        </div>
        
        <div className="relative">
          {/* Connection line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 transform -translate-x-1/2 z-0"></div>
          
          <div className="space-y-24 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8`}
              >
                <div className="md:w-1/2">
                  <div className={`text-center md:text-${index % 2 === 0 ? 'right' : 'left'}`}>
                    <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
                      {step.icon}
                    </div>
                    <h3 className="text-3xl font-bold mb-2 flex items-center gap-3 justify-center md:justify-start">
                      <span className="text-sm bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-400">{step.number}</span>
                      {step.title}
                    </h3>
                    <p className="text-lg text-white/70 max-w-md">{step.description}</p>
                  </div>
                </div>
                
                <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-gray-900 border border-purple-500 z-20">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                </div>
                
                <div className="md:w-1/2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
                  <div className="h-64 relative">
                    <Image
                      src={`https://images.unsplash.com/photo-${index === 0 ? '1540039155733-5bb30b53aa14' : index === 1 ? '1429962714451-bb934ecdc4ec' : index === 2 ? '1516873240891-996f09f3cd2e' : '1496307042754-b4aa456c4a2d'}?q=80&w=800&auto=format&fit=crop`}
                      alt={`Step ${step.number}`}
                      layout="fill"
                      objectFit="cover"
                      className="opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => {
  const testimonials = [
    {
      quote: "As a DJ, TipWave has completely transformed how I interact with my audience. The real-time feedback is invaluable.",
      name: "DJ Quantum",
      role: "Club Resident DJ",
      avatar: "https://images.unsplash.com/photo-1531891570158-e71b35a485bc?q=80&w=1064&auto=format&fit=crop"
    },
    {
      quote: "I love being able to influence what's played next! It makes every night out feel personalized and interactive.",
      name: "Aisha Johnson",
      role: "Regular User",
      avatar: "https://images.unsplash.com/photo-1597586124394-fbd6ef244026?q=80&w=774&auto=format&fit=crop"
    },
    {
      quote: "Our venue revenue increased by 30% after implementing TipWave. Customers stay longer and spend more.",
      name: "Marcus Rodriguez",
      role: "Nightclub Owner",
      avatar: "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?q=80&w=1170&auto=format&fit=crop"
    }
  ];
  
  return (
    <section id="testimonials" className="py-24 px-6 relative bg-gradient-to-b from-black via-purple-900/10 to-black">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
              What People Say
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-white/70 max-w-2xl mx-auto"
          >
            Join thousands of satisfied users who have already transformed their nightlife experience.
          </motion.p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gradient-to-br from-gray-900/40 to-gray-800/40 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-6 hover:border-purple-500/50 transition-all duration-300 group"
            >
              <div className="mb-4">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-purple-400 mb-2">
                  <path d="M9.33333 21.3333C7.86667 21.3333 6.66667 20.8 5.73333 19.7333C4.8 18.6667 4.33333 17.3333 4.33333 15.7333C4.33333 14.2667 4.73333 12.9333 5.53333 11.7333C6.33333 10.5333 7.33333 9.6 8.53333 8.93333C9.73333 8.26667 11 7.73333 12.3333 7.33333C13.6667 6.93333 14.8667 6.66667 15.9333 6.53333L16.6667 8.8C15.2 9.06667 13.8 9.46667 12.4667 10C11.1333 10.5333 10.1333 11.2 9.46667 12C8.8 12.8 8.53333 13.7333 8.66667 14.8C9.06667 14.6667 9.6 14.6 10.2667 14.6C11.6 14.6 12.7333 15.0667 13.6667 16C14.6 16.9333 15.0667 18.0667 15.0667 19.4C15.0667 20.7333 14.6 21.8667 13.6667 22.8C12.7333 23.7333 11.6 24.2 10.2667 24.2C10.1333 24.2 9.73333 24.1333 9.06667 24C8.46667 23.7333 7.86667 23.3333 7.26667 22.8C6.66667 22.2667 6.2 21.6 5.86667 20.8C5.53333 20 5.4 19.1333 5.46667 18.2C5.46667 17.9333 5.46667 17.6667 5.46667 17.4C5.53333 17.1333 5.53333 16.8667 5.46667 16.6H3.86667V15.2667C3.86667 12.5333 4.6 10.2667 6.06667 8.46667C7.53333 6.66667 9.46667 5.46667 11.8667 4.86667C14.2667 4.26667 16.8 4.06667 19.4667 4.26667L19.7333 6.4C17.4667 6.4 15.3333 6.73333 13.3333 7.4C11.3333 8.06667 9.73333 9.13333 8.53333 10.6C7.33333 12.0667 6.73333 13.9333 6.73333 16.2L10.2667 16C11.2 16 12 16.3333 12.6667 17C13.3333 17.6667 13.6667 18.4667 13.6667 19.4C13.6667 20.3333 13.3333 21.1333 12.6667 21.8C12 22.4667 11.2 22.8 10.2667 22.8C9.93333 22.8 9.6 22.6667 9.33333 22.4C9.06667 22.1333 8.93333 21.8 8.93333 21.4667C8.86667 21.3333 9 21.3333 9.33333 21.3333ZM25.3333 21.3333C23.8667 21.3333 22.6667 20.8 21.7333 19.7333C20.8 18.6667 20.3333 17.3333 20.3333 15.7333C20.3333 14.2667 20.7333 12.9333 21.5333 11.7333C22.3333 10.5333 23.3333 9.6 24.5333 8.93333C25.7333 8.26667 27 7.73333 28.3333 7.33333C29.6667 6.93333 30.8667 6.66667 31.9333 6.53333L32.6667 8.8C31.2 9.06667 29.8 9.46667 28.4667 10C27.1333 10.5333 26.1333 11.2 25.4667 12C24.8 12.8 24.5333 13.7333 24.6667 14.8C25.0667 14.6667 25.6 14.6 26.2667 14.6C27.6 14.6 28.7333 15.0667 29.6667 16C30.6 16.9333 31.0667 18.0667 31.0667 19.4C31.0667 20.7333 30.6 21.8667 29.6667 22.8C28.7333 23.7333 27.6 24.2 26.2667 24.2C26.1333 24.2 25.7333 24.1333 25.0667 24C24.4667 23.7333 23.8667 23.3333 23.2667 22.8C22.6667 22.2667 22.2 21.6 21.8667 20.8C21.5333 20 21.4 19.1333 21.4667 18.2C21.4667 17.9333 21.4667 17.6667 21.4667 17.4C21.5333 17.1333 21.5333 16.8667 21.4667 16.6H19.8667V15.2667C19.8667 12.5333 20.6 10.2667 22.0667 8.46667C23.5333 6.66667 25.4667 5.46667 27.8667 4.86667C30.2667 4.26667 32.8 4.06667 35.4667 4.26667L35.7333 6.4C33.4667 6.4 31.3333 6.73333 29.3333 7.4C27.3333 8.06667 25.7333 9.13333 24.5333 10.6C23.3333 12.0667 22.7333 13.9333 22.7333 16.2L26.2667 16C27.2 16 28 16.3333 28.6667 17C29.3333 17.6667 29.6667 18.4667 29.6667 19.4C29.6667 20.3333 29.3333 21.1333 28.6667 21.8C28 22.4667 27.2 22.8 26.2667 22.8C25.9333 22.8 25.6 22.6667 25.3333 22.4C25.0667 22.1333 24.9333 21.8 24.9333 21.4667C24.8667 21.3333 25 21.3333 25.3333 21.3333Z" fill="currentColor" />
                </svg>
                <p className="text-white/90 mb-4">{testimonial.quote}</p>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-3 border-2 border-purple-500/30">
                  <Image 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-white">{testimonial.name}</h4>
                  <p className="text-sm text-white/60">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CallToAction = () => {
  // Remove unused scrollYProgress or add ESLint disable comment
  // eslint-disable-next-line no-unused-vars
  const { scrollYProgress } = useScroll();
  
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Dynamic background with particles and gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 via-purple-900/50 to-black z-0">
        <div className="absolute inset-0 opacity-30">
          <Image 
            src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=2070&auto=format&fit=crop"
            alt="DJ Concert"
            layout="fill"
            objectFit="cover"
            quality={100}
            className="opacity-40"
          />
        </div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full bg-white/20 blur-sm animate-float"
              style={{
                width: Math.random() * 10 + 5 + 'px',
                height: Math.random() * 10 + 5 + 'px',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                animationDuration: Math.random() * 15 + 10 + 's',
                animationDelay: Math.random() * 5 + 's',
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Glowing border */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div className="space-y-8">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold"
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Ready to <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">Transform</span> Your Nightlife?
          </motion.h2>
          
          <motion.p 
            className="text-xl text-white/80 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            Join thousands of music lovers and DJs already using TipWave to create unforgettable nightlife experiences. Get started in minutes.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row justify-center gap-4 mt-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <motion.button
              whileHover={{ 
                scale: 1.05, 
                boxShadow: "0 0 25px rgba(139, 92, 246, 0.5)",
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.95 }}
              className="relative px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium text-lg overflow-hidden group"
            >
              <span className="absolute top-0 left-0 w-full h-full bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></span>
              <span className="relative flex items-center justify-center gap-2">
                Get Started <ChevronRight size={20} />
              </span>
            </motion.button>
            
            <motion.button
              whileHover={{ 
                scale: 1.05,
                borderColor: "rgba(168, 85, 247, 0.8)",
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-full border-2 border-purple-500/50 hover:border-purple-500 text-white font-medium text-lg transition-colors duration-300"
            >
              For DJs
            </motion.button>
          </motion.div>
          
          {/* Testimonial micro-quote */}
          <motion.div 
            className="mt-10 pt-8 max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            <div className="relative">
              <div className="absolute -top-4 left-0 text-4xl text-purple-500/70"></div>
              <p className="italic text-white/80">TipWave revolutionized our venue&apos;s experience. Revenue up 35% in just three months!</p>
              <div className="flex items-center justify-center mt-4">
                <div className="w-8 h-8 rounded-full overflow-hidden mr-3 bg-gradient-to-r from-blue-500 to-purple-500 p-0.5">
                  <div className="w-full h-full rounded-full overflow-hidden bg-gray-900">
                    <Image src="https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?q=80&w=150&auto=format&fit=crop" 
                      width={32} 
                      height={32} 
                      alt="Club Owner" 
                    />
                  </div>
                </div>
                <span className="text-sm font-medium">Marcus R. - Club Owner</span>
              </div>
            </div>
          </motion.div>
          
          <div className="pt-8 text-white/60 text-sm flex items-center justify-center gap-2">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              No credit card required
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              Free tier available
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              Cancel anytime
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const PricingSection = () => {
  const plans = [
    {
      name: "Free",
      price: "0",
      description: "Perfect for getting started",
      features: [
        "Basic song requests",
        "View live DJs",
        "Standard request priority",
        "Basic analytics"
      ],
      cta: "Get Started",
      highlighted: false
    },
    {
      name: "Pro",
      price: "19",
      description: "For serious music lovers",
      features: [
        "Priority song requests",
        "Advanced analytics",
        "Custom playlists",
        "Request history",
        "Premium support",
        "No ads"
      ],
      cta: "Upgrade Now",
      highlighted: true
    },
    {
      name: "Business",
      price: "49",
      description: "For venues and events",
      features: [
        "All Pro features",
        "Multiple venues",
        "API access",
        "Custom branding",
        "24/7 support",
        "Priority queue"
      ],
      cta: "Contact Sales",
      highlighted: false
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-black relative">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/0 via-gray-900/50 to-black"></div>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-6 relative z-10"
      >
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-blue-400">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Select the perfect plan for your needs. Upgrade or downgrade at any time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative rounded-2xl backdrop-blur-xl border ${
                plan.highlighted 
                  ? 'bg-gradient-to-b from-blue-600/20 to-purple-600/20 border-blue-500/30' 
                  : 'bg-gray-900/50 border-gray-800'
              } p-8`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-white">${plan.price}</span>
                  <span className="text-gray-400">/month</span>
                </div>
                <p className="text-gray-400 mt-2">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center text-gray-300">
                    <svg className="w-5 h-5 mr-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button 
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors duration-200 ${
                  plan.highlighted
                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                }`}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>

        <div className="pt-8 text-white/60 text-sm flex items-center justify-center gap-2">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
            </svg>
            No credit card required
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
            </svg>
            Free tier available
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
            </svg>
            Cancel anytime
          </span>
        </div>
      </motion.div>
    </section>
  );
};

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-black border-t border-gray-800 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                TipWave
              </span>
            </h2>
            <p className="text-white/60 text-sm">
              Revolutionizing the interaction between DJs and their audience, creating a more engaged and personalized experience for all.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z" />
                </svg>
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                </svg>
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z" />
                </svg>
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z" />
                </svg>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">For DJs</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">For Venues</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Integrations</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">API</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Support</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Community</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Privacy</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Terms</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-800 text-white/40 text-sm flex flex-col md:flex-row justify-between items-center">
          <div>© {currentYear} TipWave, Inc. All rights reserved.</div>
          <div className="mt-4 md:mt-0">
            <ul className="flex space-x-6">
              <li><a href="#" className="hover:text-white/70 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white/70 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white/70 transition-colors">Cookies Settings</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingPage;