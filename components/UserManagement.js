import { useState, useEffect, useCallback } from "react";
import { 
  Search, Filter, PlusCircle, RefreshCw, Edit, /* Trash, */ MoreHorizontal, CheckCircle, XCircle, X
} from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

export function UserManagement() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);

  // Wrap fetchUsers in useCallback to avoid recreating it on every render
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      let url = `/api/admin/users?page=${pagination.page}&limit=${pagination.limit}`;
      
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      
      if (filter) {
        url += `&filter=${encodeURIComponent(filter)}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      
      const data = await response.json();
      setUsers(data.users || []);
      setPagination(prev => data.pagination || prev);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [pagination.page, pagination.limit, search, filter]); // Removed full pagination object

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]); // Now fetchUsers is stable between renders

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setPagination({ ...pagination, page: 1 });
      fetchUsers();
    }
  };

  const handleFilter = (filterValue) => {
    setFilter(filterValue);
    setPagination({ ...pagination, page: 1 });
  };

  const handleEditUser = async (updates) => {
    if (!selectedUser) return;
    
    try {
      const response = await fetch(`/api/admin/users`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedUser._id,
          updates
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update user");
      }
      
      toast.success("User updated successfully");
      setShowEditUserModal(false);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(error.message);
    }
  };

  const handleAddUser = async (userData) => {
    try {
      // Implementation would be added when backend is ready
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add user");
      }
      
      toast.success("User added successfully");
      setShowAddUserModal(false);
      fetchUsers();
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error("Add user functionality not implemented yet");
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">User Management</h1>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearch}
            />
          </div>
          
          <div className="relative">
            <button
              className="flex items-center space-x-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              onClick={() => setShowDropdown(prev => prev === 'filter' ? null : 'filter')}
            >
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </button>
            
            {showDropdown === 'filter' && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div className="py-1">
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => { handleFilter(''); setShowDropdown(null); }}
                  >
                    All Users
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => { handleFilter('dj'); setShowDropdown(null); }}
                  >
                    DJs Only
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => { handleFilter('user'); setShowDropdown(null); }}
                  >
                    Regular Users
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => { handleFilter('active'); setShowDropdown(null); }}
                  >
                    Active Users
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => { handleFilter('inactive'); setShowDropdown(null); }}
                  >
                    Inactive Users
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <button
            className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={() => setShowAddUserModal(true)}
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add User</span>
          </button>
          
          <button
            className={`p-2 rounded-lg border border-gray-300 hover:bg-gray-50 ${refreshing ? 'animate-spin' : ''}`}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <RefreshCw className="animate-spin h-8 w-8 text-gray-400" />
        </div>
      ) : (
        <>
          {users.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-4">No users found</p>
              <button
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                onClick={() => setShowAddUserModal(true)}
              >
                Add User
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-gray-100">
                              {user.image ? (
                                <Image src={user.image} alt={user.name} width={40} height={40} className="object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-500">
                                  {user.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name || 'Unknown User'}</div>
                              <div className="text-sm text-gray-500">ID: {user._id.substring(0, 8)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email || 'No email'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'DJ' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role || 'User'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="relative">
                            <button
                              className="text-gray-400 hover:text-gray-600"
                              onClick={() => setShowDropdown(prev => prev === user._id ? null : user._id)}
                            >
                              <MoreHorizontal className="h-5 w-5" />
                            </button>
                            
                            {showDropdown === user._id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                <div className="py-1">
                                  <button
                                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setShowEditUserModal(true);
                                      setShowDropdown(null);
                                    }}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit User
                                  </button>
                                  <button
                                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                    onClick={() => {
                                      handleEditUser({ status: user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' });
                                      setShowDropdown(null);
                                    }}
                                  >
                                    {user.status === 'ACTIVE' ? (
                                      <>
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Deactivate
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Activate
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{" "}
                  of <span className="font-medium">{pagination.total}</span> users
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page <= 1}
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    // Show pages around current page
                    let pageNum;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        className={`px-3 py-1 rounded border ${
                          pagination.page === pageNum
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page >= pagination.pages}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}
      
      {/* Edit User Modal */}
      {showEditUserModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setShowEditUserModal(false)}
          onSave={handleEditUser}
        />
      )}
      
      {/* Add User Modal */}
      {showAddUserModal && (
        <AddUserModal
          onClose={() => setShowAddUserModal(false)}
          onSave={handleAddUser}
        />
      )}
    </div>
  );
}

function EditUserModal({ user, onClose, onSave }) {
  const [role, setRole] = useState(user.role || 'USER');
  const [status, setStatus] = useState(user.status || 'ACTIVE');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ role, status });
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit User</h2>
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Name
            </label>
            <input
              type="text"
              className="border border-gray-300 rounded-lg px-4 py-2 w-full bg-gray-100"
              value={user.name || ''}
              disabled
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              className="border border-gray-300 rounded-lg px-4 py-2 w-full bg-gray-100"
              value={user.email || ''}
              disabled
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Role
            </label>
            <select
              className="border border-gray-300 rounded-lg px-4 py-2 w-full"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="USER">User</option>
              <option value="DJ">DJ</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Status
            </label>
            <select
              className="border border-gray-300 rounded-lg px-4 py-2 w-full"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddUserModal({ onClose, onSave }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("USER");
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name, email, role });
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add User</h2>
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Name
            </label>
            <input
              type="text"
              className="border border-gray-300 rounded-lg px-4 py-2 w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              className="border border-gray-300 rounded-lg px-4 py-2 w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Role
            </label>
            <select
              className="border border-gray-300 rounded-lg px-4 py-2 w-full"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="USER">User</option>
              <option value="DJ">DJ</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 