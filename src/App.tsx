import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Coins, 
  Users, 
  Radio, 
  Settings, 
  PlusCircle, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  AlertTriangle,
  Gift,
  Bell,
  Sparkles,
  Lock,
  Unlock,
  RefreshCw,
  Search,
  Zap,
  Crown,
  UserCheck,
  UserX,
  X,
  DollarSign,
  LogOut,
  Send,
  Sliders,
  ExternalLink,
  Flame,
  Activity
} from 'lucide-react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  db,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot
} from './firebase';

const OWNER_EMAIL = 'yfastvpn@gmail.com';

interface UserRecord {
  id: string;
  name: string;
  av: string;
  coins: number;
  diamonds?: number;
  svip: number;
  role: 'user' | 'admin';
  status: 'active' | 'banned';
  badge?: string;
  email?: string;
}

interface RechargeRequest {
  id: string;
  userId: string;
  userName: string;
  userAv: string;
  coins: number;
  price: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  note?: string;
}

interface RoomRecord {
  id: string;
  name: string;
  host: string;
  hostId?: string;
  cv: string;
  c: string;
  th: number;
  d: number;
  n: number;
  flag: string;
  tag: string;
  ann: string;
  isLocked?: boolean;
}

const DEFAULT_USERS: UserRecord[] = [
  { id: '102938', name: 'রাফি', av: '🧑', coins: 145000, diamonds: 250, svip: 2, role: 'user', status: 'active', badge: 'Top Tipper' },
  { id: '492019', name: 'নুসরাত', av: '👩', coins: 92000, diamonds: 120, svip: 1, role: 'user', status: 'active', badge: 'Singer' },
  { id: '857392', name: 'শাকিল (ওনার)', av: '👑', coins: 10000000, diamonds: 50000, svip: 3, role: 'admin', status: 'active', badge: 'Super Admin' },
  { id: '394810', name: 'তানভীর', av: '😎', coins: 45000, diamonds: 50, svip: 1, role: 'user', status: 'active', badge: 'Event Host' },
  { id: '729104', name: 'আবির (সাসপেন্ডেড)', av: '🤖', coins: 200, diamonds: 0, svip: 0, role: 'user', status: 'banned', badge: 'Restricted' },
  { id: '619284', name: 'সাদিয়া', av: '🌸', coins: 83000, diamonds: 95, svip: 1, role: 'user', status: 'active', badge: 'Voice Star' },
];

const DEFAULT_REQUESTS: RechargeRequest[] = [
  { id: 'req_101', userId: '102938', userName: 'রাফি', userAv: '🧑', coins: 12000, price: 10, status: 'pending', createdAt: '১০ মিনিট আগে', note: 'বিকাশ পেমেন্ট সম্পন্ন: 0171XXXXXXX' },
  { id: 'req_102', userId: '492019', userName: 'নুসরাত', userAv: '👩', coins: 26000, price: 20, status: 'pending', createdAt: '২৫ মিনিট আগে', note: 'নগদ ট্রানজেকশন আইডি: 9J28A1' },
];

const DEFAULT_ROOMS: RoomRecord[] = [
  { id: '30101', name: 'লাইভ মিউজিক ও আড্ডা 🎵', host: 'শাকিল', cv: '🎤', c: 'চ্যাট', th: 0, d: 0, n: 88, flag: '🇧🇩', tag: 'VIP Host', ann: 'সবাইকে স্বাগতম! গান শুনুন এবং আনন্দ করুন।' },
  { id: '30102', name: 'নাইট ক্লাব পার্টি 🔥', host: 'রোমেল', cv: '🎧', c: 'পার্টি', th: 1, d: 0, n: 120, flag: '🇧🇩', tag: 'Party', ann: 'রাত ১২টা পর্যন্ত লাইভ ডিজে চলবে।' },
  { id: '30103', name: 'গেম জোন 🎮', host: 'সাব্বির', cv: '🎮', c: 'গেম', th: 2, d: 1, n: 54, flag: '🇸🇦', tag: 'Games', ann: 'সিংহ ফুড হুইল ও ফ্রুট স্লটস খেলুন।' },
  { id: '30104', name: 'নতুনদের আড্ডা', host: 'মিম', cv: '💬', c: 'নতুন', th: 3, d: 1, n: 31, flag: '🇮🇳', tag: 'Newcomers', ann: 'নতুন সদস্যদের উষ্ণ অভ্যর্থনা!' },
];

