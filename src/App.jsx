import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, Image as ImageIcon, Sparkles, AlertCircle, Shield, Zap, Target, Download, 
  RotateCcw, Crosshair, Pencil, Terminal, Plus, X, ChevronDown, Layers, Lock, Unlock, 
  XCircle, Trash2, Info, Cloud, ImagePlus, Activity, Smartphone, MonitorSmartphone, 
  MousePointer2, MoreVertical, PlusSquare, History, ZoomIn, Maximize2, Cpu, Eye, 
  ScanLine, Atom, Home, ArrowRight, Box, Calendar, Ruler, Star, BookOpen, Settings2, Save, Camera, ChevronLeft, ChevronRight, Filter, Paintbrush
} from 'lucide-react';

// --- 파이어베이스 SDK 초기화 ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection, addDoc, deleteDoc, updateDoc } from 'firebase/firestore';

// 사용자 제공 파이어베이스 설정 적용
const firebaseConfig = {
  apiKey: "AIzaSyBoF_BaKzklKb1fSe2mHyspeVRULvf9oWk",
  authDomain: "specium-collection-v1.firebaseapp.com",
  projectId: "specium-collection-v1",
  storageBucket: "specium-collection-v1.firebasestorage.app",
  messagingSenderId: "327491644948",
  appId: "1:327491644948:web:28b3c4d6e7f500cbc28101"
};

const appId = 'specium-collection-v1';
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

// Vercel 배포 및 PWA(설치형 앱) 환경에서 로그인 세션을 안전하게 유지하기 위한 설정 명시
setPersistence(auth, browserLocalPersistence).catch(console.error);

const db = getFirestore(firebaseApp);

// --- 이미지 압축 유틸리티 ---
const compressImage = (base64Str, maxWidth = 1000, maxHeight = 1000, quality = 0.7) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; }
      } else {
        if (height > maxHeight) { width *= maxHeight / height; height = maxHeight; }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
  });
};

// --- 커스텀 컴포넌트들 ---

