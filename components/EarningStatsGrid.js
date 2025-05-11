import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { StatCard } from './StatCard';
import { DollarSign, CalendarDays, Music,  TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

export function EarningStatsGrid({ onCardClick, defaultCurrency = { symbol: '$' } }) {
  const { data: session } = useSession();
  const [statsData, setStatsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Add a refresh function that can be called to update the data
  const refreshStats = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    const fetchEarningsStats = async () => {
      if (!session?.user?.id) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/dj/${session.user.id}/earnings?timeframe=month&_cacheBust=${Date.now()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch earnings data');
        }
        
        const data = await response.json();
        console.log("Raw earnings data:", data);
        
        // Calculate song request earnings if not already provided
        let songRequestEarnings = data.songRequestEarnings || 0;
        
        if (!data.songRequestEarnings && data.recentTransactions) {
          songRequestEarnings = data.recentTransactions
            .filter(tx => tx.type === 'income' && 
              (tx.description?.toLowerCase().includes('song request') || 
               tx.description?.toLowerCase().includes('accepted song')))
            .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
        }
        
        // Count completed requests
        const completedRequests = data.totalCompletedRequests || 
          (data.recentTransactions?.filter(tx => tx.type === 'income' && 
            (tx.description?.toLowerCase().includes('song request') || 
             tx.description?.toLowerCase().includes('accepted song')))
            .length || 0);
        
        // Get total earnings from API (it should already include song request earnings)
        let totalEarnings = data.total || 0;
        
        // Process the data for display - make sure song request earnings are included correctly
        // but NOT double-counted
        const processedData = {
          // Total earnings should already include song requests from the API
          totalEarnings: totalEarnings,
          monthlyEarnings: data.monthly?.reduce((sum, month) => sum + parseFloat(month.total || 0), 0) || 0,
          songRequestEarnings: songRequestEarnings,
          completedRequests: completedRequests,
          monthlyTrend: data.trends?.monthly || 0,
          weeklyTrend: data.trends?.weekly || 0
        };
        
        console.log("Processed stats data:", processedData);
        setStatsData(processedData);
      } catch (error) {
        console.error('Error fetching earnings stats:', error);
        toast.error('Failed to load earnings statistics');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEarningsStats();
  }, [session?.user?.id, refreshTrigger]);

  // Listen for the request-accepted event to refresh the stats
  useEffect(() => {
    const handleRequestAccepted = () => {
      console.log("Request acceptance detected, refreshing stats");
      // Add slight delay to ensure transaction has completed
      setTimeout(() => {
        refreshStats();
      }, 1500);
    };
    
    window.addEventListener('request-accepted', handleRequestAccepted);
    
    return () => {
      window.removeEventListener('request-accepted', handleRequestAccepted);
    };
  }, [refreshStats]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Earnings"
        value={statsData?.totalEarnings || 0}
        icon={DollarSign}
        trend={statsData?.monthlyTrend}
        isCurrency={true}
        currencySymbol={defaultCurrency.symbol}
        color="green"
        isLoading={isLoading}
        onClick={() => onCardClick && onCardClick('total')}
      />
      
      <StatCard
        title="Monthly Earnings"
        value={statsData?.monthlyEarnings || 0}
        icon={CalendarDays}
        trend={statsData?.monthlyTrend}
        isCurrency={true}
        currencySymbol={defaultCurrency.symbol}
        color="blue"
        isLoading={isLoading}
        onClick={() => onCardClick && onCardClick('monthly')}
      />
      
      <StatCard
        title="Song Request Earnings"
        value={statsData?.songRequestEarnings || 0}
        icon={Music}
        subtitle={`${statsData?.completedRequests || 0} completed requests`}
        isCurrency={true}
        currencySymbol={defaultCurrency.symbol}
        color="purple"
        isLoading={isLoading}
        onClick={() => onCardClick && onCardClick('requests')}
      />
      
      <StatCard
        title="Weekly Growth"
        value={`${statsData?.weeklyTrend || 0}%`}
        icon={TrendingUp}
        color="pink"
        isLoading={isLoading}
        onClick={() => onCardClick && onCardClick('growth')}
      />
    </div>
  );
} 