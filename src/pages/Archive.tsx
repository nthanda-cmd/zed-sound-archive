import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Song, Genre } from '../types';
import { motion } from 'motion/react';
import { Search, Filter, Play, Music, Video, ChevronRight, FileText } from 'lucide-react';

export default function Archive() {
  const { genre } = useParams<{ genre?: Genre }>();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<Genre | 'all'>(genre || 'all');

  const genres: { id: Genre | 'all', label: string }[] = [
    { id: 'all', label: 'All Library' },
    { id: 'kalindula', label: 'Kalindula' },
    { id: 'traditional', label: 'Traditional' },
    { id: 'pop_pre_2000', label: 'Pre-2000 Pop' },
    { id: 'pop_modern', label: 'Modern Pop' },
  ];

  useEffect(() => {
    async function fetchSongs() {
      setLoading(true);
      try {
        const songsRef = collection(db, 'songs');
        let q;
        if (selectedGenre !== 'all') {
          q = query(songsRef, where('genre', '==', selectedGenre), orderBy('createdAt', 'desc'));
        } else {
          q = query(songsRef, orderBy('createdAt', 'desc'));
        }
        
        const querySnapshot = await getDocs(q);
        const results = querySnapshot.docs.map(doc => {
          const data = doc.data() as any;
          return { id: doc.id, ...data } as Song;
        });
        setSongs(results);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'songs');
      } finally {
        setLoading(false);
      }
    }

    fetchSongs();
  }, [selectedGenre]);

  const filteredSongs = songs.filter(song => 
    song.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/10 pb-8">
        <div>
          <h3 className="text-[10px] uppercase tracking-widest text-[#B8860B] mb-2 font-bold">Zambian Sound Archive</h3>
          <h1 className="text-5xl font-serif italic text-white leading-tight">Musical Records</h1>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input 
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-[#B8860B]/50 transition-colors text-sm"
            />
          </div>
          <div className="flex bg-white/5 border border-white/10 p-1 overflow-x-auto no-scrollbar">
            {genres.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGenre(g.id)}
                className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold transition-all whitespace-nowrap ${
                  selectedGenre === g.id ? 'bg-[#B8860B] text-black shadow-sm' : 'text-white/40 hover:text-white'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-white/5 border border-white/10 animate-pulse" />
          ))}
        </div>
      ) : filteredSongs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSongs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-white/5 border border-white/10 border-dashed">
          <Music className="w-12 h-12 text-[#B8860B] mx-auto mb-4 opacity-40 shrink-0" />
          <h3 className="text-xl font-serif italic text-white">No records found</h3>
          <p className="text-sm text-white/40 uppercase tracking-widest mt-2">Try adjusting your filters</p>
        </div>
      )}
    </motion.div>
  );
}

function SongCard({ song }: { song: Song }) {
  return (
    <Link to={`/song/${song.id}`}>
      <motion.div 
        whileHover={{ y: -8 }}
        className="bg-white/5 border border-white/10 p-8 shadow-2xl hover:bg-white/[0.08] hover:border-[#B8860B]/30 transition-all h-full flex flex-col justify-between group"
      >
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div className={`p-4 bg-dark-bg border border-white/10 ${song.mediaType === 'audio' ? 'text-[#B8860B]' : 'text-rose-400'}`}>
              {song.mediaType === 'audio' ? <Play className="w-6 h-6 fill-current" /> : <Video className="w-6 h-6" />}
            </div>
            <div className="flex gap-3">
              {song.chordsGuitar && <span className="p-2 bg-white/5 text-white/40 group-hover:text-[#B8860B] transition-colors" title="Guitar Chords"><Music className="w-4 h-4" /></span>}
              {song.sheetMusicUrl && <span className="p-2 bg-white/5 text-white/40 group-hover:text-[#B8860B] transition-colors" title="Sheet Music"><FileText className="w-4 h-4" /></span>}
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-serif italic text-white mb-2 leading-tight group-hover:text-white line-clamp-1">{song.title}</h3>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#B8860B] font-bold">
              {song.genre.replace(/_/g, ' ')}
            </p>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
          <span className="text-[9px] uppercase tracking-widest text-white/20">
            Cataloged {new Date(song.createdAt?.seconds * 1000).getFullYear()}
          </span>
          <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-[#B8860B] group-hover:translate-x-1 transition-all" />
        </div>
      </motion.div>
    </Link>
  );
}
