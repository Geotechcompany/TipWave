import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Wallet, Search, CheckCircle, XCircle,
  RefreshCw, Loader2,
  Clock, Building2, CreditCard, CircleDollarSign,
  User, Copy, Check
} from "lucide-react";
import toast from "react-hot-toast";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import { formatDistanceToNow } from "date-fns";
import { useSession } from "next-auth/react";

export default function WithdrawalManagement() {
  const { data: session } = useSession();
  const [withdrawals, setWithdrawals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState("pending");
  const [copiedField, setCopiedField] = useState("");
  const [actionLoading, setActionLoading] = useState('');
  
  const getMethodIcon = (method) => {
    const methodMap = {
      'bank_transfer': <Building2 className="h-4 w-4" />,
      'credit_card': <CreditCard className="h-4 w-4" />,
      'paypal': <CircleDollarSign className="h-4 w-4" />,
      'default': <Wallet className="h-4 w-4" />
    };
    return methodMap[method?.toLowerCase()] || methodMap.default;
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedField(""), 2000);
  };

  const fetchWithdrawals = useCallback(async () => {
    if (session?.user?.role !== "ADMIN") {
      toast.error("Admin access required");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/withdrawals?status=${status}`);
      
      if (response.status === 401) {
        toast.error("Please log in to access this feature");
        return;
      }
      
      if (response.status === 403) {
        toast.error("Admin access required");
        return;
      }
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch withdrawals");
      }
      
      const data = await response.json();
      console.log("Fetched withdrawals:", data);
      
      if (Array.isArray(data.withdrawals)) {
        setWithdrawals(data.withdrawals);
      } else {
        console.error("Invalid withdrawals data format:", data);
        toast.error("Invalid data format received");
      }
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      toast.error("Failed to load withdrawals");
    } finally {
      setIsLoading(false);
    }
  }, [status, session]);

  useEffect(() => {
    console.log("Current session:", session);
    if (session?.user?.role === "ADMIN") {
      fetchWithdrawals();
    }
  }, [fetchWithdrawals, session]);

  const handleWithdrawalAction = async (withdrawalId, action) => {
    try {
      setActionLoading(`${action}-${withdrawalId}`);
      const response = await fetch(`/api/admin/withdrawals/${withdrawalId}/${action}`, {
        method: 'PUT'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${action} withdrawal`);
      }

      toast.success(`Withdrawal ${action}ed successfully`);
      fetchWithdrawals();
    } catch (error) {
      console.error(`Error ${action}ing withdrawal:`, error);
      toast.error(`Failed to ${action} withdrawal`);
    } finally {
      setActionLoading('');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-500/20 text-yellow-400",
      approved: "bg-green-500/20 text-green-400",
      rejected: "bg-red-500/20 text-red-400",
      completed: "bg-blue-500/20 text-blue-400"
    };
    return styles[status.toLowerCase()] || styles.pending;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Wallet className="h-6 w-6 mr-2" />
              Withdrawal Management
            </h1>
            <p className="text-sm text-gray-400 mt-1">Manage and process withdrawal requests</p>
          </div>
          <Button onClick={fetchWithdrawals} className="w-full sm:w-auto">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Tabs and Search */}
        <div className="space-y-4 mb-6">
          <Tabs value={status} onValueChange={setStatus} className="w-full">
            <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:flex">
              <TabsTrigger value="pending" className="flex-1">
                Pending
                {status === "pending" && withdrawals.length > 0 && (
                  <Badge variant="destructive" className="ml-2">{withdrawals.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search withdrawals..."
                className="pl-10"
              />
            </div>
            <select
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All Methods</option>
              <option value="bank">Bank Transfer</option>
              <option value="mpesa">M-PESA</option>
              <option value="paypal">PayPal</option>
            </select>
          </div>
        </div>

        {/* Withdrawals List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="text-center py-12 bg-gray-800/50 rounded-lg">
            <Wallet className="h-12 w-12 mx-auto text-gray-500 mb-3" />
            <h3 className="text-lg font-medium text-gray-300">No withdrawals found</h3>
            <p className="text-gray-400 mt-1">No {status} withdrawal requests at the moment</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {withdrawals.map((withdrawal) => (
              <div
                key={withdrawal._id}
                className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 transition-colors"
              >
                {/* Withdrawal Card Header */}
                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-gray-700 rounded-lg flex items-center justify-center">
                      {getMethodIcon(withdrawal.withdrawalMethod?.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">
                          {withdrawal.currency} {withdrawal.amount.toFixed(2)}
                        </span>
                        <Badge className={getStatusBadge(withdrawal.status)}>
                          {withdrawal.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400">
                        {withdrawal.withdrawalMethod?.name}
                      </p>
                    </div>
                  </div>

                  {withdrawal.status === "pending" && (
                    <div className="flex gap-2 sm:flex-col md:flex-row">
                      <Button
                        onClick={() => handleWithdrawalAction(withdrawal._id, "approve")}
                        className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700"
                        disabled={!!actionLoading}
                      >
                        {actionLoading === `approve-${withdrawal._id}` ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleWithdrawalAction(withdrawal._id, "reject")}
                        variant="destructive"
                        className="flex-1 sm:flex-none"
                        disabled={!!actionLoading}
                      >
                        {actionLoading === `reject-${withdrawal._id}` ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-2" />
                        )}
                        Reject
                      </Button>
                    </div>
                  )}
                </div>

                {/* Withdrawal Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  {/* User Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{withdrawal.metadata?.userName || withdrawal.user?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Email:</span>
                      <span className="flex-1 truncate">{withdrawal.metadata?.userEmail || withdrawal.user?.email}</span>
                      <CopyButton 
                        text={withdrawal.metadata?.userEmail || withdrawal.user?.email}
                        id={`email-${withdrawal._id}`}
                        copiedField={copiedField}
                        onCopy={copyToClipboard}
                      />
                    </div>
                  </div>

                  {/* Account Details */}
                  <div className="space-y-2">
                    {withdrawal.withdrawalMethod?.accountNumber && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Account:</span>
                        <span className="flex-1">{withdrawal.withdrawalMethod.accountNumber}</span>
                        <CopyButton 
                          text={withdrawal.withdrawalMethod.accountNumber}
                          id={`account-${withdrawal._id}`}
                          copiedField={copiedField}
                          onCopy={copyToClipboard}
                        />
                      </div>
                    )}
                    {withdrawal.withdrawalMethod?.accountName && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Name:</span>
                        <span className="flex-1">{withdrawal.withdrawalMethod.accountName}</span>
                        <CopyButton 
                          text={withdrawal.withdrawalMethod.accountName}
                          id={`name-${withdrawal._id}`}
                          copiedField={copiedField}
                          onCopy={copyToClipboard}
                        />
                      </div>
                    )}
                  </div>

                  {/* Additional Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{formatDistanceToNow(new Date(withdrawal.createdAt), { addSuffix: true })}</span>
                    </div>
                    {withdrawal.reference && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Reference:</span>
                        <span className="flex-1">{withdrawal.reference}</span>
                        <CopyButton 
                          text={withdrawal.reference}
                          id={`ref-${withdrawal._id}`}
                          copiedField={copiedField}
                          onCopy={copyToClipboard}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Copy Button Component
function CopyButton({ text, id, copiedField, onCopy }) {
  return (
    <button 
      onClick={() => onCopy(text, id)}
      className="p-1 hover:bg-gray-700 rounded transition-colors"
    >
      {copiedField === id ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4 text-gray-400" />
      )}
    </button>
  );
} 