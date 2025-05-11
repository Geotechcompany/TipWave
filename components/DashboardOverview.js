import { StatCard } from './StatCard';
import { EarningStatsGrid } from './EarningStatsGrid';
import { Music, Clock, Calendar } from 'lucide-react';

export function DashboardOverview({ stats, recentRequests, defaultCurrency, isLoading }) {
  return (
    <div className="space-y-8">
      {/* Earnings Stats */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Earnings Overview</h2>
        <EarningStatsGrid 
          defaultCurrency={defaultCurrency} 
          onCardClick={(view) => console.log(`Clicked ${view} card`)}
        />
      </div>
      
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <StatCard
          title="Total Requests"
          value={stats?.totalRequests || 0}
          icon={Music}
          color="blue"
          isLoading={isLoading}
        />
        
        <StatCard
          title="Completion Rate"
          value={`${stats?.completionRate || 0}%`}
          icon={Clock}
          color="green"
          isLoading={isLoading}
        />
      </div>
      
      {/* Upcoming Events Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Upcoming Events</h2>
          <button className="text-blue-400 text-sm hover:underline">View all</button>
        </div>
        
        {stats?.upcomingEvents?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.upcomingEvents.slice(0, 2).map((event) => (
              <div key={event._id} className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-500/10 rounded-lg mr-4">
                    <Calendar className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{event.title}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-800/30 rounded-xl p-6 text-center">
            <p className="text-gray-400">No upcoming events</p>
            <button className="mt-2 text-blue-400 hover:underline">Create your first event</button>
          </div>
        )}
      </div>
      
      {/* Recent Requests Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Song Requests</h2>
          <button className="text-blue-400 text-sm hover:underline">View all</button>
        </div>
        
        {recentRequests?.length > 0 ? (
          <div className="space-y-3">
            {recentRequests.slice(0, 3).map((request) => (
              <div key={request._id} className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="p-3 bg-purple-500/10 rounded-lg mr-4">
                      <Music className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{request.songTitle || "Unknown Song"}</p>
                      <p className="text-sm text-gray-400">From: {request.requesterName || "Anonymous"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-500">{defaultCurrency.symbol}{request.amount || "5.00"}</p>
                    <p className="text-sm text-gray-400">{request.status}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-800/30 rounded-xl p-6 text-center">
            <p className="text-gray-400">No recent song requests</p>
          </div>
        )}
      </div>
    </div>
  );
} 