import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  Wallet,
  Calendar as CalendarIcon,
  Clock,
  StickyNote,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  BookOpen,
  Utensils,
  Car,
  Gamepad2,
  ShoppingBag,
  Briefcase,
  MoreHorizontal,
  Sparkles,
  Check,
  X,
  CalendarDays,
  ListTodo,
  Target,
  RefreshCw,
  Pin
} from 'lucide-react';
import {
  PanelLeftClose,
  PanelLeftOpen,
  Download,
  Upload,
  Moon,
  Sun,
  Flame,
  Trophy,
  CheckSquare
} from 'lucide-react';

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot
} from 'firebase/firestore';

// Khởi tạo Firebase an toàn với fallback nếu môi trường không có config
let app, auth, db;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'personal-hub-vn';

try {
  if (typeof __firebase_config !== 'undefined' && __firebase_config) {
    const firebaseConfig = JSON.parse(__firebase_config);
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  }
} catch (error) {
  console.error('Lỗi khởi tạo Firebase, chuyển sang chế độ bộ nhớ tạm:', error);
}

const EXPENSE_CATEGORIES = [
  { id: 'an_uong', name: 'Ăn uống', type: 'expense', color: 'bg-orange-500', text: 'text-orange-600', bgLight: 'bg-orange-50', icon: Utensils },
  { id: 'di_chuyen', name: 'Di chuyển', type: 'expense', color: 'bg-blue-500', text: 'text-blue-600', bgLight: 'bg-blue-50', icon: Car },
  { id: 'hoc_tap', name: 'Học tập', type: 'expense', color: 'bg-indigo-500', text: 'text-indigo-600', bgLight: 'bg-indigo-50', icon: BookOpen },
  { id: 'giai_tri', name: 'Giải trí', type: 'expense', color: 'bg-purple-500', text: 'text-purple-600', bgLight: 'bg-purple-50', icon: Gamepad2 },
  { id: 'mua_sam', name: 'Mua sắm', type: 'expense', color: 'bg-pink-500', text: 'text-pink-600', bgLight: 'bg-pink-50', icon: ShoppingBag },
  { id: 'luong_thuong', name: 'Lương/Thưởng', type: 'income', color: 'bg-emerald-500', text: 'text-emerald-600', bgLight: 'bg-emerald-50', icon: Briefcase },
  { id: 'khac', name: 'Khác', type: 'both', color: 'bg-slate-500', text: 'text-slate-600', bgLight: 'bg-slate-100', icon: MoreHorizontal }
];

const DAYS_OF_WEEK = [
  { id: 'T2', label: 'Thứ 2', full: 'Thứ Hai' },
  { id: 'T3', label: 'Thứ 3', full: 'Thứ Ba' },
  { id: 'T4', label: 'Thứ 4', full: 'Thứ Tư' },
  { id: 'T5', label: 'Thứ 5', full: 'Thứ Năm' },
  { id: 'T6', label: 'Thứ 6', full: 'Thứ Sáu' },
  { id: 'T7', label: 'Thứ 7', full: 'Thứ Bảy' },
  { id: 'CN', label: 'Chủ Nhật', full: 'Chủ Nhật' }
];

