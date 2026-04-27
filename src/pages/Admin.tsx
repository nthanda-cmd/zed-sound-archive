import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { collection, query, getDocs, doc, updateDoc, setDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../App';
import { Song, Artist, CurationApp, UserProfile } from '../types';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Music, 
  Users, 
  FileText, 
  Check, 
  X, 
  Plus, 
  Search,
  Settings,
  LayoutDashboard
} from 'lucide-react';

export default function Admin() {
  const { profile } = useAuth();
  const location = useLocation();

  if (!profile || !['admin', 'manager', 'curator'].includes(profile.role)) {
    return <div className="py-20 text-center">Unauthorized Access</div>;
  }

  const tabs = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Applications', path: '/admin/apps', icon: FileText },
    { name: 'Songs', path: '/admin/songs', icon: Music },
    { name: 'Artists', path: '/admin/artists', icon: Users },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <aside className="w-full md:w-64 space-y-4">
        <div className="p-4 bg-[#5A5A40] text-white rounded-3xl">
          <p className="text-xs uppercase tracking-widest font-bold opacity-70">Logged in as</p>
          <p className="font-bold">{profile.role.toUpperCase()}</p>
        </div>
        <nav className="flex flex-col gap-2">
          {tabs.map((tab) => (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-bold transition-all ${
                location.pathname === tab.path 
                ? 'bg-white text-[#5A5A40] shadow-sm' 
                : 'text-[#7a7a70] hover:bg-white/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Panel */}
      <div className="flex-1 bg-white border border-[#e5e5df] rounded-[40px] p-8 min-h-[600px]">
        <Routes>
          <Route index element={<DashboardSummary />} />
          <Route path="apps" element={<ReviewApplications />} />
          <Route path="songs" element={<ManageSongs />} />
          <Route path="artists" element={<ManageArtists />} />
        </Routes>
      </div>
    </div>
  );
}

function DashboardSummary() {
  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-serif font-bold">Heritage Dashboard</h2>
        <p className="text-[#7a7a70]">System status and activity overview</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total Songs" value="156" trend="+12" icon={<Music className="text-amber-600" />} />
        <StatCard label="Active Curators" value="24" trend="+2" icon={<Users className="text-emerald-600" />} />
        <StatCard label="Pending Apps" value="8" trend="Hot" icon={<FileText className="text-rose-600" />} />
      </div>

      <div className="p-12 border-2 border-dashed border-[#e5e5df] rounded-3xl text-center space-y-4">
        <Settings className="w-12 h-12 text-[#e5e5df] mx-auto animate-spin-slow" />
        <h3 className="text-xl font-bold">Analytics Engine Offline</h3>
        <p className="text-[#7a7a70]">Historical data processing is scheduled for next maintenance cycle.</p>
      </div>
    </div>
  );
}

function StatCard({ label, value, trend, icon }: any) {
  return (
    <div className="p-6 bg-[#f5f5f0] rounded-3xl space-y-1">
      <div className="flex justify-between items-center mb-2">
        <div className="p-2 bg-white rounded-xl shadow-sm">{icon}</div>
        <span className="text-[10px] font-black bg-white px-2 py-1 rounded-full text-[#5A5A40]">{trend}</span>
      </div>
      <p className="text-[#7a7a70] text-sm font-medium">{label}</p>
      <p className="text-3xl font-bold text-[#1a1a1a]">{value}</p>
    </div>
  );
}

function ReviewApplications() {
  const [apps, setApps] = useState<CurationApp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApps() {
      try {
        const q = query(collection(db, 'applications'));
        const snap = await getDocs(q);
        setApps(snap.docs.map(d => {
          const data = d.data() as any;
          return { id: d.id, ...data } as CurationApp;
        }));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'applications');
      } finally {
        setLoading(false);
      }
    }
    fetchApps();
  }, []);

  const handleAction = async (app: CurationApp, status: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'applications', app.id), { status });
      if (status === 'approved') {
        const userRef = doc(db, 'users', app.userId);
        await updateDoc(userRef, { role: 'curator' });
      }
      setApps(prev => prev.map(a => a.id === app.id ? { ...a, status } : a));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'applications');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-serif font-bold">Pending Applications</h2>
      {loading ? (
        <p>Loading applications...</p>
      ) : apps.filter(a => a.status === 'pending').length > 0 ? (
        <div className="space-y-4">
          {apps.filter(a => a.status === 'pending').map((app) => (
            <div key={app.id} className="p-6 bg-[#f5f5f0] rounded-3xl space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-lg">{app.email}</p>
                  <p className="text-xs text-[#7a7a70]">User ID: {app.userId}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleAction(app, 'approved')}
                    className="p-2 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleAction(app, 'rejected')}
                    className="p-2 bg-rose-100 text-rose-700 rounded-xl hover:bg-rose-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <p className="text-[#1a1a1a] italic font-serif bg-white p-4 rounded-xl border border-black/5">
                "{app.statement}"
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-[#7a7a70]">No pending requests.</div>
      )}
    </div>
  );
}

function ManageSongs() {
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('kalindula');
  const [mediaUrl, setMediaUrl] = useState('');
  const { user } = useAuth();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // For demo, we assume a default artist exists or we find one
      // In real use, there would be an artist picker
      const artistsSnap = await getDocs(collection(db, 'artists'));
      const artistId = artistsSnap.empty ? 'unknown' : artistsSnap.docs[0].id;
      
      await addDoc(collection(db, 'songs'), {
        title,
        genre,
        mediaUrl,
        mediaType: 'video',
        artistId,
        createdAt: serverTimestamp(),
        createdBy: user?.uid,
      });
      setTitle('');
      setMediaUrl('');
      setShowAdd(false);
      alert('Song added successfully!');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'songs');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif font-bold">Catalog Management</h2>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2 bg-[#5A5A40] text-white rounded-xl font-bold"
        >
          {showAdd ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAdd ? 'Cancel' : 'Add Song'}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="p-6 bg-[#f5f5f0] rounded-3xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              type="text" 
              placeholder="Song Title" 
              className="p-3 rounded-xl border"
              value={title} 
              onChange={e => setTitle(e.target.value)}
              required 
            />
            <select 
              className="p-3 rounded-xl border"
              value={genre}
              onChange={e => setGenre(e.target.value)}
            >
              <option value="kalindula">Kalindula</option>
              <option value="traditional">Traditional</option>
              <option value="pop_pre_2000">Pre-2000 Pop</option>
              <option value="pop_modern">Modern Pop</option>
            </select>
            <input 
              type="text" 
              placeholder="Media URL (YouTube/MP3)" 
              className="p-3 rounded-xl border md:col-span-2"
              value={mediaUrl} 
              onChange={e => setMediaUrl(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="w-full py-3 bg-[#5A5A40] text-white rounded-xl font-bold">
            Catalog Piece
          </button>
        </form>
      )}

      <p className="text-[#7a7a70] italic">Songs list and editing features under construction...</p>
    </div>
  );
}

function ManageArtists() {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'artists'), {
        name,
        bio,
        genres: ['general'],
      });
      setName('');
      setBio('');
      alert('Artist created!');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'artists');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-serif font-bold">Artist Biographies</h2>
      <form onSubmit={handleAdd} className="space-y-4 p-6 bg-[#f5f5f0] rounded-3xl">
        <input 
          type="text" 
          placeholder="Artist Name" 
          className="w-full p-3 rounded-xl border"
          value={name}
          onChange={e => setName(e.target.value)}
          required 
        />
        <textarea 
          placeholder="Biography (Markdown supported)" 
          className="w-full p-3 rounded-xl border h-32"
          value={bio}
          onChange={e => setBio(e.target.value)}
          required 
        />
        <button type="submit" className="px-8 py-3 bg-[#5A5A40] text-white rounded-xl font-bold">
          Create Biography
        </button>
      </form>
    </div>
  );
}
