import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";

import { 
  Users, Search, Filter, RefreshCw, UserPlus, Edit, Trash2, 
  Shield, Mail, Key, AlertTriangle, CheckCircle, X, XCircle,
  Music, User, Crown
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminUserManagement({ refreshData, isLoading }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    role: 'all',
    search: '',
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [editingUser, setEditingUser] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [pagination.page, pagination.limit, filters]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        role: filters.role,
        status: filters.status,
        search: filters.search,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      }).toString();

      const response = await fetch(`/api/admin/users?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to load users: ${response.status}`);
      }

      const data = await response.json();
      
      setUsers(data.users || []);
      setPagination({
        ...pagination,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages
      });
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error(error.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user role');
      }

      toast.success(`User role updated to ${newRole}`);
      loadUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user status');
      }

      toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      loadUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      const response = await fetch(`/api/admin/users/${userToDelete}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user');
      }

      toast.success('User deleted successfully');
      setDeleteDialogOpen(false);
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleUpdateUser = async (userData) => {
    try {
      if (!editingUser?._id) {
        toast.error('No user selected for editing');
        return;
      }
      
      // Set loading state to true
      setIsUpdating(true);
      
      // Use the specific endpoint for updating a user by ID
      const response = await fetch(`/api/admin/users/${editingUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include', // Include cookies for auth
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user');
      }

      // Show success notification
      toast.success('User updated successfully');
      closeEditModal();
      loadUsers(); // Refresh the user list
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error.message || 'Failed to update user');
    } finally {
      // Always reset loading state
      setIsUpdating(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'DJ': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'USER': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'BOTH': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ADMIN': return <Shield className="h-4 w-4 mr-1" />;
      case 'DJ': return <Music className="h-4 w-4 mr-1" />;
      case 'USER': return <User className="h-4 w-4 mr-1" />;
      case 'BOTH': return <Crown className="h-4 w-4 mr-1" />;
      default: return <User className="h-4 w-4 mr-1" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const refreshUserList = () => {
    loadUsers();
  };

  const EditUserModal = ({ user, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
      name: user?.name || '',
      email: user?.email || '',
      role: user?.role || 'USER',
      status: user?.status || 'active'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
      if (user) {
        setFormData({
          name: user.name || '',
          email: user.email || '',
          role: user.role || 'USER',
          status: user.status || 'active'
        });
      }
    }, [user]);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      
      try {
        await onSave(formData);
      } finally {
        setIsSubmitting(false);
      }
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Edit User</h2>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-50"
              disabled={isSubmitting}
            >
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label className="block mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label className="block mb-2">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                  disabled={isSubmitting}
                >
                  <option value="USER">User</option>
                  <option value="DJ">DJ</option>
                  <option value="ADMIN">Admin</option>
                  <option value="BOTH">Both</option>
                </select>
              </div>
              
              <div>
                <label className="block mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                  disabled={isSubmitting}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button 
                variant="ghost" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="default"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditDialogOpen(true);
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setEditDialogOpen(false);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="pl-10 bg-gray-700 border-gray-600 text-white w-full"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => loadUsers()}
            disabled={loading}
            className="border-gray-600 text-gray-200 hover:text-white hover:bg-gray-700"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <select
            value={filters.role}
            onChange={(e) => setFilters({...filters, role: e.target.value})}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm"
          >
            <option value="all">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="DJ">DJ</option>
            <option value="USER">User</option>
            <option value="BOTH">Both</option>
          </select>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          
          <select
            value={`${filters.sortBy}:${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split(':');
              setFilters({...filters, sortBy, sortOrder});
            }}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm"
          >
            <option value="createdAt:desc">Newest</option>
            <option value="createdAt:asc">Oldest</option>
            <option value="name:asc">Name A-Z</option>
            <option value="name:desc">Name Z-A</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/50 rounded-lg border border-gray-700">
          <Users className="h-12 w-12 mx-auto text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-300">No users found</h3>
          <p className="text-gray-400 mt-2">Try adjusting your search filters</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Joined</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-700/30">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                        {user.image ? (
                          <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
                        ) : (
                          <User className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">{user.name}</div>
                        <div className="text-sm text-gray-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                      {getRoleIcon(user.role)}
                      {user.role}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span 
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.status === 'active' 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                          : 'bg-red-500/20 text-red-400 border border-red-500/50'
                      }`}
                    >
                      {user.status === 'active' ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      {user.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-600 text-gray-200 hover:text-white hover:bg-gray-700"
                        onClick={() => openEditModal(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-600 text-gray-200 hover:text-white hover:bg-red-900"
                        onClick={() => {
                          setUserToDelete(user._id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Pagination controls */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination({...pagination, page: Math.max(1, pagination.page - 1)})}
              disabled={pagination.page === 1}
              className="border-gray-600 text-gray-200 hover:text-white hover:bg-gray-700"
            >
              Previous
            </Button>
            
            {Array.from({length: pagination.totalPages}, (_, i) => i + 1)
              .filter(page => {
                // Show only pages close to current page to avoid too many buttons
                return page === 1 || 
                       page === pagination.totalPages || 
                       Math.abs(page - pagination.page) <= 1;
              })
              .map((page, i, arr) => {
                // Add ellipsis when there are gaps in the sequence
                const showEllipsisBefore = i > 0 && arr[i - 1] !== page - 1;
                const showEllipsisAfter = i < arr.length - 1 && arr[i + 1] !== page + 1;
                
                return (
                  <div key={page} className="flex items-center">
                    {showEllipsisBefore && (
                      <span className="px-2 text-gray-400">...</span>
                    )}
                    
                    <Button
                      variant={pagination.page === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPagination({...pagination, page})}
                      className={
                        pagination.page === page 
                          ? "bg-blue-600 text-white" 
                          : "border-gray-600 text-gray-200 hover:text-white hover:bg-gray-700"
                      }
                    >
                      {page}
                    </Button>
                    
                    {showEllipsisAfter && (
                      <span className="px-2 text-gray-400">...</span>
                    )}
                  </div>
                );
              })}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination({...pagination, page: Math.min(pagination.totalPages, pagination.page + 1)})}
              disabled={pagination.page === pagination.totalPages}
              className="border-gray-600 text-gray-200 hover:text-white hover:bg-gray-700"
            >
              Next
            </Button>
          </nav>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="mb-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-white">Delete User</h3>
              <p className="mt-2 text-sm text-gray-400">
                Are you sure you want to delete this user? This action cannot be undone.
              </p>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                onClick={handleDeleteUser}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Dialog */}
      <EditUserModal
        user={editingUser}
        isOpen={editDialogOpen}
        onClose={closeEditModal}
        onSave={handleUpdateUser}
      />
    </div>
  );
} 