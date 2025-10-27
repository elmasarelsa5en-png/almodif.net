'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Clock,
  Shirt,
  ShoppingBasket,
  CheckCircle,
  Plus,
  Minus,
  Trash2,
  Edit2,
  BellRing,
  Send,
} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getRoomsFromStorage } from '@/lib/rooms-data'
import { playNotificationSound } from '@/lib/notification-sounds';

/**
 * Single-file Laundry Managem                      <SelectContent>
                        {occupiedRooms.map((room) => (
                          <SelectItem key={room.number} value={room.number}>
                            {room.number}
                          </SelectItem>
                        ))}
                      </SelectContent>ture.
 * Paste this file into your React + TypeScript project (e.g., src/features/LaundryFeature.tsx)
 * Requirements:
 * - Tailwind CSS available for styles referenced below.
 * - lucide-react installed for icons.
 *
 * Behavior:
 * - Stores requests and menu in localStorage using the keys below.
 * - Exposes a self-contained dashboard + modal + table.
 * - Uses minimal placeholders for "rooms" and "notify" integrations — replace as needed.
 */

/* ------------------------------- Constants -------------------------------- */
const LAUNDRY_REQUESTS_STORAGE_KEY = 'LAUNDRY_REQUESTS_STORAGE_KEY';
const LAUNDRY_MENU_KEY = 'LAUNDRY_MENU_KEY';

/* ------------------------------- Types ------------------------------------ */
type Status = 'Pending' | 'InProgress' | 'ReadyForPickup' | 'Completed';

type LaundryItemDef = {
  id: string;
  name: string;
  price: number; // per unit
};

type LaundryLine = {
  itemId: string;
  qty: number;
};

type LaundryRequest = {
  id: string;
  roomNumber: string;
  lines: LaundryLine[];
  total: number;
  status: Status;
  createdAt: string;
  sentToReception?: boolean;
  receptionRequestId?: string;
};

/* ------------------------------- Helpers ---------------------------------- */
const uid = (prefix = '') =>
  prefix + Math.random().toString(36).slice(2, 9);

const formatCurrency = (n: number | undefined | null) => {
  // التحقق من أن n رقم صالح
  if (n === undefined || n === null || isNaN(n)) {
    return '0.00 ر.س';
  }
  return `${n.toFixed(2)} ر.س`;
};

/* ------------------------------- Demo Data --------------------------------
   Replace or preload real menu via localStorage if desired.
*/
const DEFAULT_MENU: LaundryItemDef[] = [
  { id: 'shirt_wash_iron', name: 'غسيل وكوي ثوب', price: 10 },
  { id: 'dress_wash', name: 'غسيل فستان', price: 15 },
  { id: 'towel_wash', name: 'غسيل فوطة', price: 5 },
  { id: 'bedsheet_wash', name: 'غسيل ومكوي شرشف', price: 20 },
];

/* ------------------------------- Local Storage Hook ----------------------- */
function useLocalStorageState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return initial;
      
      const parsed = JSON.parse(raw) as T;
      
      // تنظيف البيانات: التأكد من أن كل طلب لديه lines و total و status صحيح
      if (key === 'LAUNDRY_REQUESTS_STORAGE_KEY' && Array.isArray(parsed)) {
        const validStatuses: Status[] = ['Pending', 'InProgress', 'ReadyForPickup', 'Completed'];
        const cleaned = (parsed as any[]).map(req => ({
          ...req,
          lines: Array.isArray(req.lines) ? req.lines : [],
          total: typeof req.total === 'number' ? req.total : 0,
          status: validStatuses.includes(req.status) ? req.status : 'Pending'
        }));
        return cleaned as T;
      }
      
      return parsed;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);

  return [state, setState] as const;
}

