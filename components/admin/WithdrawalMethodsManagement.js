import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { 
  Search, DollarSign, Wallet,
  PlusCircle, Loader2, AlertTriangle,
  Edit, Trash2, CheckCircle, XCircle
} from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

export default function WithdrawalMethodsManagement() {
  const [methods, setMethods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formMode, setFormMode] = useState("add"); // "add" or "edit"
  const dropdownRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    icon: "",
    description: "",
    processingFee: 0,
    processingTime: "1-2 business days",
    isActive: true,
    minAmount: 10,
    maxAmount: 1000,
    supportedCurrencies: ["KES", "USD"],
    requiresAdditionalInfo: false,
    additionalInfoFields: []
  });

  // Fetch withdrawal methods from the API
  const fetchWithdrawalMethods = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/withdrawal-methods');
      
      if (!response.ok) {
        throw new Error('Failed to fetch withdrawal methods');
      }
      
      const data = await response.json();
      setMethods(data.methods || []);
    } catch (error) {
      console.error('Error fetching withdrawal methods:', error);
      toast.error('Failed to load withdrawal methods');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWithdrawalMethods();
    
    // Handle clicks outside dropdown
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [fetchWithdrawalMethods]);

  // Handle input changes in the form
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else if (name === 'processingFee') {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      });
    } else if (name === 'minAmount' || name === 'maxAmount') {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      const url = formMode === 'add' 
        ? '/api/admin/withdrawal-methods' 
        : `/api/admin/withdrawal-methods/${selectedMethod._id}`;
      
      const method = formMode === 'add' ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${formMode === 'add' ? 'add' : 'update'} withdrawal method`);
      }
      
      toast.success(`Withdrawal method ${formMode === 'add' ? 'added' : 'updated'} successfully`);
      fetchWithdrawalMethods();
      setIsModalOpen(false);
    } catch (error) {
      console.error(`Error ${formMode === 'add' ? 'adding' : 'updating'} withdrawal method:`, error);
      toast.error(`Failed to ${formMode === 'add' ? 'add' : 'update'} withdrawal method`);
    } finally {
      setIsUpdating(false);
    }
  };

  // Open add modal
  const handleAddClick = () => {
    setFormData({
      name: "",
      code: "",
      icon: "",
      description: "",
      processingFee: 0,
      processingTime: "1-2 business days",
      isActive: true,
      minAmount: 10,
      maxAmount: 1000,
      supportedCurrencies: ["KES", "USD"],
      requiresAdditionalInfo: false,
      additionalInfoFields: []
    });
    setFormMode('add');
    setIsModalOpen(true);
  };

  // Open edit modal
  const handleEditClick = (method) => {
    setSelectedMethod(method);
    setFormData({
      name: method.name || "",
      code: method.code || "",
      icon: method.icon || "",
      description: method.description || "",
      processingFee: method.processingFee || 0,
      processingTime: method.processingTime || "1-2 business days",
      isActive: method.isActive !== false,
      minAmount: method.minAmount || 10,
      maxAmount: method.maxAmount || 1000,
      supportedCurrencies: method.supportedCurrencies || ["KES", "USD"],
      requiresAdditionalInfo: method.requiresAdditionalInfo || false,
      additionalInfoFields: method.additionalInfoFields || []
    });
    setFormMode('edit');
    setIsModalOpen(true);
  };

  // Open delete modal
  const handleDeleteClick = (method) => {
    setSelectedMethod(method);
    setIsDeleteModalOpen(true);
  };

  // Handle method deletion
  const handleDeleteMethod = async (id) => {
    setIsUpdating(true);
    
    try {
      const response = await fetch(`/api/admin/withdrawal-methods/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete withdrawal method');
      }
      
      toast.success('Withdrawal method deleted successfully');
      fetchWithdrawalMethods();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting withdrawal method:', error);
      toast.error('Failed to delete withdrawal method');
    } finally {
      setIsUpdating(false);
    }
  };

  // Toggle method activity status
  const handleToggleActive = async (method) => {
    try {
      const response = await fetch(`/api/admin/withdrawal-methods/${method._id}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !method.isActive })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      
      toast.success(`Method ${method.isActive ? 'deactivated' : 'activated'} successfully`);
      fetchWithdrawalMethods();
    } catch (error) {
      console.error('Error toggling method status:', error);
      toast.error('Failed to update method status');
    }
  };

  // Filter methods based on search query and active filter
  const filteredMethods = methods.filter(method => {
    const matchesSearch = method.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         method.code.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === 'all') return matchesSearch;
    if (activeFilter === 'active') return matchesSearch && method.isActive;
    if (activeFilter === 'inactive') return matchesSearch && !method.isActive;
    
    return matchesSearch;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Withdrawal Methods</h1>
          <p className="text-gray-400">Manage available withdrawal methods and settings</p>
        </div>
        <Button onClick={handleAddClick}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Method
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search methods..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Methods Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : methods.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/50 rounded-lg">
          <Wallet className="h-12 w-12 mx-auto text-gray-500 mb-3" />
          <h3 className="text-lg font-medium text-gray-300">No withdrawal methods found</h3>
          <p className="text-gray-400 mt-1">Add your first withdrawal method to get started</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredMethods.map((method) => (
            <div
              key={method._id}
              className="bg-gray-800/50 rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-700/50 rounded-lg">
                    <Wallet className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-medium">{method.name}</h3>
                    <p className="text-sm text-gray-400">{method.code}</p>
                  </div>
                </div>
                <Switch
                  checked={method.isActive}
                  onCheckedChange={() => handleToggleActive(method)}
                />
              </div>

              {/* Method details */}
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-400">{method.description}</p>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <DollarSign className="h-4 w-4" />
                  <span>Limits: {method.minAmount} - {method.maxAmount}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditClick(method)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteClick(method)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  {formMode === "add" ? "Add Withdrawal Method" : "Edit Withdrawal Method"}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsModalOpen(false)}
                >
                  <XCircle className="h-5 w-5" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Form fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Method Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="mt-1"
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
                      className="mt-1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg p-2"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minAmount">Minimum Amount</Label>
                    <Input
                      id="minAmount"
                      name="minAmount"
                      type="number"
                      value={formData.minAmount}
                      onChange={handleInputChange}
                      className="mt-1"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="maxAmount">Maximum Amount</Label>
                    <Input
                      id="maxAmount"
                      name="maxAmount"
                      type="number"
                      value={formData.maxAmount}
                      onChange={handleInputChange}
                      className="mt-1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="processingTime">Processing Time</Label>
                  <Input
                    id="processingTime"
                    name="processingTime"
                    value={formData.processingTime}
                    onChange={handleInputChange}
                    className="mt-1"
                    placeholder="e.g. 1-2 business days"
                    required
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requiresAdditionalInfo"
                      checked={formData.requiresAdditionalInfo}
                      onCheckedChange={(checked) => setFormData({...formData, requiresAdditionalInfo: checked})}
                    />
                    <Label htmlFor="requiresAdditionalInfo">Requires Additional Info</Label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        {formMode === "add" ? "Add Method" : "Save Changes"}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-lg w-full max-w-md p-6"
          >
            <div className="flex items-center gap-3 text-red-400 mb-4">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-xl font-bold">Delete Withdrawal Method</h3>
            </div>
            <p className="mb-6 text-gray-300">
              Are you sure you want to delete <span className="font-semibold">{selectedMethod?.name}</span>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteMethod(selectedMethod._id)}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Method
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
} 