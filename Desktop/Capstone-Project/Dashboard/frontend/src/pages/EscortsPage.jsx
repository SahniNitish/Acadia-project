import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import {
  Footprints,
  MapPin,
  Clock,
  User,
  Phone,
  CheckCircle,
  ArrowRight,
  Filter,
  LayoutGrid,
  List
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
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableEscortCard = ({ escort, onAction, onAssignToStaff, formatTimeAgo }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: escort.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="kanban-card p-4 mb-3 cursor-grab active:cursor-grabbing"
      data-testid={`escort-card-${escort.id}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
            <User className="w-4 h-4 text-slate-500" />
          </div>
          <div>
            <p className="font-medium text-sm">{escort.studentName || 'Student'}</p>
            <p className="text-xs text-slate-500">{escort.studentEmail || escort.studentPhone || 'No contact'}</p>
          </div>
        </div>
        <span className="text-xs text-slate-400">{formatTimeAgo(escort.createdAt)}</span>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0"></span>
          <span className="text-slate-600 truncate">{escort.pickup || 'Pickup location'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0"></span>
          <span className="text-slate-600 truncate">{escort.destination || 'Destination'}</span>
        </div>
      </div>

      {escort.notes && (
        <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded mb-3">{escort.notes}</p>
      )}

      {escort.assignedToName && (
        <p className="text-xs text-blue-600 mb-2">Assigned: {escort.assignedToName}</p>
      )}

      <div className="flex gap-2 flex-wrap">
        {escort.status === 'pending' && (
          <>
            <Button
              size="sm"
              className="flex-1 bg-[#0d1b2a] hover:bg-[#1b263b] h-8"
              onClick={(e) => {
                e.stopPropagation();
                onAction(escort.id, 'in_progress');
              }}
            >
              Assign to Me
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-3"
              onClick={(e) => {
                e.stopPropagation();
                onAssignToStaff(escort.id);
              }}
            >
              Assign to Staff
            </Button>
          </>
        )}
        {escort.status === 'in_progress' && (
          <>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-8"
              onClick={(e) => {
                e.stopPropagation();
                onAction(escort.id, 'in_progress', true);
              }}
            >
              Start Walk
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700 h-8"
              onClick={(e) => {
                e.stopPropagation();
                onAction(escort.id, 'completed');
              }}
            >
              Complete
            </Button>
          </>
        )}
        {escort.status === 'completed' && (
          <Badge className="bg-green-100 text-green-800 w-full justify-center">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        )}
      </div>
    </div>
  );
};

const KanbanColumn = ({ title, status, escorts, color, onAction, onAssignToStaff, formatTimeAgo }) => {
  const columnEscorts = escorts.filter(e => e.status === status);

  return (
    <div className="flex-1 min-w-[300px]">
      <div className={`p-3 rounded-t-lg ${color}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white">{title}</h3>
          <Badge className="bg-white/20 text-white">{columnEscorts.length}</Badge>
        </div>
      </div>
      <div className="kanban-column p-3 rounded-b-lg min-h-[400px]">
        <SortableContext items={columnEscorts.map(e => e.id)} strategy={verticalListSortingStrategy}>
          {columnEscorts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Footprints className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">No requests</p>
            </div>
          ) : (
            columnEscorts.map((escort) => (
              <SortableEscortCard
                key={escort.id}
                escort={escort}
                onAction={onAction}
                onAssignToStaff={onAssignToStaff}
                formatTimeAgo={formatTimeAgo}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
};

export default function EscortsPage() {
  const { userData, user } = useAuth();
  const [escorts, setEscorts] = useState([]);
  const [viewMode, setViewMode] = useState('kanban');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    active: 0,
    completed: 0,
    avgWait: '8 min'
  });

  // Staff assignment state
  const [staffList, setStaffList] = useState([]);
  const [assignModal, setAssignModal] = useState({ open: false, escortId: null });
  const [selectedStaffId, setSelectedStaffId] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const escortsQuery = query(
      collection(db, 'escorts'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(escortsQuery, (snapshot) => {
      const escortsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEscorts(escortsData);

      const pending = escortsData.filter(e => e.status === 'pending').length;
      const active = escortsData.filter(e => e.status === 'in_progress').length;
      const completed = escortsData.filter(e => e.status === 'completed').length;

      setStats({ pending, active, completed, avgWait: '8 min' });
      setLoading(false);
    }, (error) => {
      console.error('Error fetching escorts:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch staff list once
  useEffect(() => {
    getDocs(collection(db, 'staff')).then(snap => {
      setStaffList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }).catch(err => console.error('Error fetching staff:', err));
  }, []);

  const handleStatusChange = async (escortId, newStatus, startWalk = false) => {
    try {
      const updateData = {
        status: newStatus,
        updatedAt: new Date().toISOString()
      };

      if (newStatus === 'in_progress' && !startWalk) {
        updateData.assignedTo = user?.uid;
        updateData.assignedToName = userData?.name || user?.email || 'Staff';
      }

      if (startWalk) {
        updateData.walkStartedAt = new Date().toISOString();
      }

      if (newStatus === 'completed') {
        updateData.completedAt = new Date().toISOString();
      }

      await updateDoc(doc(db, 'escorts', escortId), updateData);
      toast.success(`Escort ${newStatus === 'completed' ? 'completed' : 'assigned to you'}`);
    } catch (error) {
      console.error('Error updating escort:', error);
      toast.error('Failed to update escort');
    }
  };

  const handleAssignToStaff = async () => {
    const staff = staffList.find(s => s.id === selectedStaffId);
    if (!staff || !assignModal.escortId) return;
    try {
      await updateDoc(doc(db, 'escorts', assignModal.escortId), {
        status: 'in_progress',
        assignedTo: staff.id,
        assignedToName: staff.name,
        updatedAt: new Date().toISOString(),
      });
      toast.success(`Assigned to ${staff.name}`);
      setAssignModal({ open: false, escortId: null });
      setSelectedStaffId('');
    } catch (error) {
      console.error('Error assigning escort:', error);
      toast.error('Failed to assign escort');
    }
  };

  const openAssignModal = (escortId) => {
    setSelectedStaffId('');
    setAssignModal({ open: true, escortId });
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;
    const escort = escorts.find(e => e.id === active.id);
    if (!escort) return;
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

  const filteredEscorts = statusFilter === 'all'
    ? escorts
    : escorts.filter(e => e.status === statusFilter);

  return (
    <div className="space-y-6" data-testid="escorts-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Safety Escorts</h1>
          <p className="text-slate-500">Manage SafeWalk requests</p>
        </div>
        <div className="flex gap-2">
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('kanban')}
              data-testid="view-kanban"
            >
              <LayoutGrid className="w-4 h-4 mr-1" />
              Kanban
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              data-testid="view-list"
            >
              <List className="w-4 h-4 mr-1" />
              List
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-slate-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-500">Active Walks</p>
          <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-500">Completed Today</p>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-500">Avg Wait Time</p>
          <p className="text-2xl font-bold">{stats.avgWait}</p>
        </Card>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-[#0d1b2a] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : viewMode === 'kanban' ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-4">
            <KanbanColumn
              title="Pending"
              status="pending"
              escorts={escorts}
              color="bg-yellow-500"
              onAction={handleStatusChange}
              onAssignToStaff={openAssignModal}
              formatTimeAgo={formatTimeAgo}
            />
            <KanbanColumn
              title="In Progress"
              status="in_progress"
              escorts={escorts}
              color="bg-blue-500"
              onAction={handleStatusChange}
              onAssignToStaff={openAssignModal}
              formatTimeAgo={formatTimeAgo}
            />
            <KanbanColumn
              title="Completed"
              status="completed"
              escorts={escorts}
              color="bg-green-500"
              onAction={handleStatusChange}
              onAssignToStaff={openAssignModal}
              formatTimeAgo={formatTimeAgo}
            />
          </div>
        </DndContext>
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
                {filteredEscorts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500">
                      No escort requests found
                    </td>
                  </tr>
                ) : (
                  filteredEscorts.map((escort) => (
                    <tr key={escort.id} data-testid={`escort-row-${escort.id}`}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                            <User className="w-4 h-4 text-slate-500" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{escort.studentName}</p>
                            <p className="text-xs text-slate-500">{escort.studentEmail || escort.studentPhone || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-slate-600">{escort.pickup}</span>
                          <ArrowRight className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600">{escort.destination}</span>
                        </div>
                      </td>
                      <td className="text-sm text-slate-500">{formatTimeAgo(escort.createdAt)}</td>
                      <td>
                        <Badge className={
                          escort.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          escort.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }>
                          {escort.status?.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="text-sm">{escort.assignedToName || '-'}</td>
                      <td>
                        {escort.status !== 'completed' && (
                          <div className="flex gap-2">
                            {escort.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-[#0d1b2a] hover:bg-[#1b263b]"
                                  onClick={() => handleStatusChange(escort.id, 'in_progress')}
                                >
                                  Assign to Me
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openAssignModal(escort.id)}
                                >
                                  Assign to Staff
                                </Button>
                              </>
                            )}
                            {escort.status === 'in_progress' && (
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleStatusChange(escort.id, 'completed')}
                              >
                                Complete
                              </Button>
                            )}
                          </div>
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

      {/* Assign to Staff Modal */}
      <Dialog open={assignModal.open} onOpenChange={(open) => {
        if (!open) setAssignModal({ open: false, escortId: null });
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Escort to Staff</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a staff member..." />
              </SelectTrigger>
              <SelectContent>
                {staffList.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} {s.email ? `(${s.email})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setAssignModal({ open: false, escortId: null })}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-[#0d1b2a] hover:bg-[#1b263b]"
                disabled={!selectedStaffId}
                onClick={handleAssignToStaff}
              >
                Assign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
