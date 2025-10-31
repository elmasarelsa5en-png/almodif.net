'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Wrench,
  Plus,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  User,
  DollarSign,
  Filter,
  Search,
  Play,
  Pause,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Target,
  Repeat
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/auth-context';
import {
  getAllMaintenanceTasks,
  getMaintenanceStats,
  createMaintenanceTask,
  updateMaintenanceTask,
  startMaintenanceTask,
  completeMaintenanceTask,
  cancelMaintenanceTask,
  assignMaintenanceTask,
  subscribeToMaintenanceTasks,
  type MaintenanceTask,
  type MaintenanceStats,
  type MaintenanceType,
  type MaintenancePriority,
  type RecurrenceType,
  getTypeLabel,
  getPriorityLabel,
  getRecurrenceLabel
} from '@/lib/maintenance-system';

const STATUS_CONFIG = {
  'scheduled': { label: 'مجدولة', color: 'bg-blue-500/20 text-blue-300', icon: '📅' },
  'pending': { label: 'قيد الانتظار', color: 'bg-yellow-500/20 text-yellow-300', icon: '⏳' },
  'in-progress': { label: 'قيد التنفيذ', color: 'bg-purple-500/20 text-purple-300', icon: '⚙️' },
  'completed': { label: 'مكتملة', color: 'bg-green-500/20 text-green-300', icon: '✅' },
  'overdue': { label: 'متأخرة', color: 'bg-red-500/20 text-red-300', icon: '🚨' },
  'cancelled': { label: 'ملغاة', color: 'bg-gray-500/20 text-gray-300', icon: '❌' },
};

const PRIORITY_CONFIG = {
  'low': { label: 'منخفضة', color: 'text-blue-400', icon: '🔵' },
  'medium': { label: 'متوسطة', color: 'text-yellow-400', icon: '🟡' },
  'high': { label: 'عالية', color: 'text-orange-400', icon: '🟠' },
  'urgent': { label: 'عاجلة', color: 'text-red-400', icon: '🔴' },
};

