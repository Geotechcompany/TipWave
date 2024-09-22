import React, { useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { SignInButton, useUser } from "@clerk/nextjs";

const LandingPage = () => {
  const { isSignedIn, user, isLoaded } = useUser();
  const [stats, setStats] = useState({ users: 0, bids: 0, djs: 0 });

  return (
    <div className="bg-gray-900 text-white">
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <CallToAction />
      <Footer />
    </div>
  );
};

const Hero = () => {
  const [muted, setMuted] = useState(true);
  const videoRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 1.2]);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setMuted(!muted);
    }
  };

  return (
    <motion.section
      style={{ opacity }}
      className="h-screen flex flex-col justify-center items-center text-center p-6 relative overflow-hidden"
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
          <source src="/club-atmosphere.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-black opacity-50" />
      </motion.div>
      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl md:text-7xl font-bold mb-6"
        >
          TipWave: Shape the Night's Soundtrack
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl md:text-2xl mb-8"
        >
          Bid on your favorite songs, influence the DJ's playlist, and elevate
          your night out!
        </motion.p>
        <SignInButton mode="modal">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-neon-blue text-white font-bold py-3 px-6 rounded-lg text-xl transition-all duration-300 ease-in-out"
          >
            Start Bidding Now
          </motion.button>
        </SignInButton>
      </div>
    </motion.section>
  );
};

const Features = () => (
  <section className="py-16 px-6 bg-gray-800">
    <div className="max-w-6xl mx-auto">
      <h2 className="text-4xl font-bold mb-12 text-center">
        Why Choose TipWave?
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard
          icon="🎵"
          title="Song Bidding"
          description="Place bids on your favorite songs to increase their chances of being played."
        />
        <FeatureCard
          icon="🎧"
          title="DJ Interaction"
          description="Connect with DJs and influence their playlists in real-time."
        />
        <FeatureCard
          icon="🌊"
          title="Dynamic Atmosphere"
          description="Experience a night that evolves with the crowd's musical preferences."
        />
      </div>
    </div>
  </section>
);

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-gray-700 p-6 rounded-lg">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-2xl font-bold mb-2">{title}</h3>
    <p>{description}</p>
  </div>
);

const HowItWorks = () => (
  <section className="py-16 px-6 bg-gray-900">
    <div className="max-w-4xl mx-auto">
      <h2 className="text-4xl font-bold mb-12 text-center">
        How TipWave Works
      </h2>
      <ol className="space-y-8">
        <li className="flex items-center">
          <span className="bg-neon-blue text-white rounded-full w-8 h-8 flex items-center justify-center mr-4">
            1
          </span>
          <p className="text-xl">
            Join a TipWave-enabled event at your favorite club or venue.
          </p>
        </li>
        <li className="flex items-center">
          <span className="bg-neon-blue text-white rounded-full w-8 h-8 flex items-center justify-center mr-4">
            2
          </span>
          <p className="text-xl">
            Browse the available song list and place bids on your top choices.
          </p>
        </li>
        <li className="flex items-center">
          <span className="bg-neon-blue text-white rounded-full w-8 h-8 flex items-center justify-center mr-4">
            3
          </span>
          <p className="text-xl">
            Watch as the highest-bid songs rise to the top of the DJ's playlist.
          </p>
        </li>
        <li className="flex items-center">
          <span className="bg-neon-blue text-white rounded-full w-8 h-8 flex items-center justify-center mr-4">
            4
          </span>
          <p className="text-xl">
            Enjoy a night of music shaped by you and the crowd!
          </p>
        </li>
      </ol>
    </div>
  </section>
);

const Testimonials = () => (
  <section className="py-16 px-6 bg-gray-800">
    <div className="max-w-6xl mx-auto">
      <h2 className="text-4xl font-bold mb-12 text-center">
        What Our Users Say
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <TestimonialCard
          quote="TipWave transformed our club nights. The energy is unreal when everyone's invested in the playlist!"
          author="Alex, Club Owner"
        />
        <TestimonialCard
          quote="As a DJ, I love the interaction with the crowd. It's like we're creating the perfect night together."
          author="DJ Sarah"
        />
      </div>
    </div>
  </section>
);

const TestimonialCard = ({ quote, author }) => (
  <div className="bg-gray-700 p-6 rounded-lg">
    <p className="text-xl mb-4">"{quote}"</p>
    <p className="font-bold">- {author}</p>
  </div>
);

const Pricing = () => (
  <section className="py-16 px-6 bg-gray-900">
    <div className="max-w-4xl mx-auto text-center">
      <h2 className="text-4xl font-bold mb-12">
        Simple Pricing for Unforgettable Nights
      </h2>
      <div className="bg-gray-800 p-8 rounded-lg">
        <h3 className="text-2xl font-bold mb-4">Pay-Per-Bid</h3>
        <p className="text-4xl font-bold mb-6">
          $1 <span className="text-xl font-normal">per bid</span>
        </p>
        <ul className="text-left mb-8">
          <li className="mb-2">✅ No subscription required</li>
          <li className="mb-2">✅ Bid on as many songs as you want</li>
          <li className="mb-2">✅ Increase your bids to boost your chances</li>
        </ul>
        <SignInButton mode="modal">
          <button className="bg-neon-blue text-white font-bold py-3 px-6 rounded-lg text-xl transition-all duration-300 ease-in-out">
            Start Bidding
          </button>
        </SignInButton>
      </div>
    </div>
  </section>
);

const CallToAction = () => (
  <section className="py-16 px-6 bg-gradient-to-r from-purple-600 to-pink-500">
    <div className="max-w-4xl mx-auto text-center">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold mb-6"
      >
        Ready to Shape the Night's Soundtrack?
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-xl mb-8"
      >
        Join TipWave today and experience the future of interactive nightlife!
      </motion.p>
      <SignInButton mode="modal">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-white text-purple-600 font-bold py-3 px-6 rounded-lg text-xl transition-all duration-300 ease-in-out"
        >
          Get Started Now
        </motion.button>
      </SignInButton>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-gray-900 text-white py-8 px-6">
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
      <div>
        <h3 className="text-2xl font-bold mb-4">TipWave</h3>
        <p>Shaping the soundtrack of your night out.</p>
      </div>
      <div>
        <h4 className="text-xl font-bold mb-4">Quick Links</h4>
        <ul className="space-y-2">
          <li>
            <a href="#" className="hover:text-neon-pink transition-colors">
              About Us
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-neon-pink transition-colors">
              Features
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-neon-pink transition-colors">
              Pricing
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-neon-pink transition-colors">
              Contact
            </a>
          </li>
        </ul>
      </div>
      <div>
        <h4 className="text-xl font-bold mb-4">Follow Us</h4>
        <div className="flex space-x-4">
          <a href="#" className="hover:text-neon-blue transition-colors">
            Twitter
          </a>
          <a href="#" className="hover:text-neon-blue transition-colors">
            Facebook
          </a>
          <a href="#" className="hover:text-neon-blue transition-colors">
            Instagram
          </a>
        </div>
      </div>
    </div>
    <div className="mt-8 text-center">
      <p>&copy; 2024 TipWave. All rights reserved.</p>
    </div>
  </footer>
);

export default LandingPage;
