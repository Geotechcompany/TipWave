import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { 
  User, Search, MoreVertical, Edit, Trash2, CheckCircle, XCircle,
  ChevronDown, RefreshCw, Loader2, AlertTriangle
} from "lucide-react";
import toast from "react-hot-toast";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardHeader, CardContent } from "../ui/card";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkActionOpen, setBulkActionOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "USER",
    status: "active"
  });
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const dropdownRef = useRef(null);
  const bulkActionRef = useRef(null);

  // Memoize the fetchUsers function with useCallback
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/users?limit=100'); // Increase limit to get more users
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    
    // Close dropdowns when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(null);
      }
      if (bulkActionRef.current && !bulkActionRef.current.contains(event.target)) {
        setBulkActionOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [fetchUsers]);

  const handleUserAction = async (userId, action) => {
    try {
      setIsUpdating(true);
      
      const status = action === 'activate' ? 'active' : 'inactive';
      
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user status');
      }
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId 
            ? { ...user, status, isActive: status === 'active' } 
            : user
        )
      );
      
      toast.success(`User ${status === 'active' ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      
      // Remove user from local state
      setUsers(users.filter(user => user._id !== userId));
      setIsDeleteModalOpen(false);
      
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) {
      toast.error('No users selected');
      return;
    }

    try {
      setIsUpdating(true);
      
      // Handle different bulk actions
      if (action === 'delete') {
        // Confirm before deleting
        if (!window.confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
          setIsUpdating(false);
          return;
        }
        
        // Delete multiple users
        const promises = selectedUsers.map(userId => 
          fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
        );
        
        await Promise.all(promises);
        setUsers(users.filter(user => !selectedUsers.includes(user._id)));
        toast.success(`${selectedUsers.length} users deleted successfully`);
      } 
      else if (action === 'activate' || action === 'deactivate') {
        // Update status for multiple users
        const promises = selectedUsers.map(userId => 
          fetch(`/api/admin/users/${userId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: action === 'activate' ? 'active' : 'inactive' })
          })
        );
        
        await Promise.all(promises);
        
        // Update local state
        setUsers(users.map(user => 
          selectedUsers.includes(user._id) 
            ? { ...user, status: action === 'activate' ? 'active' : 'inactive' } 
            : user
        ));
        
        toast.success(`${selectedUsers.length} users ${action === 'activate' ? 'activated' : 'deactivated'}`);
      }
      
      // Reset selection after bulk action
      setSelectedUsers([]);
      setSelectAll(false);
      setBulkActionOpen(false);
    } catch (error) {
      console.error(`Error performing bulk action "${action}":`, error);
      toast.error(`Failed to ${action} users`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    
    if (!selectedUser?._id) {
      toast.error("No user selected");
      return;
    }
    
    try {
      setIsUpdating(true);
      
      const response = await fetch(`/api/admin/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editForm.name,
          email: editForm.email,
          role: editForm.role,
          status: editForm.status
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user');
      }
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === selectedUser._id 
            ? { 
                ...user, 
                name: editForm.name,
                email: editForm.email,
                role: editForm.role,
                status: editForm.status,
                isActive: editForm.status === 'active'
              } 
            : user
        )
      );
      
      setIsEditModalOpen(false);
      toast.success('User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user._id));
    }
    setSelectAll(!selectAll);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchQuery === "" || 
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const getRoleBadge = (role) => {
    const roleBadges = {
      ADMIN: <Badge variant="destructive">Admin</Badge>,
      DJ: <Badge variant="secondary">DJ</Badge>,
      USER: <Badge variant="default">User</Badge>,
      BOTH: <Badge variant="warning">User + DJ</Badge>
    };
    return roleBadges[role] || <Badge variant="outline">Unknown</Badge>;
  };

  return (
    <motion.div 
      className="w-full space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => fetchUsers()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search users..."
                className="pl-8 pr-4 py-2 w-full rounded-md bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex space-x-2">
              <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-auto">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="inactive">Inactive</TabsTrigger>
                </TabsList>
              </Tabs>
              
              {selectedUsers.length > 0 && (
                <div className="relative" ref={bulkActionRef}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setBulkActionOpen(!bulkActionOpen)}
                    disabled={isUpdating}
                  >
                    Bulk Actions ({selectedUsers.length})
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                  
                  {bulkActionOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg z-10 border border-gray-600">
                      <div className="py-1">
                        <button
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                          onClick={() => handleBulkAction('activate')}
                          disabled={isUpdating}
                        >
                          <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
                          Activate Selected
                        </button>
                        <button
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                          onClick={() => handleBulkAction('deactivate')}
                          disabled={isUpdating}
                        >
                          <XCircle className="mr-2 h-4 w-4 text-red-400" />
                          Deactivate Selected
                        </button>
                        <button
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-600"
                          onClick={() => handleBulkAction('delete')}
                          disabled={isUpdating}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Selected
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 mx-auto text-gray-500 mb-3" />
              <h3 className="text-lg font-medium">No users found</h3>
              <p className="text-gray-400 mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="pb-3 pl-4">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                      />
                    </th>
                    <th className="pb-3 text-left">User</th>
                    <th className="pb-3 text-left">Role</th>
                    <th className="pb-3 text-left">Status</th>
                    <th className="pb-3 text-left">Joined</th>
                    <th className="pb-3 text-right pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredUsers.map(user => (
                    <tr key={user._id} className="hover:bg-gray-700/30">
                      <td className="py-3 pl-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user._id)}
                          onChange={() => handleSelectUser(user._id)}
                          className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center">
                            {user.name?.[0]?.toUpperCase() || <User size={14} />}
                          </div>
                          <div>
                            <div className="font-medium">{user.name || 'Unnamed User'}</div>
                            <div className="text-xs text-gray-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">{getRoleBadge(user.role)}</td>
                      <td className="py-3 px-4">
                        <Badge className={
                          (user.status === 'active' || user.isActive === true) 
                          ? 'bg-green-500/20 text-green-500' 
                          : 'bg-red-500/20 text-red-500'
                        }>
                          {(user.status === 'active' || user.isActive === true) ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-3 text-sm text-gray-400">
                        {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 relative">
                        <div className="flex justify-end">
                          <button
                            onClick={() => setDropdownOpen(dropdownOpen === user._id ? null : user._id)}
                            className="text-gray-400 hover:text-white focus:outline-none"
                          >
                            <MoreVertical className="h-5 w-5" />
                          </button>
                        </div>
                        
                        {dropdownOpen === user._id && (
                          <div 
                            ref={dropdownRef}
                            className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-50 py-1 border border-gray-700"
                          >
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setEditForm({
                                  name: user.name || "",
                                  email: user.email || "",
                                  role: user.role || "USER",
                                  status: user.status || "active"
                                });
                                setIsEditModalOpen(true);
                                setDropdownOpen(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit User
                            </button>
                            
                            {user.status === 'active' ? (
                              <button
                                onClick={() => {
                                  handleUserAction(user._id, 'deactivate');
                                  setDropdownOpen(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center"
                              >
                                <XCircle className="h-4 w-4 mr-2 text-red-400" />
                                Deactivate
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  handleUserAction(user._id, 'activate'); 
                                  setDropdownOpen(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center"
                              >
                                <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                                Activate
                              </button>
                            )}
                            
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setIsDeleteModalOpen(true);
                                setDropdownOpen(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 flex items-center"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete User
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 text-white">Edit User</h2>
            
            <form onSubmit={handleUpdateUser}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  >
                    <option value="USER">User</option>
                    <option value="DJ">DJ</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <span className="flex items-center">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
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
              <h3 className="text-xl font-bold">Delete User</h3>
            </div>
            <p className="mb-6">
              Are you sure you want to delete <span className="font-semibold">{selectedUser?.name || 'this user'}</span>? 
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
                onClick={() => handleDeleteUser(selectedUser._id)}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : "Delete User"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
} 