export default function MaintenancePage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [stats, setStats] = useState<MaintenanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);

  useEffect(() => {
    loadData();

    // الاشتراك في التحديثات الفورية
    const unsubscribe = subscribeToMaintenanceTasks((updatedTasks) => {
      setTasks(updatedTasks);
    });

    return () => unsubscribe();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tasksData, statsData] = await Promise.all([
        getAllMaintenanceTasks(),
        getMaintenanceStats()
      ]);
      setTasks(tasksData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading maintenance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesType = filterType === 'all' || task.type === filterType;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.roomNumber?.includes(searchTerm);
    return matchesStatus && matchesType && matchesSearch;
  });

  const handleStartTask = async (taskId: string) => {
    if (!user) return;
    await startMaintenanceTask(taskId, user.uid, user.name || user.username);
    loadData();
  };

  const handleCompleteTask = async (taskId: string) => {
    if (!user) return;
    const notes = prompt('ملاحظات الإكمال (اختياري):');
    await completeMaintenanceTask(
      taskId,
      { completionNotes: notes || undefined },
      user.uid,
      user.name || user.username
    );
    loadData();
  };

  return (
    <ProtectedRoute requiredPermission="view_maintenance">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <Wrench className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">🔧 جدولة الصيانة</h1>
              <p className="text-blue-200">إدارة وتتبع مهام الصيانة الدورية والطارئة</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-md border-blue-400/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-200">إجمالي المهام</p>
                    <p className="text-3xl font-bold text-white">{stats.total}</p>
                  </div>
                  <BarChart3 className="w-10 h-10 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-md border-yellow-400/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-200">قيد الانتظار</p>
                    <p className="text-3xl font-bold text-white">{stats.pending}</p>
                  </div>
                  <Clock className="w-10 h-10 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md border-purple-400/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-200">قيد التنفيذ</p>
                    <p className="text-3xl font-bold text-white">{stats.inProgress}</p>
                  </div>
                  <Play className="w-10 h-10 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-md border-green-400/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-200">مكتملة</p>
                    <p className="text-3xl font-bold text-white">{stats.completed}</p>
                  </div>
                  <CheckCircle2 className="w-10 h-10 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500/20 to-pink-500/20 backdrop-blur-md border-red-400/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-200">متأخرة</p>
                    <p className="text-3xl font-bold text-white">{stats.overdue}</p>
                  </div>
                  <AlertTriangle className="w-10 h-10 text-red-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-md border-cyan-400/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-cyan-200">معدل الإنجاز</p>
                    <p className="text-3xl font-bold text-white">{stats.completionRate}%</p>
                  </div>
                  <Target className="w-10 h-10 text-cyan-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters & Actions */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <Search className="w-5 h-5 text-white" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="بحث في المهام..."
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/50"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white/10 border-white/30 text-white rounded-lg px-3 py-2"
              >
                <option value="all">جميع الحالات</option>
                <option value="scheduled">مجدولة</option>
                <option value="pending">قيد الانتظار</option>
                <option value="in-progress">قيد التنفيذ</option>
                <option value="completed">مكتملة</option>
                <option value="overdue">متأخرة</option>
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-white/10 border-white/30 text-white rounded-lg px-3 py-2"
              >
                <option value="all">جميع الأنواع</option>
                <option value="cleaning">تنظيف</option>
                <option value="ac">تكييف</option>
                <option value="plumbing">سباكة</option>
                <option value="electrical">كهرباء</option>
                <option value="furniture">أثاث</option>
                <option value="painting">دهان</option>
                <option value="appliances">أجهزة</option>
                <option value="preventive">وقائية</option>
                <option value="emergency">طوارئ</option>
              </select>

              <Button
                onClick={() => setShowAddDialog(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Plus className="w-4 h-4 ml-2" />
                مهمة جديدة
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tasks List */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Wrench className="w-6 h-6" />
              مهام الصيانة ({filteredTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-white">جاري التحميل...</div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-8 text-white/70">لا توجد مهام</div>
            ) : (
              <div className="space-y-4">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white/5 rounded-xl p-5 hover:bg-white/10 transition-colors border border-white/10"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-white font-bold text-lg">{task.title}</h3>
                          <Badge className={STATUS_CONFIG[task.status].color}>
                            {STATUS_CONFIG[task.status].icon} {STATUS_CONFIG[task.status].label}
                          </Badge>
                          <Badge className={`${PRIORITY_CONFIG[task.priority].color} bg-white/10`}>
                            {PRIORITY_CONFIG[task.priority].icon} {PRIORITY_CONFIG[task.priority].label}
                          </Badge>
                          {task.recurrenceType !== 'once' && (
                            <Badge className="bg-blue-500/20 text-blue-300">
                              <Repeat className="w-3 h-3 ml-1" />
                              {getRecurrenceLabel(task.recurrenceType)}
                            </Badge>
                          )}
                        </div>
                        <p className="text-white/70 text-sm mb-2">{task.description}</p>
                        
                        <div className="flex flex-wrap gap-3 text-sm">
                          <div className="flex items-center gap-1 text-blue-300">
                            <Calendar className="w-4 h-4" />
                            {new Date(task.scheduledDate).toLocaleDateString('ar-SA')}
                          </div>
                          {task.roomNumber && (
                            <div className="flex items-center gap-1 text-purple-300">
                              🏠 شقة {task.roomNumber}
                            </div>
                          )}
                          {task.assignedToName && (
                            <div className="flex items-center gap-1 text-green-300">
                              <User className="w-4 h-4" />
                              {task.assignedToName}
                            </div>
                          )}
                          {task.estimatedCost && (
                            <div className="flex items-center gap-1 text-yellow-300">
                              <DollarSign className="w-4 h-4" />
                              {task.estimatedCost} ريال
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-orange-300">
                            🔧 {getTypeLabel(task.type)}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {task.status === 'pending' && (
                          <Button
                            onClick={() => handleStartTask(task.id!)}
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        )}
                        {task.status === 'in-progress' && (
                          <Button
                            onClick={() => handleCompleteTask(task.id!)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
