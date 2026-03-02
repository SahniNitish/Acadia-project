import { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { 
  Megaphone, 
  AlertTriangle,
  CloudRain,
  CheckCircle,
  Building,
  Bell,
  Send,
  Clock,
  Users,
  Info
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
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
  DialogDescription,
  DialogFooter,
} from '../components/ui/dialog';
import { toast } from 'sonner';

const templates = [
  { 
    id: 'lockdown', 
    name: 'Campus Lockdown', 
    icon: AlertTriangle, 
    color: 'bg-red-500',
    type: 'emergency',
    title: 'CAMPUS LOCKDOWN',
    message: 'A campus-wide lockdown is now in effect. Please shelter in place, lock doors, and await further instructions.'
  },
  { 
    id: 'weather', 
    name: 'Weather Advisory', 
    icon: CloudRain, 
    color: 'bg-yellow-500',
    type: 'advisory',
    title: 'Weather Advisory',
    message: 'A weather advisory has been issued for the campus area. Please take appropriate precautions.'
  },
  { 
    id: 'all_clear', 
    name: 'All Clear', 
    icon: CheckCircle, 
    color: 'bg-green-500',
    type: 'all_clear',
    title: 'ALL CLEAR',
    message: 'The emergency situation has been resolved. Normal campus activities may resume.'
  },
  { 
    id: 'evacuation', 
    name: 'Building Evacuation', 
    icon: Building, 
    color: 'bg-orange-500',
    type: 'emergency',
    title: 'Building Evacuation',
    message: 'Please evacuate the building immediately using the nearest exit. Do not use elevators.'
  },
  { 
    id: 'custom', 
    name: 'Custom Alert', 
    icon: Bell, 
    color: 'bg-slate-500',
    type: 'information',
    title: '',
    message: ''
  },
];

const alertTypes = [
  { value: 'emergency', label: 'Emergency', color: 'bg-red-500', description: 'Bypasses Do Not Disturb' },
  { value: 'advisory', label: 'Advisory', color: 'bg-yellow-500', description: 'Important notice' },
  { value: 'information', label: 'Information', color: 'bg-blue-500', description: 'General announcement' },
  { value: 'all_clear', label: 'All Clear', color: 'bg-green-500', description: 'Emergency resolved' },
];

export default function BroadcastPage() {
  const { userData, user } = useAuth();
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    type: 'information',
    title: '',
    message: '',
    targetAudience: 'all',
    scheduleNow: true
  });

  useEffect(() => {
    const broadcastsQuery = query(
      collection(db, 'broadcasts'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(broadcastsQuery, (snapshot) => {
      const broadcastsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBroadcasts(broadcastsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching broadcasts:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleTemplateSelect = (template) => {
    setFormData({
      ...formData,
      type: template.type,
      title: template.title,
      message: template.message
    });
  };

  const handleSendBroadcast = async () => {
    if (!formData.title || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setSending(true);
    try {
      await addDoc(collection(db, 'broadcasts'), {
        ...formData,
        status: 'sent',
        sentBy: user?.uid,
        sentByName: userData?.name,
        createdAt: new Date().toISOString(),
        recipientCount: formData.targetAudience === 'all' ? '2,500+' : 'Varies',
        deliveredCount: 0,
        readCount: 0
      });
      toast.success('Broadcast sent successfully!');
      setShowConfirmDialog(false);
      setFormData({
        type: 'information',
        title: '',
        message: '',
        targetAudience: 'all',
        scheduleNow: true
      });
    } catch (error) {
      console.error('Error sending broadcast:', error);
      toast.error('Failed to send broadcast');
    } finally {
      setSending(false);
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      emergency: 'bg-red-100 text-red-800 border-red-200',
      advisory: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      information: 'bg-blue-100 text-blue-800 border-blue-200',
      all_clear: 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[type] || 'bg-slate-100 text-slate-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6" data-testid="broadcast-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Broadcast Alerts</h1>
          <p className="text-slate-500">Send emergency notifications to campus users</p>
        </div>
        <Button 
          className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
          onClick={() => setShowConfirmDialog(true)}
          disabled={!formData.title || !formData.message}
          data-testid="send-alert-btn"
        >
          <Send className="w-4 h-4" />
          Send Alert
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Templates */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {templates.map((template) => {
                  const Icon = template.icon;
                  return (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                        formData.title === template.title && template.title
                          ? 'border-[#0d1b2a] bg-slate-50'
                          : 'border-transparent bg-slate-50 hover:border-slate-200'
                      }`}
                      data-testid={`template-${template.id}`}
                    >
                      <div className={`w-10 h-10 rounded-lg ${template.color} flex items-center justify-center mx-auto mb-2`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-xs font-medium text-center">{template.name}</p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Alert Form */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Compose Alert</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Alert Type</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData(p => ({ ...p, type: v }))}>
                  <SelectTrigger data-testid="alert-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {alertTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${type.color}`}></span>
                          <span>{type.label}</span>
                          <span className="text-xs text-slate-400">- {type.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                  placeholder="Alert title"
                  data-testid="alert-title-input"
                />
              </div>

              <div className="space-y-2">
                <Label>Message *</Label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData(p => ({ ...p, message: e.target.value }))}
                  placeholder="Enter your alert message..."
                  rows={5}
                  data-testid="alert-message-input"
                />
                <p className="text-xs text-slate-500 text-right">{formData.message.length} characters</p>
              </div>

              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Select value={formData.targetAudience} onValueChange={(v) => setFormData(p => ({ ...p, targetAudience: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="students">Students Only</SelectItem>
                    <SelectItem value="staff">Staff Only</SelectItem>
                    <SelectItem value="specific_building">Specific Building</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          {(formData.title || formData.message) && (
            <Card className="border-2 border-dashed">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-500">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`p-4 rounded-lg ${
                  formData.type === 'emergency' ? 'bg-red-50 border border-red-200' :
                  formData.type === 'advisory' ? 'bg-yellow-50 border border-yellow-200' :
                  formData.type === 'all_clear' ? 'bg-green-50 border border-green-200' :
                  'bg-blue-50 border border-blue-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Megaphone className={`w-5 h-5 ${
                      formData.type === 'emergency' ? 'text-red-600' :
                      formData.type === 'advisory' ? 'text-yellow-600' :
                      formData.type === 'all_clear' ? 'text-green-600' :
                      'text-blue-600'
                    }`} />
                    <Badge className={getTypeColor(formData.type)}>
                      {formData.type}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-lg mb-1">{formData.title || 'Alert Title'}</h3>
                  <p className="text-slate-600">{formData.message || 'Your message will appear here...'}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - History */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Recent Broadcasts</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-[#0d1b2a] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : broadcasts.length === 0 ? (
                <p className="text-center py-8 text-slate-500">No broadcasts sent yet</p>
              ) : (
                <div className="space-y-3">
                  {broadcasts.slice(0, 10).map((broadcast) => (
                    <div 
                      key={broadcast.id} 
                      className="p-3 bg-slate-50 rounded-lg"
                      data-testid={`broadcast-${broadcast.id}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getTypeColor(broadcast.type)}>
                          {broadcast.type}
                        </Badge>
                        <span className="text-xs text-slate-500">{formatDate(broadcast.createdAt)}</span>
                      </div>
                      <p className="font-medium text-sm truncate">{broadcast.title}</p>
                      <p className="text-xs text-slate-500 truncate mt-1">{broadcast.message}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {broadcast.recipientCount}
                        </span>
                        <span>by {broadcast.sentByName || 'Unknown'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Confirm Broadcast
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to send this alert?
            </DialogDescription>
          </DialogHeader>
          
          <div className={`p-4 rounded-lg ${
            formData.type === 'emergency' ? 'bg-red-50 border border-red-200' : 'bg-slate-50'
          }`}>
            <Badge className={getTypeColor(formData.type)}>{formData.type}</Badge>
            <h4 className="font-bold mt-2">{formData.title}</h4>
            <p className="text-sm text-slate-600 mt-1">{formData.message}</p>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Users className="w-4 h-4" />
            <span>This will be sent to <strong>2,500+</strong> users</span>
          </div>

          {formData.type === 'emergency' && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              <Info className="w-4 h-4" />
              <span>This will bypass Do Not Disturb settings</span>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700"
              onClick={handleSendBroadcast}
              disabled={sending}
            >
              {sending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Confirm & Send
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
