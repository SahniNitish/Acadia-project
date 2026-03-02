import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  Footprints, 
  FileText, 
  Users,
  MapPin,
  Phone,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  ChevronRight,
  Megaphone,
  BarChart3,
  Settings,
  Siren
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { CampusMap } from '../components/dashboard/CampusMap';

export default function DashboardPage() {
  const { userData } = useAuth();
  const [stats, setStats] = useState({
    activeAlerts: 0,
    pendingEscorts: 0,
    todayIncidents: 0,
    appUsers: 0
  });
  const [liveAlerts, setLiveAlerts] = useState([]);
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [pendingEscorts, setPendingEscorts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Real-time listener for active alerts
    const alertsQuery = query(
      collection(db, 'alerts'),
      where('status', 'in', ['new', 'in_progress']),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const unsubAlerts = onSnapshot(alertsQuery, (snapshot) => {
      const alerts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLiveAlerts(alerts);
      setStats(prev => ({ ...prev, activeAlerts: alerts.length }));
    }, (error) => {
      console.error('Alerts listener error:', error);
      setLiveAlerts([]);
    });

    // Real-time listener for pending escorts
    const escortsQuery = query(
      collection(db, 'escorts'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc'),
      limit(4)
    );

    const unsubEscorts = onSnapshot(escortsQuery, (snapshot) => {
      const escorts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPendingEscorts(escorts);
      setStats(prev => ({ ...prev, pendingEscorts: escorts.length }));
    }, (error) => {
      console.error('Escorts listener error:', error);
      setPendingEscorts([]);
    });

    // Real-time listener for incidents
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const incidentsQuery = query(
      collection(db, 'incidents'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const unsubIncidents = onSnapshot(incidentsQuery, (snapshot) => {
      const incidents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecentIncidents(incidents);
      
      // Count today's incidents
      const todayCount = incidents.filter(i => {
        const incidentDate = new Date(i.createdAt);
        return incidentDate >= today;
      }).length;
      setStats(prev => ({ ...prev, todayIncidents: todayCount }));
    }, (error) => {
      console.error('Incidents listener error:', error);
      setRecentIncidents([]);
    });

    // Get app users count
    const usersQuery = query(collection(db, 'users'));
    const unsubUsers = onSnapshot(usersQuery, (snapshot) => {
      setStats(prev => ({ ...prev, appUsers: snapshot.size }));
      setLoading(false);
    }, (error) => {
      console.error('Users listener error:', error);
      setLoading(false);
    });

    return () => {
      unsubAlerts();
      unsubEscorts();
      unsubIncidents();
      unsubUsers();
    };
  }, []);

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
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const getStatusBadge = (status) => {
    const variants = {
      new: 'bg-red-100 text-red-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      pending: 'bg-blue-100 text-blue-800'
    };
    return variants[status] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Welcome back, {userData?.name || 'Officer'}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-red-500" data-testid="stat-active-alerts">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Active Alerts</p>
                <p className="text-3xl font-bold text-slate-900">{stats.activeAlerts}</p>
                <div className="flex items-center gap-1 mt-1">
                  {stats.activeAlerts > 0 ? (
                    <>
                      <ArrowUpRight className="w-4 h-4 text-red-500" />
                      <span className="text-xs text-red-500">Needs attention</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-xs text-green-500">All clear</span>
                    </>
                  )}
                </div>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stats.activeAlerts > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
                <AlertTriangle className={`w-6 h-6 ${stats.activeAlerts > 0 ? 'text-red-600' : 'text-green-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500" data-testid="stat-pending-escorts">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Pending Escorts</p>
                <p className="text-3xl font-bold text-slate-900">{stats.pendingEscorts}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-slate-500">Waiting</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Footprints className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500" data-testid="stat-today-incidents">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Today's Incidents</p>
                <p className="text-3xl font-bold text-slate-900">{stats.todayIncidents}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowDownRight className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-green-500">-12% vs yesterday</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500" data-testid="stat-app-users">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">App Users</p>
                <p className="text-3xl font-bold text-slate-900">{stats.appUsers}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-green-500">+5 this week</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Live Alerts Panel */}
          <Card data-testid="live-alerts-panel">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-3">
                <CardTitle className="text-lg">Live Alerts</CardTitle>
                {stats.activeAlerts > 0 && (
                  <span className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse-dot"></span>
                    Real-time
                  </span>
                )}
              </div>
              <Link to="/alerts">
                <Button variant="ghost" size="sm" className="text-slate-500">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {liveAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-lg font-medium text-slate-900 mb-1">All Clear</p>
                  <p className="text-sm text-slate-500">No active emergencies</p>
                  <p className="text-xs text-slate-400 mt-2">Last checked: Just now</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {liveAlerts.map((alert) => (
                    <div 
                      key={alert.id} 
                      className={`p-4 rounded-lg border-l-4 ${
                        alert.status === 'new' ? 'border-l-red-500 bg-red-50' : 'border-l-yellow-500 bg-yellow-50'
                      }`}
                      data-testid={`alert-card-${alert.id}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            alert.status === 'new' ? 'bg-red-200' : 'bg-yellow-200'
                          }`}>
                            <Siren className={`w-5 h-5 ${alert.status === 'new' ? 'text-red-700' : 'text-yellow-700'}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={getStatusBadge(alert.status)}>
                                {alert.status === 'new' ? 'NEW' : 'IN PROGRESS'}
                              </Badge>
                              <span className="text-xs text-slate-500 font-mono">{alert.id.slice(0, 8)}</span>
                            </div>
                            <p className="font-medium text-slate-900">{alert.studentName || 'Unknown Student'}</p>
                            <div className="flex items-center gap-1 text-sm text-slate-600 mt-1">
                              <MapPin className="w-4 h-4" />
                              <span>{alert.location || 'Location unknown'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-slate-900">{formatTimeAgo(alert.createdAt)}</p>
                          <div className="flex gap-2 mt-2">
                            <Button size="sm" variant="outline" className="h-8">
                              View
                            </Button>
                            <Button size="sm" className="h-8 bg-[#0d1b2a] hover:bg-[#1b263b]">
                              Respond
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Incidents Table */}
          <Card data-testid="recent-incidents-panel">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg">Recent Incidents</CardTitle>
              <Link to="/incidents">
                <Button variant="ghost" size="sm" className="text-slate-500">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Type</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentIncidents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-slate-500">
                          No incidents reported
                        </td>
                      </tr>
                    ) : (
                      recentIncidents.map((incident) => (
                        <tr key={incident.id} data-testid={`incident-row-${incident.id}`}>
                          <td className="font-mono text-sm">{incident.id.slice(0, 8)}</td>
                          <td>
                            <span className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-slate-400" />
                              {incident.type || 'General'}
                            </span>
                          </td>
                          <td className="text-slate-600">{incident.location || 'Unknown'}</td>
                          <td>
                            <Badge className={getStatusBadge(incident.status)}>
                              {incident.status || 'pending'}
                            </Badge>
                          </td>
                          <td className="text-slate-500 text-sm">{formatTimeAgo(incident.createdAt)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Campus Map Widget */}
          <Card data-testid="campus-map-widget">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Campus Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] rounded-lg overflow-hidden">
                <CampusMap alerts={liveAlerts} />
              </div>
              <Link to="/alerts">
                <Button variant="outline" className="w-full mt-3">
                  Open Full Map
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Pending Escorts Widget */}
          <Card data-testid="pending-escorts-widget">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                Escort Requests
                {stats.pendingEscorts > 0 && (
                  <Badge className="bg-blue-100 text-blue-800">{stats.pendingEscorts}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingEscorts.length === 0 ? (
                <p className="text-center py-6 text-slate-500 text-sm">No pending requests</p>
              ) : (
                <div className="space-y-3">
                  {pendingEscorts.slice(0, 3).map((escort) => (
                    <div key={escort.id} className="p-3 bg-slate-50 rounded-lg" data-testid={`escort-card-${escort.id}`}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-slate-900 text-sm">{escort.studentName}</p>
                        <span className="text-xs text-slate-500">{formatTimeAgo(escort.createdAt)}</span>
                      </div>
                      <div className="text-xs text-slate-600 space-y-1">
                        <p className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          {escort.pickup || 'Pickup location'}
                        </p>
                        <p className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-red-500"></span>
                          {escort.destination || 'Destination'}
                        </p>
                      </div>
                      <Button size="sm" className="w-full mt-2 h-7 text-xs bg-[#0d1b2a] hover:bg-[#1b263b]">
                        Assign to Me
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <Link to="/escorts">
                <Button variant="ghost" size="sm" className="w-full mt-2 text-slate-500">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Actions Widget */}
          <Card data-testid="quick-actions-widget">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/broadcast">
                  <div className="quick-action-btn bg-red-50 hover:bg-red-100">
                    <Megaphone className="w-6 h-6 text-red-600 mb-2" />
                    <span className="text-sm font-medium text-slate-700">Broadcast</span>
                  </div>
                </Link>
                <Link to="/analytics">
                  <div className="quick-action-btn bg-blue-50 hover:bg-blue-100">
                    <BarChart3 className="w-6 h-6 text-blue-600 mb-2" />
                    <span className="text-sm font-medium text-slate-700">Reports</span>
                  </div>
                </Link>
                <Link to="/users">
                  <div className="quick-action-btn bg-green-50 hover:bg-green-100">
                    <Users className="w-6 h-6 text-green-600 mb-2" />
                    <span className="text-sm font-medium text-slate-700">Users</span>
                  </div>
                </Link>
                <Link to="/settings">
                  <div className="quick-action-btn bg-slate-100 hover:bg-slate-200">
                    <Settings className="w-6 h-6 text-slate-600 mb-2" />
                    <span className="text-sm font-medium text-slate-700">Settings</span>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
