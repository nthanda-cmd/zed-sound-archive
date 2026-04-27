import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Song, Artist } from '../types';
import { motion } from 'motion/react';
import { Music, Video, FileText, ChevronLeft, Play, Info, Languages, Piano } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function SongDetail() {
  const { id } = useParams<{ id: string }>();
  const [song, setSong] = useState<Song | null>(null);
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'lyrics' | 'chords' | 'scores'>('lyrics');

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      setLoading(true);
      try {
        const songRef = doc(db, 'songs', id);
        const songSnap = await getDoc(songRef);
        
        if (songSnap.exists()) {
          const songData = { id: songSnap.id, ...(songSnap.data() as any) } as Song;
          setSong(songData);
          
          const artistRef = doc(db, 'artists', songData.artistId);
          const artistSnap = await getDoc(artistRef);
          if (artistSnap.exists()) {
            setArtist({ id: artistSnap.id, ...(artistSnap.data() as any) } as Artist);
          }
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `songs/${id}`);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  if (loading) return <div className="h-96 flex items-center justify-center text-[#B8860B] uppercase tracking-widest text-xs">Accessing Record...</div>;
  if (!song) return <div className="text-center py-20 uppercase tracking-widest text-white/40">Record not found</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-12 pb-32"
    >
      <Link to="/archive" className="flex items-center gap-2 text-white/40 hover:text-[#B8860B] transition-colors w-fit text-[10px] uppercase tracking-widest font-bold">
        <ChevronLeft className="w-4 h-4" /> Return to Library
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          <header className="flex items-end gap-10 border-b border-white/10 pb-10">
            <div className="w-48 h-48 bg-dark-surface shadow-2xl border border-white/10 flex items-center justify-center relative shrink-0">
               <div className="absolute inset-0 flex items-center justify-center opacity-10 text-6xl">🎸</div>
               <div className="z-10 text-center p-4">
                 <p className="text-[10px] uppercase tracking-[0.2em] mb-1 opacity-60">{song.genre.replace(/_/g, ' ')}</p>
                 <p className="text-lg font-serif italic text-white leading-tight">{song.title.split(' ')[0]}<br/>{song.title.split(' ').slice(1).join(' ')}</p>
               </div>
            </div>
            <div className="flex-1 pb-2">
              <h1 className="text-6xl font-serif italic text-white mb-4 leading-tight">{song.title}</h1>
              <div className="flex flex-wrap gap-4">
                <span className="px-3 py-1 bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest text-white/60">Artist: {artist?.name || 'Unknown'}</span>
                <span className="px-3 py-1 bg-[#B8860B]/10 border border-[#B8860B]/20 text-[10px] uppercase tracking-widest text-[#B8860B]">Verified Archivist Record</span>
              </div>
            </div>
          </header>

          {/* Media Player Placeholder */}
          <div className="aspect-video bg-black/40 rounded-sm border border-white/10 overflow-hidden flex items-center justify-center relative group">
            {song.mediaType === 'video' ? (
              <div className="text-white text-center p-8 bg-gradient-to-t from-black to-transparent w-full h-full flex flex-col justify-center">
                <Video className="w-16 h-16 mx-auto mb-4 text-[#B8860B] opacity-50" />
                <p className="uppercase tracking-[0.3em] text-[10px] opacity-40 mb-2">Video Integration Pending</p>
                <code className="text-[10px] font-mono text-[#B8860B]/60 break-all max-w-sm mx-auto">{song.mediaUrl}</code>
              </div>
            ) : (
              <div className="w-full h-full bg-[#111] flex flex-col items-center justify-center space-y-6">
                <div className="w-24 h-24 rounded-full border border-white/10 flex items-center justify-center group-hover:border-[#B8860B] transition-colors">
                  <Play className="w-8 h-8 text-[#B8860B] fill-current" />
                </div>
                <p className="uppercase tracking-[0.3em] text-[10px] text-white/40">Studio Demo Playback</p>
              </div>
            )}
          </div>

          {/* Interaction Tabs */}
          <div className="bg-white/5 border border-white/10 rounded-sm overflow-hidden">
            <div className="flex border-b border-white/10">
              <TabButton 
                active={activeTab === 'lyrics'} 
                onClick={() => setActiveTab('lyrics')} 
                label="Lyrics & Meaning" 
              />
              <TabButton 
                active={activeTab === 'chords'} 
                onClick={() => setActiveTab('chords')} 
                label="Notation" 
              />
              <TabButton 
                active={activeTab === 'scores'} 
                onClick={() => setActiveTab('scores')} 
                label="Score Card" 
              />
            </div>
            
            <div className="p-10">
              {activeTab === 'lyrics' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                  <div className="space-y-6">
                    <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40 border-b border-white/5 pb-2">Vernacular Original</h3>
                    <div className="font-serif italic text-xl leading-relaxed text-white whitespace-pre-wrap">
                      {song.lyricsOriginal || 'Transcription in progress.'}
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#B8860B] border-b border-[#B8860B]/20 pb-2">English Meaning</h3>
                    <div className="font-serif text-xl leading-relaxed text-[#D1D1D1]/80 whitespace-pre-wrap">
                      {song.lyricsTranslation || 'Translation pending verification.'}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'chords' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                  <div className="space-y-6">
                    <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40 border-b border-white/5 pb-2">Guitar Progression</h3>
                    <pre className="font-mono text-xs leading-relaxed text-[#B8860B] bg-black/40 p-8 border border-white/5 whitespace-pre-wrap">
                      {song.chordsGuitar || '// No guitar notation cataloged.'}
                    </pre>
                  </div>
                  <div className="space-y-6">
                    <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40 border-b border-white/5 pb-2">Keyboard Arrangements</h3>
                    <pre className="font-mono text-xs leading-relaxed text-[#D1D1D1]/60 bg-black/40 p-8 border border-white/5 whitespace-pre-wrap">
                      {song.chordsPiano || '// No piano notation cataloged.'}
                    </pre>
                  </div>
                </div>
              )}

              {activeTab === 'scores' && (
                <div className="flex flex-col items-center justify-center p-20 text-center space-y-8 bg-black/20">
                  {song.sheetMusicUrl ? (
                    <>
                      <div className="w-20 h-20 bg-white/5 border border-white/10 flex items-center justify-center">
                        <FileText className="w-10 h-10 text-[#B8860B]" />
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-2xl font-serif italic text-white">Full Score Available</h4>
                        <p className="text-xs uppercase tracking-widest text-white/40">Preserved in Heritage Digital Repository</p>
                      </div>
                      <a 
                        href={song.sheetMusicUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="px-10 py-3 bg-[#B8860B] text-black text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#B8860B]/90 transition-all"
                      >
                        Download PDF Score
                      </a>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <FileText className="w-12 h-12 text-white/10 mx-auto" />
                      <p className="text-xs uppercase tracking-[0.3em] text-white/20">Scores Pending Cataloging</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="bg-white/5 border border-white/10 rounded-sm p-8 space-y-8 shadow-2xl">
            <h2 className="text-[10px] uppercase tracking-[0.3em] text-white/30 border-b border-white/5 pb-4 font-bold">Metadata & Context</h2>
            {artist && (
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  {artist.photoUrl ? (
                    <img src={artist.photoUrl} alt={artist.name} className="w-20 h-20 rounded-sm object-cover border border-white/10" />
                  ) : (
                    <div className="w-20 h-20 bg-white/5 border border-white/10 flex items-center justify-center italic text-3xl font-serif text-white/20">
                      {artist.name[0]}
                    </div>
                  )}
                  <div>
                    <h4 className="font-serif italic text-xl text-white">{artist.name}</h4>
                    <p className="text-[10px] uppercase tracking-widest text-[#B8860B] font-bold">Legendary Artist</p>
                  </div>
                </div>
                <div className="text-sm text-[#D1D1D1]/60 leading-relaxed font-light italic line-clamp-4">
                  <ReactMarkdown>{artist.bio}</ReactMarkdown>
                </div>
                <Link to="/artists" className="text-[10px] uppercase tracking-widest font-bold text-white hover:text-[#B8860B] transition-colors inline-block pt-2">
                  Read Complete Biography →
                </Link>
              </div>
            )}
            <div className="space-y-4 pt-6 border-t border-white/5">
              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest">
                <span className="text-white/20">Archive ID</span>
                <span className="font-mono text-white/60">ZED-AUD-{song.id.slice(-4).toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest">
                <span className="text-white/20">Preservation</span>
                <span className="text-[#B8860B] font-bold animate-pulse">● System Verified</span>
              </div>
            </div>
          </div>

          <div className="p-8 border border-[#B8860B]/10 bg-[#B8860B]/5 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#B8860B]"></div>
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#B8860B] mb-4">Transcription Note</h3>
            <p className="text-xs text-[#D1D1D1]/60 leading-relaxed italic">
              "Traditional rhythmic patterns often bypass western notation rules. When using these charts, prioritize the 'swing' of the thumb-stroke over precise metronome timing."
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center py-6 px-4 text-[10px] uppercase tracking-[0.2em] font-bold transition-all relative ${
        active ? 'text-[#B8860B] bg-white/5' : 'text-white/30 hover:text-white'
      }`}
    >
      {label}
      {active && (
        <motion.div 
          layoutId="activeTabUnderline" 
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#B8860B]" 
        />
      )}
    </button>
  );
}
