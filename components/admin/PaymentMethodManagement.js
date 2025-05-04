import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { 
  CreditCard, Search, 
  PlusCircle, RefreshCw, Loader2, AlertTriangle, DollarSign
} from "lucide-react";
import toast from "react-hot-toast";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

export default function PaymentMethodManagement() {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formMode, setFormMode] = useState("add"); // "add" or "edit"
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const dropdownRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    icon: "",
    description: "",
    processingFee: 0,
    isActive: true,
    requiresRedirect: false,
    supportedCurrencies: ["KES", "USD"],
    credentials: {
      apiKey: "",
      secretKey: "",
      webhookSecret: "",
      consumerKey: "",
      consumerSecret: "",
      passKey: "",
      businessShortCode: "",
      callbackUrl: ""
    }
  });

  // Fetch payment methods
  const fetchPaymentMethods = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/payment-methods');
      if (!response.ok) throw new Error("Failed to fetch payment methods");
      const data = await response.json();
      setPaymentMethods(data.paymentMethods || []);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      toast.error("Failed to load payment methods");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPaymentMethods();
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(null);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [fetchPaymentMethods]);

  // Filter payment methods based on search and active filter
  const filteredPaymentMethods = paymentMethods.filter(method => {
    const matchesSearch = method.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          method.code.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === "all") return matchesSearch;
    if (activeFilter === "active") return matchesSearch && method.isActive;
    if (activeFilter === "inactive") return matchesSearch && !method.isActive;
    
    return matchesSearch;
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      // Handle nested properties (e.g., credentials.apiKey)
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsUpdating(true);
      
      // Get form values
      const methodData = {
        name: formData.name,
        code: formData.code,
        icon: formData.icon,
        description: formData.description,
        processingFee: parseFloat(formData.processingFee),
        isActive: formData.isActive,
        requiresRedirect: formData.requiresRedirect,
        supportedCurrencies: formData.supportedCurrencies,
        // Pass credentials as plain text - they'll be encrypted on the server
        credentials: {
          apiKey: formData.credentials.apiKey,
          secretKey: formData.credentials.secretKey,
          webhookSecret: formData.credentials.webhookSecret,
          // Add any M-PESA specific credentials
          consumerKey: formData.credentials.consumerKey,
          consumerSecret: formData.credentials.consumerSecret,
          passKey: formData.credentials.passKey,
          businessShortCode: formData.credentials.businessShortCode,
          callbackUrl: formData.credentials.callbackUrl
        }
      };
      
      // API call to save the payment method
      const url = formMode === 'add' 
        ? '/api/admin/payment-methods' 
        : `/api/admin/payment-methods/${selectedMethod._id}`;
        
      const method = formMode === 'add' ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(methodData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save payment method');
      }
      
      // Success handling
      toast.success(`Payment method ${formMode === 'add' ? 'added' : 'updated'} successfully`);
      setIsModalOpen(false);
      fetchPaymentMethods();
    } catch (error) {
      console.error(`Error ${formMode === 'add' ? 'adding' : 'updating'} payment method:`, error);
      toast.error(`Failed to ${formMode === 'add' ? 'add' : 'update'} payment method`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleStatus = async (methodId, currentStatus) => {
    try {
      setIsUpdating(true);
      
      const response = await fetch(`/api/admin/payment-methods/${methodId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          isActive: !currentStatus 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update payment method status');
      }
      
      // Update local state
      setPaymentMethods(prevMethods => 
        prevMethods.map(method => 
          method._id === methodId 
            ? { ...method, isActive: !currentStatus } 
            : method
        )
      );
      
      toast.success(`Payment method ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error updating payment method status:', error);
      toast.error('Failed to update payment method status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeletePaymentMethod = async (methodId) => {
    try {
      setIsUpdating(true);
      
      const response = await fetch(`/api/admin/payment-methods/${methodId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete payment method');
      }
      
      // Remove from local state
      setPaymentMethods(paymentMethods.filter(method => method._id !== methodId));
      setIsDeleteModalOpen(false);
      
      toast.success('Payment method deleted successfully');
    } catch (error) {
      console.error('Error deleting payment method:', error);
      toast.error('Failed to delete payment method');
    } finally {
      setIsUpdating(false);
    }
  };

  const openAddModal = () => {
    setFormMode('add');
    setFormData({
      name: "",
      code: "",
      icon: "",
      description: "",
      processingFee: 0,
      isActive: true,
      requiresRedirect: false,
      supportedCurrencies: ["KES", "USD"],
      credentials: {
        apiKey: "",
        secretKey: "",
        webhookSecret: "",
        consumerKey: "",
        consumerSecret: "",
        passKey: "",
        businessShortCode: "",
        callbackUrl: ""
      }
    });
    setIsModalOpen(true);
  };

  const openEditModal = (method) => {
    setFormMode('edit');
    setSelectedMethod(method);
    setFormData({
      name: method.name || "",
      code: method.code || "",
      icon: method.icon || "",
      description: method.description || "",
      processingFee: method.processingFee || 0,
      isActive: method.isActive !== false,
      requiresRedirect: method.requiresRedirect === true,
      supportedCurrencies: method.supportedCurrencies || ["KES", "USD"],
      credentials: {
        apiKey: method.credentials?.apiKey || "",
        secretKey: method.credentials?.secretKey || "",
        webhookSecret: method.credentials?.webhookSecret || "",
        consumerKey: method.credentials?.consumerKey || "",
        consumerSecret: method.credentials?.consumerSecret || "",
        passKey: method.credentials?.passKey || "",
        businessShortCode: method.credentials?.businessShortCode || "",
        callbackUrl: method.credentials?.callbackUrl || ""
      }
    });
    setIsModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8" style={{ minHeight: "calc(100vh - 100px)" }}>
      <h1 className="text-2xl font-bold mb-6">Payment Methods</h1>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={fetchPaymentMethods}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="ml-2 hidden sm:inline">Refresh</span>
          </Button>
          <Button 
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Method
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search payment methods..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Tabs 
            defaultValue="all" 
            className="w-full sm:w-auto"
            value={activeFilter}
            onValueChange={setActiveFilter}
          >
            <TabsList className="grid grid-cols-3 w-full sm:w-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : filteredPaymentMethods.length === 0 ? (
          <div className="text-center py-10 bg-gray-800 rounded-lg">
            <CreditCard className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-300">No payment methods found</h3>
            <p className="text-gray-400 mt-1">
              {searchQuery ? "Try adjusting your search terms" : "Get started by adding a payment method"}
            </p>
            <Button 
              className="mt-4 bg-blue-600 hover:bg-blue-700"
              onClick={openAddModal}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </div>
        ) : (
          <div className="w-full overflow-x-auto" style={{ minHeight: "300px" }}>
            <table className="min-w-full bg-gray-800 text-white" style={{ tableLayout: "fixed" }}>
              <thead>
                <tr className="bg-gray-900">
                  <th className="py-3 px-6 text-left" style={{ width: "25%" }}>NAME</th>
                  <th className="py-3 px-6 text-left" style={{ width: "20%" }}>CODE</th>
                  <th className="py-3 px-6 text-left" style={{ width: "15%" }}>FEE</th>
                  <th className="py-3 px-6 text-left" style={{ width: "20%" }}>STATUS</th>
                  <th className="py-3 px-6 text-right" style={{ width: "20%" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredPaymentMethods.map((method) => (
                  <tr key={method._id} className="border-b border-gray-700">
                    <td className="py-4 px-6 text-left">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-gray-700 rounded-md flex items-center justify-center mr-3">
                          {method.icon ? (
                            <img src={method.icon} alt={method.name} className="h-6 w-6" />
                          ) : (
                            <CreditCard className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                        <span className="font-medium">{method.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-left">{method.code}</td>
                    <td className="py-4 px-6 text-left">
                      <span className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                        {method.processingFee}%
                      </span>
                    </td>
                    <td className="py-4 px-6 text-left">
                      <Badge 
                        className={method.isActive 
                          ? "bg-green-500/20 text-green-400 border-green-500/50" 
                          : "bg-gray-500/20 text-gray-400 border-gray-500/50"}
                      >
                        {method.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="relative inline-block" style={{ zIndex: 50 }}>
                        <button 
                          onClick={() => setDropdownOpen(dropdownOpen === method._id ? null : method._id)}
                          className="text-gray-400 hover:text-white p-2 rounded-full"
                          aria-label="Actions"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                          </svg>
                        </button>
                        {dropdownOpen === method._id && (
                          <div 
                            className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-10"
                            style={{ zIndex: 100, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)" }}
                          >
                            <button 
                              onClick={() => openEditModal(method)}
                              className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 flex items-center"
                            >
                              <span className="mr-2">✏️</span> Edit Method
                            </button>
                            <button 
                              onClick={() => handleToggleStatus(method._id, method.isActive)}
                              className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 flex items-center"
                            >
                              <span className="mr-2">🔴</span> Deactivate
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg shadow-lg max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 text-white">
              {formMode === 'add' ? 'Add Payment Method' : 'Edit Payment Method'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Method Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full mt-1"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="code">Method Code</Label>
                    <Input
                      id="code"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      className="w-full mt-1"
                      required
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Unique identifier (e.g. stripe, paypal)
                    </p>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full p-2 mt-1 bg-gray-700 border border-gray-600 rounded-md text-white"
                    rows={2}
                  />
                </div>
                
                <div>
                  <Label htmlFor="icon">Icon URL</Label>
                  <Input
                    id="icon"
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    className="w-full mt-1"
                    placeholder="https://example.com/icon.png"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="processingFee">Processing Fee (%)</Label>
                    <Input
                      id="processingFee"
                      name="processingFee"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.processingFee}
                      onChange={handleInputChange}
                      className="w-full mt-1"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Options</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                    />
                    <Label htmlFor="isActive" className="cursor-pointer">Method Active</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requiresRedirect"
                      name="requiresRedirect"
                      checked={formData.requiresRedirect}
                      onCheckedChange={(checked) => setFormData({...formData, requiresRedirect: checked})}
                    />
                    <Label htmlFor="requiresRedirect" className="cursor-pointer">Requires Redirect</Label>
                  </div>
                </div>
                
                <div>
                  <Label>API Credentials</Label>
                  <div className="space-y-3 mt-2 p-3 border border-gray-700 rounded-md">
                    <div>
                      <Label htmlFor="credentials.apiKey">API Key</Label>
                      <Input
                        id="credentials.apiKey"
                        name="credentials.apiKey"
                        value={formData.credentials.apiKey}
                        onChange={handleInputChange}
                        className="w-full mt-1"
                        type="password"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="credentials.secretKey">Secret Key</Label>
                      <Input
                        id="credentials.secretKey"
                        name="credentials.secretKey"
                        value={formData.credentials.secretKey}
                        onChange={handleInputChange}
                        className="w-full mt-1"
                        type="password"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="credentials.webhookSecret">Webhook Secret</Label>
                      <Input
                        id="credentials.webhookSecret"
                        name="credentials.webhookSecret"
                        value={formData.credentials.webhookSecret}
                        onChange={handleInputChange}
                        className="w-full mt-1"
                        type="password"
                      />
                    </div>
                  </div>
                </div>

                {formData.code === 'mpesa' && (
                  <div className="space-y-4 mt-4 border-t border-gray-700 pt-4">
                    <h3 className="text-lg font-medium">M-PESA Credentials</h3>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="consumerKey">Consumer Key</Label>
                        <Input
                          id="consumerKey"
                          placeholder="Consumer Key from Daraja API"
                          value={formData.credentials.consumerKey || ''}
                          onChange={(e) => handleInputChange({ target: { name: 'credentials.consumerKey', value: e.target.value } })}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="consumerSecret">Consumer Secret</Label>
                        <Input
                          id="consumerSecret"
                          type="password"
                          placeholder="Consumer Secret from Daraja API"
                          value={formData.credentials.consumerSecret || ''}
                          onChange={(e) => handleInputChange({ target: { name: 'credentials.consumerSecret', value: e.target.value } })}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="passKey">Pass Key</Label>
                        <Input
                          id="passKey"
                          type="password"
                          placeholder="Passkey from Daraja API"
                          value={formData.credentials.passKey || ''}
                          onChange={(e) => handleInputChange({ target: { name: 'credentials.passKey', value: e.target.value } })}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="businessShortCode">Business Short Code</Label>
                        <Input
                          id="businessShortCode"
                          placeholder="M-PESA Business Short Code"
                          value={formData.credentials.businessShortCode || ''}
                          onChange={(e) => handleInputChange({ target: { name: 'credentials.businessShortCode', value: e.target.value } })}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="callbackUrl">Callback URL</Label>
                        <Input
                          id="callbackUrl"
                          placeholder="https://yourdomain.com/api/payments/mpesa/callback"
                          value={formData.credentials.callbackUrl || ''}
                          onChange={(e) => handleInputChange({ target: { name: 'credentials.callbackUrl', value: e.target.value } })}
                          className="mt-1"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          URL that will receive payment notifications from M-PESA
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <span className="flex items-center">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    formMode === 'add' ? 'Add Method' : 'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div 
            className="bg-gray-800 rounded-lg w-full max-w-md p-6 shadow-lg"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center space-x-3 text-red-400 mb-4">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-xl font-bold">Delete Payment Method</h3>
            </div>
            <p className="mb-6">
              Are you sure you want to delete <span className="font-semibold">{selectedMethod?.name}</span>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={() => handleDeletePaymentMethod(selectedMethod._id)}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : "Delete Method"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
} 