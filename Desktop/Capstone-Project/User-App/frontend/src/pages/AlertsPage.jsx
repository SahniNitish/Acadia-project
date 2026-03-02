import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { 
  AlertTriangle, 
  MapPin, 
  Phone, 
  Mail,
  Clock,
  Filter,
  Download,
  LayoutGrid,
  List,
  Siren,
  CheckCircle,
  User,
  ExternalLink
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
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
} from '../components/ui/dialog';
import { toast } from 'sonner';
import { CampusMap } from '../components/dashboard/CampusMap';

export default function AlertsPage() {
  const { userData, user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('today');
  const [viewMode, setViewMode] = useState('card');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    avgResponseTime: '3.2 min',
    resolved: 0,
    active: 0
  });

  useEffect(() => {
    const alertsQuery = query(
      collection(db, 'alerts'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(alertsQuery, (snapshot) => {
      const alertsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAlerts(alertsData);
      
      // Calculate stats
      const active = alertsData.filter(a => a.status === 'new' || a.status === 'in_progress').length;
      const resolved = alertsData.filter(a => a.status === 'resolved').length;
      setStats(prev => ({
        ...prev,
        total: alertsData.length,
        active,
        resolved
      }));
      
      setLoading(false);
    }, (error) => {
      console.error('Error fetching alerts:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let filtered = [...alerts];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(a => a.status === statusFilter);
    }
    
    // Apply time filter
    const now = new Date();
    if (timeFilter === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      filtered = filtered.filter(a => new Date(a.createdAt) >= today);
    } else if (timeFilter === '7days') {
      const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(a => new Date(a.createdAt) >= weekAgo);
    } else if (timeFilter === '30days') {
      const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(a => new Date(a.createdAt) >= monthAgo);
    }
    
    setFilteredAlerts(filtered);
  }, [alerts, statusFilter, timeFilter]);

  const handleStatusChange = async (alertId, newStatus) => {
    try {
      await updateDoc(doc(db, 'alerts', alertId), {
        status: newStatus,
        updatedAt: new Date().toISOString(),
        updatedBy: user?.uid
      });
      toast.success(`Alert status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating alert:', error);
      toast.error('Failed to update alert status');
    }
  };

  const handleAssignToMe = async (alertId) => {
    try {
      await updateDoc(doc(db, 'alerts', alertId), {
        assignedTo: user?.uid,
        assignedToName: userData?.name,
        status: 'in_progress',
        updatedAt: new Date().toISOString()
      });
      toast.success('Alert assigned to you');
    } catch (error) {
      console.error('Error assigning alert:', error);
      toast.error('Failed to assign alert');
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-red-100 text-red-800 border-red-200',
      in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      resolved: 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  const getCardBorderColor = (status) => {
    const colors = {
      new: 'border-l-red-500',
      in_progress: 'border-l-yellow-500',
      resolved: 'border-l-green-500'
    };
    return colors[status] || 'border-l-slate-300';
  };

  return (
    <div className="space-y-6" data-testid="alerts-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Emergency Alerts</h1>
          <p className="text-slate-500">Monitor and respond to SOS alerts</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Filter Tabs & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="all" data-testid="filter-all">All</TabsTrigger>
            <TabsTrigger value="new" data-testid="filter-new">Active</TabsTrigger>
            <TabsTrigger value="in_progress" data-testid="filter-in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="resolved" data-testid="filter-resolved">Resolved</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center gap-3">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-40" data-testid="time-filter">
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'card' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('card')}
              data-testid="view-card"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
              data-testid="view-list"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-slate-500">Total Alerts (Today)</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-500">Avg Response Time</p>
          <p className="text-2xl font-bold">{stats.avgResponseTime}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-500">Resolved Today</p>
          <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
        </Card>
        <Card className={`p-4 ${stats.active > 0 ? 'bg-red-50 border-red-200' : ''}`}>
          <p className="text-sm text-slate-500">Active Now</p>
          <p className={`text-2xl font-bold ${stats.active > 0 ? 'text-red-600' : ''}`}>{stats.active}</p>
        </Card>
      </div>

      {/* Alerts Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-[#0d1b2a] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No alerts found</h3>
            <p className="text-sm text-slate-500">
              {statusFilter === 'all' ? 'All clear - no emergencies reported' : `No ${statusFilter} alerts`}
            </p>
          </div>
        </Card>
      ) : viewMode === 'card' ? (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <Card 
              key={alert.id} 
              className={`border-l-4 ${getCardBorderColor(alert.status)} overflow-hidden`}
              data-testid={`alert-card-${alert.id}`}
            >
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row">
                  {/* Main Info */}
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          alert.status === 'new' ? 'bg-red-100' : 
                          alert.status === 'in_progress' ? 'bg-yellow-100' : 'bg-green-100'
                        }`}>
                          <Siren className={`w-5 h-5 ${
                            alert.status === 'new' ? 'text-red-600' : 
                            alert.status === 'in_progress' ? 'text-yellow-600' : 'text-green-600'
                          }`} />
                        </div>
                        <div>
                          <Badge className={getStatusColor(alert.status)}>
                            {alert.status === 'new' ? 'NEW' : alert.status === 'in_progress' ? 'IN PROGRESS' : 'RESOLVED'}
                          </Badge>
                          <p className="text-xs text-slate-500 font-mono mt-1">{alert.id.slice(0, 12)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatTimeAgo(alert.createdAt)}</p>
                        <Badge variant="outline" className="mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          {alert.elapsedTime || '5 min'}
                        </Badge>
                      </div>
                    </div>

                    {/* Student Info */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                        <User className="w-6 h-6 text-slate-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{alert.studentName || 'Unknown Student'}</p>
                        <div className="flex items-center gap-3 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {alert.studentPhone || 'N/A'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {alert.studentEmail || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg mb-4">
                      <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-slate-700">{alert.location || 'Location pending...'}</p>
                        <p className="text-xs text-slate-500">
                          {alert.latitude && alert.longitude 
                            ? `${alert.latitude.toFixed(4)}, ${alert.longitude.toFixed(4)}`
                            : 'Coordinates not available'}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="ml-auto">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Maps
                      </Button>
                    </div>

                    {/* Assigned Officer */}
                    {alert.assignedToName && (
                      <p className="text-sm text-slate-500 mb-4">
                        Assigned to: <span className="font-medium text-slate-700">{alert.assignedToName}</span>
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" className="flex items-center gap-2" size="sm">
                        <Phone className="w-4 h-4" />
                        Call Student
                      </Button>
                      {alert.status !== 'resolved' && (
                        <>
                          <Button 
                            size="sm"
                            className="bg-[#0d1b2a] hover:bg-[#1b263b]"
                            onClick={() => handleAssignToMe(alert.id)}
                          >
                            Assign to Me
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedAlert(alert)}
                          >
                            View Details
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => handleStatusChange(alert.id, 'resolved')}
                          >
                            Resolve
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Map Preview */}
                  <div className="w-full lg:w-64 h-48 lg:h-auto bg-slate-100">
                    <CampusMap alerts={[alert]} height="100%" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* List View */
        <Card>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Time</th>
                  <th>Assigned To</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlerts.map((alert) => (
                  <tr key={alert.id} data-testid={`alert-row-${alert.id}`}>
                    <td className="font-mono text-sm">{alert.id.slice(0, 8)}</td>
                    <td>
                      <div>
                        <p className="font-medium">{alert.studentName || 'Unknown'}</p>
                        <p className="text-xs text-slate-500">{alert.studentPhone || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="max-w-xs truncate">{alert.location || 'Unknown'}</td>
                    <td>
                      <Badge className={getStatusColor(alert.status)}>
                        {alert.status}
                      </Badge>
                    </td>
                    <td className="text-sm text-slate-500">{formatTimeAgo(alert.createdAt)}</td>
                    <td>{alert.assignedToName || '-'}</td>
                    <td>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setSelectedAlert(alert)}>
                          View
                        </Button>
                        {alert.status !== 'resolved' && (
                          <Button 
                            size="sm" 
                            className="bg-[#0d1b2a] hover:bg-[#1b263b]"
                            onClick={() => handleStatusChange(alert.id, 'resolved')}
                          >
                            Resolve
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Alert Detail Modal */}
      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Siren className="w-5 h-5 text-red-600" />
              Alert Details
            </DialogTitle>
          </DialogHeader>
          {selectedAlert && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Status</p>
                  <Badge className={getStatusColor(selectedAlert.status)}>
                    {selectedAlert.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Student</p>
                  <p className="font-medium">{selectedAlert.studentName || 'Unknown'}</p>
                  <p className="text-sm text-slate-500">{selectedAlert.studentEmail}</p>
                  <p className="text-sm text-slate-500">{selectedAlert.studentPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Location</p>
                  <p className="font-medium">{selectedAlert.location || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Time</p>
                  <p className="font-medium">{new Date(selectedAlert.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button className="bg-[#0d1b2a] hover:bg-[#1b263b]" onClick={() => handleAssignToMe(selectedAlert.id)}>
                    Assign to Me
                  </Button>
                  <Button variant="outline" className="text-green-600" onClick={() => {
                    handleStatusChange(selectedAlert.id, 'resolved');
                    setSelectedAlert(null);
                  }}>
                    Mark Resolved
                  </Button>
                </div>
              </div>
              <div className="h-[300px] rounded-lg overflow-hidden">
                <CampusMap alerts={[selectedAlert]} height="100%" />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
