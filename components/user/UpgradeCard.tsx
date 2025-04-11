import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export function UpgradeCard() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-lg rounded-xl border border-blue-500/20 p-4 space-y-2"
    >
      <div className="flex items-center gap-2 text-blue-300">
        <Sparkles className="h-5 w-5" />
        <h3 className="font-medium">Upgrade Your Experience</h3>
      </div>
      
      <p className="text-sm text-gray-400">
        Get priority requests and exclusive features
      </p>
      
      <Link 
        href="/#pricing"
        className="mt-2 block w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2 px-4 rounded-lg text-center transition-colors duration-200"
      >
        Upgrade Now
      </Link>
    </motion.div>
  );
} 