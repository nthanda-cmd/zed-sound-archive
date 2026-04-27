import { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Artist } from '../types';
import { motion } from 'motion/react';
import { User, Music, Search, Heart } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function ArtistBios() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchArtists() {
      setLoading(true);
      try {
        const q = query(collection(db, 'artists'), orderBy('name'));
        const querySnapshot = await getDocs(q);
        const results = querySnapshot.docs.map(doc => {
          const data = doc.data() as any;
          return { id: doc.id, ...data } as Artist;
        });
        setArtists(results);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'artists');
      } finally {
        setLoading(false);
      }
    }
    fetchArtists();
  }, []);

  const filtered = artists.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-serif font-bold text-[#1a1a1a]">Artists & Legends</h1>
          <p className="text-lg text-[#7a7a70]">The pioneers and shapers of Zambian sound</p>
        </div>
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a7a70]" />
          <input 
            type="text"
            placeholder="Search artists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-[#e5e5df] rounded-2xl focus:outline-none ring-[#5A5A40]/10 focus:ring-4"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3].map(i => <div key={i} className="h-80 bg-white rounded-3xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((artist) => (
            <motion.div 
              key={artist.id}
              className="bg-white border border-[#e5e5df] rounded-3xl overflow-hidden hover:shadow-xl transition-all"
            >
              <div className="h-48 overflow-hidden relative group">
                {artist.photoUrl ? (
                  <img src={artist.photoUrl} alt={artist.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full bg-[#f5f5f0] flex items-center justify-center">
                    <User className="w-12 h-12 text-[#e5e5df]" />
                  </div>
                )}
                <div className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 cursor-pointer transition-colors">
                  <Heart className="w-4 h-4" />
                </div>
              </div>
              <div className="p-8 space-y-4">
                <div>
                  <h3 className="text-2xl font-serif font-bold text-[#1a1a1a]">{artist.name}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {artist.genres.map(g => (
                      <span key={g} className="text-[10px] uppercase font-bold text-[#5A5A40] bg-[#f5f5f0] px-2 py-0.5 rounded">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="prose prose-sm text-[#7a7a70] line-clamp-4">
                  <ReactMarkdown>{artist.bio}</ReactMarkdown>
                </div>
                <div className="pt-4 border-t border-[#f5f5f0] flex items-center gap-2 text-sm font-bold text-[#5A5A40]">
                  <Music className="w-4 h-4" />
                  <span>Explore their music</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
