import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Wallet,
  Clock, 
  CheckCircle, 
  XCircle,
  Loader2, 
  ChevronRight,
  Building2,
  CreditCard,
  CircleDollarSign
} from "lucide-react";
import { useSession } from "next-auth/react";
import { Badge } from "./ui/badge";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { formatDistanceToNow } from "date-fns";

export function WithdrawalTransactions({ defaultCurrency }) {
  const { data: session } = useSession();
  const [withdrawals, setWithdrawals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState("all");

  useEffect(() => {
    const fetchWithdrawals = async () => {
      if (!session?.user?.id) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/dj/${session.user.id}/withdrawals?status=${status}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch withdrawals');
        }
        
        const data = await response.json();
        setWithdrawals(data.withdrawals || []);
      } catch (error) {
        console.error('Error fetching withdrawals:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWithdrawals();
  }, [session?.user?.id, status]);

  const getMethodIcon = (method) => {
    const methodMap = {
      'bank_transfer': <Building2 className="h-4 w-4" />,
      'credit_card': <CreditCard className="h-4 w-4" />,
      'paypal': <CircleDollarSign className="h-4 w-4" />,
      'default': <Wallet className="h-4 w-4" />
    };
    return methodMap[method?.toLowerCase()] || methodMap.default;
  };

  const getStatusStyles = (status) => {
    const styles = {
      pending: {
        bg: "bg-yellow-500/10",
        text: "text-yellow-500",
        icon: <Clock className="h-4 w-4" />
      },
      processing: {
        bg: "bg-blue-500/10",
        text: "text-blue-500",
        icon: <Loader2 className="h-4 w-4 animate-spin" />
      },
      completed: {
        bg: "bg-green-500/10",
        text: "text-green-500",
        icon: <CheckCircle className="h-4 w-4" />
      },
      rejected: {
        bg: "bg-red-500/10",
        text: "text-red-500",
        icon: <XCircle className="h-4 w-4" />
      }
    };
    return styles[status.toLowerCase()] || styles.pending;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden"
    >
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-xl font-semibold flex items-center">
          <Wallet className="h-5 w-5 mr-2 text-gray-400" />
          Withdrawal History
        </h2>
      </div>

      <div className="p-6">
        <Tabs value={status} onValueChange={setStatus} className="mb-6">
          <TabsList className="grid grid-cols-4 gap-2">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No withdrawal transactions found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {withdrawals.map((withdrawal) => {
              const statusStyle = getStatusStyles(withdrawal.status);
              const methodIcon = getMethodIcon(withdrawal.withdrawalMethod?.name);
              const formattedDate = formatDistanceToNow(new Date(withdrawal.createdAt), { addSuffix: true });
              
              return (
                <motion.div
                  key={withdrawal._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-medium text-white text-lg">
                          {defaultCurrency.symbol}{withdrawal.amount}
                        </span>
                        <Badge 
                          variant="secondary"
                          className={`${statusStyle.bg} ${statusStyle.text} flex items-center gap-1`}
                        >
                          {statusStyle.icon}
                          <span>{withdrawal.status}</span>
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Clock className="h-4 w-4" />
                          <span>{formattedDate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          {methodIcon}
                          <span>
                            {withdrawal.withdrawalMethod?.name || 
                             withdrawal.method || 
                             withdrawal.paymentMethod || 
                             'Unknown Method'}
                          </span>
                        </div>
                      </div>

                      {withdrawal.reference && (
                        <div className="mt-2 text-sm text-gray-500">
                          Reference: {withdrawal.reference}
                        </div>
                      )}
                      
                      {withdrawal.status === "rejected" && withdrawal.reason && (
                        <div className="mt-2 text-sm text-red-400 bg-red-500/10 p-2 rounded">
                          Reason: {withdrawal.reason}
                        </div>
                      )}
                    </div>
                    
                    <ChevronRight className="h-5 w-5 text-gray-500" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
} 