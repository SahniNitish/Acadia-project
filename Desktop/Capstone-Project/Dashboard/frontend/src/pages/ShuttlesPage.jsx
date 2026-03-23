import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import {
  Bus,
  MapPin,
  Clock,
  User,
  CheckCircle,
  ArrowRight,
  List,
  LayoutGrid,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';

export default function ShuttlesPage() {
  const { userData, user } = useAuth();
  const [shuttles, setShuttles] = useState([]);
  const [viewMode, setViewMode] = useState('list');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, active: 0, completed: 0 });

  useEffect(() => {
    const q = query(collection(db, 'shuttles'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setShuttles(data);
      setStats({
        pending: data.filter(s => s.status === 'pending').length,
        active: data.filter(s => s.status === 'in_progress').length,
        completed: data.filter(s => s.status === 'completed').length,
      });
      setLoading(false);
    }, (err) => {
      console.error('Error fetching shuttles:', err);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAction = async (shuttleId, newStatus) => {
    try {
      const updateData = { status: newStatus, updatedAt: new Date().toISOString() };
      if (newStatus === 'in_progress') {
        updateData.assignedTo = user?.uid;
        updateData.assignedToName = userData?.name;
      }
      if (newStatus === 'completed') {
        updateData.completedAt = new Date().toISOString();
      }
      await updateDoc(doc(db, 'shuttles', shuttleId), updateData);
      toast.success(`Shuttle ${newStatus === 'completed' ? 'completed' : 'updated'}`);
    } catch (error) {
      console.error('Error updating shuttle:', error);
      toast.error('Failed to update shuttle');
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
    const diffMins = Math.floor((new Date() - new Date(dateString)) / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return new Date(dateString).toLocaleDateString();
  };

  const filtered = statusFilter === 'all' ? shuttles : shuttles.filter(s => s.status === statusFilter);

  return (
    <div className="space-y-6" data-testid="shuttles-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Shuttle Bookings</h1>
          <p className="text-slate-500">Manage student shuttle requests</p>
        </div>
        <div className="flex border rounded-md">
          <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('list')}>
            <List className="w-4 h-4 mr-1" /> List
          </Button>
          <Button variant={viewMode === 'kanban' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('kanban')}>
            <LayoutGrid className="w-4 h-4 mr-1" /> Kanban
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-slate-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-500">Active</p>
          <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-500">Completed</p>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </Card>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-[#0d1b2a] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : viewMode === 'kanban' ? (
        /* Kanban View */
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[
            { title: 'Pending', status: 'pending', color: 'bg-yellow-500' },
            { title: 'In Progress', status: 'in_progress', color: 'bg-blue-500' },
            { title: 'Completed', status: 'completed', color: 'bg-green-500' },
          ].map(col => (
            <div key={col.status} className="flex-1 min-w-[300px]">
              <div className={`p-3 rounded-t-lg ${col.color}`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white">{col.title}</h3>
                  <Badge className="bg-white/20 text-white">{shuttles.filter(s => s.status === col.status).length}</Badge>
                </div>
              </div>
              <div className="kanban-column p-3 rounded-b-lg min-h-[300px]">
                {shuttles.filter(s => s.status === col.status).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <Bus className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm">No requests</p>
                  </div>
                ) : (
                  shuttles.filter(s => s.status === col.status).map(shuttle => (
                    <div key={shuttle.id} className="kanban-card p-4 mb-3">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                            <User className="w-4 h-4 text-slate-500" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{shuttle.studentName || 'Student'}</p>
                            <p className="text-xs text-slate-500">{shuttle.studentEmail || shuttle.studentPhone || 'No contact'}</p>
                          </div>
                        </div>
                        <span className="text-xs text-slate-400">{formatTimeAgo(shuttle.createdAt)}</span>
                      </div>
                      <div className="space-y-1 mb-3 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0"></span>
                          <span className="text-slate-600 truncate">{shuttle.pickup || 'Pickup'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0"></span>
                          <span className="text-slate-600 truncate">{shuttle.destination || 'Destination'}</span>
                        </div>
                      </div>
                      {shuttle.notes && (
                        <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded mb-3">{shuttle.notes}</p>
                      )}
                      <div className="flex gap-2">
                        {shuttle.status === 'pending' && (
                          <Button size="sm" className="flex-1 bg-[#0d1b2a] hover:bg-[#1b263b] h-8" onClick={() => handleAction(shuttle.id, 'in_progress')}>
                            Accept
                          </Button>
                        )}
                        {shuttle.status === 'in_progress' && (
                          <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 h-8" onClick={() => handleAction(shuttle.id, 'completed')}>
                            Complete
                          </Button>
                        )}
                        {shuttle.status === 'completed' && (
                          <Badge className="bg-green-100 text-green-800 w-full justify-center">
                            <CheckCircle className="w-3 h-3 mr-1" /> Completed
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <Card>
          <div className="p-4 border-b">
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Route</th>
                  <th>Requested</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500">No shuttle requests found</td>
                  </tr>
                ) : (
                  filtered.map(shuttle => (
                    <tr key={shuttle.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                            <User className="w-4 h-4 text-slate-500" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{shuttle.studentName || 'Student'}</p>
                            <p className="text-xs text-slate-500">{shuttle.studentEmail || shuttle.studentPhone || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2 text-sm max-w-xs">
                          <span className="text-slate-600 truncate">{shuttle.pickup}</span>
                          <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <span className="text-slate-600 truncate">{shuttle.destination}</span>
                        </div>
                      </td>
                      <td className="text-sm text-slate-500">{formatTimeAgo(shuttle.createdAt)}</td>
                      <td>
                        <Badge className={
                          shuttle.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          shuttle.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }>
                          {shuttle.status?.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="text-sm">{shuttle.assignedToName || '-'}</td>
                      <td>
                        {shuttle.status === 'pending' && (
                          <Button size="sm" className="bg-[#0d1b2a] hover:bg-[#1b263b]" onClick={() => handleAction(shuttle.id, 'in_progress')}>
                            Accept
                          </Button>
                        )}
                        {shuttle.status === 'in_progress' && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleAction(shuttle.id, 'completed')}>
                            Complete
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
