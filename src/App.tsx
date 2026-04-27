import { useEffect, useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile, UserRole } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Music, 
  BookOpen, 
  Users, 
  ShieldCheck, 
  User as UserIcon, 
  Menu, 
  X,
  LogOut,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import Home from './pages/Home';
import Archive from './pages/Archive';
import Education from './pages/Education';
import ArtistBios from './pages/ArtistBios';
import Admin from './pages/Admin';
import Apply from './pages/Apply';
import SongDetail from './pages/SongDetail';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signIn: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const docRef = doc(db, 'users', u.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          const newProfile: UserProfile = {
            uid: u.uid,
            email: u.email || '',
            role: u.email === 'nthandazyambo@gmail.com' ? 'admin' : 'user',
            displayName: u.displayName || 'Anonymous User',
          };
          await setDoc(docRef, newProfile);
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, logout }}>
      <Router>
        <div className="min-h-screen bg-dark-bg text-[#D1D1D1] font-sans selection:bg-brand-gold/30">
          <Navigation />
          <main className="max-w-7xl mx-auto px-4 py-8">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/archive" element={<Archive />} />
                <Route path="/archive/:genre" element={<Archive />} />
                <Route path="/song/:id" element={<SongDetail />} />
                <Route path="/education" element={<Education />} />
                <Route path="/artists" element={<ArtistBios />} />
                <Route path="/apply" element={<Apply />} />
                {(profile?.role === 'admin' || profile?.role === 'manager' || profile?.role === 'curator') && (
                  <Route path="/admin/*" element={<Admin />} />
                )}
              </Routes>
            </AnimatePresence>
          </main>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

function Navigation() {
  const { user, profile, signIn, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Library', icon: Music, path: '/archive' },
    { name: 'Theory', icon: BookOpen, path: '/education' },
    { name: 'Artists', icon: Users, path: '/artists' },
  ];

  const isAdmin = profile?.role === 'admin' || profile?.role === 'manager' || profile?.role === 'curator';

  return (
    <nav className="h-16 border-b border-white/10 sticky top-0 z-50 bg-dark-bg/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-gold rounded-sm flex items-center justify-center font-serif font-bold text-black text-xl">Z</div>
          <span className="font-serif text-lg tracking-tight text-white uppercase hidden sm:block">Zambian Sound Archive</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-[10px] uppercase tracking-widest font-semibold transition-colors ${
                location.pathname.startsWith(item.path) ? 'text-brand-gold' : 'text-[#7a7a70] hover:text-white'
              }`}
            >
              {item.name}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin" className="text-[10px] uppercase tracking-widest font-semibold text-[#7a7a70] hover:text-white">
              Admin
            </Link>
          )}
          {user ? (
            <div className="flex items-center gap-6">
              <Link to="/apply" className="px-4 py-1.5 border border-brand-gold text-brand-gold text-[10px] uppercase tracking-widest hover:bg-brand-gold hover:text-black transition-all">
                Curation
              </Link>
              <button 
                onClick={logout}
                className="text-[10px] uppercase tracking-widest font-semibold text-[#7a7a70] hover:text-rose-400 transition-colors"
                id="logout_btn"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={signIn}
              className="px-4 py-2 border border-brand-gold text-brand-gold text-[10px] uppercase tracking-widest hover:bg-brand-gold hover:text-black transition-all"
              id="signin_btn"
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-brand-gold" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-white/10 bg-dark-bg overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className="text-xs uppercase tracking-widest font-semibold text-[#D1D1D1]"
                >
                  {item.name}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="text-xs uppercase tracking-widest font-semibold text-[#D1D1D1]"
                >
                  Admin Dash
                </Link>
              )}
              {user ? (
                <>
                  <Link
                    to="/apply"
                    onClick={() => setIsOpen(false)}
                    className="text-brand-gold text-xs uppercase tracking-widest"
                  >
                    Apply to Curate
                  </Link>
                  <button onClick={logout} className="text-left text-rose-400 text-xs uppercase tracking-widest">
                    Sign Out
                  </button>
                </>
              ) : (
                <button onClick={signIn} className="w-full py-4 border border-brand-gold text-brand-gold text-xs uppercase tracking-widest">
                  Sign In with Google
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