/* ------------------------------- Permission Check ------------------------- */
/*
 Replace this with your app's auth/permission check.
 For safety, this function returns true by default; adjust as needed.
*/
const hasPermission = (perm: string) => {
  // Example: check user object, roles, or JWT claims.
  // return currentUser?.permissions?.includes(perm)
  return true; // keep safe default to show buttons; change to false to hide sensitive actions.
};

/* ------------------------------- Notification / Sound --------------------- */
/* Replace with your app's toast/notification and sound system. */
const notify = (title: string, body?: string) => {
  // simple console fallback; integrate with your app to send to "guest requests" queue
  console.info('Notify:', title, body || '');
  // optional local visual notification via browser (permission required)
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body: body || '' });
  }
  // local bell sound
  try {
    const audio = new Audio(
      'data:audio/mp3;base64,//uQZAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCA...'
    );
    audio.volume = 0.2;
    audio.play().catch(() => {});
  } catch {}
};

/* ------------------------------- Status UI Mapping ------------------------ */
const STATUS_META: Record<
  Status,
  { label: string; bg: string; Icon: React.ComponentType<any> }
> = {
  Pending: { label: 'معلق', bg: 'bg-yellow-500/80', Icon: Clock },
  InProgress: { label: 'قيد الغسيل', bg: 'bg-blue-500/80', Icon: Shirt },
  ReadyForPickup: { label: 'جاهز للاستلام', bg: 'bg-purple-500/80', Icon: ShoppingBasket },
  Completed: { label: 'مكتمل', bg: 'bg-green-500/80', Icon: CheckCircle },
};

