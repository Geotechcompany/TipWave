import { useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

const LandingPage = () => {
  const [stats, setStats] = useState({ users: 0, bids: 0, djs: 0 });

  return (
    <div className="bg-gradient-to-b from-black to-purple-900 text-white min-h-screen">
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CallToAction />
      <Footer />
    </div>
  );
};

const Header = () => {
  const { isSignedIn, user } = useUser();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black bg-opacity-50 backdrop-blur-md">
      <nav className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-3xl font-bold text-neon-blue">TipWave</div>
        <ul className="flex space-x-6">
          <li>
            <a
              href="#features"
              className="hover:text-neon-pink transition-colors"
            >
              Features
            </a>
          </li>
          <li>
            <a
              href="#how-it-works"
              className="hover:text-neon-pink transition-colors"
            >
              How It Works
            </a>
          </li>
          <li>
            <a
              href="#testimonials"
              className="hover:text-neon-pink transition-colors"
            >
              Testimonials
            </a>
          </li>
        </ul>
        <div>
          {isSignedIn ? (
            <>
              <Link href="/dashboard/user">
                <button className="bg-neon-blue text-white px-4 py-2 rounded-full hover:bg-neon-pink transition-colors mr-4">
                  Dashboard
                </button>
              </Link>
              <SignOutButton>
                <button className="bg-neon-pink text-white px-4 py-2 rounded-full hover:bg-neon-blue transition-colors">
                  Sign Out
                </button>
              </SignOutButton>
            </>
          ) : (
            <SignInButton mode="modal">
              <button className="bg-neon-blue text-white px-4 py-2 rounded-full hover:bg-neon-pink transition-colors">
                Sign In
              </button>
            </SignInButton>
          )}
        </div>
      </nav>
    </header>
  );
};

const Hero = () => {
  const { isSignedIn } = useUser();
  const videoRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 1.2]);

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
          <source src="/banner.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-black opacity-50" />
      </motion.div>
      <div className="relative z-10 max-w-4xl">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl md:text-7xl font-bold mb-6 text-neon-blue"
        >
          Shape the Night with TipWave
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl md:text-2xl mb-8"
        >
          Bid on your favorite songs and influence the DJ's playlist in
          real-time.
        </motion.p>
        {isSignedIn ? (
          <Link href="/dashboard/user">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-neon-pink text-white font-bold py-3 px-8 rounded-full text-xl transition-all duration-300 ease-in-out"
            >
              Go to Dashboard
            </motion.button>
          </Link>
        ) : (
          <SignInButton mode="modal">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-neon-pink text-white font-bold py-3 px-8 rounded-full text-xl transition-all duration-300 ease-in-out"
            >
              Start Bidding Now
            </motion.button>
          </SignInButton>
        )}
      </div>
    </motion.section>
  );
};

const Features = () => (
  <section id="features" className="py-20 px-6">
    <div className="max-w-6xl mx-auto">
      <h2 className="text-4xl font-bold mb-12 text-center text-neon-blue">
        Why Choose TipWave?
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <FeatureCard
          icon="🎵"
          title="Real-time Bidding"
          description="Place bids on songs and watch the playlist change instantly."
        />
        <FeatureCard
          icon="💰"
          title="Support Artists"
          description="Your bids directly support DJs and venues you love."
        />
        <FeatureCard
          icon="🎉"
          title="Enhanced Experience"
          description="Enjoy a more interactive and personalized night out."
        />
      </div>
    </div>
  </section>
);

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-purple-800 p-6 rounded-lg text-center">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-2xl font-bold mb-2 text-neon-pink">{title}</h3>
    <p>{description}</p>
  </div>
);

const HowItWorks = () => (
  <section id="how-it-works" className="py-20 px-6 bg-black">
    <div className="max-w-6xl mx-auto">
      <h2 className="text-4xl font-bold mb-12 text-center text-neon-blue">
        How Tip Wave Works
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Step
          number="1"
          title="Join the Wave"
          description="Sign up and enter a TipWave-enabled venue."
        />
        <Step
          number="2"
          title="Place Your Bid"
          description="Browse songs and place bids on your favorites."
        />
        <Step
          number="3"
          title="Enjoy the Music"
          description="The highest bidded songs get played by the DJ."
        />
      </div>
    </div>
  </section>
);

const Step = ({ number, title, description }) => (
  <div className="text-center">
    <div className="inline-block bg-neon-pink text-black text-2xl font-bold rounded-full w-12 h-12 flex items-center justify-center mb-4">
      {number}
    </div>
    <h3 className="text-2xl font-bold mb-2 text-neon-blue">{title}</h3>
    <p>{description}</p>
  </div>
);

const Testimonials = () => (
  <section id="testimonials" className="py-20 px-6">
    <div className="max-w-6xl mx-auto">
      <h2 className="text-4xl font-bold mb-12 text-center text-neon-blue">
        What Our Users Say
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <TestimonialCard
          quote="TipWave has completely changed how I experience clubs. It's so much fun to bid on songs and see them played!"
          author="Alex, Music Lover"
        />
        <TestimonialCard
          quote="As a DJ, TipWave helps me connect with the crowd like never before. It's a game-changer for the industry."
          author="DJ Spark"
        />
      </div>
    </div>
  </section>
);

const TestimonialCard = ({ quote, author }) => (
  <div className="bg-purple-800 p-6 rounded-lg">
    <p className="text-lg mb-4">"{quote}"</p>
    <p className="font-bold text-neon-pink">- {author}</p>
  </div>
);

const CallToAction = () => (
  <section className="py-20 px-6 bg-gradient-to-r from-purple-600 to-pink-500">
    <div className="max-w-4xl mx-auto text-center">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold mb-6 text-white"
      >
        Ready to Ride the TipWave?
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-xl mb-8 text-white"
      >
        Join thousands of music lovers and DJs in shaping the soundtrack of the
        night!
      </motion.p>
      <SignInButton mode="modal">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-white text-purple-600 font-bold py-3 px-8 rounded-full text-xl transition-all duration-300 ease-in-out"
        >
          Get Started Now
        </motion.button>
      </SignInButton>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-black text-white py-12 px-6">
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
      <div>
        <h3 className="text-2xl font-bold mb-4 text-neon-blue">TipWave</h3>
        <p>Shaping the soundtrack of your night, one bid at a time.</p>
      </div>
      <div>
        <h4 className="text-xl font-bold mb-4 text-neon-pink">Quick Links</h4>
        <ul className="space-y-2">
          <li>
            <a href="#" className="hover:text-neon-blue transition-colors">
              About Us
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-neon-blue transition-colors">
              Features
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-neon-blue transition-colors">
              For DJs
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-neon-blue transition-colors">
              Contact
            </a>
          </li>
        </ul>
      </div>
      <div>
        <h4 className="text-xl font-bold mb-4 text-neon-pink">Follow Us</h4>
        <div className="flex space-x-4">
          <a href="#" className="hover:text-neon-blue transition-colors">
            Twitter
          </a>
          <a href="#" className="hover:text-neon-blue transition-colors">
            Instagram
          </a>
          <a href="#" className="hover:text-neon-blue transition-colors">
            TikTok
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
