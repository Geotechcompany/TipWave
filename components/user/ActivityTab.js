import { motion } from "framer-motion";
import { Music, UserCheck, PlusCircle, History } from "lucide-react";

export function ActivityTab({ activities = [] }) {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'PLAYED':
        return <Music className="h-4 w-4 text-blue-400" />;
      case 'REQUEST':
        return <PlusCircle className="h-4 w-4 text-green-400" />;
      case 'RECOMMENDATION':
        return <UserCheck className="h-4 w-4 text-purple-400" />;
      default:
        return <Music className="h-4 w-4 text-gray-400" />;
    }
  };

  const getActivityBackground = (type) => {
    switch (type) {
      case 'PLAYED':
        return 'bg-blue-500/20';
      case 'REQUEST':
        return 'bg-green-500/20';
      case 'RECOMMENDATION':
        return 'bg-purple-500/20';
      default:
        return 'bg-gray-500/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/30 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-6"
    >
      <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
      {activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={activity._id || index} className="flex items-start space-x-3">
              <div className={`p-2 ${getActivityBackground(activity.type)} rounded-full`}>
                {getActivityIcon(activity.type)}
              </div>
              <div>
                <p className="font-medium">{activity.title}</p>
                <p className="text-sm text-gray-400">{activity.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
            <History className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-300 mb-2">No Recent Activity</h3>
          <p className="text-gray-500 max-w-sm">
            Your activity history will appear here once you start making requests or receiving recommendations.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
} 