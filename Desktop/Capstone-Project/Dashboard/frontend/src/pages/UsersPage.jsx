import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { 
  Users, 
  Search,
  Plus,
  Mail,
  Phone,
  Shield,
  UserCheck,
  UserX,
  MoreHorizontal,
  Edit,
  Trash2,
  Clock
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

export default function UsersPage() {
  const { userData, user } = useAuth();
  const [appUsers, setAppUsers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('app_users');
  const [loading, setLoading] = useState(true);
  const [showAddStaffDialog, setShowAddStaffDialog] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'officer'
  });

  useEffect(() => {
    // Fetch app users
    const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubUsers = onSnapshot(usersQuery, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAppUsers(usersData);
    }, (error) => {
      console.error('Error fetching users:', error);
    });

    // Fetch staff
    const staffQuery = query(collection(db, 'staff'), orderBy('createdAt', 'desc'));
    const unsubStaff = onSnapshot(staffQuery, (snapshot) => {
      const staffData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStaff(staffData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching staff:', error);
      setLoading(false);
    });

    return () => {
      unsubUsers();
      unsubStaff();
    };
  }, []);

  const handleAddStaff = async () => {
    if (!newStaff.name || !newStaff.email) {
      toast.error('Name and email are required');
      return;
    }

    try {
      await addDoc(collection(db, 'staff'), {
        ...newStaff,
        status: 'active',
        createdAt: new Date().toISOString(),
        createdBy: user?.uid
      });
      toast.success('Staff member added successfully');
      setShowAddStaffDialog(false);
      setNewStaff({ name: '', email: '', phone: '', role: 'officer' });
    } catch (error) {
      console.error('Error adding staff:', error);
      toast.error('Failed to add staff member');
    }
  };

  const handleStatusChange = async (userId, collection_name, newStatus) => {
    try {
      await updateDoc(doc(db, collection_name, userId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      toast.success('Status updated');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDeleteUser = async (userId, collection_name) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await deleteDoc(doc(db, collection_name, userId));
      toast.success('User deleted');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const filteredAppUsers = appUsers.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStaff = staff.filter(s => 
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6" data-testid="users-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500">Manage app users and security staff</p>
        </div>
        <Dialog open={showAddStaffDialog} onOpenChange={setShowAddStaffDialog}>
          <DialogTrigger asChild>
            <Button className="bg-[#0d1b2a] hover:bg-[#1b263b] flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Security Staff</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input
                  value={newStaff.name}
                  onChange={(e) => setNewStaff(p => ({ ...p, name: e.target.value }))}
                  placeholder="Officer John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff(p => ({ ...p, email: e.target.value }))}
                  placeholder="john.doe@acadiau.ca"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff(p => ({ ...p, phone: e.target.value }))}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={newStaff.role} onValueChange={(v) => setNewStaff(p => ({ ...p, role: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="officer">Officer</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowAddStaffDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleAddStaff} className="flex-1 bg-[#0d1b2a] hover:bg-[#1b263b]">
                  Add Staff
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
          data-testid="search-users"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="app_users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            App Users ({appUsers.length})
          </TabsTrigger>
          <TabsTrigger value="staff" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security Staff ({staff.length})
          </TabsTrigger>
        </TabsList>

        {/* App Users Tab */}
        <TabsContent value="app_users">
          <Card>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Registered</th>
                    <th>Verified</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8">
                        <div className="flex justify-center">
                          <div className="w-8 h-8 border-4 border-[#0d1b2a] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      </td>
                    </tr>
                  ) : filteredAppUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-500">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredAppUsers.map((user) => (
                      <tr key={user.id} data-testid={`user-row-${user.id}`}>
                        <td>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-9 h-9">
                              <AvatarFallback className="bg-slate-100 text-slate-600 text-sm">
                                {getInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{user.name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td>
                          <span className="flex items-center gap-1 text-sm">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {user.email || 'N/A'}
                          </span>
                        </td>
                        <td>
                          <span className="flex items-center gap-1 text-sm">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {user.phone || 'N/A'}
                          </span>
                        </td>
                        <td className="text-sm text-slate-500">{formatDate(user.createdAt)}</td>
                        <td>
                          {user.verified ? (
                            <UserCheck className="w-5 h-5 text-green-500" />
                          ) : (
                            <UserX className="w-5 h-5 text-slate-300" />
                          )}
                        </td>
                        <td>
                          <Badge className={user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {user.status || 'active'}
                          </Badge>
                        </td>
                        <td>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleStatusChange(user.id, 'users', user.status === 'active' ? 'suspended' : 'active')}>
                                {user.status === 'active' ? 'Suspend' : 'Activate'}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteUser(user.id, 'users')}>
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Staff Tab */}
        <TabsContent value="staff">
          <Card>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Staff Member</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Last Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8">
                        <div className="flex justify-center">
                          <div className="w-8 h-8 border-4 border-[#0d1b2a] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      </td>
                    </tr>
                  ) : filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-500">
                        No staff members found
                      </td>
                    </tr>
                  ) : (
                    filteredStaff.map((member) => (
                      <tr key={member.id} data-testid={`staff-row-${member.id}`}>
                        <td>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-9 h-9">
                              <AvatarFallback className="bg-[#0d1b2a] text-white text-sm">
                                {getInitials(member.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{member.name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td>
                          <span className="flex items-center gap-1 text-sm">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {member.email || 'N/A'}
                          </span>
                        </td>
                        <td>
                          <span className="flex items-center gap-1 text-sm">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {member.phone || 'N/A'}
                          </span>
                        </td>
                        <td>
                          <Badge className={
                            member.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                            member.role === 'supervisor' ? 'bg-blue-100 text-blue-800' :
                            'bg-slate-100 text-slate-800'
                          }>
                            {member.role || 'officer'}
                          </Badge>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${member.status === 'active' ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                            <span className="text-sm capitalize">{member.status || 'active'}</span>
                          </div>
                        </td>
                        <td className="text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {member.lastActive ? formatDate(member.lastActive) : 'Never'}
                          </span>
                        </td>
                        <td>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(member.id, 'staff', member.status === 'active' ? 'inactive' : 'active')}>
                                {member.status === 'active' ? 'Deactivate' : 'Activate'}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteUser(member.id, 'staff')}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