const UltraDropdown = ({ label, options, value, onChange, onManage, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        {onManage && <button onClick={onManage} className="p-1 text-slate-500 hover:text-cyan-400 transition-colors"><Settings2 size={12} /></button>}
      </div>
      <button type="button" onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-black/50 border rounded-xl px-4 py-3 text-sm text-left flex items-center justify-between transition-all ${isOpen ? 'border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'border-slate-700 hover:border-slate-600'}`}>
        <span className={value ? "text-white font-bold" : "text-slate-600"}>{value || placeholder}</span>
        <ChevronDown size={16} className={`text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-cyan-400' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute z-[100] mt-2 w-full bg-slate-900 border border-slate-700 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {options.map((opt) => (
              <button key={opt} type="button" onClick={() => { onChange(opt); setIsOpen(false); }}
                className={`w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-cyan-600 hover:text-white transition-colors border-b border-slate-800 last:border-0 ${value === opt ? 'bg-cyan-900/40 text-cyan-400' : 'text-slate-300'}`}>{opt}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const UltraCalendar = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date(value || new Date()));
  const calendarRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const firstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();
  const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  const selectDay = (day) => {
    const cellDateStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(cellDateStr); setIsOpen(false);
  };
  const days = [];
  const startOffset = firstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let d = 1; d <= daysInMonth(viewDate.getFullYear(), viewDate.getMonth()); d++) days.push(d);
  return (
    <div className="relative w-full" ref={calendarRef}>
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">제작 날짜</span>
      <button type="button" onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-black/50 border rounded-xl px-4 py-3 text-sm text-left flex items-center justify-between transition-all ${isOpen ? 'border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'border-slate-700 hover:border-slate-600'}`}>
        <span className="text-white font-bold">{value || '날짜 선택'}</span>
        <Calendar size={18} className={`text-slate-500 ${isOpen ? 'text-cyan-400' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute z-[100] mt-2 w-72 bg-slate-900 border border-slate-700 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.9)] p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-4 px-2">
            <button type="button" onClick={handlePrevMonth} className="p-1 hover:text-cyan-400 transition-colors"><ChevronLeft size={20} /></button>
            <div className="text-xs font-black text-white uppercase tracking-widest italic">{viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
            <button type="button" onClick={handleNextMonth} className="p-1 hover:text-cyan-400 transition-colors"><ChevronRight size={20} /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i} className="text-center text-[8px] font-black text-slate-600">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              if (!day) return <div key={i} className="aspect-square"></div>;
              const cellDateStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              return (
                <div key={i} className="aspect-square flex items-center justify-center">
                  <button type="button" onClick={() => selectDay(day)}
                    className={`w-full h-full text-[10px] font-bold rounded-lg transition-all ${value === cellDateStr ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>{day}</button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const StarRating = ({ label, value, onChange, disabled }) => (
  <div className="flex flex-col gap-2">
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" disabled={disabled} onClick={() => onChange(star)}
          className={`transition-all ${star <= value ? 'text-rose-500 scale-110' : 'text-slate-700 hover:text-slate-500'}`}>
          <Star size={20} fill={star <= value ? "currentColor" : "none"} />
        </button>
      ))}
    </div>
  </div>
);

const UltraImageViewer = ({ src, isOpen, onClose }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const overlayRef = useRef(null);
  useEffect(() => {
    if (isOpen) { setScale(1); setPosition({ x: 0, y: 0 }); document.body.style.overflow = 'hidden'; }
    else { document.body.style.overflow = ''; }
  }, [isOpen]);
  if (!isOpen) return null;
  return (
    <div ref={overlayRef} onClick={(e) => e.target === overlayRef.current && onClose()}
      className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300">
      <div className="relative bg-slate-900 border border-slate-700/50 rounded-[2.5rem] w-full max-w-4xl h-full max-h-[85vh] shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        <div className="absolute top-0 left-0 right-0 p-5 flex justify-between items-center z-10 bg-gradient-to-b from-slate-900 via-slate-900/80 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center shadow-lg"><Maximize2 size={16} className="text-white" /></div>
            <h3 className="text-white font-black uppercase tracking-widest text-[10px]">Ultra Viewer</h3>
          </div>
          <button onClick={onClose} className="w-9 h-9 bg-slate-800 hover:bg-cyan-600 text-white rounded-full flex items-center justify-center transition-all shadow-xl"><X size={18} /></button>
        </div>
        <div className="flex-grow w-full flex items-center justify-center overflow-hidden bg-black/40">
          <img src={src} alt="Enlarged" className="max-h-[95%] max-w-[95%] object-contain" />
        </div>
      </div>
    </div>
  );
};

// --- 인트로 시퀀스 ---
const IntroSequence = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const s1 = setTimeout(() => setStep(1), 100);
    const s2 = setTimeout(() => setStep(2), 2800);
    const s3 = setTimeout(() => onComplete(), 3800);
    return () => { clearTimeout(s1); clearTimeout(s2); clearTimeout(s3); };
  }, [onComplete]);
  return (
    <div className={`fixed inset-0 z-[500] flex items-center justify-center bg-[#020202] transition-opacity duration-1000 ${step >= 2 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} onClick={onComplete}>
      <div className="absolute inset-0 opacity-[0.02] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] mix-blend-overlay"></div>
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[40vh] rounded-[100%] blur-[120px] transition-all duration-[3000ms] ${step >= 1 ? 'opacity-30 scale-100 bg-cyan-900/50' : 'opacity-0 scale-50'}`}></div>
      <div className={`relative z-10 flex flex-col items-center transition-all duration-[3500ms] cubic-bezier(0.16, 1, 0.3, 1) ${step === 0 ? 'opacity-0 scale-110 blur-xl' : 'opacity-100 scale-100 blur-0'}`}>
        <h1 className="text-5xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 tracking-tighter uppercase italic leading-none px-6 text-center">
          SPECIUM <br/><span className="text-transparent bg-clip-text bg-gradient-to-b from-cyan-400 to-cyan-700 drop-shadow-[0_0_20px_rgba(34,211,238,0.3)]">COLLECTION</span>
        </h1>
        <div className={`h-[1px] bg-gradient-to-r from-transparent via-slate-600 to-transparent mt-6 mb-4 transition-all duration-[2000ms] delay-500 ${step >= 1 ? 'w-[80%] opacity-50' : 'w-0 opacity-0'}`}></div>
        <p className={`text-slate-400 text-[10px] md:text-xs tracking-[1em] uppercase pl-[1em] transition-all duration-[2000ms] delay-700 ${step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>Toy Archive System</p>
      </div>
    </div>
  );
};

// --- 아이디/비밀번호 기반 로그인/회원가입 화면 ---
const AuthScreen = ({ onUnlock, user }) => {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [agentId, setAgentId] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // [수정] 컴포넌트 마운트 시 무조건 false로 시작하도록 초기화 강제
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user && !success) {
      setSuccess(true);
      const timer = setTimeout(onUnlock, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, success, onUnlock]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isLoginTab && !name.trim()) {
      setError("에이전트 이름(Agent Name)을 입력해주세요.");
      return;
    }
    if (!agentId.trim() || !password.trim()) {
      setError("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }
    if (password.length < 6) {
      setError("보안을 위해 비밀번호는 최소 6자리 이상이어야 합니다.");
      return;
    }

    setError('');
    setLoading(true);

    const sanitizedId = agentId.trim().replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    
    if (sanitizedId.length < 3) {
      setError("아이디는 영문/숫자 조합으로 3자 이상이어야 합니다.");
      setLoading(false);
      return;
    }

    const fakeEmail = `${sanitizedId}@specium-member.com`;

    try {
      if (isLoginTab) {
        await signInWithEmailAndPassword(auth, fakeEmail, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, fakeEmail, password);
        if (name.trim()) {
          await updateProfile(userCredential.user, { displayName: name.trim() });
        }
      }
      // 성공 상태로 변경 (이때 버튼 모양과 문구가 Access Granted로 바뀜)
      setSuccess(true);
    } catch (err) {
      console.error("Firebase Auth Error:", err.code, err.message);
      let errorMsg = "인증 과정에서 오류가 발생했습니다.";
      switch(err.code) {
        case 'auth/operation-not-allowed':
          errorMsg = "파이어베이스 설정 오류: Firebase Console > Authentication > Sign-in method에서 '이메일/비밀번호' 제공업체를 사용 설정(Enable)해야 합니다.";
          break;
        case 'auth/email-already-in-use':
          errorMsg = "이미 존재하는 아이디입니다. 다른 아이디를 선택하거나 로그인해 주세요.";
          break;
        case 'auth/weak-password':
          errorMsg = "비밀번호는 최소 6자리 이상이어야 합니다.";
          break;
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMsg = isLoginTab 
            ? "아이디 또는 비밀번호가 일치하지 않습니다. (가입되지 않은 아이디일 수 있습니다)"
            : "회원가입 정보가 유효하지 않습니다. 정보를 다시 확인해 주세요.";
          break;
        case 'auth/invalid-email':
          errorMsg = "아이디에 사용할 수 없는 문자가 포함되어 있습니다.";
          break;
        case 'auth/too-many-requests':
          errorMsg = "너무 많은 시도가 감지되었습니다. 잠시 후 다시 시도해 주세요.";
          break;
        default:
          errorMsg = `오류 발생: ${err.message}`;
      }
      setError(errorMsg);
    } finally {
      // 에러가 났을 때만 로딩 상태 해제 (성공했으면 언락 애니메이션을 위해 놔둠)
      if (!success) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-[#050505] text-white overflow-y-auto custom-scrollbar">
      <div className="min-h-full flex flex-col items-center justify-center p-4 md:p-8">
        <div className={`p-8 md:p-10 rounded-[2.5rem] border ${error ? 'border-rose-500 shadow-[0_0_40px_rgba(225,29,72,0.4)]' : success ? 'border-cyan-400 shadow-[0_0_40px_rgba(34,211,238,0.5)]' : 'border-slate-800 shadow-2xl'} bg-black/60 backdrop-blur-xl flex flex-col w-full max-w-[400px] transition-all my-auto`}>
          
          <div className="flex flex-col items-center mb-8">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors duration-500 ${success ? 'bg-cyan-900/40 text-cyan-400' : 'bg-slate-800/50 text-slate-400'}`}>
              {success ? <Unlock size={28} /> : <Shield size={28} />}
            </div>
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-[0.2em] text-center">M78 Database</h2>
            <p className="text-[10px] text-slate-500 font-mono tracking-widest mt-2 uppercase text-center">Authorized Personnel Only</p>
          </div>

          <form onSubmit={handleSubmit} className="w-full flex flex-col">
            <div className="flex w-full mb-6 bg-slate-900/80 p-1.5 rounded-[1.2rem] border border-slate-800">
              <button type="button" onClick={() => { setIsLoginTab(true); setError(''); }} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${isLoginTab ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Login</button>
              <button type="button" onClick={() => { setIsLoginTab(false); setError(''); }} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${!isLoginTab ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Register</button>
            </div>

            {error && <div className="mb-4 p-4 bg-rose-500/10 border border-rose-500/50 rounded-xl text-rose-400 text-[11px] font-bold text-center leading-relaxed animate-in fade-in zoom-in-95">{error}</div>}

            <div className="space-y-4">
              {!isLoginTab && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Agent Name</span>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black/50 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-cyan-500 outline-none transition-all text-white placeholder-slate-700" placeholder="Agent Name" />
                </div>
              )}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Security ID</span>
                <input type="text" value={agentId} onChange={(e) => setAgentId(e.target.value)} className="w-full bg-black/50 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-cyan-500 outline-none transition-all text-white placeholder-slate-700" placeholder="Agent ID" />
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Passcode</span>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black/50 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-cyan-500 outline-none transition-all text-white placeholder-slate-700" placeholder="••••••••" />
              </div>
            </div>

            {/* [수정] success와 loading 상태를 명확히 분리하여 텍스트 렌더링 정상화 */}
            <button type="submit" disabled={loading || success} className="w-full mt-8 py-4 bg-gradient-to-r from-cyan-600 to-cyan-400 hover:from-cyan-500 hover:to-cyan-300 text-white rounded-2xl font-black uppercase text-sm shadow-[0_0_20px_rgba(34,211,238,0.3)] disabled:opacity-50 hover:scale-[1.02] active:scale-95 transition-all">
              {success ? 'Access Granted' : loading ? 'Processing...' : (isLoginTab ? 'Authenticate' : 'Initialize Agent')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- 메인 앱 컴포넌트 ---
const App = () => {
  const [appState, setAppState] = useState('intro');
  const [user, setUser] = useState(null);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [loadingState, setLoadingState] = useState(false);
  const [error, setError] = useState(null);

  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [brands, setBrands] = useState(['BANDAI', 'GOOD SMILE', 'HASBRO', 'KOTOBUKIYA']);
  const [categories, setCategories] = useState(['ULTRAMAN', 'GUNDAM', 'TRANSFORMERS', 'MAZINGER']);
  
  const [collectionForm, setCollectionForm] = useState({
    profileImages: [], brand: '', category: '', series: '', name: '',
    creationDate: new Date().toISOString().split('T')[0], manualImages: [],
    cardImageFront: null, cardImageBack: null, sizeCm: '',
    ratingAppearance: 0, ratingDifficulty: 0, ratingArticulation: 0
  });
  const [isEditingCollection, setIsEditingCollection] = useState(false);
  const [activeCollectionId, setActiveCollectionId] = useState(null);
  const [filterBrand, setFilterBrand] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [manageType, setManageType] = useState(null);
  const [manageInput, setManageInput] = useState("");
  const [detailViewerImage, setDetailViewerImage] = useState(null);
  const [isDetailViewerOpen, setIsDetailViewerOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    setIsCloudSyncing(true);
    const settingsDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'classification');
    const unsubSettings = onSnapshot(settingsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        if (docSnap.data().brands) setBrands(docSnap.data().brands);
        if (docSnap.data().categories) setCategories(docSnap.data().categories);
      } else { setDoc(settingsDocRef, { brands, categories }).catch(console.error); }
    }, (err) => console.error("Firestore error:", err));
    
    const collRef = collection(db, 'artifacts', appId, 'users', user.uid, 'toy_collections');
    const unsubCollections = onSnapshot(collRef, (snapshot) => {
      setCollections(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setIsCloudSyncing(false);
    }, (err) => console.error("Firestore error:", err));
    
    return () => { unsubSettings(); unsubCollections(); };
  }, [user]);

  const saveClassificationToCloud = async (newBrands, newCats) => {
    if (!user) return;
    try { await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'classification'), { brands: newBrands, categories: newCats }); } catch (e) { console.error(e); }
  };

  const handleCollectionImageUpload = (type, index = null) => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*';
    if (type === 'manual' || type === 'profile') input.multiple = true;
    input.onchange = async (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;
      if (type === 'manual') {
        const availableSlots = 2 - collectionForm.manualImages.length;
        const newImages = await Promise.all(files.slice(0, availableSlots).map(file => new Promise(resolve => {
          const reader = new FileReader();
          reader.onloadend = async () => resolve(await compressImage(reader.result));
          reader.readAsDataURL(file);
        })));
        setCollectionForm(prev => ({ ...prev, manualImages: [...prev.manualImages, ...newImages] }));
      } else if (type === 'profile') {
        const newImages = await Promise.all(files.slice(0, 4).map(file => new Promise(resolve => {
          const reader = new FileReader();
          reader.onloadend = async () => resolve(await compressImage(reader.result));
          reader.readAsDataURL(file);
        })));
        setCollectionForm(prev => {
          const updatedProfiles = [...prev.profileImages];
          newImages.forEach((img, i) => { if (index + i < 4) updatedProfiles[index + i] = img; });
          return { ...prev, profileImages: updatedProfiles };
        });
      } else {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const compressed = await compressImage(reader.result);
          if (type === 'cardFront') setCollectionForm({ ...collectionForm, cardImageFront: compressed });
          else if (type === 'cardBack') setCollectionForm({ ...collectionForm, cardImageBack: compressed });
        };
        reader.readAsDataURL(files[0]);
      }
    };
    input.click();
  };

  const handleSaveCollection = async () => {
    if (!collectionForm.name.trim() || !user) return;
    setLoadingState(true); setError(null);
    try {
      const collRef = collection(db, 'artifacts', appId, 'users', user.uid, 'toy_collections');
      if (isEditingCollection && activeCollectionId) await updateDoc(doc(collRef, activeCollectionId), collectionForm);
      else await addDoc(collRef, collectionForm);
      resetCollectionForm(); setAppState('collection');
    } catch (e) { setError("저장 실패: 파이어베이스 용량 초과 또는 연결 오류입니다."); }
    finally { setLoadingState(false); }
  };

  const handleDeleteCollection = async (e, id) => {
    e.stopPropagation(); if (!user) return;
    if (window.confirm("정말로 이 완구 데이터를 삭제하시겠습니까?")) {
      try { await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'toy_collections', id)); } catch (e) { console.error(e); }
    }
  };

  const resetCollectionForm = () => {
    setCollectionForm({ profileImages: [], brand: '', category: '', series: '', name: '', creationDate: new Date().toISOString().split('T')[0], manualImages: [], cardImageFront: null, cardImageBack: null, sizeCm: '', ratingAppearance: 0, ratingDifficulty: 0, ratingArticulation: 0 });
    setIsEditingCollection(false); setActiveCollectionId(null);
  };

  const handleManageSubmit = () => {
    if (!manageInput.trim()) return;
    let nextBrands = [...brands], nextCats = [...categories];
    if (manageType === 'brand') { if (!brands.includes(manageInput)) nextBrands.push(manageInput); }
    else { if (!categories.includes(manageInput)) nextCats.push(manageInput); }
    setBrands(nextBrands); setCategories(nextCats); saveClassificationToCloud(nextBrands, nextCats); setManageInput("");
  };

  const filteredCollections = collections.filter(item => (filterBrand === 'ALL' || item.brand === filterBrand) && (filterCategory === 'ALL' || item.category === filterCategory));

  if (appState === 'intro') return <IntroSequence onComplete={() => setAppState('auth')} />;
  if (appState === 'auth') return <AuthScreen onUnlock={() => setAppState('collection')} user={user} />;

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-8 font-sans selection:bg-cyan-500 overflow-x-hidden animate-in fade-in duration-1000 select-none">
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-25 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-600 rounded-full blur-[140px] opacity-30"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px] opacity-20"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10 pt-4">
        <header className="mb-10 flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-4">
            <div className="flex-1">{appState === 'add-collection' && <button onClick={() => setAppState('collection')} className="w-10 h-10 flex items-center justify-center bg-slate-800/80 hover:bg-slate-700 text-white rounded-full border border-slate-700 transition-all active:scale-90"><ChevronLeft size={20} /></button>}</div>
            <div className="flex items-center gap-4">
               <div className="px-4 py-1 bg-cyan-600/20 border border-cyan-600/50 text-cyan-400 text-[10px] font-bold uppercase rounded-full tracking-widest flex items-center gap-2"><Shield size={14} /> Agent: {user?.displayName || user?.email?.split('@')[0] || 'Unknown'}</div>
               <button onClick={() => auth.signOut().then(() => setAppState('auth'))} title="Sign Out" className="p-1 text-slate-500 hover:text-rose-500 transition-colors"><XCircle size={18} /></button>
            </div>
            <div className="flex-1 flex justify-end"><Cloud size={20} className={isCloudSyncing ? 'text-cyan-400 animate-pulse' : 'text-slate-600'} /></div>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 mb-6 italic uppercase tracking-tighter text-center">SPECIUM <span className="text-cyan-500">COLLECTION</span></h1>
          <p className="text-slate-300 text-sm md:text-lg text-center break-keep">수집한 완구의 정보를 <span className="text-cyan-400 font-bold">도감 형식으로 영구 기록합니다.</span></p>
        </header>

        {appState === 'collection' ? (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex justify-between items-center mb-8 border-l-4 border-cyan-500 pl-4">
              <div><h3 className="text-xl font-black uppercase italic">Archives</h3><p className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">Total Specimens: {collections.length}</p></div>
              <button onClick={() => { resetCollectionForm(); setAppState('add-collection'); }} className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-black uppercase text-xs shadow-[0_0_20px_rgba(8,145,178,0.3)] transition-all hover:scale-105 active:scale-95"><Plus size={18} className="inline mr-1" /> Register Toy</button>
            </div>
            {collections.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="flex-1"><UltraDropdown label="Filter by Brand" options={['All Brands', ...brands]} value={filterBrand === 'ALL' ? 'All Brands' : filterBrand} onChange={(v) => setFilterBrand(v === 'All Brands' ? 'ALL' : v)} /></div>
                <div className="flex-1"><UltraDropdown label="Filter by Category" options={['All Categories', ...categories]} value={filterCategory === 'ALL' ? 'All Categories' : filterCategory} onChange={(v) => setFilterCategory(v === 'All Categories' ? 'ALL' : v)} /></div>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
              {filteredCollections.map((item) => (
                <div key={item.id} onClick={() => { setSelectedCollection(item); setIsDetailOpen(true); }} className="group bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden hover:border-cyan-500 transition-all cursor-pointer hover:shadow-2xl relative">
                  <div className="aspect-square bg-black relative overflow-hidden">
                    {item.profileImages?.[0] ? <img src={item.profileImages[0]} className="w-full h-full object-cover transition-transform group-hover:scale-110" /> : <div className="w-full h-full flex items-center justify-center text-slate-800"><ImageIcon size={48} /></div>}
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={(e) => { e.stopPropagation(); setCollectionForm(item); setIsEditingCollection(true); setActiveCollectionId(item.id); setAppState('add-collection'); }} className="p-2 bg-black/60 rounded-full hover:text-cyan-400 border border-white/10"><Pencil size={14} /></button>
                      <button onClick={(e) => handleDeleteCollection(e, item.id)} className="p-2 bg-black/60 rounded-full hover:text-rose-500 border border-white/10"><Trash2 size={14} /></button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-5 pt-16 bg-gradient-to-t from-black via-black/80 to-transparent">
                         <span className="text-sm font-black text-cyan-300 uppercase tracking-[0.2em]">{item.brand || 'No Brand'}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="font-black text-white italic uppercase truncate text-2xl group-hover:text-cyan-400 transition-colors drop-shadow-md">{item.name}</h4>
                    <p className="text-slate-400 text-xs font-bold mt-1 truncate">{item.series || 'No Series Data'}</p>
                    <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center">
                      <div className="flex gap-1">{[...Array(5)].map((_, i) => <Star key={i} size={10} className={i < item.ratingAppearance ? 'text-rose-500 fill-rose-500' : 'text-slate-800'} />)}</div>
                      <span className="text-[9px] font-mono text-slate-500">{item.creationDate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
            {error && <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500 rounded-xl text-rose-400 text-sm flex items-center gap-2"><AlertCircle size={18} /> {error}</div>}
            
            <div className="space-y-8">
              <section className="bg-slate-900/60 rounded-[2.5rem] border border-slate-800 p-8">
                <div className="flex items-center gap-2 mb-6 border-l-4 border-cyan-500 pl-4"><ImageIcon className="text-cyan-400" size={18} /><h3 className="text-sm font-black uppercase tracking-[0.2em]">Toy Profiles</h3></div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[0, 1, 2, 3].map(idx => (
                    <div key={idx} onClick={() => handleCollectionImageUpload('profile', idx)} className="aspect-square rounded-2xl border-2 border-dashed border-slate-800 bg-black/40 flex items-center justify-center cursor-pointer overflow-hidden transition-all hover:border-cyan-500/50 group">
                      {collectionForm.profileImages[idx] ? <img src={collectionForm.profileImages[idx]} className="w-full h-full object-cover" /> : <Camera size={24} className="opacity-30 group-hover:opacity-100 transition-opacity" />}
                    </div>
                  ))}
                </div>
              </section>

              <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div className="bg-slate-900/60 rounded-[2.5rem] border border-slate-800 p-8"><UltraDropdown label="브랜드 선택" placeholder="브랜드를 선택하세요" options={brands} value={collectionForm.brand} onChange={(v) => setCollectionForm({...collectionForm, brand: v})} onManage={() => setManageType('brand')} /></div>
                 <div className="bg-slate-900/60 rounded-[2.5rem] border border-slate-800 p-8"><UltraDropdown label="카테고리 선택" placeholder="카테고리를 선택하세요" options={categories} value={collectionForm.category} onChange={(v) => setCollectionForm({...collectionForm, category: v})} onManage={() => setManageType('category')} /></div>
              </section>

              <section className="bg-slate-900/60 rounded-[2.5rem] border border-slate-800 p-8 space-y-6">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Toy Series</span><input type="text" value={collectionForm.series} onChange={(e) => setCollectionForm({...collectionForm, series: e.target.value})} className="w-full bg-black/50 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-cyan-500 outline-none transition-all" placeholder="Ex: Gundam 00" /></div>
                    <div className="space-y-2"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Toy Official Name</span><input type="text" value={collectionForm.name} onChange={(e) => setCollectionForm({...collectionForm, name: e.target.value})} className="w-full bg-black/50 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-cyan-500 outline-none transition-all" placeholder="Ex: MG Exia" /></div>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2"><UltraCalendar value={collectionForm.creationDate} onChange={(v) => setCollectionForm({...collectionForm, creationDate: v})} /></div>
                    <div className="space-y-2"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Size</span><div className="relative"><input type="number" value={collectionForm.sizeCm} onChange={(e) => setCollectionForm({...collectionForm, sizeCm: e.target.value})} className="w-full bg-black/50 border border-slate-700 rounded-xl px-4 py-3 text-sm pr-12 focus:border-cyan-500 outline-none" placeholder="0" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-500">cm</span></div></div>
                 </div>
              </section>

              <section className="bg-slate-900/60 rounded-[2.5rem] border border-slate-800 p-8 space-y-4">
                <div className="flex items-center justify-between border-l-4 border-slate-500 pl-4 mb-6"><div className="flex items-center gap-2"><BookOpen className="text-slate-400" size={18} /><h3 className="text-sm font-black uppercase tracking-[0.2em]">INSTRUCTION</h3></div></div>
                <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                  {collectionForm.manualImages.map((img, i) => (
                    <div key={i} className="relative shrink-0 w-32 md:w-40 aspect-[3/4] bg-black/40 rounded-2xl border border-slate-700 overflow-hidden group"><img src={img} className="w-full h-full object-contain" /><button onClick={() => setCollectionForm(prev => ({...prev, manualImages: prev.manualImages.filter((_, idx) => idx !== i)}))} className="absolute top-2 right-2 p-1.5 bg-rose-600/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button></div>
                  ))}
                  {collectionForm.manualImages.length < 2 && <div onClick={() => handleCollectionImageUpload('manual')} className="shrink-0 w-32 md:w-40 aspect-[3/4] bg-black/40 border-2 border-dashed border-slate-800 rounded-2xl flex items-center justify-center cursor-pointer hover:border-cyan-500/50"><Plus size={24} className="text-slate-700" /></div>}
                </div>
              </section>

              <section className="bg-slate-900/60 rounded-[2.5rem] border border-slate-800 p-8 space-y-4">
                <div className="flex items-center gap-2 border-l-4 border-slate-500 pl-4 mb-6"><Sparkles className="text-slate-400" size={18} /><h3 className="text-sm font-black uppercase tracking-[0.2em]">Character Cards</h3></div>
                <div className="grid grid-cols-2 gap-4 md:gap-8">
                  <div onClick={() => handleCollectionImageUpload('cardFront')} className="aspect-[3/4] md:h-64 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-cyan-500/50 group">{collectionForm.cardImageFront ? <img src={collectionForm.cardImageFront} className="w-full h-full object-contain p-2" /> : <><Sparkles size={24} className="text-slate-700 mb-2" /><span className="text-[10px] font-black uppercase text-slate-600">Front Image</span></>}</div>
                  <div onClick={() => handleCollectionImageUpload('cardBack')} className="aspect-[3/4] md:h-64 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-cyan-500/50 group">{collectionForm.cardImageBack ? <img src={collectionForm.cardImageBack} className="w-full h-full object-contain p-2" /> : <><Sparkles size={24} className="text-slate-700 mb-2" /><span className="text-[10px] font-black uppercase text-slate-600">Back Image</span></>}</div>
                </div>
              </section>

              <section className="bg-slate-900/60 rounded-[2.5rem] border border-slate-800 p-8">
                <div className="flex items-center gap-2 mb-8 border-l-4 border-rose-500 pl-4"><Target className="text-rose-500" size={18} /><h3 className="text-sm font-black uppercase tracking-[0.2em]">Evaluation Ratings</h3></div>
                <div className="flex flex-col sm:flex-row gap-8 justify-between">
                  <StarRating label="외관" value={collectionForm.ratingAppearance} onChange={(v) => setCollectionForm({...collectionForm, ratingAppearance: v})} />
                  <StarRating label="조립 난이도" value={collectionForm.ratingDifficulty} onChange={(v) => setCollectionForm({...collectionForm, ratingDifficulty: v})} />
                  <StarRating label="가동 성능" value={collectionForm.ratingArticulation} onChange={(v) => setCollectionForm({...collectionForm, ratingArticulation: v})} />
                </div>
              </section>

              <div className="flex gap-4">
                <button onClick={() => setAppState('collection')} className="flex-1 py-5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-[2rem] font-black uppercase text-sm hover:scale-[1.02] active:scale-95 transition-all">Cancel</button>
                <button onClick={handleSaveCollection} disabled={loadingState || !collectionForm.name.trim()} className="flex-[2] py-5 bg-gradient-to-r from-cyan-600 to-cyan-400 hover:from-cyan-500 hover:to-cyan-300 text-white rounded-[2rem] font-black uppercase text-sm shadow-[0_0_30px_rgba(8,145,178,0.4)] disabled:opacity-50 hover:scale-[1.02] active:scale-95 transition-all">{loadingState ? 'Archiving...' : isEditingCollection ? 'Update Archive' : 'Commit to Archives'}</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {isDetailOpen && selectedCollection && (
        <div className="fixed inset-0 z-[250] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-700/50 rounded-[2.5rem] w-full max-w-2xl shadow-[0_0_80px_rgba(0,0,0,0.8)] flex flex-col my-8">
            <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-gradient-to-r from-slate-800/50 to-transparent">
               <div className="flex flex-col gap-1"><span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em]">{selectedCollection.brand}</span><h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">{selectedCollection.name}</h3></div>
               <button onClick={() => setIsDetailOpen(false)} className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-all"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
               <div className="grid grid-cols-2 gap-4">
                  {selectedCollection.profileImages?.map((img, i) => img && <img key={i} src={img} onClick={() => { setDetailViewerImage(img); setIsDetailViewerOpen(true); }} className="w-full aspect-square object-cover rounded-2xl border border-slate-800 shadow-lg cursor-pointer hover:border-cyan-500 transition-all" />)}
               </div>
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700 sm:col-span-2"><span className="text-[9px] font-black text-slate-500 uppercase block mb-1">Category</span><span className="text-xs font-bold text-white break-words">{selectedCollection.category || '-'}</span></div>
                  <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700 sm:col-span-2"><span className="text-[9px] font-black text-slate-500 uppercase block mb-1">Series</span><span className="text-xs font-bold text-white break-words">{selectedCollection.series || '-'}</span></div>
                  <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700 sm:col-span-2"><span className="text-[9px] font-black text-slate-500 uppercase block mb-1">Size</span><span className="text-xs font-bold text-white">{selectedCollection.sizeCm} cm</span></div>
                  <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700 sm:col-span-2"><span className="text-[9px] font-black text-slate-500 uppercase block mb-1">Completed</span><span className="text-xs font-bold text-white">{selectedCollection.creationDate}</span></div>
               </div>
               <div className="p-6 bg-slate-950/50 border border-slate-800 rounded-[2rem] flex flex-col sm:flex-row justify-between gap-6">
                  <StarRating label="외관" value={selectedCollection.ratingAppearance} disabled />
                  <StarRating label="조립 난이도" value={selectedCollection.ratingDifficulty} disabled />
                  <StarRating label="가동 성능" value={selectedCollection.ratingArticulation} disabled />
               </div>
               <div className="space-y-4">
                 {(selectedCollection.manualImages?.length > 0) && (
                   <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                     {selectedCollection.manualImages.map((img, i) => <img key={i} src={img} onClick={() => { setDetailViewerImage(img); setIsDetailViewerOpen(true); }} className="h-48 md:h-64 rounded-2xl border border-slate-800 shadow-xl object-contain bg-black/40 p-2 cursor-pointer hover:border-cyan-500 transition-all" />)}
                   </div>
                 )}
                 <div className="grid grid-cols-2 gap-4">
                   {selectedCollection.cardImageFront && <img src={selectedCollection.cardImageFront} onClick={() => { setDetailViewerImage(selectedCollection.cardImageFront); setIsDetailViewerOpen(true); }} className="w-full rounded-2xl border border-slate-800 shadow-xl bg-black/40 object-contain p-2 cursor-pointer hover:border-cyan-500 transition-all" />}
                   {selectedCollection.cardImageBack && <img src={selectedCollection.cardImageBack} onClick={() => { setDetailViewerImage(selectedCollection.cardImageBack); setIsDetailViewerOpen(true); }} className="w-full rounded-2xl border border-slate-800 shadow-xl bg-black/40 object-contain p-2 cursor-pointer hover:border-cyan-500 transition-all" />}
                 </div>
               </div>
            </div>
            <div className="p-8 bg-slate-800/30 border-t border-slate-800 flex gap-4"><button onClick={(e) => { setIsDetailOpen(false); setCollectionForm(selectedCollection); setIsEditingCollection(true); setActiveCollectionId(selectedCollection.id); setAppState('add-collection'); }} className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black uppercase text-xs transition-all">Edit Record</button><button onClick={() => setIsDetailOpen(false)} className="flex-1 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-[0_0_20px_rgba(8,145,178,0.2)]">Close Archives</button></div>
          </div>
        </div>
      )}

      {manageType && (
        <div className="fixed inset-0 z-[260] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-950 border border-slate-700/50 rounded-[2.5rem] w-full max-w-sm shadow-[0_0_80px_rgba(0,0,0,0.8)] p-8">
             <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Manage {manageType === 'brand' ? 'Brands' : 'Categories'}</h3><button onClick={() => setManageType(null)} className="text-slate-500 hover:text-white transition-colors"><X size={20} /></button></div>
             <div className="flex gap-2 mb-6"><input type="text" value={manageInput} onChange={(e) => setManageInput(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-500" placeholder="New item..." /><button onClick={handleManageSubmit} className="p-3 bg-cyan-600 rounded-xl text-white hover:bg-cyan-500 transition-colors shadow-lg"><Plus size={20} /></button></div>
             <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-2">{(manageType === 'brand' ? brands : categories).map(item => (<div key={item} className="flex justify-between items-center p-3 bg-slate-900 rounded-xl border border-slate-800 group transition-all hover:border-slate-600"><span className="text-sm font-bold text-slate-300 uppercase tracking-widest">{item}</span><button onClick={() => { if(manageType === 'brand') { let n = brands.filter(b=>b!==item); setBrands(n); saveClassificationToCloud(n, categories); } else { let n = categories.filter(c=>c!==item); setCategories(n); saveClassificationToCloud(brands, n); } }} className="text-slate-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button></div>))}</div>
          </div>
        </div>
      )}

      <UltraImageViewer src={detailViewerImage} isOpen={isDetailViewerOpen} onClose={() => setIsDetailViewerOpen(false)} />

      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(34, 211, 238, 0.2); border-radius: 10px; }`}</style>
    </div>
  );
};
export default App;
