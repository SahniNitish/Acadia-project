import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { 
  FileText, 
  Search,
  Filter,
  Download,
  Plus,
  MapPin,
  Clock,
  User,
  AlertTriangle,
  Eye,
  Package,
  ShieldAlert,
  Car,
  Image
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
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
  DialogTrigger,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';

const incidentTypes = [
  { value: 'suspicious_activity', label: 'Suspicious Activity', icon: Eye },
  { value: 'theft', label: 'Theft', icon: Package },
  { value: 'harassment', label: 'Harassment', icon: ShieldAlert },
  { value: 'vandalism', label: 'Vandalism', icon: AlertTriangle },
  { value: 'vehicle', label: 'Vehicle Incident', icon: Car },
  { value: 'other', label: 'Other', icon: FileText },
];

export default function IncidentsPage() {
  const { userData, user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNewIncidentDialog, setShowNewIncidentDialog] = useState(false);
  const [newIncident, setNewIncident] = useState({
    type: 'suspicious_activity',
    location: '',
    description: '',
    priority: 'medium',
    reporterName: '',
    anonymous: false
  });

  useEffect(() => {
    const incidentsQuery = query(
      collection(db, 'incidents'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(incidentsQuery, (snapshot) => {
      const incidentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setIncidents(incidentsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching incidents:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let filtered = [...incidents];
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(i => i.status === statusFilter);
    }
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(i => i.type === typeFilter);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(i => 
        i.location?.toLowerCase().includes(query) ||
        i.description?.toLowerCase().includes(query) ||
        i.reporterName?.toLowerCase().includes(query) ||
        i.id.toLowerCase().includes(query)
      );
    }
    
    setFilteredIncidents(filtered);
  }, [incidents, statusFilter, typeFilter, searchQuery]);

  const handleStatusChange = async (incidentId, newStatus) => {
    try {
      await updateDoc(doc(db, 'incidents', incidentId), {
        status: newStatus,
        updatedAt: new Date().toISOString(),
        updatedBy: user?.uid
      });
      toast.success(`Incident status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating incident:', error);
      toast.error('Failed to update incident');
    }
  };

  const handleCreateIncident = async () => {
    try {
      await addDoc(collection(db, 'incidents'), {
        ...newIncident,
        status: 'new',
        createdAt: new Date().toISOString(),
        createdBy: user?.uid,
        createdByName: userData?.name
      });
      toast.success('Incident reported successfully');
      setShowNewIncidentDialog(false);
      setNewIncident({
        type: 'suspicious_activity',
        location: '',
        description: '',
        priority: 'medium',
        reporterName: '',
        anonymous: false
      });
    } catch (error) {
      console.error('Error creating incident:', error);
      toast.error('Failed to create incident');
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
      new: 'bg-blue-100 text-blue-800',
      under_review: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-slate-100 text-slate-800'
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-slate-100 text-slate-600',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-red-100 text-red-700'
    };
    return colors[priority] || 'bg-slate-100 text-slate-600';
  };

  const getTypeIcon = (type) => {
    const typeObj = incidentTypes.find(t => t.value === type);
    return typeObj?.icon || FileText;
  };

  return (
    <div className="space-y-6" data-testid="incidents-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Incident Reports</h1>
          <p className="text-slate-500">Manage and track campus incidents</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Dialog open={showNewIncidentDialog} onOpenChange={setShowNewIncidentDialog}>
            <DialogTrigger asChild>
              <Button className="bg-[#0d1b2a] hover:bg-[#1b263b] flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Incident
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Report New Incident</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Incident Type</Label>
                  <Select value={newIncident.type} onValueChange={(v) => setNewIncident(p => ({ ...p, type: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {incidentTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input 
                    value={newIncident.location}
                    onChange={(e) => setNewIncident(p => ({ ...p, location: e.target.value }))}
                    placeholder="e.g., Main Library, 2nd Floor"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    value={newIncident.description}
                    onChange={(e) => setNewIncident(p => ({ ...p, description: e.target.value }))}
                    placeholder="Describe the incident in detail..."
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={newIncident.priority} onValueChange={(v) => setNewIncident(p => ({ ...p, priority: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Reporter Name (optional)</Label>
                  <Input 
                    value={newIncident.reporterName}
                    onChange={(e) => setNewIncident(p => ({ ...p, reporterName: e.target.value }))}
                    placeholder="Leave blank for anonymous"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowNewIncidentDialog(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleCreateIncident} className="flex-1 bg-[#0d1b2a] hover:bg-[#1b263b]">
                    Submit Report
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search incidents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="search-incidents"
          />
        </div>
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="new">Pending</TabsTrigger>
            <TabsTrigger value="under_review">Under Review</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>
        </Tabs>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {incidentTypes.map(type => (
              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Incidents Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Location</th>
                <th>Reporter</th>
                <th>Date/Time</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 border-4 border-[#0d1b2a] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-500">
                    No incidents found
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((incident) => {
                  const TypeIcon = getTypeIcon(incident.type);
                  return (
                    <tr key={incident.id} data-testid={`incident-row-${incident.id}`}>
                      <td className="font-mono text-sm">{incident.id.slice(0, 8)}</td>
                      <td>
                        <span className="flex items-center gap-2">
                          <TypeIcon className="w-4 h-4 text-slate-400" />
                          {incidentTypes.find(t => t.value === incident.type)?.label || incident.type}
                        </span>
                      </td>
                      <td className="max-w-xs truncate">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {incident.location || 'Unknown'}
                        </span>
                      </td>
                      <td>
                        {incident.anonymous || !incident.reporterName ? (
                          <span className="text-slate-400 italic">Anonymous</span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            {incident.reporterName}
                          </span>
                        )}
                      </td>
                      <td className="text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(incident.createdAt)}
                        </span>
                      </td>
                      <td>
                        <Badge className={getStatusColor(incident.status)}>
                          {incident.status?.replace('_', ' ') || 'pending'}
                        </Badge>
                      </td>
                      <td>
                        <Badge className={getPriorityColor(incident.priority)}>
                          {incident.priority || 'medium'}
                        </Badge>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedIncident(incident)}
                          >
                            View
                          </Button>
                          {incident.status !== 'resolved' && (
                            <Select 
                              value={incident.status}
                              onValueChange={(v) => handleStatusChange(incident.id, v)}
                            >
                              <SelectTrigger className="h-8 w-28">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="under_review">Review</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Incident Detail Modal */}
      <Dialog open={!!selectedIncident} onOpenChange={() => setSelectedIncident(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Incident Details
            </DialogTitle>
          </DialogHeader>
          {selectedIncident && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">ID</p>
                  <p className="font-mono">{selectedIncident.id}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Status</p>
                  <Badge className={getStatusColor(selectedIncident.status)}>
                    {selectedIncident.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Type</p>
                  <p className="capitalize">{selectedIncident.type?.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Priority</p>
                  <Badge className={getPriorityColor(selectedIncident.priority)}>
                    {selectedIncident.priority}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Location</p>
                  <p>{selectedIncident.location || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Reported</p>
                  <p>{new Date(selectedIncident.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-2">Description</p>
                <p className="p-3 bg-slate-50 rounded-lg">{selectedIncident.description || 'No description provided'}</p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setSelectedIncident(null)} className="flex-1">
                  Close
                </Button>
                {selectedIncident.status !== 'resolved' && (
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      handleStatusChange(selectedIncident.id, 'resolved');
                      setSelectedIncident(null);
                    }}
                  >
                    Mark Resolved
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