export default function AdminApp() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isDirectShakilAccess, setIsDirectShakilAccess] = useState<boolean>(true);
  const [securityPinInput, setSecurityPinInput] = useState<string>('admin123');
  const [activeTab, setActiveTab] = useState<'users' | 'requests' | 'quick_boost' | 'rooms' | 'banner' | 'gifts' | 'system'>('users');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Data states
  const [userList, setUserList] = useState<UserRecord[]>(DEFAULT_USERS);
  const [rechargeRequests, setRechargeRequests] = useState<RechargeRequest[]>(DEFAULT_REQUESTS);
  const [roomList, setRoomList] = useState<RoomRecord[]>(DEFAULT_ROOMS);
  const [bannerText, setBannerText] = useState('ভয়েস রুমে আড্ডা দিন, গিফট পাঠান, গেম খেলুন! 🎉');
  const [systemCoinsTotal, setSystemCoinsTotal] = useState<number>(10465200);

  // Search & Filter
  const [searchUser, setSearchUser] = useState('');
  const [userFilter, setUserFilter] = useState<'all' | 'admin' | 'svip' | 'banned'>('all');
  const [reqFilter, setReqFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  // Modals
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [coinModalUser, setCoinModalUser] = useState<UserRecord | null>(null);
  const [coinAmountInput, setCoinAmountInput] = useState('');
  const [coinActionType, setCoinActionType] = useState<'add' | 'deduct' | 'set'>('add');
  const [coinReasonInput, setCoinReasonInput] = useState('অ্যাডমিন কয়েন রিচার্জ');

  // New user inputs
  const [newUserName, setNewUserName] = useState('');
  const [newUserId, setNewUserId] = useState('');
  const [newUserAv, setNewUserAv] = useState('🧑');
  const [newUserCoins, setNewUserCoins] = useState('50000');
  const [newUserSvip, setNewUserSvip] = useState(1);
  const [newUserRole, setNewUserRole] = useState<'user' | 'admin'>('user');

  // Toast helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Auth Listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setCurrentUser(u);
    });
    return () => unsub();
  }, []);

  // Sync state from Firestore if available
  useEffect(() => {
    try {
      const stateDocRef = doc(db, 'system', 'voice_app_state');
      const unsub = onSnapshot(stateDocRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (Array.isArray(data.userList) && data.userList.length > 0) {
            setUserList(data.userList);
          }
          if (Array.isArray(data.rechargeRequests)) {
            setRechargeRequests(data.rechargeRequests);
          }
          if (Array.isArray(data.rooms) && data.rooms.length > 0) {
            setRoomList(data.rooms);
          }
          if (data.bn?.t) {
            setBannerText(data.bn.t);
          }
        }
      }, (err) => {
        console.log('Firestore snapshot fallback to local memory state:', err.message);
      });
      return () => unsub();
    } catch (_) {}
  }, []);

  // Sync back to Firestore
  const saveStateToFirestore = async (updates: { userList?: UserRecord[]; rechargeRequests?: RechargeRequest[]; rooms?: RoomRecord[]; bannerText?: string }) => {
    try {
      const stateDocRef = doc(db, 'system', 'voice_app_state');
      const payload: any = {};
      if (updates.userList) payload.userList = updates.userList;
      if (updates.rechargeRequests) payload.rechargeRequests = updates.rechargeRequests;
      if (updates.rooms) payload.rooms = updates.rooms;
      if (updates.bannerText) payload.bn = { t: updates.bannerText, g: 0 };
      await setDoc(stateDocRef, payload, { merge: true });
    } catch (e) {
      console.warn('Firestore sync note:', e);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user.email === OWNER_EMAIL) {
        showToast(`স্বাগতম সুপার অ্যাডমিন: ${res.user.displayName || res.user.email}! 👑`);
      } else {
        showToast(`লগইন সফল: ${res.user.email}`);
      }
    } catch (err: any) {
      showToast('গুগল লগইনে সমস্যা: ' + err.message);
    }
  };

  // Shakil Admin & Owner direct authorization (No password or PIN required)
  const isSuperAdmin = Boolean(
    currentUser?.email === OWNER_EMAIL ||
    isDirectShakilAccess ||
    currentUser?.displayName?.toLowerCase().includes('shakil') ||
    currentUser?.displayName?.includes('শাকিল')
  );

  // Action: Add / Update User Coins
  const handleUpdateUserCoins = () => {
    if (!coinModalUser) return;
    const amount = parseInt(coinAmountInput, 10);
    if (isNaN(amount) || amount <= 0) {
      showToast('সঠিক কয়েন সংখ্যা দিন');
      return;
    }

    const updated = userList.map((u) => {
      if (u.id === coinModalUser.id) {
        let nextCoins = u.coins;
        if (coinActionType === 'add') nextCoins += amount;
        else if (coinActionType === 'deduct') nextCoins = Math.max(0, nextCoins - amount);
        else if (coinActionType === 'set') nextCoins = amount;
        return { ...u, coins: nextCoins };
      }
      return u;
    });

    setUserList(updated);
    saveStateToFirestore({ userList: updated });
    showToast(`${coinModalUser.name}-এর ব্যালেন্সে ${amount.toLocaleString()} কয়েন ${coinActionType === 'add' ? 'যোগ' : coinActionType === 'deduct' ? 'কর্তন' : 'সেট'} করা হয়েছে!`);
    setCoinModalUser(null);
    setCoinAmountInput('');
  };

  // Action: Ban / Unban User
  const toggleBanUser = (user: UserRecord) => {
    const updated = userList.map((u) => {
      if (u.id === user.id) {
        const nextStatus = u.status === 'banned' ? 'active' : 'banned';
        return { ...u, status: nextStatus as 'active' | 'banned' };
      }
      return u;
    });
    setUserList(updated);
    saveStateToFirestore({ userList: updated });
    showToast(user.status === 'banned' ? `${user.name} এর একাউন্ট সচল (Unbanned) করা হয়েছে` : `${user.name} এর একাউন্ট ব্লক (Banned) করা হয়েছে`);
  };

  // Action: Toggle Admin Role
  const toggleRole = (user: UserRecord) => {
    const updated = userList.map((u) => {
      if (u.id === user.id) {
        const nextRole = u.role === 'admin' ? 'user' : 'admin';
        return { ...u, role: nextRole as 'user' | 'admin' };
      }
      return u;
    });
    setUserList(updated);
    saveStateToFirestore({ userList: updated });
    showToast(`${user.name}-কে ${user.role === 'admin' ? 'ইউজার' : 'অ্যাডমিন'} রোল দেওয়া হয়েছে`);
  };

  // Action: Delete User
  const deleteUser = (userId: string) => {
    if (!confirm('আপনি কি নিশ্চিত এই ইউজারকে মুছে ফেলতে চান?')) return;
    const updated = userList.filter((u) => u.id !== userId);
    setUserList(updated);
    saveStateToFirestore({ userList: updated });
    showToast('ইউজার সফলভাবে রিমুভ করা হয়েছে');
  };

  // Action: Add New User
  const handleAddNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;
    const uid = newUserId.trim() || String(Math.floor(100000 + Math.random() * 900000));
    const newUser: UserRecord = {
      id: uid,
      name: newUserName.trim(),
      av: newUserAv,
      coins: parseInt(newUserCoins, 10) || 50000,
      diamonds: 100,
      svip: newUserSvip,
      role: newUserRole,
      status: 'active',
      badge: newUserRole === 'admin' ? 'Official Admin' : 'Member'
    };
    const updated = [newUser, ...userList];
    setUserList(updated);
    saveStateToFirestore({ userList: updated });
    showToast(`নতুন ইউজার ${newUser.name} যুক্ত হয়েছে!`);
    setShowAddUserModal(false);
    setNewUserName('');
    setNewUserId('');
  };

  // Action: Recharge Request Approve / Reject
  const handleApproveRequest = (req: RechargeRequest) => {
    // 1. Credit coins to user
    const updatedUsers = userList.map((u) => {
      if (u.id === req.userId || u.name === req.userName) {
        return { ...u, coins: u.coins + req.coins };
      }
      return u;
    });
    setUserList(updatedUsers);

    // 2. Mark request approved
    const updatedRequests = rechargeRequests.map((r) => {
      if (r.id === req.id) {
        return { ...r, status: 'approved' as const };
      }
      return r;
    });
    setRechargeRequests(updatedRequests);
    saveStateToFirestore({ userList: updatedUsers, rechargeRequests: updatedRequests });
    showToast(`অনুমোদিত! ${req.userName}-এর অ্যাকাউন্টে +${req.coins.toLocaleString()} কয়েন যুক্ত হয়েছে! 🪙`);
  };

  const handleRejectRequest = (reqId: string) => {
    const updatedRequests = rechargeRequests.map((r) => {
      if (r.id === reqId) {
        return { ...r, status: 'rejected' as const };
      }
      return r;
    });
    setRechargeRequests(updatedRequests);
    saveStateToFirestore({ rechargeRequests: updatedRequests });
    showToast('রিকোয়েস্ট বাতিল (Rejected) করা হয়েছে।');
  };

  // Action: Instant Owner Max Boost
  const handleOwnerMaxBoost = () => {
    const updated = userList.map((u) => {
      if (u.role === 'admin' || u.name.includes('শাকিল') || u.id === '857392') {
        return {
          ...u,
          coins: u.coins + 10000000,
          diamonds: (u.diamonds || 0) + 50000,
          svip: 3,
          badge: 'Super Admin 👑'
        };
      }
      return u;
    });
    setUserList(updated);
    saveStateToFirestore({ userList: updated });
    showToast('🔥 সফল! অ্যাডমিন অ্যাকাউন্টে +১০,০০০,০০০ কয়েন, +৫০,০০০ ডায়মন্ড ও SVIP 3 বুস্ট সম্পন্ন!');
  };

  // Action: Save Banner Text
  const handleSaveBanner = () => {
    saveStateToFirestore({ bannerText });
    showToast('লাইভ ব্যানার সফলভাবে আপডেট করা হয়েছে! সকল রুমে সম্প্রচারিত হচ্ছে। 📢');
  };

  // Filtered Users
  const filteredUsers = userList.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(searchUser.toLowerCase()) || u.id.includes(searchUser);
    if (!matchSearch) return false;
    if (userFilter === 'admin') return u.role === 'admin';
    if (userFilter === 'svip') return u.svip > 0;
    if (userFilter === 'banned') return u.status === 'banned';
    return true;
  });

  // Filtered Requests
  const filteredRequests = rechargeRequests.filter((r) => {
    if (reqFilter === 'all') return true;
    return r.status === reqFilter;
  });

  // Access Gate
  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#070b14] via-[#0d1424] to-[#070b14] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#131b2e] border border-cyan-500/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-tr from-cyan-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20 mb-4 border border-cyan-400/40 animate-pulse">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-wide">SHAKIL M VOICE</h1>
            <p className="text-cyan-400 font-semibold text-sm mt-1">Exclusive Super Admin Control Center</p>
            <div className="mt-3 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-full text-xs text-red-400 flex items-center gap-1.5 font-medium">
              <Lock className="w-3.5 h-3.5" />
              <span>অনুমোদিত ওনার ও অ্যাডমিন এক্সেস সংরক্ষিত</span>
            </div>
          </div>

          <div className="space-y-3.5">
            {/* Security PIN Option (admin123) - নো পাসওয়ার্ড */}
            <div className="bg-slate-900/80 border border-amber-500/40 rounded-2xl p-4 text-center space-y-2.5">
              <div className="flex items-center justify-center gap-2 text-amber-400 font-bold text-xs">
                <Lock className="w-4 h-4" />
                <span>👑 Shakil Admin সিকিউরিটি পিন (admin123) সুবিধা</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-tight">
                এডমিন পাসওয়ার্ড বাদ দেওয়া হয়েছে। শুধুমাত্র সিকিউরিটি পিন দিন:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={securityPinInput}
                  onChange={(e) => setSecurityPinInput(e.target.value)}
                  placeholder="admin123"
                  className="flex-1 bg-slate-800 border border-amber-500/50 rounded-xl px-3 py-2 text-center font-mono font-bold text-amber-300 text-sm focus:outline-none focus:border-amber-400"
                />
                <button
                  onClick={() => {
                    if (securityPinInput.trim() === 'admin123') {
                      setIsDirectShakilAccess(true);
                      showToast('👑 Shakil Admin সিকিউরিটি পিন (admin123) ভেরিফাইড!');
                    } else {
                      showToast('❌ ভুল পিন! সঠিক পিন: admin123');
                    }
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black rounded-xl text-xs active:scale-95 shadow cursor-pointer"
                >
                  প্রবেশ
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                setSecurityPinInput('admin123');
                setIsDirectShakilAccess(true);
                showToast('Shakil Admin (admin123) হিসেবে সরাসরি প্রবেশ করেছেন! 👑');
              }}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 rounded-2xl font-black flex items-center justify-center gap-3 transition shadow-lg shadow-amber-500/20 active:scale-98 cursor-pointer"
            >
              <Crown className="w-5 h-5 fill-slate-950" />
              <span>Shakil Admin এক ক্লিকে সরাসরি প্রবেশ</span>
            </button>

            <button
              onClick={handleGoogleLogin}
              className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-900 rounded-2xl font-bold flex items-center justify-center gap-3 transition shadow-md active:scale-98 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>ওনার গুগল আইডি দিয়ে লগইন ({OWNER_EMAIL})</span>
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
            <p>Database: <span className="text-cyan-400 font-mono">ai-studio-22dd0b7a</span></p>
            <p className="mt-1">GitHub Repo: <span className="text-purple-400 font-mono">soverixnet-design/shakil-m-voice-admin</span></p>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Admin Dashboard
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-5 py-3 rounded-2xl shadow-2xl border border-cyan-400/40 flex items-center gap-3 animate-bounce">
          <Sparkles className="w-5 h-5 text-yellow-300" />
          <span className="font-semibold text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Top Header Navbar */}
      <header className="bg-[#111726]/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-500/30 border border-cyan-400/40">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-wide text-white">SHAKIL M VOICE — SUPER ADMIN</h1>
              <span className="px-2 py-0.5 text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 rounded-full font-bold uppercase">
                Owner Access
              </span>
            </div>
            <p className="text-xs text-cyan-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>লাইভ ফায়ারবেস ক্লাউড কানেক্টেড</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOwnerMaxBoost}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition active:scale-95"
            title="এডমিন একাউন্টে ১০,০০০,০০০ কয়েন ও SVIP 3 বুস্ট"
          >
            <Flame className="w-4 h-4 fill-black" />
            <span>১-ক্লিক ওনার বুস্ট (+10M কয়েন)</span>
          </button>

          <a
            href="https://ais-pre-rktr5ve3meqsxiwojkwdb4-551896246899.europe-west2.run.app"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs flex items-center gap-1.5 transition border border-slate-700"
          >
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            <span>অ্যাপ ভিজিট করুন</span>
          </a>

          <button
            onClick={() => {
              signOut(auth);
              setIsDirectShakilAccess(false);
              showToast('অ্যাডমিন প্যানেল থেকে সফলভাবে লগআউট হয়েছেন');
            }}
            className="p-2 bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl transition border border-slate-700"
            title="লগআউট"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Quick KPI Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#131b2e] border border-slate-800 rounded-2xl p-4 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">মোট ইউজার</p>
              <p className="text-xl font-black text-white">{userList.length} জন</p>
            </div>
          </div>

          <div className="bg-[#131b2e] border border-slate-800 rounded-2xl p-4 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">সিস্টেম ট্রেজারি কয়েন</p>
              <p className="text-xl font-black text-amber-400">{systemCoinsTotal.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-[#131b2e] border border-slate-800 rounded-2xl p-4 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 relative">
              <Bell className="w-6 h-6" />
              {rechargeRequests.filter(r => r.status === 'pending').length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
                  {rechargeRequests.filter(r => r.status === 'pending').length}
                </span>
              )}
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">পেন্ডিং রিচার্জ রিকোয়েস্ট</p>
              <p className="text-xl font-black text-white">
                {rechargeRequests.filter(r => r.status === 'pending').length} টি
              </p>
            </div>
          </div>

          <div className="bg-[#131b2e] border border-slate-800 rounded-2xl p-4 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Radio className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">অ্যাক্টিভ ভয়েস রুম</p>
              <p className="text-xl font-black text-white">{roomList.length} টি রুম</p>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'users'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-[#131b2e] text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>ইউজার ম্যানেজমেন্ট ({userList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 whitespace-nowrap transition relative ${
              activeTab === 'requests'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-[#131b2e] text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>কয়েন ও রিচার্জ রিকোয়েস্ট</span>
            {rechargeRequests.filter(r => r.status === 'pending').length > 0 && (
              <span className="px-1.5 py-0.2 bg-red-500 text-white rounded-full text-[10px] font-black">
                {rechargeRequests.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('quick_boost')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'quick_boost'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'bg-[#131b2e] text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>কুইক ওনার বুস্টার</span>
          </button>

          <button
            onClick={() => setActiveTab('rooms')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'rooms'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-[#131b2e] text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>ভয়েস রুম নিয়ন্ত্রণ ({roomList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('banner')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'banner'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-[#131b2e] text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>লাইভ ব্যানার ও নোটিশ</span>
          </button>
        </div>

        {/* TAB 1: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#111726] p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-72">
                  <input
                    type="text"
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    placeholder="ইউজারের নাম অথবা আইডি দিয়ে সার্চ করুন..."
                    className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                </div>

                <select
                  value={userFilter}
                  onChange={(e: any) => setUserFilter(e.target.value)}
                  className="bg-[#0a0f1d] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
                >
                  <option value="all">সব ইউজার</option>
                  <option value="admin">শুধু অ্যাডমিন</option>
                  <option value="svip">শুধু SVIP</option>
                  <option value="banned">ব্লক করা ইউজার</option>
                </select>
              </div>

              <button
                onClick={() => setShowAddUserModal(true)}
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 transition active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>নতুন ইউজার তৈরি করুন</span>
              </button>
            </div>

            {/* User List Table */}
            <div className="bg-[#111726] rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#0c1220] uppercase text-[11px] text-slate-400 border-b border-slate-800 font-semibold">
                    <tr>
                      <th className="px-4 py-3.5">ইউজার প্রোফাইল</th>
                      <th className="px-4 py-3.5">ইউজার আইডি</th>
                      <th className="px-4 py-3.5">কয়েন ব্যালেন্স</th>
                      <th className="px-4 py-3.5">SVIP লেভেল</th>
                      <th className="px-4 py-3.5">রোল / পারমিশন</th>
                      <th className="px-4 py-3.5">স্ট্যাটাস</th>
                      <th className="px-4 py-3.5 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/30 transition">
                        <td className="px-4 py-3.5 flex items-center gap-3">
                          <span className="text-2xl">{u.av}</span>
                          <div>
                            <div className="flex items-center gap-1.5 font-bold text-white text-sm">
                              <span>{u.name}</span>
                              {u.role === 'admin' && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                            </div>
                            {u.badge && (
                              <span className="text-[10px] px-1.5 py-0.2 bg-cyan-500/10 text-cyan-400 rounded border border-cyan-500/20 font-medium">
                                {u.badge}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-400">{u.id}</td>
                        <td className="px-4 py-3.5 font-bold text-amber-400">
                          🪙 {u.coins.toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5">
                          {u.svip > 0 ? (
                            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full font-bold text-[10px]">
                              SVIP {u.svip}
                            </span>
                          ) : (
                            <span className="text-slate-500 font-medium">সাধারণ</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              u.role === 'admin'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-slate-700/50 text-slate-300'
                            }`}
                          >
                            {u.role === 'admin' ? '🛡️ অ্যাডমিন' : '👤 ইউজার'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          {u.status === 'banned' ? (
                            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full font-bold text-[10px]">
                              🚫 ব্লকড (Banned)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full font-bold text-[10px]">
                              ✅ অ্যাক্টিভ
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right space-x-1.5">
                          <button
                            onClick={() => {
                              setCoinModalUser(u);
                              setCoinAmountInput('');
                            }}
                            className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-semibold transition"
                            title="কয়েন যোগ / কর্তন"
                          >
                            🪙 কয়েন
                          </button>

                          <button
                            onClick={() => toggleRole(u)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                            title="রোল পরিবর্তন করুন"
                          >
                            {u.role === 'admin' ? <UserX className="w-3.5 h-3.5 text-yellow-400" /> : <UserCheck className="w-3.5 h-3.5 text-cyan-400" />}
                          </button>

                          <button
                            onClick={() => toggleBanUser(u)}
                            className={`p-1.5 rounded-lg transition ${
                              u.status === 'banned'
                                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                            }`}
                            title={u.status === 'banned' ? 'আনব্যান করুন' : 'ব্যান করুন'}
                          >
                            {u.status === 'banned' ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => deleteUser(u.id)}
                            className="p-1.5 bg-slate-800 hover:bg-red-500/30 text-slate-500 hover:text-red-400 rounded-lg transition"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RECHARGE REQUESTS */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-[#111726] p-4 rounded-2xl border border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">ইউজার কয়েন রিচার্জ ও টপ-আপ অনুমোদন</h3>
                <p className="text-xs text-slate-400 mt-0.5">ইউজারদের ওয়ালেট থেকে পাঠানো কয়েন পারচেজ রিকোয়েস্ট যাচাই করুন এবং অনুমোদন দিন</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setReqFilter('pending')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    reqFilter === 'pending' ? 'bg-amber-500 text-black' : 'bg-[#0c1220] text-slate-400'
                  }`}
                >
                  পেন্ডিং ({rechargeRequests.filter(r => r.status === 'pending').length})
                </button>
                <button
                  onClick={() => setReqFilter('approved')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    reqFilter === 'approved' ? 'bg-emerald-500 text-black' : 'bg-[#0c1220] text-slate-400'
                  }`}
                >
                  অনুমোদিত
                </button>
                <button
                  onClick={() => setReqFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    reqFilter === 'all' ? 'bg-cyan-500 text-black' : 'bg-[#0c1220] text-slate-400'
                  }`}
                >
                  সব রিকোয়েস্ট
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRequests.map((req) => (
                <div key={req.id} className="bg-[#111726] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{req.userAv}</span>
                      <div>
                        <h4 className="font-bold text-white text-sm">{req.userName}</h4>
                        <p className="text-xs text-slate-400 font-mono">ID: {req.userId}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      req.status === 'pending'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : req.status === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {req.status === 'pending' ? '⏳ অপেক্ষমাণ (Pending)' : req.status === 'approved' ? '✅ অনুমোদিত' : '❌ বাতিল'}
                    </span>
                  </div>

                  <div className="bg-[#0a0f1d] p-3.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-slate-400">অনুরোধকৃত কয়েন</p>
                      <p className="text-lg font-black text-amber-400">🪙 {req.coins.toLocaleString()} Coins</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-slate-400">প্যাকেজ মূল্য</p>
                      <p className="text-sm font-bold text-emerald-400">${req.price} USD</p>
                    </div>
                  </div>

                  {req.note && (
                    <p className="text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 italic">
                      " {req.note} "
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/60">
                    <span>{req.createdAt}</span>
                    {req.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRejectRequest(req.id)}
                          className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold rounded-lg transition"
                        >
                          বাতিল
                        </button>
                        <button
                          onClick={() => handleApproveRequest(req)}
                          className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg shadow-md shadow-emerald-500/20 transition active:scale-95"
                        >
                          অনুমোদন দিন (Approve)
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {filteredRequests.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500 bg-[#111726] rounded-2xl border border-slate-800">
                  <DollarSign className="w-12 h-12 mx-auto text-slate-600 mb-2" />
                  <p className="font-semibold text-sm">কোনো পেন্ডিং রিকোয়েস্ট পাওয়া যায়নি</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: QUICK OWNER BOOSTER */}
        {activeTab === 'quick_boost' && (
          <div className="bg-[#111726] border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 max-w-3xl mx-auto shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Crown className="w-8 h-8 text-black" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">ওনার স্পেশাল সুপার বুস্টার (Owner Master Boost)</h3>
                <p className="text-xs text-amber-400/90 font-medium">অ্যাডমিনের অ্যাকাউন্টে আনলিমিটেড কয়েন, ডায়মন্ড ও ভিআইপি পাওয়ার বুস্ট করুন</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={handleOwnerMaxBoost}
                className="p-5 bg-gradient-to-br from-amber-500/20 to-orange-500/10 hover:from-amber-500/30 hover:to-orange-500/20 border border-amber-500/40 rounded-2xl text-left transition space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">👑</span>
                  <span className="text-xs px-2 py-0.5 bg-amber-400 text-black font-bold rounded-full">1-Click Max</span>
                </div>
                <h4 className="font-bold text-white text-base group-hover:text-amber-400 transition">+১০,০০০,০০০ কয়েন ও SVIP 3</h4>
                <p className="text-xs text-slate-400">এক ক্লিকেই অ্যাডমিন ওয়ালেটে ১০ মিলিয়ন কয়েন ও সকল স্পেশাল এন্ট্রি/ফ্রেম আনলক</p>
              </button>

              <button
                onClick={() => {
                  const updated = userList.map(u => {
                    if (u.role === 'admin' || u.name.includes('শাকিল')) {
                      return { ...u, coins: u.coins + 1000000 };
                    }
                    return u;
                  });
                  setUserList(updated);
                  saveStateToFirestore({ userList: updated });
                  showToast('+১,০০০,০০০ কয়েন অ্যাডমিন ওয়ালেটে যোগ করা হয়েছে! 🪙');
                }}
                className="p-5 bg-[#0e1628] hover:bg-[#131f38] border border-cyan-500/30 rounded-2xl text-left transition space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🪙</span>
                  <span className="text-xs px-2 py-0.5 bg-cyan-400 text-black font-bold rounded-full">+1M Booster</span>
                </div>
                <h4 className="font-bold text-white text-base">+১,০০০,০০০ কয়েন বুস্ট</h4>
                <p className="text-xs text-slate-400">দ্রুত টেস্ট ও গিফটিং করার জন্য ১ মিলিয়ন কয়েন যোগ করুন</p>
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: ROOM CONTROL */}
        {activeTab === 'rooms' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-[#111726] p-4 rounded-2xl border border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">লাইভ ভয়েস রুম ও অডিও চ্যানেল কন্ট্রোল</h3>
                <p className="text-xs text-slate-400">চলমান সকল ভয়েস রুম পর্যবেক্ষণ করুন, নোটিশ পরিবর্তন করুন বা অনুপযুক্ত রুম বন্ধ করুন</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roomList.map((room) => (
                <div key={room.id} className="bg-[#111726] border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{room.cv}</span>
                      <div>
                        <h4 className="font-bold text-white text-sm">{room.name}</h4>
                        <p className="text-xs text-slate-400">হোস্ট: {room.host} | ক্যাটাগরি: {room.c}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full text-xs font-semibold">
                      {room.n} জন অনলাইন
                    </span>
                  </div>

                  <div className="bg-[#0a0f1d] p-3 rounded-xl border border-slate-800 text-xs text-slate-400">
                    <span className="text-slate-500 font-semibold block mb-1">রুম নোটিশ / এনাউন্সমেন্ট:</span>
                    <p className="text-slate-300 italic">{room.ann}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <span className="text-xs text-slate-500 font-mono">Room ID: {room.id}</span>
                    <button
                      onClick={() => {
                        if (!confirm(`আপনি কি "${room.name}" রুমটি বন্ধ করতে চান?`)) return;
                        const updated = roomList.filter(r => r.id !== room.id);
                        setRoomList(updated);
                        saveStateToFirestore({ rooms: updated });
                        showToast(`রুম সফলভাবে বন্ধ করা হয়েছে`);
                      }}
                      className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-bold transition"
                    >
                      রুম বন্ধ করুন
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: BANNER */}
        {activeTab === 'banner' && (
          <div className="bg-[#111726] border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 max-w-2xl mx-auto shadow-2xl">
            <div>
              <h3 className="text-base font-bold text-white">লাইভ ব্যানার ও ব্রডকাস্ট নোটিশ আপডেট</h3>
              <p className="text-xs text-slate-400 mt-1">এই লেখাটি অ্যাপের হোমস্ক্রিন ও সকল ভয়েস রুমের উপরে স্ক্রলিং নোটিশ হিসেবে লাইভ দেখা যাবে</p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">ব্যানার টেক্সট (Marquee Text):</label>
              <textarea
                rows={3}
                value={bannerText}
                onChange={(e) => setBannerText(e.target.value)}
                className="w-full bg-[#0a0f1d] border border-slate-700 focus:border-cyan-400 rounded-xl p-3 text-sm text-white focus:outline-none"
              />
            </div>

            <div className="bg-[#0a0f1d] p-4 rounded-xl border border-slate-800 flex items-center gap-3">
              <span className="text-xl">📢</span>
              <div className="overflow-hidden whitespace-nowrap">
                <span className="text-xs text-cyan-300 animate-pulse">{bannerText}</span>
              </div>
            </div>

            <button
              onClick={handleSaveBanner}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/25 transition active:scale-98"
            >
              লাইভ নোটিশ পাবলিশ করুন
            </button>
          </div>
        )}
      </div>

      {/* COIN MANAGEMENT MODAL */}
      {coinModalUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#131b2e] border border-cyan-500/40 rounded-3xl p-6 w-full max-w-md space-y-5 shadow-2xl relative">
            <button
              onClick={() => setCoinModalUser(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <span className="text-4xl">{coinModalUser.av}</span>
              <div>
                <h3 className="font-bold text-white text-base">{coinModalUser.name}</h3>
                <p className="text-xs text-slate-400 font-mono">বর্তমান ব্যালেন্স: 🪙 {coinModalUser.coins.toLocaleString()} কয়েন</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">অ্যাকশন সিলেক্ট করুন</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCoinActionType('add')}
                    className={`py-2 rounded-xl text-xs font-bold transition ${
                      coinActionType === 'add' ? 'bg-emerald-500 text-slate-950' : 'bg-[#0a0f1d] text-slate-400'
                    }`}
                  >
                    + কয়েন যোগ
                  </button>
                  <button
                    type="button"
                    onClick={() => setCoinActionType('deduct')}
                    className={`py-2 rounded-xl text-xs font-bold transition ${
                      coinActionType === 'deduct' ? 'bg-red-500 text-white' : 'bg-[#0a0f1d] text-slate-400'
                    }`}
                  >
                    - কয়েন কর্তন
                  </button>
                  <button
                    type="button"
                    onClick={() => setCoinActionType('set')}
                    className={`py-2 rounded-xl text-xs font-bold transition ${
                      coinActionType === 'set' ? 'bg-cyan-500 text-slate-950' : 'bg-[#0a0f1d] text-slate-400'
                    }`}
                  >
                    সরাসরি সেট
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">কয়েন সংখ্যা</label>
                <input
                  type="number"
                  value={coinAmountInput}
                  onChange={(e) => setCoinAmountInput(e.target.value)}
                  placeholder="যেমন: 50000"
                  className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl px-4 py-2.5 text-white font-bold text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[10000, 50000, 100000, 500000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCoinAmountInput(String(amt))}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg text-xs font-mono font-bold"
                  >
                    +{amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleUpdateUserCoins}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold rounded-xl shadow-lg shadow-amber-500/20 transition active:scale-98"
            >
              নিশ্চিত করুন
            </button>
          </div>
        </div>
      )}

      {/* ADD USER MODAL */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#131b2e] border border-cyan-500/40 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowAddUserModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-white text-base">নতুন ইউজার যোগ করুন</h3>

            <form onSubmit={handleAddNewUser} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">নাম</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="ইউজারের নাম..."
                  className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">আইডি (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                  placeholder="যেমন: 102938"
                  className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">কয়েন</label>
                  <input
                    type="number"
                    value={newUserCoins}
                    onChange={(e) => setNewUserCoins(e.target.value)}
                    className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">SVIP লেভেল</label>
                  <select
                    value={newUserSvip}
                    onChange={(e) => setNewUserSvip(Number(e.target.value))}
                    className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value={0}>সাধারণ (০)</option>
                    <option value={1}>SVIP 1</option>
                    <option value={2}>SVIP 2</option>
                    <option value={3}>SVIP 3</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/25 transition active:scale-98 mt-2"
              >
                ইউজার তৈরি করুন
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
