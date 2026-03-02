import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  BarChart3, 
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  Footprints,
  FileText,
  Users,
  Target
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Sample data for charts
const incidentsOverTime = [
  { name: 'Mon', alerts: 4, incidents: 8, escorts: 12 },
  { name: 'Tue', alerts: 3, incidents: 6, escorts: 15 },
  { name: 'Wed', alerts: 5, incidents: 10, escorts: 18 },
  { name: 'Thu', alerts: 2, incidents: 7, escorts: 14 },
  { name: 'Fri', alerts: 6, incidents: 12, escorts: 20 },
  { name: 'Sat', alerts: 8, incidents: 15, escorts: 8 },
  { name: 'Sun', alerts: 3, incidents: 5, escorts: 6 },
];

const incidentTypes = [
  { name: 'Suspicious Activity', value: 35, color: '#3182ce' },
  { name: 'Theft', value: 20, color: '#e53e3e' },
  { name: 'Harassment', value: 15, color: '#ecc94b' },
  { name: 'Vandalism', value: 12, color: '#38a169' },
  { name: 'Vehicle', value: 10, color: '#805ad5' },
  { name: 'Other', value: 8, color: '#718096' },
];

const hourlyActivity = [
  { hour: '12am', count: 2 }, { hour: '2am', count: 1 }, { hour: '4am', count: 1 },
  { hour: '6am', count: 3 }, { hour: '8am', count: 8 }, { hour: '10am', count: 12 },
  { hour: '12pm', count: 15 }, { hour: '2pm', count: 14 }, { hour: '4pm', count: 16 },
  { hour: '6pm', count: 20 }, { hour: '8pm', count: 25 }, { hour: '10pm', count: 18 },
];

const responseTimeTrend = [
  { date: 'Week 1', time: 4.2, target: 5 },
  { date: 'Week 2', time: 3.8, target: 5 },
  { date: 'Week 3', time: 4.5, target: 5 },
  { date: 'Week 4', time: 3.2, target: 5 },
];

const topLocations = [
  { name: 'Main Library', incidents: 25 },
  { name: 'Student Center', incidents: 20 },
  { name: 'Parking Lot A', incidents: 18 },
  { name: 'Residence Hall B', incidents: 15 },
  { name: 'Athletics Complex', incidents: 12 },
];

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('7days');
  const [stats, setStats] = useState({
    totalAlerts: 31,
    avgResponseTime: '3.8 min',
    incidentsReported: 63,
    escortsCompleted: 93,
    activeUsers: 2456,
    resolutionRate: '94%'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // In production, fetch real analytics data from Firestore
    setLoading(false);
  }, [dateRange]);

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }) => (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {trendValue}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-slate-500">{title}</p>
    </Card>
  );

  return (
    <div className="space-y-6" data-testid="analytics-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics & Reports</h1>
          <p className="text-slate-500">Campus security performance metrics</p>
        </div>
        <div className="flex gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40" data-testid="date-range-select">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard 
          title="Total Alerts" 
          value={stats.totalAlerts} 
          icon={AlertTriangle} 
          color="bg-red-500"
          trend="down"
          trendValue="-12%"
        />
        <StatCard 
          title="Avg Response" 
          value={stats.avgResponseTime} 
          icon={Clock} 
          color="bg-blue-500"
          trend="up"
          trendValue="-0.5min"
        />
        <StatCard 
          title="Incidents" 
          value={stats.incidentsReported} 
          icon={FileText} 
          color="bg-yellow-500"
          trend="down"
          trendValue="-8%"
        />
        <StatCard 
          title="Escorts" 
          value={stats.escortsCompleted} 
          icon={Footprints} 
          color="bg-green-500"
          trend="up"
          trendValue="+15%"
        />
        <StatCard 
          title="Active Users" 
          value={stats.activeUsers} 
          icon={Users} 
          color="bg-purple-500"
          trend="up"
          trendValue="+5%"
        />
        <StatCard 
          title="Resolution Rate" 
          value={stats.resolutionRate} 
          icon={Target} 
          color="bg-emerald-500"
          trend="up"
          trendValue="+2%"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incidents Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Activity Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={incidentsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend />
                  <Line type="monotone" dataKey="alerts" stroke="#e53e3e" strokeWidth={2} dot={{ r: 4 }} name="Alerts" />
                  <Line type="monotone" dataKey="incidents" stroke="#ecc94b" strokeWidth={2} dot={{ r: 4 }} name="Incidents" />
                  <Line type="monotone" dataKey="escorts" stroke="#38a169" strokeWidth={2} dot={{ r: 4 }} name="Escorts" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Incident Types */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Incident Types Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incidentTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {incidentTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 justify-center mt-4">
              {incidentTypes.map((type) => (
                <div key={type.name} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }}></span>
                  <span className="text-xs text-slate-600">{type.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Hourly Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Hourly Activity Pattern</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="hour" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="count" fill="#3182ce" radius={[4, 4, 0, 0]} name="Incidents" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-slate-500 text-center mt-2">Peak hours: 6PM - 10PM</p>
          </CardContent>
        </Card>

        {/* Response Time Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Response Time Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={responseTimeTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} domain={[0, 6]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="time" 
                    stroke="#3182ce" 
                    fill="#bee3f8" 
                    strokeWidth={2}
                    name="Avg Response (min)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="target" 
                    stroke="#e53e3e" 
                    strokeDasharray="5 5" 
                    strokeWidth={2}
                    dot={false}
                    name="Target (5 min)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-4 mt-2">
              <span className="flex items-center gap-2 text-sm">
                <span className="w-3 h-3 rounded-full bg-blue-400"></span>
                Response Time
              </span>
              <span className="flex items-center gap-2 text-sm">
                <span className="w-3 h-0.5 bg-red-500"></span>
                Target
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Locations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Incident Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topLocations} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#64748b" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} width={120} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="incidents" fill="#0d1b2a" radius={[0, 4, 4, 0]} name="Incidents" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
