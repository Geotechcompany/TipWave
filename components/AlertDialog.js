import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, AlertCircle, CheckCircle } from "lucide-react";

const AlertDialog = ({ message, type, onClose }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress <= 0) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return oldProgress - 100 / 15;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [onClose]);

  const bgColor = type === "error" ? "bg-red-500" : "bg-green-500";
  const textColor = type === "error" ? "text-red-800" : "text-green-800";
  const Icon = type === "error" ? AlertCircle : CheckCircle;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, x: 50 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: -50, x: 50 }}
      className={`fixed top-4 right-4 w-80 ${bgColor} text-white p-4 rounded-lg shadow-lg`}
    >
      <button onClick={onClose} className="absolute top-2 right-2 text-white">
        <X size={18} />
      </button>
      <div className="flex items-center mb-2">
        <Icon className={`mr-2 ${textColor}`} size={24} />
        <p className={`${textColor} font-semibold`}>{message}</p>
      </div>
      <div className="w-full bg-white rounded-full h-1.5 mb-4 dark:bg-gray-700">
        <motion.div
          className="bg-blue-600 h-1.5 rounded-full"
          initial={{ width: "100%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </motion.div>
  );
};

export default AlertDialog;
