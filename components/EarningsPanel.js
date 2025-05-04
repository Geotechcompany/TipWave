import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { DollarSign, Calendar, TrendingUp, Download, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export function EarningsPanel({ defaultCurrency = { code: 'USD', symbol: '$', rate: 1 } }) {
  const { data: session } = useSession();
  const [earnings, setEarnings] = useState({
    total: 0,
    monthly: [],
    recentTransactions: [],
    trends: { weekly: 0, monthly: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("month");
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Format currency with the correct symbol
  const formatCurrency = (amount) => {
    return `${defaultCurrency.symbol || '$'}${parseFloat(amount).toFixed(2)}`;
  };

  const fetchEarnings = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/dj/${session.user.id}/earnings?timeframe=${timeframe}`);
      if (!response.ok) throw new Error('Failed to fetch earnings');
      const data = await response.json();
      setEarnings(data);
    } catch (error) {
      console.error('Error fetching earnings:', error);
      toast.error('Failed to load earnings data');
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, timeframe]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchEarnings();
    }
  }, [fetchEarnings, session?.user?.id]);

  const handleWithdraw = async () => {
    if (!session?.user?.id) return;
    
    try {
      setIsWithdrawing(true);
      const response = await fetch(`/api/dj/${session.user.id}/earnings/withdraw`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to process withdrawal');
      
      toast.success('Withdrawal initiated successfully!');
      // Refresh earnings data
      await fetchEarnings();
    } catch (error) {
      console.error('Error withdrawing earnings:', error);
      toast.error('Failed to process withdrawal');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleExport = async () => {
    try {
      const csvContent = [
        ['Date', 'Song', 'Requester', 'Amount'],
        ...earnings.recentTransactions.map(tx => [
          new Date(tx.date).toLocaleDateString(),
          tx.songTitle,
          tx.requesterName,
          formatCurrency(tx.amount)
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `earnings-${timeframe}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting earnings:', error);
      toast.error('Failed to export earnings data');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Earnings Overview</h2>
        <div className="flex space-x-2">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <button 
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center space-x-2"
            onClick={handleExport}
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold"></h2>
        <div className="flex items-center gap-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm flex items-center gap-2 disabled:opacity-50"
                disabled={earnings.total <= 0 || isWithdrawing}
              >
                {isWithdrawing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <DollarSign className="h-4 w-4" />
                )}
                Withdraw Earnings
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Withdraw Earnings</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to withdraw {formatCurrency(earnings.total)} to your connected bank account?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleWithdraw}>
                  Confirm Withdrawal
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Earnings"
              value={formatCurrency(earnings.total)}
              icon={DollarSign}
              trend={earnings.trends.monthly}
            />
            <StatCard
              title="This Month"
              value={formatCurrency(earnings.monthly[earnings.monthly.length - 1]?.total || 0)}
              icon={Calendar}
              trend={earnings.trends.monthly}
            />
            <StatCard
              title="Weekly Average"
              value={formatCurrency(earnings.total / 4)}
              icon={TrendingUp}
              trend={earnings.trends.weekly}
            />
          </div>

          {/* Recent Transactions */}
          <div className="bg-gray-800/50 rounded-xl p-6">
            <h3 className="text-lg font-medium mb-4">Recent Transactions</h3>
            <div className="space-y-4">
              {earnings.recentTransactions.map((transaction) => (
                <TransactionRow 
                  key={transaction._id} 
                  {...transaction} 
                  currencySymbol={defaultCurrency.symbol}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}

function StatCard({ title, value, icon: Icon, trend }) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400">{title}</p>
          <h4 className="text-2xl font-bold mt-2">{value}</h4>
        </div>
        <div className="p-3 bg-gray-700/50 rounded-lg">
          <Icon className="h-6 w-6 text-blue-400" />
        </div>
      </div>
      {trend !== undefined && (
        <div className="mt-4 flex items-center text-sm">
          <TrendingUp className={`h-4 w-4 mr-1 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          <span className={trend >= 0 ? 'text-green-500' : 'text-red-500'}>
            {trend}% from last period
          </span>
        </div>
      )}
    </div>
  );
}

function TransactionRow({ date, amount, songTitle, requesterName, currencySymbol = '$' }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-700/50 last:border-0">
      <div className="flex items-center space-x-4">
        <div className="p-2 bg-blue-500/10 rounded-lg">
          <DollarSign className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <p className="font-medium">{songTitle}</p>
          <p className="text-sm text-gray-400">from {requesterName}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium text-green-500">{currencySymbol}{amount.toFixed(2)}</p>
        <p className="text-sm text-gray-400">
          {new Date(date).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
} 