const SCHEDULE_TAGS = [
  { id: 'hoc_tap', name: 'Học tập / Lớp học', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'lam_viec', name: 'Làm việc', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { id: 'the_thao', name: 'Thể thao / Sức khỏe', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { id: 'ca_nhan', name: 'Cá nhân / Giải trí', color: 'bg-purple-100 text-purple-700 border-purple-200' }
];

const PRIORITY_LEVELS = {
  high: { label: 'Cao', badge: 'bg-rose-100 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
  medium: { label: 'Trung bình', badge: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  low: { label: 'Thấp', badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' }
};

const NOTE_COLORS = [
  { id: 'yellow', bg: 'bg-amber-50/90 border-amber-200', accent: 'text-amber-800' },
  { id: 'blue', bg: 'bg-sky-50/90 border-sky-200', accent: 'text-sky-800' },
  { id: 'green', bg: 'bg-emerald-50/90 border-emerald-200', accent: 'text-emerald-800' },
  { id: 'rose', bg: 'bg-rose-50/90 border-rose-200', accent: 'text-rose-800' },
  { id: 'purple', bg: 'bg-purple-50/90 border-purple-200', accent: 'text-purple-800' }
];

const HABIT_COLORS = [
  { id: 'indigo', label: 'Tím Indigo', activeCls: 'bg-indigo-600 text-white border-indigo-600', lightCls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { id: 'emerald', label: 'Xanh Ngọc', activeCls: 'bg-emerald-600 text-white border-emerald-600', lightCls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'rose', label: 'Đỏ Hồng', activeCls: 'bg-rose-600 text-white border-rose-600', lightCls: 'bg-rose-50 text-rose-700 border-rose-200' },
  { id: 'amber', label: 'Vàng Cam', activeCls: 'bg-amber-500 text-white border-amber-500', lightCls: 'bg-amber-50 text-amber-700 border-amber-200' }
];

// Hàm hỗ trợ định dạng tiền tệ VNĐ
const formatVND = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
};

// Hàm lấy chuỗi YYYY-MM-DD theo giờ địa phương
const getTodayStr = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Hàm quy đổi ngày hiện tại sang mã Thứ (T2 -> CN)
const getCurrentDayCode = () => {
  const day = new Date().getDay(); // 0 là CN, 1 là T2...
  if (day === 0) return 'CN';
  return `T${day + 1}`;
};

export default function App() {
  const [user, setUser] = useState(null);
  const [isSyncing, setIsSyncing] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [toast, setToast] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem('personal_hub_dark_mode') === 'true';
    } catch {
      return false;
    }
  });

  // Dữ liệu 6 phân hệ
  const [expenses, setExpenses] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [notes, setNotes] = useState([]);
  const [habits, setHabits] = useState([]);

  // State cho bộ lọc & form Quản lý chi tiêu
  const [txTitle, setTxTitle] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState('expense');
  const [txCategory, setTxCategory] = useState('an_uong');
  const [txDate, setTxDate] = useState(getTodayStr());
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // State cho Thời gian biểu & Công việc
  const [selectedDayTab, setSelectedDayTab] = useState(getCurrentDayCode());
  const [schTitle, setSchTitle] = useState('');
  const [schStart, setSchStart] = useState('08:00');
  const [schEnd, setSchEnd] = useState('09:30');
  const [schLocation, setSchLocation] = useState('');
  const [schTag, setSchTag] = useState('hoc_tap');

  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskFilter, setTaskFilter] = useState('all');

  // State cho Lịch sự kiện
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(getTodayStr());
  const [evTitle, setEvTitle] = useState('');
  const [evTime, setEvTime] = useState('09:00');
  const [evType, setEvType] = useState('event'); // event | deadline | reminder

  // State cho Ghi chú & Mục tiêu
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteColor, setNoteColor] = useState('yellow');
  const [noteIsGoal, setNoteIsGoal] = useState(false);

  // State cho Theo dõi thói quen (Habit Tracker)
  const [habitTitle, setHabitTitle] = useState('');
  const [habitTarget, setHabitTarget] = useState(5);
  const [habitColor, setHabitColor] = useState('indigo');

  // Lưu trạng thái Dark Mode
  useEffect(() => {
    try {
      localStorage.setItem('personal_hub_dark_mode', String(darkMode));
    } catch (e) {
      // Bỏ qua nếu môi trường chặn localStorage
    }
  }, [darkMode]);

  // Hiển thị thông báo nhỏ (Toast)
  const showNotification = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // 1. Khởi tạo Auth
  useEffect(() => {
    if (!auth) {
      setIsSyncing(false);
      return;
    }
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error('Lỗi đăng nhập:', err);
        setIsSyncing(false);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) setIsSyncing(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Lắng nghe dữ liệu Firestore
  useEffect(() => {
    if (!user || !db) return;
    setIsSyncing(true);

    const expensesRef = collection(db, 'artifacts', appId, 'users', user.uid, 'expenses');
    const schedulesRef = collection(db, 'artifacts', appId, 'users', user.uid, 'schedules');
    const tasksRef = collection(db, 'artifacts', appId, 'users', user.uid, 'tasks');
    const eventsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'events');
    const notesRef = collection(db, 'artifacts', appId, 'users', user.uid, 'notes');
    const habitsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'habits');

    const unsubExpenses = onSnapshot(
      expensesRef,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.createdAt || 0) - (a.createdAt || 0));
        setExpenses(list);
        setIsSyncing(false);
      },
      (err) => console.error('Lỗi tải chi tiêu:', err)
    );

    const unsubSchedules = onSnapshot(
      schedulesRef,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
        setSchedules(list);
      },
      (err) => console.error('Lỗi tải thời gian biểu:', err)
    );

    const unsubTasks = onSnapshot(
      tasksRef,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => Number(a.completed) - Number(b.completed) || (b.createdAt || 0) - (a.createdAt || 0));
        setTasks(list);
      },
      (err) => console.error('Lỗi tải công việc:', err)
    );

    const unsubEvents = onSnapshot(
      eventsRef,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
        setEvents(list);
      },
      (err) => console.error('Lỗi tải lịch sự kiện:', err)
    );

    const unsubNotes = onSnapshot(
      notesRef,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setNotes(list);
      },
      (err) => console.error('Lỗi tải ghi chú:', err)
    );

    const unsubHabits = onSnapshot(
      habitsRef,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
        setHabits(list);
      },
      (err) => console.error('Lỗi tải thói quen:', err)
    );

    return () => {
      unsubExpenses();
      unsubSchedules();
      unsubTasks();
      unsubEvents();
      unsubNotes();
      unsubHabits();
    };
  }, [user]);

  // Hàm lưu chung (Hỗ trợ cả Firestore + Fallback State nếu mất kết nối)
  const saveItem = async (colName, itemData, setter) => {
    const id = itemData.id || crypto.randomUUID();
    const payload = { ...itemData, id, createdAt: itemData.createdAt || Date.now() };

    if (user && db) {
      try {
        await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, colName, id), payload);
      } catch (e) {
        console.error(`Lỗi lưu ${colName}:`, e);
        setter((prev) => [payload, ...prev]);
      }
    } else {
      setter((prev) => [payload, ...prev]);
    }
  };

  const removeItem = async (colName, id, setter) => {
    if (user && db) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, colName, id));
      } catch (e) {
        console.error(`Lỗi xóa ${colName}:`, e);
        setter((prev) => prev.filter((i) => i.id !== id));
      }
    } else {
      setter((prev) => prev.filter((i) => i.id !== id));
    }
  };

  // Nạp dữ liệu mẫu để người dùng dễ hình dung ngay lần đầu sử dụng
  const loadDemoData = async () => {
    const today = getTodayStr();
    const todayDayCode = getCurrentDayCode();

    const sampleExpenses = [
      { title: 'Lương tháng & Phụ cấp', amount: 15000000, type: 'income', category: 'luong_thuong', date: today },
      { title: 'Ăn trưa cơm văn phòng & Trà sữa', amount: 85000, type: 'expense', category: 'an_uong', date: today },
      { title: 'Đổ xăng xe máy', amount: 90000, type: 'expense', category: 'di_chuyen', date: today },
      { title: 'Mua khóa học Tiếng Anh Online', amount: 1200000, type: 'expense', category: 'hoc_tap', date: today },
      { title: 'Mua sắm đồ dùng cá nhân', amount: 450000, type: 'expense', category: 'mua_sam', date: today }
    ];

    const sampleSchedules = [
      { day: todayDayCode, startTime: '08:00', endTime: '10:30', title: 'Học chuyên ngành / Làm việc sáng', location: 'Phòng B204', tag: 'hoc_tap' },
      { day: todayDayCode, startTime: '14:00', endTime: '16:30', title: 'Làm dự án cá nhân & Lập trình', location: 'Thư viện', tag: 'lam_viec' },
      { day: todayDayCode, startTime: '17:30', endTime: '18:30', title: 'Chạy bộ & Tập thể dục', location: 'Công viên', tag: 'the_thao' }
    ];

    const sampleTasks = [
      { title: 'Hoàn thành báo cáo tiến độ tuần', priority: 'high', completed: false },
      { title: 'Ôn tập 30 từ vựng chuyên ngành', priority: 'medium', completed: false },
      { title: 'Thanh toán hóa đơn Internet tháng này', priority: 'high', completed: true },
      { title: 'Dọn dẹp bàn làm việc gọn gàng', priority: 'low', completed: false }
    ];

    const sampleEvents = [
      { date: today, title: 'Họp nhóm triển khai dự án mới', time: '09:30', type: 'event' },
      { date: today, title: 'Hạn nộp bài tập lớn', time: '23:59', type: 'deadline' }
    ];

    const sampleNotes = [
      { title: 'Mục tiêu tài chính tháng này', content: 'Tiết kiệm tối thiểu 4.000.000 ₫ vào quỹ dự phòng cá nhân. Hạn chế đặt đồ ăn đêm.', color: 'green', isGoal: true },
      { title: 'Ý tưởng đọc sách', content: 'Đọc xong cuốn "Atomic Habits - Thay đổi tí hon hiệu quả bất ngờ" trước ngày 25.', color: 'yellow', isGoal: false }
    ];

    const sampleHabits = [
      { title: 'Tự học ngoại ngữ / Lập trình 45 phút', targetDays: 6, color: 'indigo', completedDays: { T2: true, T3: true, T4: true, [todayDayCode]: true } },
      { title: 'Đọc sách 20 trang trước khi ngủ', targetDays: 5, color: 'emerald', completedDays: { T2: true, T4: true, T6: true } },
      { title: 'Tập thể dục / Chạy bộ 30 phút', targetDays: 4, color: 'rose', completedDays: { T3: true, T5: true, [todayDayCode]: true } },
      { title: 'Ngủ trước 23:30 & Uống đủ 2L nước', targetDays: 7, color: 'amber', completedDays: { T2: true, T3: true, T4: true, T5: true } }
    ];

    for (const item of sampleExpenses) await saveItem('expenses', item, setExpenses);
    for (const item of sampleSchedules) await saveItem('schedules', item, setSchedules);
    for (const item of sampleTasks) await saveItem('tasks', item, setTasks);
    for (const item of sampleEvents) await saveItem('events', item, setEvents);
    for (const item of sampleNotes) await saveItem('notes', item, setNotes);
    for (const item of sampleHabits) await saveItem('habits', item, setHabits);

    showNotification('Đã tạo dữ liệu mẫu thành công!');
  };

  // Xuất dữ liệu ra file JSON để sao lưu khi mang lên GitHub
  const handleExportJSON = () => {
    const backupData = {
      version: '1.1',
      exportedAt: new Date().toISOString(),
      expenses,
      schedules,
      tasks,
      events,
      notes,
      habits
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `personal-hub-backup-${getTodayStr()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotification('Đã xuất file sao lưu dữ liệu (JSON)!');
  };

  // Nhập dữ liệu từ file JSON đã sao lưu
  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result);
        if (Array.isArray(parsed.expenses)) {
          for (const item of parsed.expenses) await saveItem('expenses', item, setExpenses);
        }
        if (Array.isArray(parsed.schedules)) {
          for (const item of parsed.schedules) await saveItem('schedules', item, setSchedules);
        }
        if (Array.isArray(parsed.tasks)) {
          for (const item of parsed.tasks) await saveItem('tasks', item, setTasks);
        }
        if (Array.isArray(parsed.events)) {
          for (const item of parsed.events) await saveItem('events', item, setEvents);
        }
        if (Array.isArray(parsed.notes)) {
          for (const item of parsed.notes) await saveItem('notes', item, setNotes);
        }
        if (Array.isArray(parsed.habits)) {
          for (const item of parsed.habits) await saveItem('habits', item, setHabits);
        }
        showNotification('Đã khôi phục dữ liệu từ file JSON thành công!');
      } catch (err) {
        console.error('Lỗi đọc file JSON:', err);
        showNotification('File JSON không hợp lệ, vui lòng kiểm tra lại!', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Xử lý thêm giao dịch
  const handleAddTransaction = async (e) => {
    e.preventDefault();
    const numericAmount = Number(txAmount);
    if (!txTitle.trim() || !numericAmount || numericAmount <= 0) {
      showNotification('Vui lòng nhập tên khoản thu/chi và số tiền hợp lệ!', 'error');
      return;
    }

    await saveItem(
      'expenses',
      {
        title: txTitle.trim(),
        amount: numericAmount,
        type: txType,
        category: txCategory,
        date: txDate || getTodayStr()
      },
      setExpenses
    );

    setTxTitle('');
    setTxAmount('');
    showNotification('Đã thêm giao dịch mới!');
  };

  // Xử lý thêm lịch trình thời gian biểu
  const handleAddSchedule = async (e) => {
    e.preventDefault();
    if (!schTitle.trim()) {
      showNotification('Vui lòng nhập tên môn học hoặc hoạt động!', 'error');
      return;
    }

    await saveItem(
      'schedules',
      {
        day: selectedDayTab,
        startTime: schStart,
        endTime: schEnd,
        title: schTitle.trim(),
        location: schLocation.trim(),
        tag: schTag
      },
      setSchedules
    );

    setSchTitle('');
    setSchLocation('');
    showNotification(`Đã thêm vào lịch ${DAYS_OF_WEEK.find((d) => d.id === selectedDayTab)?.full}!`);
  };

  // Xử lý thêm việc cần làm (To-do)
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) {
      showNotification('Vui lòng nhập nội dung công việc!', 'error');
      return;
    }

    await saveItem(
      'tasks',
      {
        title: taskTitle.trim(),
        priority: taskPriority,
        completed: false
      },
      setTasks
    );

    setTaskTitle('');
    showNotification('Đã thêm công việc cần làm!');
  };

  const handleToggleTask = async (task) => {
    const updated = { ...task, completed: !task.completed };
    if (user && db) {
      try {
        await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'tasks', task.id), {
          completed: updated.completed
        });
      } catch (e) {
        console.error('Lỗi cập nhật task:', e);
      }
    } else {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    }
  };

  // Xử lý thêm sự kiện vào Lịch
  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!evTitle.trim()) {
      showNotification('Vui lòng nhập tên sự kiện!', 'error');
      return;
    }

    await saveItem(
      'events',
      {
        date: selectedCalendarDate,
        title: evTitle.trim(),
        time: evTime,
        type: evType
      },
      setEvents
    );

    setEvTitle('');
    showNotification('Đã lưu sự kiện vào lịch!');
  };

  // Xử lý thêm Ghi chú / Mục tiêu
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteTitle.trim() && !noteContent.trim()) {
      showNotification('Vui lòng nhập tiêu đề hoặc nội dung ghi chú!', 'error');
      return;
    }

    await saveItem(
      'notes',
      {
        title: noteTitle.trim() || 'Ghi chú không tiêu đề',
        content: noteContent.trim(),
        color: noteColor,
        isGoal: noteIsGoal
      },
      setNotes
    );

    setNoteTitle('');
    setNoteContent('');
    setNoteIsGoal(false);
    showNotification('Đã lưu ghi chú mới!');
  };

  // Xử lý thêm Thói quen mới (Habit Tracker)
  const handleAddHabit = async (e) => {
    e.preventDefault();
    if (!habitTitle.trim()) {
      showNotification('Vui lòng nhập tên thói quen cần rèn luyện!', 'error');
      return;
    }

    await saveItem(
      'habits',
      {
        title: habitTitle.trim(),
        targetDays: Number(habitTarget) || 5,
        color: habitColor,
        completedDays: {}
      },
      setHabits
    );

    setHabitTitle('');
    showNotification('Đã thêm thói quen mới vào bảng theo dõi!');
  };

  // Đánh dấu hoàn thành thói quen theo từng thứ trong tuần (T2 -> CN)
  const handleToggleHabitDay = async (habit, dayId) => {
    const currentMap = habit.completedDays || {};
    const updatedMap = {
      ...currentMap,
      [dayId]: !currentMap[dayId]
    };

    if (user && db) {
      try {
        await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'habits', habit.id), {
          completedDays: updatedMap
        });
      } catch (e) {
        console.error('Lỗi cập nhật habit:', e);
        setHabits((prev) => prev.map((h) => (h.id === habit.id ? { ...h, completedDays: updatedMap } : h)));
      }
    } else {
      setHabits((prev) => prev.map((h) => (h.id === habit.id ? { ...h, completedDays: updatedMap } : h)));
    }
  };

  // Làm mới bảng tick thói quen khi sang tuần mới
  const handleResetAllHabitsWeek = async () => {
    for (const h of habits) {
      if (user && db) {
        try {
          await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'habits', h.id), {
            completedDays: {}
          });
        } catch (e) {
          console.error(e);
        }
      }
    }
    setHabits((prev) => prev.map((h) => ({ ...h, completedDays: {} })));
    showNotification('Đã làm mới bảng theo dõi thói quen cho tuần mới!');
  };

  // Tính toán thống kê tài chính
  const financialStats = useMemo(() => {
    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    let totalIncome = 0;
    let totalExpense = 0;
    let monthIncome = 0;
    let monthExpense = 0;
    const categoryTotals = {};

    expenses.forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      const isCurrentMonth = (tx.date || '').startsWith(currentMonthPrefix);

      if (tx.type === 'income') {
        totalIncome += amt;
        if (isCurrentMonth) monthIncome += amt;
      } else {
        totalExpense += amt;
        if (isCurrentMonth) monthExpense += amt;
        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + amt;
      }
    });

    return {
      balance: totalIncome - totalExpense,
      totalIncome,
      totalExpense,
      monthIncome,
      monthExpense,
      monthBalance: monthIncome - monthExpense,
      categoryTotals
    };
  }, [expenses]);

  // Lọc danh sách giao dịch
  const filteredExpenses = useMemo(() => {
    return expenses.filter((tx) => {
      const matchType = filterType === 'all' || tx.type === filterType;
      const matchCat = filterCategory === 'all' || tx.category === filterCategory;
      return matchType && matchCat;
    });
  }, [expenses, filterType, filterCategory]);

  // Tính toán dữ liệu lưới Lịch (Calendar Grid)
  const calendarDays = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Chuyển đổi để Thứ 2 là cột đầu tiên (0: Thứ 2, ..., 6: Chủ nhật)
    const startOffset = (firstDayOfMonth.getDay() + 6) % 7;
    const daysInMonth = lastDayOfMonth.getDate();

    const days = [];
    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayEvents = events.filter((ev) => ev.date === dateStr);
      days.push({
        dayNumber: d,
        dateStr,
        events: dayEvents
      });
    }
    return days;
  }, [currentMonthDate, events]);

  const todayStr = getTodayStr();
  const todayDayCode = getCurrentDayCode();
  const todaySchedules = schedules.filter((s) => s.day === todayDayCode);
  const todayEvents = events.filter((e) => e.date === todayStr);
  const pendingTasks = tasks.filter((t) => !t.completed);
  const todayCompletedHabitsCount = habits.filter((h) => h.completedDays?.[todayDayCode]).length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Tổng quan',
      subLabel: 'Bảng điều khiển chính',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'expenses',
      label: 'Quản lý chi tiêu',
      subLabel: 'Sổ thu chi & Ngân sách',
      icon: Wallet,
      badge: expenses.length
    },
    {
      id: 'schedule',
      label: 'Thời gian biểu & Việc làm',
      subLabel: 'Lịch tuần & To-do list',
      icon: Clock,
      badge: pendingTasks.length
    },
    {
      id: 'habits',
      label: 'Thói quen (Habits)',
      subLabel: 'Rèn kỷ luật mỗi ngày',
      icon: Flame,
      badge: habits.length
    },
    {
      id: 'calendar',
      label: 'Lịch sự kiện',
      subLabel: 'Lịch tháng & Deadline',
      icon: CalendarIcon,
      badge: events.length
    },
    {
      id: 'notes',
      label: 'Ghi chú & Mục tiêu',
      subLabel: 'Ý tưởng & Kế hoạch',
      icon: StickyNote,
      badge: notes.length
    }
  ];

  return (
    <div
      className={`h-screen overflow-hidden flex flex-row font-sans transition-colors duration-300 ${
        darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
      }`}
    >
      {/* CSS hỗ trợ đồng bộ bảng màu Dark Mode mượt mà cho toàn bộ thẻ */}
      {darkMode && (
        <style>{`
          .dark .bg-white { background-color: #0f172a !important; }
          .dark .bg-white\\/85 { background-color: rgba(15, 23, 42, 0.88) !important; }
          .dark .bg-slate-50, .dark .bg-slate-50\\/60, .dark .bg-slate-50\\/50, .dark .bg-slate-50\\/40 { background-color: #1e293b !important; }
          .dark .bg-slate-100 { background-color: #1e293b !important; }
          .dark .text-slate-900 { color: #f8fafc !important; }
          .dark .text-slate-800 { color: #f1f5f9 !important; }
          .dark .text-slate-700 { color: #cbd5e1 !important; }
          .dark .text-slate-600 { color: #94a3b8 !important; }
          .dark .text-slate-500 { color: #64748b !important; }
          .dark .border-slate-200, .dark .border-slate-200\\/90, .dark .border-slate-200\\/80, .dark .border-slate-200\\/70, .dark .border-slate-200\\/60, .dark .border-slate-100 {
            border-color: #334155 !important;
          }
          .dark input, .dark select, .dark textarea {
            background-color: #0f172a !important;
            color: #f8fafc !important;
            border-color: #334155 !important;
          }
          .dark .bg-indigo-50\\/90, .dark .bg-indigo-50\\/70, .dark .bg-indigo-50\\/40, .dark .bg-indigo-50 {
            background-color: rgba(79, 70, 229, 0.18) !important;
          }
          .dark .text-indigo-950, .dark .text-indigo-700 {
            color: #a5b4fc !important;
          }
        `}</style>
      )}

      {/* Thông báo Toast nổi */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border transition-all duration-300 ${
            toast.type === 'error'
              ? 'bg-rose-600 text-white border-rose-700'
              : 'bg-slate-900 text-white border-slate-800'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5 text-rose-200" /> : <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Thanh Danh Sách Tab Dọc Bên Trái (Compact Left Vertical Sidebar Tabs) */}
      <aside
        className={`${
          isSidebarCollapsed ? 'w-14' : 'w-48'
        } h-screen bg-white border-r border-slate-200/90 flex flex-col justify-between shrink-0 select-none transition-all duration-300 z-30 shadow-2xs`}
      >
        {/* Phần trên: Logo + Nút Thu gọn & Danh sách các Tab */}
        <div className="flex flex-col flex-1 min-h-0">
          {/* Header của Sidebar */}
          <div className="px-3 py-3 border-b border-slate-100 flex items-center justify-between gap-1.5">
            <div className={`flex items-center gap-2 overflow-hidden ${isSidebarCollapsed ? 'justify-center w-full' : ''}`}>
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xs shadow-indigo-200 shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              {!isSidebarCollapsed && (
                <div className="truncate">
                  <h1 className="font-bold text-sm text-slate-900 leading-tight truncate">Personal Hub</h1>
                  <p className="text-[10px] text-slate-400 truncate">Quản lý cá nhân</p>
                </div>
              )}
            </div>

            {!isSidebarCollapsed && (
              <button
                onClick={() => setIsSidebarCollapsed(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition shrink-0"
                title="Thu gọn danh sách tab"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Nút mở rộng nhanh khi đang thu gọn */}
          {isSidebarCollapsed && (
            <div className="px-2 pt-2 flex justify-center">
              <button
                onClick={() => setIsSidebarCollapsed(false)}
                className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                title="Mở rộng danh sách tab"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Danh sách các Tab điều hướng dọc (Gọn nhẹ) */}
          <div className="px-2 py-3 flex-1 overflow-y-auto space-y-1">
            {!isSidebarCollapsed && (
              <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Danh mục
              </div>
            )}

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={isSidebarCollapsed ? `${item.label} (${item.badge ?? 0})` : item.label}
                  className={`relative w-full group flex items-center ${
                    isSidebarCollapsed ? 'justify-center p-2' : 'justify-between px-2.5 py-2'
                  } rounded-xl text-left transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-50/90 text-indigo-700 font-semibold ring-1 ring-indigo-200/80'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  {/* Thanh chỉ báo Tab đang kích hoạt */}
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-600 rounded-r-full" />
                  )}

                  <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2.5 min-w-0'}`}>
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition shrink-0 ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-indigo-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    {!isSidebarCollapsed && (
                      <span className={`text-xs truncate ${isActive ? 'font-bold text-indigo-950' : 'font-medium'}`}>
                        {item.label}
                      </span>
                    )}
                  </div>

                  {/* Badge đếm số lượng mục nhỏ gọn */}
                  {item.badge !== null && item.badge > 0 && (
                    <span
                      className={`${
                        isSidebarCollapsed
                          ? 'absolute top-1 right-1 text-[9px] px-1 min-w-[14px] h-[14px] flex items-center justify-center'
                          : 'text-[10px] px-1.5 py-0.5 ml-1'
                      } rounded-full font-bold shrink-0 transition ${
                        isActive
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-200/70 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Phần dưới Sidebar: Trạng thái lưu trữ & Công cụ Sao lưu JSON / Dữ liệu mẫu gọn nhẹ */}
        <div className="p-2.5 border-t border-slate-100 bg-slate-50/60 space-y-1.5">
          {!isSidebarCollapsed ? (
            <>
              <div className="flex items-center justify-between text-[10px] px-1">
                <span className="text-slate-400">Trạng thái:</span>
                <span className="flex items-center gap-1 font-semibold text-emerald-600">
                  <span className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-amber-400 animate-ping' : 'bg-emerald-500'}`} />
                  {isSyncing ? 'Đồng bộ...' : 'Đã lưu'}
                </span>
              </div>

              <button
                onClick={loadDemoData}
                className="w-full py-1.5 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition shadow-2xs"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Nạp dữ liệu mẫu</span>
              </button>

              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={handleExportJSON}
                  className="py-1.5 px-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 transition"
                  title="Tải dữ liệu về máy dưới dạng file JSON"
                >
                  <Download className="w-3 h-3 text-indigo-600 shrink-0" />
                  <span className="truncate">Xuất</span>
                </button>

                <label
                  className="py-1.5 px-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
                  title="Khôi phục dữ liệu từ file JSON"
                >
                  <Upload className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span className="truncate">Nhập</span>
                  <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
                </label>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1.5 py-0.5">
              <button
                onClick={loadDemoData}
                title="Nạp dữ liệu mẫu"
                className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleExportJSON}
                title="Xuất dữ liệu (JSON)"
                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 transition"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <label
                title="Nhập dữ liệu (JSON)"
                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 transition cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
              </label>
            </div>
          )}
        </div>
      </aside>

      {/* Khu vực Nội dung chính bên phải (Cuộn độc lập với Sidebar) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Header trên cùng của khung nội dung */}
        <header className="bg-white/85 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-20 px-4 sm:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
              title={isSidebarCollapsed ? 'Mở rộng thanh Tab bên trái' : 'Thu gọn thanh Tab bên trái'}
            >
              {isSidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-2xl font-bold text-slate-900 truncate">
                {navItems.find((i) => i.id === activeTab)?.label}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 truncate">
                {DAYS_OF_WEEK.find((d) => d.id === todayDayCode)?.full}, ngày{' '}
                {todayStr.split('-').reverse().join('/')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Nút bật/tắt Dark Mode */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                darkMode
                  ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
                  : 'bg-slate-100 border-slate-200/80 text-slate-700 hover:bg-slate-200'
              }`}
              title={darkMode ? 'Chuyển sang Giao diện Sáng' : 'Chuyển sang Giao diện Tối (Dark Mode)'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
              <span className="hidden md:inline">{darkMode ? 'Nền sáng' : 'Nền tối'}</span>
            </button>

            <div className="flex items-center gap-2 bg-slate-100 px-3.5 py-2 rounded-xl">
              <Wallet className="w-4 h-4 text-indigo-600" />
              <span className="text-xs text-slate-500 hidden sm:inline">Số dư:</span>
              <span className={`text-xs sm:text-sm font-bold ${financialStats.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {formatVND(financialStats.balance)}
              </span>
            </div>
          </div>
        </header>

        {/* Khu vực hiển thị từng Tab */}
        <main className="p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* 4 Thẻ Tóm tắt (Summary Cards) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white p-5 rounded-2xl shadow-md shadow-indigo-100 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-indigo-100 text-sm font-medium">Số dư hiện tại</span>
                    <div className="p-2 bg-white/15 rounded-xl">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-2xl font-bold tracking-tight">{formatVND(financialStats.balance)}</div>
                    <p className="text-xs text-indigo-200 mt-1">
                      Tháng này: {financialStats.monthBalance >= 0 ? '+' : ''}
                      {formatVND(financialStats.monthBalance)}
                    </p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-sm font-medium">Tổng thu tháng này</span>
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-2xl font-bold text-emerald-600">{formatVND(financialStats.monthIncome)}</div>
                    <p className="text-xs text-slate-400 mt-1">Tổng tích lũy: {formatVND(financialStats.totalIncome)}</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-sm font-medium">Tổng chi tháng này</span>
                    <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                      <TrendingDown className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-2xl font-bold text-rose-600">{formatVND(financialStats.monthExpense)}</div>
                    <p className="text-xs text-slate-400 mt-1">Tổng chi tiêu: {formatVND(financialStats.totalExpense)}</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-sm font-medium">Hoạt động hôm nay</span>
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                      <CalendarDays className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-2xl font-bold text-slate-900">
                      {todaySchedules.length + pendingTasks.length + todayEvents.length} mục
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {todaySchedules.length} lịch học/làm • {pendingTasks.length} việc cần làm
                    </p>
                  </div>
                </div>
              </div>

              {/* Khối nội dung nhanh trên Tổng quan */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cột 1: Lịch trình & Sự kiện hôm nay */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-indigo-600" />
                        <span>Lịch trình hôm nay ({DAYS_OF_WEEK.find((d) => d.id === todayDayCode)?.label})</span>
                      </h3>
                      <button
                        onClick={() => setActiveTab('schedule')}
                        className="text-xs font-semibold text-indigo-600 hover:underline"
                      >
                        Chi tiết
                      </button>
                    </div>

                    {todaySchedules.length === 0 && todayEvents.length === 0 ? (
                      <div className="py-10 text-center text-slate-400 text-sm">
                        Hôm nay bạn chưa có lịch cố định hay sự kiện nào.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {todayEvents.map((ev) => (
                          <div
                            key={ev.id}
                            className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/70 flex items-start justify-between gap-3"
                          >
                            <div>
                              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 block">
                                Sự kiện • {ev.time}
                              </span>
                              <p className="font-semibold text-slate-800 text-sm mt-0.5">{ev.title}</p>
                            </div>
                          </div>
                        ))}

                        {todaySchedules.map((item) => {
                          const tagObj = SCHEDULE_TAGS.find((t) => t.id === item.tag) || SCHEDULE_TAGS[0];
                          return (
                            <div
                              key={item.id}
                              className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between gap-3"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                                    {item.startTime} - {item.endTime}
                                  </span>
                                  {item.location && (
                                    <span className="text-xs text-slate-500">• {item.location}</span>
                                  )}
                                </div>
                                <p className="font-semibold text-slate-800 text-sm mt-1">{item.title}</p>
                              </div>
                              <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium shrink-0 ${tagObj.color}`}>
                                {tagObj.name.split('/')[0]}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setActiveTab('schedule')}
                    className="mt-4 w-full py-2.5 bg-slate-100 hover:bg-slate-200/70 text-slate-700 rounded-xl text-xs font-semibold transition"
                  >
                    + Thêm khung giờ mới
                  </button>
                </div>

                {/* Cột 2: Việc cần làm ưu tiên */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <ListTodo className="w-5 h-5 text-indigo-600" />
                        <span>Việc cần làm ({pendingTasks.length})</span>
                      </h3>
                      <button
                        onClick={() => setActiveTab('schedule')}
                        className="text-xs font-semibold text-indigo-600 hover:underline"
                      >
                        Tất cả
                      </button>
                    </div>

                    {tasks.length === 0 ? (
                      <div className="py-10 text-center text-slate-400 text-sm">
                        Danh sách công việc đang trống.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {tasks.slice(0, 5).map((task) => {
                          const pri = PRIORITY_LEVELS[task.priority] || PRIORITY_LEVELS.medium;
                          return (
                            <div
                              key={task.id}
                              onClick={() => handleToggleTask(task)}
                              className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition ${
                                task.completed
                                  ? 'bg-slate-50/60 border-slate-100 text-slate-400 line-through'
                                  : 'bg-white border-slate-200 hover:border-indigo-300'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {task.completed ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                ) : (
                                  <Circle className="w-5 h-5 text-slate-300 shrink-0" />
                                )}
                                <span className="text-sm font-medium truncate">{task.title}</span>
                              </div>
                              <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium shrink-0 ${pri.badge}`}>
                                {pri.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setActiveTab('schedule')}
                    className="mt-4 w-full py-2.5 bg-slate-100 hover:bg-slate-200/70 text-slate-700 rounded-xl text-xs font-semibold transition"
                  >
                    Quản lý danh sách công việc
                  </button>
                </div>

                {/* Cột 3: Giao dịch gần đây */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-indigo-600" />
                        <span>Chi tiêu gần đây</span>
                      </h3>
                      <button
                        onClick={() => setActiveTab('expenses')}
                        className="text-xs font-semibold text-indigo-600 hover:underline"
                      >
                        Xem sổ thu chi
                      </button>
                    </div>

                    {expenses.length === 0 ? (
                      <div className="py-10 text-center text-slate-400 text-sm">
                        Chưa có giao dịch thu chi nào.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {expenses.slice(0, 5).map((tx) => {
                          const cat = EXPENSE_CATEGORIES.find((c) => c.id === tx.category) || EXPENSE_CATEGORIES[6];
                          const CatIcon = cat.icon;
                          return (
                            <div key={tx.id} className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-9 h-9 rounded-xl ${cat.bgLight} ${cat.text} flex items-center justify-center shrink-0`}>
                                  <CatIcon className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-slate-800 truncate">{tx.title}</p>
                                  <p className="text-xs text-slate-400">
                                    {cat.name} • {(tx.date || '').split('-').reverse().join('/')}
                                  </p>
                                </div>
                              </div>
                              <span
                                className={`text-sm font-bold shrink-0 ${
                                  tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                                }`}
                              >
                                {tx.type === 'income' ? '+' : '-'}
                                {formatVND(tx.amount)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setActiveTab('expenses')}
                    className="mt-4 w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-xs font-semibold transition"
                  >
                    + Ghi chép thu chi mới
                  </button>
                </div>
              </div>

              {/* Thanh theo dõi nhanh Thói quen hôm nay ngay trên Tổng quan */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                        Thói quen hôm nay ({todayCompletedHabitsCount}/{habits.length} hoàn thành)
                      </h3>
                      <p className="text-xs text-slate-500">
                        Bấm trực tiếp vào thói quen bên dưới để đánh dấu hoàn thành cho {DAYS_OF_WEEK.find((d) => d.id === todayDayCode)?.full}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('habits')}
                    className="text-xs font-semibold text-indigo-600 hover:underline self-start sm:self-auto"
                  >
                    Mở bảng theo dõi tuần →
                  </button>
                </div>

                {habits.length === 0 ? (
                  <div className="py-6 text-center text-slate-400 text-xs">
                    Chưa có thói quen nào. Hãy bấm &ldquo;Nạp dữ liệu mẫu&rdquo; hoặc vào tab <strong>Thói quen (Habits)</strong> để tạo mới!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {habits.map((h) => {
                      const isDoneToday = Boolean(h.completedDays?.[todayDayCode]);
                      const doneCount = DAYS_OF_WEEK.filter((d) => h.completedDays?.[d.id]).length;
                      return (
                        <button
                          key={h.id}
                          onClick={() => handleToggleHabitDay(h, todayDayCode)}
                          className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between gap-3 cursor-pointer ${
                            isDoneToday
                              ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900'
                              : 'bg-slate-50/70 border-slate-200/80 hover:border-indigo-300 text-slate-800'
                          }`}
                        >
                          <div className="min-w-0">
                            <p className={`text-xs font-bold truncate ${isDoneToday ? 'text-emerald-700' : 'text-slate-800'}`}>
                              {h.title}
                            </p>
                            <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                              <Flame className="w-3 h-3 text-orange-500" />
                              Tuần này: {doneCount}/{h.targetDays || 5} ngày
                            </span>
                          </div>
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition ${
                              isDoneToday ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-300 text-transparent'
                            }`}
                          >
                            <Check className="w-4 h-4" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {}
          {activeTab === 'expenses' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Cột trái: Form thêm khoản thu/chi & Thống kê danh mục */}
              <div className="lg:col-span-5 space-y-6">
                <form
                  onSubmit={handleAddTransaction}
                  className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4"
                >
                  <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                    <Plus className="w-5 h-5 text-indigo-600" />
                    <span>Thêm giao dịch mới</span>
                  </h3>

                  {/* Chuyển đổi Thu nhập / Chi tiêu */}
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => {
                        setTxType('expense');
                        setTxCategory('an_uong');
                      }}
                      className={`py-2 rounded-lg text-sm font-semibold transition ${
                        txType === 'expense' ? 'bg-white text-rose-600 shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      Chi tiêu (-)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTxType('income');
                        setTxCategory('luong_thuong');
                      }}
                      className={`py-2 rounded-lg text-sm font-semibold transition ${
                        txType === 'income' ? 'bg-white text-emerald-600 shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      Thu nhập (+)
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Mô tả / Nội dung</label>
                    <input
                      type="text"
                      value={txTitle}
                      onChange={(e) => setTxTitle(e.target.value)}
                      placeholder="VD: Ăn trưa, Tiền xăng, Lương tháng..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Số tiền (VNĐ)</label>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={txAmount}
                        onChange={(e) => setTxAmount(e.target.value)}
                        placeholder="VD: 150000"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Ngày giao dịch</label>
                      <input
                        type="date"
                        value={txDate}
                        onChange={(e) => setTxDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Nút chọn nhanh mệnh giá VNĐ */}
                  <div className="flex flex-wrap gap-1.5">
                    {[30000, 50000, 100000, 200000, 500000].map((preset) => (
                      <button
                        type="button"
                        key={preset}
                        onClick={() => setTxAmount(String(preset))}
                        className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 font-medium transition"
                      >
                        {preset / 1000}k
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Danh mục</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {EXPENSE_CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const selected = txCategory === cat.id;
                        return (
                          <button
                            type="button"
                            key={cat.id}
                            onClick={() => setTxCategory(cat.id)}
                            className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition ${
                              selected
                                ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700'
                                : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                            }`}
                          >
                            <Icon className="w-4 h-4 shrink-0" />
                            <span className="truncate">{cat.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm shadow-indigo-200 transition text-sm"
                  >
                    Lưu giao dịch
                  </button>
                </form>

                {/* Biểu đồ thanh tỷ trọng chi tiêu theo danh mục */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                  <h3 className="font-bold text-slate-900 text-base">Phân bổ chi tiêu theo danh mục</h3>
                  {financialStats.totalExpense === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">Chưa có dữ liệu chi tiêu để thống kê.</p>
                  ) : (
                    <div className="space-y-3.5">
                      {EXPENSE_CATEGORIES.filter((c) => financialStats.categoryTotals[c.id] > 0).map((cat) => {
                        const amount = financialStats.categoryTotals[cat.id] || 0;
                        const percent = Math.round((amount / financialStats.totalExpense) * 100);
                        return (
                          <div key={cat.id} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-slate-700">{cat.name}</span>
                              <span className="text-slate-900">
                                {formatVND(amount)} ({percent}%)
                              </span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${cat.color} rounded-full transition-all duration-500`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Cột phải: Bộ lọc và Danh sách lịch sử giao dịch */}
              <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">Lịch sử thu chi</h3>
                    <p className="text-xs text-slate-500">Hiển thị {filteredExpenses.length} giao dịch</p>
                  </div>

                  {/* Bộ lọc */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                      {[
                        { id: 'all', label: 'Tất cả' },
                        { id: 'income', label: 'Khoản thu' },
                        { id: 'expense', label: 'Khoản chi' }
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setFilterType(t.id)}
                          className={`px-3 py-1.5 rounded-lg transition ${
                            filterType === t.id ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>

                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none"
                    >
                      <option value="all">Mọi danh mục</option>
                      {EXPENSE_CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Danh sách giao dịch */}
                <div className="mt-4 space-y-2.5 flex-1">
                  {filteredExpenses.length === 0 ? (
                    <div className="py-16 text-center text-slate-400 text-sm">
                      Không tìm thấy giao dịch nào phù hợp với bộ lọc.
                    </div>
                  ) : (
                    filteredExpenses.map((tx) => {
                      const cat = EXPENSE_CATEGORIES.find((c) => c.id === tx.category) || EXPENSE_CATEGORIES[6];
                      const CatIcon = cat.icon;
                      return (
                        <div
                          key={tx.id}
                          className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3 transition"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className={`w-10 h-10 rounded-xl ${cat.bgLight} ${cat.text} flex items-center justify-center shrink-0`}>
                              <CatIcon className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 text-sm truncate">{tx.title}</p>
                              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                <span className="font-medium">{cat.name}</span>
                                <span>•</span>
                                <span>{(tx.date || '').split('-').reverse().join('/')}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span
                              className={`text-sm sm:text-base font-bold ${
                                tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                              }`}
                            >
                              {tx.type === 'income' ? '+' : '-'}
                              {formatVND(tx.amount)}
                            </span>
                            <button
                              onClick={() => removeItem('expenses', tx.id, setExpenses)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Xóa giao dịch"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {}
          {activeTab === 'schedule' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Phân khu 1 (7 cột): Thời gian biểu trong tuần */}
              <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                      <Clock className="w-5 h-5 text-indigo-600" />
                      <span>Thời gian biểu trong tuần</span>
                    </h3>
                    <p className="text-xs text-slate-500">Quản lý lịch học, ca làm việc và thói quen hàng ngày</p>
                  </div>
                </div>

                {/* Thanh chọn Thứ 2 -> Chủ Nhật */}
                <div className="grid grid-cols-7 gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = selectedDayTab === day.id;
                    const count = schedules.filter((s) => s.day === day.id).length;
                    return (
                      <button
                        key={day.id}
                        onClick={() => setSelectedDayTab(day.id)}
                        className={`py-2.5 rounded-xl flex flex-col items-center justify-center transition ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-slate-600 hover:bg-white/60'
                        }`}
                      >
                        <span className="text-xs font-bold">{day.label}</span>
                        <span
                          className={`text-[10px] mt-0.5 px-1.5 rounded-full ${
                            isSelected ? 'bg-white/20 text-white' : 'text-slate-400'
                          }`}
                        >
                          {count} ca
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Form thêm khung giờ */}
                <form onSubmit={handleAddSchedule} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
                  <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                    + Thêm lịch cho {DAYS_OF_WEEK.find((d) => d.id === selectedDayTab)?.full}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={schTitle}
                      onChange={(e) => setSchTitle(e.target.value)}
                      placeholder="Tên môn học / Công việc..."
                      className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      type="text"
                      value={schLocation}
                      onChange={(e) => setSchLocation(e.target.value)}
                      placeholder="Phòng học / Địa điểm (Tùy chọn)"
                      className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 items-center">
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-0.5">Bắt đầu</label>
                      <input
                        type="time"
                        value={schStart}
                        onChange={(e) => setSchStart(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-0.5">Kết thúc</label>
                      <input
                        type="time"
                        value={schEnd}
                        onChange={(e) => setSchEnd(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[11px] text-slate-500 mb-0.5">Phân loại</label>
                      <select
                        value={schTag}
                        onChange={(e) => setSchTag(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                      >
                        {SCHEDULE_TAGS.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2 sm:col-span-1 pt-4">
                      <button
                        type="submit"
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition"
                      >
                        Thêm lịch
                      </button>
                    </div>
                  </div>
                </form>

                {/* Danh sách khung giờ trong ngày đang chọn */}
                <div className="space-y-3">
                  {schedules.filter((s) => s.day === selectedDayTab).length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-sm">
                      Chưa có khung giờ nào cho {DAYS_OF_WEEK.find((d) => d.id === selectedDayTab)?.full}.
                    </div>
                  ) : (
                    schedules
                      .filter((s) => s.day === selectedDayTab)
                      .map((item) => {
                        const tagObj = SCHEDULE_TAGS.find((t) => t.id === item.tag) || SCHEDULE_TAGS[0];
                        return (
                          <div
                            key={item.id}
                            className="p-4 rounded-2xl border border-slate-200/80 hover:border-indigo-200 bg-white flex items-center justify-between gap-4 shadow-2xs transition"
                          >
                            <div className="flex items-center gap-4 min-w-0">
                              <div className="px-3 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-center shrink-0">
                                <span className="block text-xs font-bold">{item.startTime}</span>
                                <span className="block text-[10px] text-indigo-400">đến {item.endTime}</span>
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                                  <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${tagObj.color}`}>
                                    {tagObj.name}
                                  </span>
                                </div>
                                {item.location && (
                                  <p className="text-xs text-slate-500 mt-1">Địa điểm: {item.location}</p>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={() => removeItem('schedules', item.id, setSchedules)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>

              {/* Phân khu 2 (5 cột): Danh sách việc cần làm (To-Do List) */}
              <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                      <ListTodo className="w-5 h-5 text-indigo-600" />
                      <span>Danh sách việc cần làm</span>
                    </h3>
                    <p className="text-xs text-slate-500">Đánh dấu các đầu việc theo mức độ ưu tiên</p>
                  </div>

                  {/* Form thêm Task */}
                  <form onSubmit={handleAddTask} className="space-y-2.5">
                    <input
                      type="text"
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      placeholder="Nhập công việc cần hoàn thành..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-500 mr-1">Ưu tiên:</span>
                        {Object.entries(PRIORITY_LEVELS).map(([key, val]) => (
                          <button
                            type="button"
                            key={key}
                            onClick={() => setTaskPriority(key)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                              taskPriority === key ? val.badge : 'border-slate-200 text-slate-500 bg-white'
                            }`}
                          >
                            {val.label}
                          </button>
                        ))}
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition shrink-0"
                      >
                        + Thêm việc
                      </button>
                    </div>
                  </form>

                  {/* Lọc trạng thái công việc */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                    {[
                      { id: 'all', label: `Tất cả (${tasks.length})` },
                      { id: 'pending', label: `Chưa xong (${pendingTasks.length})` },
                      { id: 'done', label: `Hoàn thành (${tasks.length - pendingTasks.length})` }
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setTaskFilter(f.id)}
                        className={`flex-1 py-1.5 rounded-lg transition ${
                          taskFilter === f.id ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* Danh sách To-Do */}
                  <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                    {tasks
                      .filter((t) => {
                        if (taskFilter === 'pending') return !t.completed;
                        if (taskFilter === 'done') return t.completed;
                        return true;
                      })
                      .map((task) => {
                        const pri = PRIORITY_LEVELS[task.priority] || PRIORITY_LEVELS.medium;
                        return (
                          <div
                            key={task.id}
                            className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition ${
                              task.completed ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200'
                            }`}
                          >
                            <div
                              onClick={() => handleToggleTask(task)}
                              className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                            >
                              {task.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                              ) : (
                                <Circle className="w-5 h-5 text-slate-300 hover:text-indigo-500 shrink-0" />
                              )}
                              <span
                                className={`text-sm font-medium ${
                                  task.completed ? 'line-through text-slate-400' : 'text-slate-800'
                                }`}
                              >
                                {task.title}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${pri.badge}`}>
                                {pri.label}
                              </span>
                              <button
                                onClick={() => removeItem('tasks', task.id, setTasks)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {}
          {activeTab === 'habits' && (
            <div className="space-y-6">
              {/* Khối thêm thói quen mới + Thống kê nhanh */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <form
                  onSubmit={handleAddHabit}
                  className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
                      <Flame className="w-5 h-5 text-orange-500" />
                      <span>Thêm thói quen rèn luyện</span>
                    </h3>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Tên thói quen hàng ngày</label>
                    <input
                      type="text"
                      value={habitTitle}
                      onChange={(e) => setHabitTitle(e.target.value)}
                      placeholder="VD: Tập thể dục 30p, Đọc sách, Học tiếng Anh..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Mục tiêu (Số ngày/tuần)</label>
                      <select
                        value={habitTarget}
                        onChange={(e) => setHabitTarget(Number(e.target.value))}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                      >
                        {[3, 4, 5, 6, 7].map((num) => (
                          <option key={num} value={num}>
                            {num} ngày / tuần
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Màu đánh dấu</label>
                      <select
                        value={habitColor}
                        onChange={(e) => setHabitColor(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                      >
                        {HABIT_COLORS.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition shadow-xs cursor-pointer"
                  >
                    + Thêm vào bảng theo dõi
                  </button>
                </form>

                {/* Bảng tóm tắt kỷ luật tuần */}
                <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-orange-500 flex items-center gap-1">
                        <Trophy className="w-4 h-4" /> Chỉ số kỷ luật cá nhân
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                        Bảng theo dõi thói quen trong tuần (T2 - CN)
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Tick vào từng ô thứ trong tuần để duy trì chuỗi thói quen tích cực của bạn.
                      </p>
                    </div>

                    {habits.length > 0 && (
                      <button
                        onClick={handleResetAllHabitsWeek}
                        className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-600 transition shrink-0 cursor-pointer"
                        title="Xóa các dấu tick cũ để bắt đầu tuần mới"
                      >
                        Làm mới tuần
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                      <span className="text-xs text-slate-500">Hoàn thành hôm nay</span>
                      <div className="text-xl font-bold text-slate-900 mt-1">
                        {todayCompletedHabitsCount} / {habits.length} thói quen
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                      <span className="text-xs text-slate-500">Tổng lượt hoàn thành tuần</span>
                      <div className="text-xl font-bold text-emerald-600 mt-1">
                        {habits.reduce(
                          (acc, h) => acc + DAYS_OF_WEEK.filter((d) => h.completedDays?.[d.id]).length,
                          0
                        )}{' '}
                        lượt tick
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                      <span className="text-xs text-slate-500">Đạt mục tiêu tuần</span>
                      <div className="text-xl font-bold text-indigo-600 mt-1">
                        {
                          habits.filter(
                            (h) =>
                              DAYS_OF_WEEK.filter((d) => h.completedDays?.[d.id]).length >= (h.targetDays || 5)
                          ).length
                        }{' '}
                        thói quen
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bảng ma trận tích chọn Thói quen từ Thứ 2 -> Chủ Nhật */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
                {habits.length === 0 ? (
                  <div className="p-16 text-center space-y-3">
                    <Flame className="w-10 h-10 text-orange-400 mx-auto" />
                    <p className="text-sm text-slate-500">
                      Bạn chưa thêm thói quen nào. Hãy tạo một thói quen ở khung bên trên hoặc nhấn <strong>Nạp dữ liệu mẫu</strong>!
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200/80 bg-slate-50/70 text-xs font-bold text-slate-500">
                          <th className="py-3.5 px-5 min-w-[220px]">Thói quen rèn luyện</th>
                          {DAYS_OF_WEEK.map((day) => {
                            const isTodayCol = day.id === todayDayCode;
                            return (
                              <th
                                key={day.id}
                                className={`py-3.5 px-2 text-center w-14 ${
                                  isTodayCol ? 'text-indigo-600 bg-indigo-50/50' : ''
                                }`}
                              >
                                <span className="block">{day.label}</span>
                                {isTodayCol && (
                                  <span className="text-[9px] font-bold uppercase text-indigo-500">Hôm nay</span>
                                )}
                              </th>
                            );
                          })}
                          <th className="py-3.5 px-4 text-center w-36">Tiến độ tuần</th>
                          <th className="py-3.5 px-3 text-center w-12">Xóa</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {habits.map((habit) => {
                          const colorObj = HABIT_COLORS.find((c) => c.id === habit.color) || HABIT_COLORS[0];
                          const doneCount = DAYS_OF_WEEK.filter((d) => habit.completedDays?.[d.id]).length;
                          const target = habit.targetDays || 5;
                          const pct = Math.min(100, Math.round((doneCount / target) * 100));

                          return (
                            <tr key={habit.id} className="hover:bg-slate-50/60 transition">
                              <td className="py-4 px-5">
                                <div className="font-bold text-slate-900 text-sm">{habit.title}</div>
                                <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                                  <span>Mục tiêu: {target} ngày/tuần</span>
                                  {doneCount >= target && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                                      Đã đạt mục tiêu!
                                    </span>
                                  )}
                                </div>
                              </td>

                              {DAYS_OF_WEEK.map((day) => {
                                const checked = Boolean(habit.completedDays?.[day.id]);
                                const isTodayCol = day.id === todayDayCode;
                                return (
                                  <td
                                    key={day.id}
                                    className={`py-3 px-2 text-center ${isTodayCol ? 'bg-indigo-50/20' : ''}`}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => handleToggleHabitDay(habit, day.id)}
                                      className={`w-9 h-9 rounded-xl border inline-flex items-center justify-center transition cursor-pointer ${
                                        checked
                                          ? `${colorObj.activeCls} shadow-2xs scale-105`
                                          : 'border-slate-200 hover:border-indigo-300 bg-white text-transparent'
                                      }`}
                                      title={`Đánh dấu ${day.full}`}
                                    >
                                      <Check className="w-4 h-4 stroke-[2.5]" />
                                    </button>
                                  </td>
                                );
                              })}

                              <td className="py-3 px-4">
                                <div className="flex items-center justify-between text-xs font-bold mb-1">
                                  <span className="text-slate-700">
                                    {doneCount}/{target} ngày
                                  </span>
                                  <span className="text-indigo-600">{pct}%</span>
                                </div>
                                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-300 ${
                                      doneCount >= target ? 'bg-emerald-500' : 'bg-indigo-600'
                                    }`}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </td>

                              <td className="py-3 px-3 text-center">
                                <button
                                  onClick={() => removeItem('habits', habit.id, setHabits)}
                                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg transition"
                                  title="Xóa thói quen"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {}
          {activeTab === 'calendar' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Lưới lịch tháng (8 cột) */}
              <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg capitalize">
                      Tháng {currentMonthDate.getMonth() + 1}, {currentMonthDate.getFullYear()}
                    </h3>
                    <p className="text-xs text-slate-500">Nhấn vào một ngày bất kỳ để xem hoặc thêm sự kiện</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const now = new Date();
                        setCurrentMonthDate(now);
                        setSelectedCalendarDate(getTodayStr());
                      }}
                      className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                    >
                      Hôm nay
                    </button>
                    <button
                      onClick={() =>
                        setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1))
                      }
                      className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1))
                      }
                      className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Tiêu đề các thứ trong tuần */}
                <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-500 pb-2 border-b border-slate-100">
                  {DAYS_OF_WEEK.map((d) => (
                    <div key={d.id}>{d.label}</div>
                  ))}
                </div>

                {/* Các ô ngày trong tháng */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((cell, idx) => {
                    if (!cell) {
                      return <div key={`empty-${idx}`} className="h-20 sm:h-24 rounded-xl bg-slate-50/40" />;
                    }

                    const isToday = cell.dateStr === todayStr;
                    const isSelected = cell.dateStr === selectedCalendarDate;
                    const hasEvents = cell.events.length > 0;

                    return (
                      <button
                        key={cell.dateStr}
                        onClick={() => setSelectedCalendarDate(cell.dateStr)}
                        className={`h-20 sm:h-24 p-2 rounded-xl border text-left flex flex-col justify-between transition relative ${
                          isSelected
                            ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/40'
                            : isToday
                            ? 'border-indigo-300 bg-indigo-50/20'
                            : 'border-slate-200/70 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span
                            className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                              isToday
                                ? 'bg-indigo-600 text-white'
                                : isSelected
                                ? 'text-indigo-700'
                                : 'text-slate-700'
                            }`}
                          >
                            {cell.dayNumber}
                          </span>
                          {hasEvents && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-600">
                              {cell.events.length}
                            </span>
                          )}
                        </div>

                        {/* Danh sách rút gọn các sự kiện trong ô ngày */}
                        <div className="space-y-1 overflow-hidden w-full">
                          {cell.events.slice(0, 2).map((ev) => (
                            <div
                              key={ev.id}
                              className={`text-[10px] truncate px-1.5 py-0.5 rounded font-medium ${
                                ev.type === 'deadline'
                                  ? 'bg-rose-100 text-rose-700'
                                  : ev.type === 'reminder'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-indigo-100 text-indigo-700'
                              }`}
                            >
                              {ev.title}
                            </div>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cột phải (4 cột): Chi tiết sự kiện trong ngày đang chọn */}
              <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  <div className="pb-3 border-b border-slate-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Ngày đang chọn</span>
                    <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                      Ngày {selectedCalendarDate.split('-').reverse().join('/')}
                    </h3>
                  </div>

                  {/* Form thêm sự kiện mới cho ngày đang chọn */}
                  <form onSubmit={handleAddEvent} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
                    <h4 className="text-xs font-bold text-slate-700 uppercase">+ Thêm sự kiện / Nhắc hẹn</h4>
                    <input
                      type="text"
                      value={evTitle}
                      onChange={(e) => setEvTitle(e.target.value)}
                      placeholder="Tên sự kiện, sinh nhật, hạn chót..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="time"
                        value={evTime}
                        onChange={(e) => setEvTime(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                      />
                      <select
                        value={evType}
                        onChange={(e) => setEvType(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                      >
                        <option value="event">Sự kiện</option>
                        <option value="deadline">Hạn chót (Deadline)</option>
                        <option value="reminder">Nhắc nhở</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition"
                    >
                      Lưu vào ngày {selectedCalendarDate.split('-').reverse().slice(0, 2).join('/')}
                    </button>
                  </form>

                  {/* Danh sách sự kiện trong ngày */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-500 uppercase">
                      Sự kiện trong ngày ({events.filter((e) => e.date === selectedCalendarDate).length})
                    </h4>

                    {events.filter((e) => e.date === selectedCalendarDate).length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs">
                        Không có sự kiện nào trong ngày này.
                      </div>
                    ) : (
                      events
                        .filter((e) => e.date === selectedCalendarDate)
                        .map((ev) => (
                          <div
                            key={ev.id}
                            className="p-3.5 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 bg-white"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-indigo-600">{ev.time}</span>
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                    ev.type === 'deadline'
                                      ? 'bg-rose-100 text-rose-700'
                                      : ev.type === 'reminder'
                                      ? 'bg-amber-100 text-amber-700'
                                      : 'bg-indigo-100 text-indigo-700'
                                  }`}
                                >
                                  {ev.type === 'deadline' ? 'Deadline' : ev.type === 'reminder' ? 'Nhắc hẹn' : 'Sự kiện'}
                                </span>
                              </div>
                              <p className="text-sm font-semibold text-slate-900 mt-1">{ev.title}</p>
                            </div>
                            <button
                              onClick={() => removeItem('events', ev.id, setEvents)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {}
          {activeTab === 'notes' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Cột tạo ghi chú / mục tiêu mới */}
              <div className="lg:col-span-4">
                <form
                  onSubmit={handleAddNote}
                  className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4 sticky top-24"
                >
                  <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                    <StickyNote className="w-5 h-5 text-indigo-600" />
                    <span>Tạo ghi chú / Mục tiêu</span>
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Tiêu đề</label>
                    <input
                      type="text"
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      placeholder="VD: Mục tiêu tháng 10, Ý tưởng..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Nội dung chi tiết</label>
                    <textarea
                      rows={4}
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Viết ghi chú nhanh hoặc kế hoạch hành động của bạn..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">Màu thẻ ghi chú:</span>
                    <div className="flex items-center gap-2">
                      {NOTE_COLORS.map((c) => (
                        <button
                          type="button"
                          key={c.id}
                          onClick={() => setNoteColor(c.id)}
                          className={`w-6 h-6 rounded-full border ${c.bg} ${
                            noteColor === c.id ? 'ring-2 ring-indigo-600 ring-offset-1' : ''
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/70 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={noteIsGoal}
                      onChange={(e) => setNoteIsGoal(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-indigo-600" />
                      Đánh dấu là Mục tiêu quan trọng trong tháng
                    </span>
                  </label>

                  <button
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm shadow-indigo-200 transition text-sm"
                  >
                    Lưu ghi chú
                  </button>
                </form>
              </div>

              {/* Lưới danh sách các thẻ ghi chú */}
              <div className="lg:col-span-8 space-y-4">
                {notes.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center text-slate-400 text-sm">
                    Bạn chưa có ghi chú hay mục tiêu nào. Hãy thêm một ghi chú ở khung bên trái!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {notes.map((note) => {
                      const theme = NOTE_COLORS.find((c) => c.id === note.color) || NOTE_COLORS[0];
                      return (
                        <div
                          key={note.id}
                          className={`p-5 rounded-2xl border ${theme.bg} flex flex-col justify-between space-y-4 shadow-2xs transition hover:shadow-md`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                {note.isGoal ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-600 text-white">
                                    <Target className="w-3 h-3" /> Mục tiêu
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/70 text-slate-600">
                                    <Pin className="w-3 h-3" /> Ghi chú
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => removeItem('notes', note.id, setNotes)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg bg-white/60 transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <h4 className={`font-bold text-base ${theme.accent}`}>{note.title}</h4>
                            <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{note.content}</p>
                          </div>

                          <div className="text-[11px] text-slate-400 pt-2 border-t border-black/5 flex justify-between">
                            <span>Đã lưu tự động</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}