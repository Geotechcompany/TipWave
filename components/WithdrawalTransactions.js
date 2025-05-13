import { useState, useEffect, useCallback } from "react";
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
  CircleDollarSign,
  AlertCircle
} from "lucide-react";
import { useSession } from "next-auth/react";
import { Badge } from "./ui/badge";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

export function WithdrawalTransactions({ defaultCurrency }) {
  const { data: session } = useSession();
  const [withdrawals, setWithdrawals] = useState([]);
  const [withdrawalMethods, setWithdrawalMethods] = useState({});
  const [baseWithdrawalMethods, setBaseWithdrawalMethods] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchWithdrawalMethods = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      const response = await fetch(`/api/dj/${session.user.id}/withdrawal-methods`);
      if (!response.ok) throw new Error('Failed to fetch withdrawal methods');
      
      const data = await response.json();
      const methodsMap = data.methods.reduce((acc, method) => {
        acc[method._id] = method;
        return acc;
      }, {});
      
      setWithdrawalMethods(methodsMap);
    } catch (error) {
      console.error('Error fetching withdrawal methods:', error);
    }
  }, [session?.user?.id]);

  const fetchBaseWithdrawalMethods = useCallback(async () => {
    try {
      const response = await fetch('/api/withdrawal-methods');
      if (!response.ok) throw new Error('Failed to fetch base withdrawal methods');
      
      const data = await response.json();
      const methodsMap = data.methods.reduce((acc, method) => {
        acc[method._id] = method;
        return acc;
      }, {});
      
      setBaseWithdrawalMethods(methodsMap);
    } catch (error) {
      console.error('Error fetching base withdrawal methods:', error);
    }
  }, []);

  const fetchWithdrawals = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      const statusParam = status === 'all' ? '' : `?status=${status}`;
      const response = await fetch(`/api/dj/${session.user.id}/withdrawals${statusParam}`);
      if (!response.ok) throw new Error('Failed to fetch withdrawals');
      const data = await response.json();
      setWithdrawals(data.withdrawals || []);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    }
  }, [session?.user?.id, status]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          fetchWithdrawalMethods(),
          fetchBaseWithdrawalMethods(),
          fetchWithdrawals()
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [fetchWithdrawalMethods, fetchBaseWithdrawalMethods, fetchWithdrawals]);

  const getMethodIcon = (withdrawalMethodId) => {
    if (!withdrawalMethodId) return <Wallet className="h-4 w-4" />;
    
    const userMethod = withdrawalMethods[withdrawalMethodId];
    if (!userMethod?.methodId) return <Wallet className="h-4 w-4" />;

    const baseMethod = baseWithdrawalMethods[userMethod.methodId];
    if (!baseMethod) return <Wallet className="h-4 w-4" />;

    const methodMap = {
      'bank_transfer': <Building2 className="h-4 w-4" />,
      'credit_card': <CreditCard className="h-4 w-4" />,
      'paypal': <CircleDollarSign className="h-4 w-4" />,
      'default': <Wallet className="h-4 w-4" />
    };
    
    return methodMap[baseMethod.code?.toLowerCase()] || methodMap.default;
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
      approved: {
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

  const getMethodName = (withdrawalMethodId) => {
    if (!withdrawalMethodId) return 'Bank Transfer';
    
    const userMethod = withdrawalMethods[withdrawalMethodId];
    if (!userMethod?.methodId) return 'Bank Transfer';
    
    const baseMethod = baseWithdrawalMethods[userMethod.methodId];
    return baseMethod?.name || 'Bank Transfer';
  };

  const handleTransactionClick = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setIsModalOpen(true);
  };

  const TransactionDetails = ({ withdrawal }) => {
    if (!withdrawal) return null;
    
    const statusStyle = getStatusStyles(withdrawal.status);
    const methodIcon = getMethodIcon(withdrawal.withdrawalMethodId);
    const formattedDate = new Date(withdrawal.createdAt).toLocaleString();
    const processedDate = withdrawal.processedAt ? new Date(withdrawal.processedAt).toLocaleString() : null;
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-semibold text-white">
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
        </div>

        <div className="grid gap-4 text-sm">
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
            <div className="flex items-center gap-2 text-gray-400">
              <Clock className="h-4 w-4" />
              <span>Requested</span>
            </div>
            <span className="text-white">{formattedDate}</span>
          </div>

          {processedDate && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
              <div className="flex items-center gap-2 text-gray-400">
                <CheckCircle className="h-4 w-4" />
                <span>Processed</span>
              </div>
              <span className="text-white">{processedDate}</span>
            </div>
          )}

          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
            <div className="flex items-center gap-2 text-gray-400">
              {methodIcon}
              <span>Method</span>
            </div>
            <span className="text-white">
              {getMethodName(withdrawal.withdrawalMethodId)}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
            <div className="flex items-center gap-2 text-gray-400">
              <span>Reference</span>
            </div>
            <span className="text-white font-mono text-sm">
              {withdrawal.reference}
            </span>
          </div>
        </div>

        {withdrawal.status === "rejected" && withdrawal.reason && (
          <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-400">Rejection Reason</h4>
                <p className="mt-1 text-sm text-red-300">{withdrawal.reason}</p>
              </div>
            </div>
          </div>
        )}

        {withdrawal.metadata && (
          <div className="mt-4 p-4 rounded-lg bg-gray-800/50">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Additional Details</h4>
            <div className="space-y-2 text-sm text-gray-500">
              {Object.entries(withdrawal.metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="text-gray-400">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const getFilteredWithdrawals = () => {
    if (status === 'all') return withdrawals;
    
    return withdrawals.filter(withdrawal => {
      if (status === 'completed') {
        return ['completed', 'approved'].includes(withdrawal.status.toLowerCase());
      }
      return withdrawal.status.toLowerCase() === status.toLowerCase();
    });
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
            <TabsTrigger value="all">
              All
              <span className="ml-2 text-xs text-gray-400">
                ({withdrawals.length})
              </span>
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending
              <span className="ml-2 text-xs text-gray-400">
                ({withdrawals.filter(w => w.status.toLowerCase() === 'pending').length})
              </span>
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed
              <span className="ml-2 text-xs text-gray-400">
                ({withdrawals.filter(w => ['completed', 'approved'].includes(w.status.toLowerCase())).length})
              </span>
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected
              <span className="ml-2 text-xs text-gray-400">
                ({withdrawals.filter(w => w.status.toLowerCase() === 'rejected').length})
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : getFilteredWithdrawals().length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No {status !== 'all' ? status : ''} withdrawal transactions found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {getFilteredWithdrawals().map((withdrawal) => {
              const statusStyle = getStatusStyles(withdrawal.status);
              const methodIcon = getMethodIcon(withdrawal.withdrawalMethodId);
              const formattedDate = formatDistanceToNow(new Date(withdrawal.createdAt), { addSuffix: true });
              
              return (
                <motion.div
                  key={withdrawal._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => handleTransactionClick(withdrawal)}
                  className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 transition-colors cursor-pointer"
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
                            {getMethodName(withdrawal.withdrawalMethodId)}
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          <TransactionDetails withdrawal={selectedWithdrawal} />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
} 