/* ------------------------------- Main Component --------------------------- */
export default function LaundryPage() {
  const [menu, setMenu] = useLocalStorageState<LaundryItemDef[]>(
    LAUNDRY_MENU_KEY,
    DEFAULT_MENU
  );

  const [requests, setRequests] = useLocalStorageState<LaundryRequest[]>(
    LAUNDRY_REQUESTS_STORAGE_KEY,
    []
  );

  // Modal / form state (single modal for add/edit)
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [lines, setLines] = useState<Record<string, number>>({}); // itemId => qty
  const [chargeToRoom, setChargeToRoom] = useState(true);
  const [customerType, setCustomerType] = useState<'internal' | 'external'>('external');
  const [customerName, setCustomerName] = useState<string>('');
  const [occupiedRooms, setOccupiedRooms] = useState<any[]>([]);

  // Load occupied rooms
  useEffect(() => {
    const rooms = getRoomsFromStorage();
    const occupied = rooms.filter(room => room.status === 'Occupied' && room.guestName);
    setOccupiedRooms(occupied);
  }, []);

  // compute totals
  const computedTotal = useMemo(() => {
    return menu.reduce((sum, it) => {
      const q = lines[it.id] || 0;
      return sum + q * it.price;
    }, 0);
  }, [menu, lines]);

  useEffect(() => {
    // init default lines when menu changes
    const initial: Record<string, number> = {};
    menu.forEach((m) => {
      initial[m.id] = 0;
    });
    setLines((cur) => {
      // if already initialized, keep current to avoid resetting in edit
      const hasAny = Object.keys(cur).length > 0;
      return hasAny ? cur : initial;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menu]);

  /* -------------------------- CRUD Operations --------------------------- */
  const openAdd = () => {
    setEditingId(null);
    setSelectedRoom('');
    const init: Record<string, number> = {};
    menu.forEach((m) => (init[m.id] = 0));
    setLines(init);
    setChargeToRoom(true);
    setCustomerType('external');
    setCustomerName('');
    setIsOpen(true);
  };

  const openEdit = (id: string) => {
    const req = requests.find((r) => r.id === id);
    if (!req) return;
    const mapping: Record<string, number> = {};
    menu.forEach((m) => (mapping[m.id] = 0));
    // فحص وجود lines وأنه array قبل الاستخدام
    if (req.lines && Array.isArray(req.lines)) {
      req.lines.forEach((l) => (mapping[l.itemId] = l.qty));
    }
    setEditingId(id);
    setSelectedRoom(req.roomNumber);
    setLines(mapping);
    setChargeToRoom(true); // when editing, keep same accounting selection previously saved? default true
    setIsOpen(true);
  };

  // Handle customer type change
  const handleCustomerTypeChange = (type: 'internal' | 'external') => {
    setCustomerType(type);
    if (type === 'external') {
      setSelectedRoom('');
      setCustomerName('');
      setChargeToRoom(false); // External customers don't charge to room
    } else {
      setChargeToRoom(true); // Internal customers charge to room by default
    }
  };

  // Handle room selection
  const handleRoomChange = (roomNum: string) => {
    setSelectedRoom(roomNum);
    if (roomNum) {
      const room = occupiedRooms.find(r => r.number === roomNum);
      if (room && room.guestName) {
        setCustomerName(room.guestName);
      }
    } else {
      setCustomerName('');
    }
  };

  const removeRequest = (id: string) => {
    if (!hasPermission('manage:laundry')) return;
    const ok = confirm('هل أنت متأكد من حذف هذا الطلب نهائيًا؟');
    if (!ok) return;
    setRequests((prev) => prev.filter((p) => p.id !== id));
    notify('تم حذف طلب المغسلة', `الطلب ${id} تم حذفه`);
  };

  const saveRequest = () => {
    if (customerType === 'internal' && !selectedRoom) {
      alert('اختر رقم الغرفة');
      return;
    }
    if (customerType === 'external' && !customerName.trim()) {
      alert('أدخل اسم العميل');
      return;
    }
    const linesArr: LaundryLine[] = Object.entries(lines)
      .filter(([, qty]) => qty > 0)
      .map(([itemId, qty]) => ({ itemId, qty }));
    if (linesArr.length === 0) {
      alert('حدد بندًا واحدًا على الأقل بكمية أكبر من صفر');
      return;
    }
    const total = computedTotal;
    const customerInfo = customerType === 'internal' ? `غرفة ${selectedRoom}` : customerName;

    if (editingId) {
      // update existing
      setRequests((prev) =>
        prev.map((r) =>
          r.id === editingId ? { ...r, lines: linesArr, total } : r
        )
      );
      notify('تم تحديث طلب المغسلة', `${customerInfo} ــ ${formatCurrency(total)}`);
    } else {
      // create new
      const newReq: LaundryRequest = {
        id: uid('lr_'),
        roomNumber: customerType === 'internal' ? selectedRoom : '',
        lines: linesArr,
        total,
        status: 'Pending',
        createdAt: new Date().toISOString(),
      };
      setRequests((prev) => [newReq, ...prev]);
      // accounting side effects
      if (customerType === 'internal' && chargeToRoom) {
        // Example: append to room ledger in localStorage under key ROOM_LEDGER_<roomNumber>
        try {
          const ledgerKey = `ROOM_LEDGER_${selectedRoom}`;
          const raw = localStorage.getItem(ledgerKey);
          const ledger = raw ? JSON.parse(raw) : [];
          ledger.push({
            id: uid('ledger_'),
            ts: new Date().toISOString(),
            desc: `طلب مغسلة بقيمة ${formatCurrency(total)}`,
            amount: total,
          });
          localStorage.setItem(ledgerKey, JSON.stringify(ledger));
        } catch {}
      }
      // register event to guest requests area (placeholder)
      notify('طلب مغسلة جديد', `${customerInfo} ــ ${formatCurrency(total)}`);
    }
    setIsOpen(false);
    setEditingId(null);
  };

  const changeStatus = (id: string, next: Status) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: next } : r)));
    const meta = STATUS_META[next];
    notify(`حالة الطلب تغيرت إلى ${meta.label}`, `طلب ${id}`);
  };

  const sendToReception = (request: LaundryRequest) => {
    // Get all employees and find available reception staff
    const employeesData = localStorage.getItem('employees');
    const employees = employeesData ? JSON.parse(employeesData) : [];
    const receptionStaff = employees.find((emp: any) => 
      emp.department === 'استقبال' && emp.status === 'available'
    );

    if (!receptionStaff) {
      alert('لا يوجد موظف استقبال متاح حالياً');
      return;
    }

    // Create guest request from laundry request
    const guestRequest = {
      id: uid(),
      guestName: `نزيل غرفة ${request.roomNumber}`,
      roomNumber: request.roomNumber,
      requestType: 'laundry',
      requestDescription: request.lines.map(line => {
        const item = menu.find(m => m.id === line.itemId);
        return `${item?.name || 'صنف'} × ${line.qty}`;
      }).join(', '),
      priority: 'medium' as const,
      status: 'awaiting_employee_approval' as const,
      requestDate: new Date().toISOString(),
      assignedTo: receptionStaff.id,
      assignedToName: receptionStaff.name,
      notes: `طلب من المغسلة - المبلغ: ${formatCurrency(request.total)}`,
      selectedSubItems: request.lines.map(line => line.itemId),
      linkedSection: 'laundry' as const,
      originalOrderId: request.id
    };

    // Save to guest requests
    const requestsData = localStorage.getItem('guest-requests');
    const guestRequests = requestsData ? JSON.parse(requestsData) : [];
    guestRequests.unshift(guestRequest);
    localStorage.setItem('guest-requests', JSON.stringify(guestRequests));

    // Update request status to indicate it's sent to reception
    setRequests((prev) => prev.map((r) => 
      r.id === request.id ? { ...r, sentToReception: true, receptionRequestId: guestRequest.id } : r
    ));

    // Play notification sound
    playNotificationSound('new-request');

    alert('تم إرسال الطلب للاستقبال بنجاح ✓');
  };

  /* -------------------------- Utility Renderers -------------------------- */
  const countNew = requests.filter((r) => r.status === 'Pending').length;
  const countCompletedToday = requests.filter((r) => {
    if (r.status !== 'Completed') return false;
    const date = new Date(r.createdAt).toLocaleDateString();
    return date === new Date().toLocaleDateString();
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">إدارة المغسلة</h1>
          <p className="text-purple-200">تتبع ومراقبة طلبات الغسيل والكوي</p>
        </div>

        <div className="space-y-6">
          {/* Mini Dashboard */}
          <div className="flex gap-4 items-center">
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div className="p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-xl flex items-center justify-between">
                <div>
                  <div className="text-sm text-purple-200">طلبات جديدة</div>
                  <div className="text-3xl font-bold text-white">{countNew}</div>
                </div>
                <div className="text-yellow-400">
                  <BellRing size={32} />
                </div>
              </div>
              <div className="p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-xl flex items-center justify-between">
                <div>
                  <div className="text-sm text-purple-200">مكتمل اليوم</div>
                  <div className="text-3xl font-bold text-white">{countCompletedToday}</div>
                </div>
                <div className="text-green-400">
                  <CheckCircle size={32} />
                </div>
              </div>
            </div>

            <div>
              <button
                onClick={openAdd}
                className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium"
              >
                <Plus size={20} />
                إضافة طلب غسيل
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] table-auto">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-right px-6 py-4 font-semibold text-white">رقم الغرفة</th>
                    <th className="text-right px-6 py-4 font-semibold text-white">الأصناف</th>
                    <th className="text-right px-6 py-4 font-semibold text-white">الإجمالي</th>
                    <th className="text-right px-6 py-4 font-semibold text-white">الحالة</th>
                    <th className="text-right px-6 py-4 font-semibold text-white">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-purple-200">
                        لا توجد طلبات حالياً
                      </td>
                    </tr>
                  )}
                  {requests.map((r) => (
                    <tr key={r.id} className="border-t border-white/10 hover:bg-slate-700/30">
                      <td className="px-6 py-4 text-right text-white font-medium">{r.roomNumber}</td>
                      <td className="px-6 py-4 text-right text-purple-200">
                        {r.lines && Array.isArray(r.lines)
                          ? r.lines
                              .map((ln) => {
                                const def = menu.find((m) => m.id === ln.itemId);
                                return def ? `${def.name} (x${ln.qty})` : `${ln.itemId} (x${ln.qty})`;
                              })
                              .join('، ')
                          : 'لا توجد عناصر'}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-green-400">{formatCurrency(r.total)}</td>
                      <td className="px-6 py-4 text-right">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-2 flex-wrap">
                          <button
                            title="تعديل"
                            onClick={() => openEdit(r.id)}
                            className="p-2 rounded-lg hover:bg-slate-700/50 text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <Edit2 size={18} />
                          </button>

                          <button
                            title="حذف"
                            onClick={() => removeRequest(r.id)}
                            className={`p-2 rounded-lg hover:bg-slate-700/50 text-red-400 hover:text-red-300 transition-colors ${hasPermission('manage:laundry') ? '' : 'opacity-50 cursor-not-allowed'}`}
                            disabled={!hasPermission('manage:laundry')}
                          >
                            <Trash2 size={18} />
                          </button>

                          {/* State transition buttons */}
                          {r.status === 'Pending' && (
                            <button
                              onClick={() => changeStatus(r.id, 'InProgress')}
                              className="px-3 py-1 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors"
                            >
                              بدء الغسيل
                            </button>
                          )}
                          {r.status === 'InProgress' && (
                            <button
                              onClick={() => changeStatus(r.id, 'ReadyForPickup')}
                              className="px-3 py-1 rounded-lg bg-purple-600 text-white text-sm hover:bg-purple-700 transition-colors"
                            >
                              جاهز للاستلام
                            </button>
                          )}
                          {r.status === 'ReadyForPickup' && (
                            <button
                              onClick={() => changeStatus(r.id, 'Completed')}
                              className="px-3 py-1 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 transition-colors"
                            >
                              تم التسليم
                            </button>
                          )}

                          {/* Send to reception button */}
                          {!r.sentToReception && (r.status === 'Pending' || r.status === 'InProgress') && (
                            <button
                              onClick={() => sendToReception(r)}
                              className="px-3 py-1 rounded-lg bg-amber-600 text-white text-sm hover:bg-amber-700 transition-colors flex items-center gap-1"
                              title="إرسال للاستقبال"
                            >
                              <Send size={14} />
                              إرسال للاستقبال
                            </button>
                          )}

                          {r.sentToReception && (
                            <span className="px-3 py-1 rounded-lg bg-green-600 text-white text-xs flex items-center gap-1">
                              <CheckCircle size={14} />
                              تم الإرسال
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal */}
        {isOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <div className="relative max-w-4xl w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl p-8 z-10 mx-4">
              <h3 className="text-xl font-bold text-white mb-6">{editingId ? 'تعديل طلب غسيل' : 'إضافة طلب غسيل'}</h3>

              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm text-purple-200 mb-2">نوع العميل</label>
                  <RadioGroup
                    value={customerType}
                    onValueChange={handleCustomerTypeChange}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="internal" id="internal" />
                      <label htmlFor="internal" className="text-white cursor-pointer">عميل داخلي (غرفة)</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="external" id="external" />
                      <label htmlFor="external" className="text-white cursor-pointer">عميل خارجي</label>
                    </div>
                  </RadioGroup>
                </div>

                {customerType === 'internal' && (
                  <>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm text-purple-200 mb-2">رقم الغرفة</label>
                      <Select value={selectedRoom} onValueChange={handleRoomChange}>
                        <SelectTrigger className="w-full bg-white/10 border border-white/20 text-white">
                          <SelectValue placeholder="اختر غرفة مشغولة" />
                        </SelectTrigger>
                        <SelectContent>
                          {occupiedRooms.map((room) => (
                            <SelectItem key={room.number} value={room.number}>
                              {room.number}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm text-purple-200 mb-2">اسم العميل</label>
                      <input
                        type="text"
                        value={customerName}
                        readOnly
                        placeholder="سيتم ملؤه تلقائياً"
                        className="w-full bg-white/5 border border-white/20 rounded-lg p-3 text-white placeholder-purple-300"
                      />
                    </div>
                  </>
                )}

                {customerType === 'external' && (
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm text-purple-200 mb-2">اسم العميل</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="أدخل اسم العميل"
                      className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                )}

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm text-purple-200 mb-2">طريقة المحاسبة</label>
                  {customerType === 'internal' ? (
                    <div className="px-4 py-3 rounded-lg bg-purple-600 text-white text-center">
                      تحميل على الشقة (تلقائي للعملاء الداخليين)
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setChargeToRoom(true)}
                        className={`px-4 py-3 rounded-lg transition-colors ${chargeToRoom ? 'bg-purple-600 text-white' : 'bg-white/10 text-purple-200 hover:bg-slate-700/50'}`}
                      >
                        تحميل على الشقة
                      </button>
                      <button
                        onClick={() => setChargeToRoom(false)}
                        className={`px-4 py-3 rounded-lg transition-colors ${!chargeToRoom ? 'bg-purple-600 text-white' : 'bg-white/10 text-purple-200 hover:bg-slate-700/50'}`}
                      >
                        إيراد خدمات
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 border-t border-white/20 pt-6 space-y-4 max-h-80 overflow-auto">
                {menu.map((m) => (
                  <div key={m.id} className="flex items-center justify-between gap-4 p-4 bg-white/5 rounded-lg">
                    <div className="text-right">
                      <div className="font-medium text-white">{m.name}</div>
                      <div className="text-sm text-purple-200">{formatCurrency(m.price)} / وحدة</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          setLines((s) => ({ ...s, [m.id]: Math.max(0, (s[m.id] || 0) - 1) }))
                        }
                        className="p-2 rounded-lg bg-white/10 hover:bg-slate-700/50 text-white transition-colors"
                        aria-label={`نقص ${m.name}`}
                      >
                        <Minus size={16} />
                      </button>
                      <div className="w-16 text-center text-white font-bold text-lg">{lines[m.id] || 0}</div>
                      <button
                        onClick={() =>
                          setLines((s) => ({ ...s, [m.id]: (s[m.id] || 0) + 1 }))
                        }
                        className="p-2 rounded-lg bg-white/10 hover:bg-slate-700/50 text-white transition-colors"
                        aria-label={`زيادة ${m.name}`}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-white/20 pt-6">
                <div className="text-right">
                  <div className="text-sm text-purple-200">الإجمالي</div>
                  <div className="text-3xl font-bold text-green-400">{formatCurrency(computedTotal)}</div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                    }}
                    className="px-6 py-3 rounded-lg bg-white/10 text-white hover:bg-slate-700/50 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={saveRequest}
                    className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium"
                  >
                    إرسال الطلب
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------- StatusBadge Component ------------------- */
function StatusBadge({ status }: { status: Status }) {
  const meta = STATUS_META[status];
  
  // حماية: إذا كانت الحالة غير معروفة، استخدم Pending كافتراضي
  if (!meta) {
    console.warn(`Unknown status: ${status}, using Pending as fallback`);
    const fallbackMeta = STATUS_META['Pending'];
    const Icon = fallbackMeta.Icon;
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-white ${fallbackMeta.bg} shadow-lg`}>
        <Icon size={16} />
        <span className="text-sm font-medium">{status || 'غير محدد'}</span>
      </div>
    );
  }
  
  const Icon = meta.Icon;
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-white ${meta.bg} shadow-lg`}>
      <Icon size={16} />
      <span className="text-sm font-medium">{meta.label}</span>
    </div>
  );
}