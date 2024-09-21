import { useState, useEffect } from "react";
import { useUser, SignInButton, SignOutButton } from "@clerk/nextjs";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, Music, Users, DollarSign } from "lucide-react";

export default function LandingPage() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [stats, setStats] = useState({ users: 0, bids: 0, djs: 0 });
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  useEffect(() => {
    // Simulating fetching stats
    setStats({ users: 10000, bids: 50000, djs: 500 });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-6">
        <h1 className="text-3xl font-bold text-neon-blue">DJ Tipping App</h1>
        {isLoaded &&
          (isSignedIn ? (
            <SignOutButton>
              <button className="bg-neon-pink hover:bg-neon-pink/80 text-white font-bold py-2 px-4 rounded transition-all duration-300 ease-in-out transform hover:scale-105">
                Sign Out
              </button>
            </SignOutButton>
          ) : (
            <SignInButton mode="modal">
              <button className="bg-neon-pink hover:bg-neon-pink/80 text-white font-bold py-2 px-4 rounded transition-all duration-300 ease-in-out transform hover:scale-105">
                Sign In
              </button>
            </SignInButton>
          ))}
      </header>

      <motion.section
        style={{ opacity, scale }}
        className="h-screen flex flex-col justify-center items-center text-center p-6"
      >
        <h2 className="text-6xl font-bold mb-6">Tip Your Favorite DJs</h2>
        <p className="text-xl mb-8">
          Request songs, place bids, and support the music you love!
        </p>
        <SignInButton mode="modal">
          <button className="bg-neon-blue hover:bg-neon-blue/80 text-white font-bold py-3 px-6 rounded-lg text-xl transition-all duration-300 ease-in-out transform hover:scale-105">
            Join the Fun!
          </button>
        </SignInButton>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="mt-12"
        >
          <ArrowDown size={32} />
        </motion.div>
      </motion.section>

      <section className="py-16 px-6">
        <h2 className="text-4xl font-bold mb-8 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-dark-gray p-6 rounded-lg text-center"
          >
            <Music className="mx-auto mb-4 text-neon-blue" size={48} />
            <h3 className="text-2xl font-bold mb-2">Request Songs</h3>
            <p>
              Search for your favorite tracks and add them to the DJ's queue.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-dark-gray p-6 rounded-lg text-center"
          >
            <DollarSign className="mx-auto mb-4 text-neon-pink" size={48} />
            <h3 className="text-2xl font-bold mb-2">Place Bids</h3>
            <p>
              Increase your chances of hearing your song by placing higher bids.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-dark-gray p-6 rounded-lg text-center"
          >
            <Users className="mx-auto mb-4 text-neon-green" size={48} />
            <h3 className="text-2xl font-bold mb-2">Support DJs</h3>
            <p>Your bids directly support your favorite DJs and their music.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 px-6 bg-dark-gray">
        <h2 className="text-4xl font-bold mb-8 text-center">Platform Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h3 className="text-6xl font-bold text-neon-blue mb-2">
              {stats.users.toLocaleString()}
            </h3>
            <p className="text-xl">Active Users</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center"
          >
            <h3 className="text-6xl font-bold text-neon-pink mb-2">
              {stats.bids.toLocaleString()}
            </h3>
            <p className="text-xl">Total Bids</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center"
          >
            <h3 className="text-6xl font-bold text-neon-green mb-2">
              {stats.djs.toLocaleString()}
            </h3>
            <p className="text-xl">Active DJs</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
