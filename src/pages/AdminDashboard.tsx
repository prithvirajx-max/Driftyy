import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
  FaUsers, 
  FaUserEdit, 
  FaTrash, 
  FaSignOutAlt, 
  FaSearch, 
  FaUserCircle,
  FaRegCalendarAlt,
  FaEnvelope,
  FaFilter,
  FaGoogle,
  FaFacebook,
  FaChevronLeft,
  FaChevronRight,
  FaUserCog,
  FaShieldAlt,
  FaKey
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import styles from './AdminDashboard.module.css';

// API URL
const API_URL = 'http://localhost:5001/api';

// User interface for OAuth users
interface User {
  _id: string;
  displayName: string;
  email: string;
  provider: string;
  providerId: string;
  photoURL: string | null;
  role: string;
  createdAt: string;
  lastLogin: string;
  phoneNumber?: string;
  status?: 'active' | 'inactive' | 'suspended';
  profile?: {
    bio?: string;
    age?: number;
    gender?: string;
    location?: string;
    interests?: string[];
  };
}

// Pagination interface
interface Pagination {
  total: number;
  page: number;
  pages: number;
}

// Stats interface
interface Stats {
  totalUsers: number;
  newToday: number;
  activeUsers: number;
  googleUsers: number;
  facebookUsers: number;
  verifiedUsers: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated, logout, user } = useAuth();
  
  // State
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [filteredStatus, setFilteredStatus] = useState<string>('all');
  const [filteredProvider, setFilteredProvider] = useState<string>('all');
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    newToday: 0,
    activeUsers: 0,
    googleUsers: 0,
    facebookUsers: 0,
    verifiedUsers: 0
  });
  
  // Pagination state
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    pages: 1
  });
  const [pageSize, setPageSize] = useState(10);

  // Check if admin is authenticated
  useEffect(() => {
    // Store the authentication status in localStorage to persist between refreshes
    if (isAdmin) {
      localStorage.setItem('adminAuthenticated', 'true');
    }
    
    const checkAdminStatus = () => {
      // Check both AuthContext and localStorage
      const isAdminInContext = isAdmin;
      const isAdminInStorage = localStorage.getItem('adminAuthenticated') === 'true';
      const hasValidToken = localStorage.getItem('token');
      
      console.log('Admin dashboard check - isAuthenticated:', isAuthenticated);
      console.log('Admin dashboard check - isAdmin in context:', isAdminInContext);
      console.log('Admin dashboard check - isAdmin in storage:', isAdminInStorage);
      console.log('Admin dashboard check - has token:', !!hasValidToken);
      
      // Only redirect if definitely not an admin after giving time for auth to initialize
      if (!isLoading && !isAdminInContext && !isAdminInStorage && !hasValidToken) {
        console.log('Not authenticated as admin, redirecting to login');
        navigate('/admin');
      }
    };
    
    // Run the check immediately if authentication is already loaded
    if (!isLoading) {
      checkAdminStatus();
    } else {
      // Otherwise, give a slight delay to allow auth context to initialize properly
      const timer = setTimeout(checkAdminStatus, 500);
      return () => clearTimeout(timer);
    }
  }, [navigate, isAuthenticated, isAdmin, isLoading]);
  
  // Store admin status on login
  useEffect(() => {
    if (isAdmin) {
      localStorage.setItem('adminAuthenticated', 'true');
    }
  }, [isAdmin]);
  
  // Fetch users from API with pagination and filters
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Build query params for filtering and pagination
        const params = new URLSearchParams();
        params.append('page', pagination.page.toString());
        params.append('limit', pageSize.toString());
        
        if (searchTerm) {
          params.append('search', searchTerm);
        }
        
        if (filteredProvider !== 'all') {
          params.append('provider', filteredProvider);
        }
        
        console.log(`Fetching users from: ${API_URL}/auth/users?${params.toString()}`);
        
        // Make API request with query params
        const response = await axios.get(`${API_URL}/auth/users?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        console.log('Users API response:', response.data);
        
        // Update pagination info if available
        if (response.data.pagination) {
          setPagination({
            total: response.data.pagination.total,
            page: response.data.pagination.page,
            pages: response.data.pagination.pages
          });
        }
        
        // Get users array from response
        const usersData = response.data.users || [];
        
        // Transform the user data to include status based on last login
        const usersWithStatus = usersData.map((user: User) => {
          const lastLoginDate = new Date(user.lastLogin);
          const now = new Date();
          const diffDays = Math.floor((now.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24));
          
          // Determine status based on last login
          let status: 'active' | 'inactive' | 'suspended' = 'active';
          if (diffDays > 30) {
            status = 'inactive';
          }
          
          return { ...user, status };
        });
        
        setUsers(usersWithStatus);
        
        // Update statistics based on user data
        const newStats = {
          totalUsers: usersWithStatus.length,
          newToday: usersWithStatus.filter((u: User) => {
            const createdDate = new Date(u.createdAt);
            const today = new Date();
            return createdDate.getDate() === today.getDate() &&
                   createdDate.getMonth() === today.getMonth() &&
                   createdDate.getFullYear() === today.getFullYear();
          }).length,
          activeUsers: usersWithStatus.filter((u: User) => u.status === 'active').length,
          googleUsers: usersWithStatus.filter((u: User) => u.provider === 'google').length,
          facebookUsers: usersWithStatus.filter((u: User) => u.provider === 'facebook').length,
          verifiedUsers: usersWithStatus.filter((u: User) => u.phoneNumber).length
        };
        
        setStats(newStats);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching users:', err);
        setError('Failed to fetch users. ' + (err.response?.data?.message || err.message));
        
        // If we get a 401 or 403 error, the token might be invalid
        if (err.response?.status === 401 || err.response?.status === 403) {
          console.log('Authentication error, redirecting to login');
          // Redirect to login after a short delay
          setTimeout(() => {
            navigate('/admin');
          }, 2000);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, [pagination.page, pageSize, searchTerm, filteredProvider, navigate]);

  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate('/admin');
  };

  // Filter users based on search, status and provider filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.providerId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filteredStatus === 'all' || user.status === filteredStatus;
    const matchesProvider = filteredProvider === 'all' || user.provider === filteredProvider;
    
    return matchesSearch && matchesStatus && matchesProvider;
  });

  // Handle editing user
  const handleEditUser = (user: User) => {
    setEditingUser({...user});
  };

  // Save edited user
  const handleSaveUser = async () => {
    if (editingUser) {
      try {
        setIsLoading(true);
        
        // In a real implementation, this would call the API
        // await axios.put(`${API_URL}/users/${editingUser._id}`, editingUser);
        
        // For now, just update in state
        setUsers(users.map(user => 
          user._id === editingUser._id ? editingUser : user
        ));
        
        setEditingUser(null);
      } catch (err) {
        console.error('Error updating user:', err);
        alert('Failed to update user');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId: string) => {
    try {
      setIsLoading(true);
      
      // In a real implementation, this would call the API
      // await axios.delete(`${API_URL}/users/${userId}`);
      
      // For now, just remove from state
      setUsers(users.filter(user => user._id !== userId));
      setShowDeleteModal(null);
      
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user');
    } finally {
      setIsLoading(false);
    }
  };

  // If not authenticated as admin, show unauthorized message
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className={styles.unauthorizedContainer}>
        <h1>Unauthorized Access</h1>
        <p>You need to be an admin to view this page.</p>
        <button onClick={() => navigate('/')} className={styles.returnButton}>Return Home</button>
      </div>
    );
  }
  
  return (
    <div className={styles.adminDashboard}>
      <header className={styles.adminHeader}>
        <div className={styles.headerLeft}>
          <h1>Drifty Dating Admin</h1>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.adminControls}>
            <button className={styles.logoutButton} onClick={handleLogout}>
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </header>
      
      <div className={styles.dashboardContent}>
        {/* Statistics Cards */}
        <div className={styles.statsGrid}>
          <motion.div 
            className={`${styles.statCard} ${styles.totalUsersCard}`}
            whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(255, 78, 142, 0.2)' }}
          >
            <div className={styles.statIcon}>
              <FaUsers />
            </div>
            <div className={styles.statInfo}>
              <h3>Total Users</h3>
              <div className={styles.statValue}>{stats.totalUsers}</div>
              <div className={styles.statTrend}>+{stats.newToday} today</div>
            </div>
          </motion.div>
          
          <motion.div 
            className={`${styles.statCard} ${styles.activeUsersCard}`}
            whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(78, 142, 255, 0.2)' }}
          >
            <div className={styles.statIcon}>
              <FaUserCircle />
            </div>
            <div className={styles.statInfo}>
              <h3>Active Users</h3>
              <div className={styles.statValue}>{stats.activeUsers}</div>
              <div className={styles.statTrend}>
                {stats.totalUsers ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}% of total
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className={`${styles.statCard} ${styles.googleUsersCard}`}
            whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(219, 68, 55, 0.2)' }}
          >
            <div className={styles.statIcon}>
              <FaGoogle />
            </div>
            <div className={styles.statInfo}>
              <h3>Google Users</h3>
              <div className={styles.statValue}>{stats.googleUsers}</div>
              <div className={styles.statTrend}>
                {stats.totalUsers ? Math.round((stats.googleUsers / stats.totalUsers) * 100) : 0}% of total
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className={`${styles.statCard} ${styles.facebookUsersCard}`}
            whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(66, 103, 178, 0.2)' }}
          >
            <div className={styles.statIcon}>
              <FaFacebook />
            </div>
            <div className={styles.statInfo}>
              <h3>Facebook Users</h3>
              <div className={styles.statValue}>{stats.facebookUsers}</div>
              <div className={styles.statTrend}>
                {stats.totalUsers ? Math.round((stats.facebookUsers / stats.totalUsers) * 100) : 0}% of total
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className={`${styles.statCard} ${styles.verifiedUsersCard}`}
            whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(76, 175, 80, 0.2)' }}
          >
            <div className={styles.statIcon}>
              <FaKey />
            </div>
            <div className={styles.statInfo}>
              <h3>Verified Users</h3>
              <div className={styles.statValue}>{stats.verifiedUsers}</div>
              <div className={styles.statTrend}>
                {stats.totalUsers ? Math.round((stats.verifiedUsers / stats.totalUsers) * 100) : 0}% of total
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Users Section */}
        <div className={styles.usersSection}>
          <div className={styles.sectionHeader}>
            <h2><FaUsers /> User Management</h2>
            <div className={styles.sectionControls}>
              <span>{filteredUsers.length} users</span>
            </div>
          </div>
          
          {/* Filters */}
          <div className={styles.filterContainer}>
            <div className={styles.searchBox}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <div className={styles.statusFilter}>
              <FaFilter className={styles.filterIcon} />
              <select
                value={filteredStatus}
                onChange={(e) => setFilteredStatus(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div className={styles.providerFilter}>
              <FaFilter className={styles.filterIcon} />
              <select
                value={filteredProvider}
                onChange={(e) => setFilteredProvider(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Providers</option>
                <option value="google">Google</option>
                <option value="facebook">Facebook</option>
              </select>
            </div>
          </div>
          
          {/* Loading and Error States */}
          {isLoading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>Loading users...</p>
            </div>
          ) : error ? (
            <div className={styles.errorContainer}>
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className={styles.retryButton}
              >
                Retry
              </button>
            </div>
          ) : (
            /* User Cards Grid */
            <div className={styles.usersGrid}>
              {filteredUsers.length === 0 ? (
                <div className={styles.noUsers}>
                  <p>No users found matching your filters.</p>
                </div>
              ) : (
                filteredUsers.map(user => (
                  <motion.div 
                    key={user._id}
                    className={styles.userCard}
                    whileHover={{ y: -5, boxShadow: '0 12px 30px rgba(0, 0, 0, 0.1)' }}
                  >
                    <div className={styles.userCardHeader}>
                      <img 
                        src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=random`} 
                        alt={user.displayName} 
                        className={styles.userAvatar} 
                      />
                      <div className={styles.userInfo}>
                        <h3>{user.displayName}</h3>
                        <div className={styles.userMeta}>
                          <span className={`${styles.userStatus} ${styles[user.status || 'active']}`}>
                            {user.status || 'active'}
                          </span>
                          <span className={styles.userProvider}>
                            {user.provider === 'google' ? (
                              <><FaGoogle style={{ color: '#DB4437' }} /> Google</>  
                            ) : user.provider === 'facebook' ? (
                              <><FaFacebook style={{ color: '#4267B2' }} /> Facebook</>
                            ) : (
                              user.provider
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className={styles.userCardBody}>
                      <div className={styles.userDetail}>
                        <FaEnvelope className={styles.detailIcon} />
                        <span>{user.email}</span>
                      </div>
                      <div className={styles.userDetail}>
                        <FaRegCalendarAlt className={styles.detailIcon} />
                        <span>Created: {new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className={styles.userDetail}>
                        <FaUserCircle className={styles.detailIcon} />
                        <span>Last Login: {new Date(user.lastLogin).toLocaleDateString()}</span>
                      </div>
                      {user.phoneNumber && (
                        <div className={styles.userDetail}>
                          <FaEnvelope className={styles.detailIcon} />
                          <span>Phone: {user.phoneNumber}</span>
                        </div>
                      )}
                      <div className={styles.userDetail}>
                        <span className={styles.detailLabel}>Role:</span>
                        <span className={styles.userRole}>{user.role}</span>
                      </div>
                    </div>
                    
                    <div className={styles.userCardActions}>
                      <button 
                        className={styles.editButton}
                        onClick={() => handleEditUser(user)}
                      >
                        <FaUserEdit /> Edit
                      </button>
                      <button 
                        className={styles.deleteButton}
                        onClick={() => setShowDeleteModal(user._id)}
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Edit User Modal */}
      {editingUser && (
        <div className={styles.modalOverlay}>
          <motion.div 
            className={styles.editModal}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2>Edit User</h2>
            <div className={styles.editForm}>
              <div className={styles.formRow}>
                <label>Name</label>
                <input 
                  type="text" 
                  value={editingUser.displayName} 
                  onChange={(e) => setEditingUser({...editingUser, displayName: e.target.value})}
                />
              </div>
              <div className={styles.formRow}>
                <label>Email</label>
                <input 
                  type="email" 
                  value={editingUser.email} 
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                />
              </div>
              <div className={styles.formRow}>
                <label>Provider</label>
                <input 
                  type="text" 
                  value={editingUser.provider} 
                  readOnly
                  disabled
                  className={styles.disabledInput}
                />
              </div>
              <div className={styles.formRow}>
                <label>Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className={styles.formRow}>
                <label>Status</label>
                <select 
                  value={editingUser.status || 'active'} 
                  onChange={(e) => setEditingUser({
                    ...editingUser, 
                    status: e.target.value as 'active' | 'inactive' | 'suspended'
                  })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.cancelButton} onClick={() => setEditingUser(null)}>
                Cancel
              </button>
              <button className={styles.saveButton} onClick={handleSaveUser}>
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Delete User Confirmation Modal */}
      {showDeleteModal && (
        <div className={styles.modalOverlay}>
          <motion.div 
            className={styles.confirmModal}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to delete this user? This action cannot be undone.</p>
            <div className={styles.modalActions}>
              <button className={styles.cancelButton} onClick={() => setShowDeleteModal(null)}>
                Cancel
              </button>
              <button className={styles.deleteButton} onClick={() => handleDeleteUser(showDeleteModal)}>
                Delete User
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
