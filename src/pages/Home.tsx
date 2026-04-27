import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Music, History, GraduationCap, ChevronRight, Play } from 'lucide-react';

export default function Home() {
  const genres = [
    { title: 'Kalindula Legends', description: 'The beating heart of Zambian rhythmic folk music.', icon: Music, color: 'bg-white/5', text: 'text-white', path: '/archive/kalindula' },
    { title: 'Traditional / Folk', description: 'Ancestral sounds from all 73 ethnic groups.', icon: History, color: 'bg-white/5', text: 'text-white', path: '/archive/traditional' },
    { title: 'Zed Pop (Pre-2000s)', description: 'The evolution of Zed Pop from pre-2000s classics.', icon: Play, color: 'bg-white/5 border-brand-gold/20', text: 'text-brand-gold', path: '/archive/pop_pre_2000' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-24"
    >
      {/* Hero Section */}
      <section className="relative overflow-hidden flex items-end gap-12 min-h-[40vh] py-12">
        <div className="w-64 h-64 bg-dark-surface shadow-2xl border border-white/10 flex items-center justify-center relative shrink-0 hidden md:flex">
          <div className="absolute inset-0 flex items-center justify-center opacity-10 text-8xl">🎸</div>
          <div className="z-10 text-center p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] mb-2 opacity-60">Zambian Heritage</p>
            <p className="text-xl font-serif italic text-white leading-tight">Archive of<br/>Melodies</p>
          </div>
        </div>

        <div className="flex-1 pb-4">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-6xl md:text-8xl font-serif font-light italic text-white leading-tight mb-6"
          >
            Mundali Sounds
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-[#D1D1D1]/60 mb-8 leading-relaxed max-w-2xl"
          >
            An exploration of contemporary rhythm blended with traditional vocal harmonies. 
            Discover lyrics, chords for guitar, and transcriptions for piano.
          </motion.p>
          <div className="flex flex-wrap gap-6">
            <Link 
              to="/archive" 
              className="px-8 py-3 bg-brand-gold text-black text-xs uppercase tracking-widest font-bold hover:bg-brand-gold/90 transition-all flex items-center gap-2"
            >
              Explore Library <ChevronRight className="w-4 h-4" />
            </Link>
            <Link 
              to="/education" 
              className="px-8 py-3 border border-white/20 text-[#D1D1D1] text-xs uppercase tracking-widest font-bold hover:bg-white/5 transition-all flex items-center gap-2"
            >
              Music Theory <GraduationCap className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Musical Streams */}
      <section className="space-y-12">
        <div className="flex items-end justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Genres</h3>
            <h2 className="text-4xl font-serif italic text-white">Musical Streams</h2>
          </div>
          <Link to="/archive" className="text-brand-gold text-[10px] uppercase tracking-widest font-bold flex items-center gap-1 hover:underline">
            View Complete Archive <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {genres.map((genre, idx) => (
            <motion.div
              key={genre.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              whileHover={{ y: -10 }}
              className={`bg-white/5 border border-white/5 p-10 flex flex-col justify-between h-80 transition-all hover:bg-white/[0.08] hover:border-brand-gold/30`}
            >
              <div className="space-y-6">
                <div className={`p-4 bg-white/5 w-fit border border-white/10`}>
                  <genre.icon className={`w-8 h-8 ${genre.text}`} />
                </div>
                <div>
                  <h3 className={`text-2xl font-serif italic mb-3 ${genre.text}`}>{genre.title}</h3>
                  <p className="text-sm text-[#D1D1D1]/60 leading-relaxed font-light">{genre.description}</p>
                </div>
              </div>
              <Link 
                to={genre.path} 
                className={`flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold ${activeGenreText(genre.title)} hover:opacity-80 transition-opacity`}
              >
                Enter Collection <ChevronRight className="w-3 h-3" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Curation CTA */}
      <section className="bg-white/5 border border-white/5 p-12 md:p-20 flex flex-col md:flex-row items-center gap-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent"></div>
        <div className="flex-1 space-y-6 text-center md:text-left">
          <h2 className="text-4xl font-serif italic text-white">The Curator Project</h2>
          <p className="text-[#D1D1D1]/60 text-lg leading-relaxed max-w-xl">
            We are looking for ethnomusicologists, translators, and enthusiasts to help 
            transcribe and preserve the sounds of Luapula, Copperbelt, and the Zambezi.
          </p>
          <Link 
            to="/apply" 
            className="inline-block px-10 py-4 bg-transparent border border-brand-gold text-brand-gold text-xs uppercase tracking-widest font-bold hover:bg-brand-gold hover:text-black transition-all"
          >
            Apply to Curate Content
          </Link>
        </div>
        <div className="w-full md:w-1/3 grid grid-cols-2 gap-px bg-white/10">
          <div className="aspect-square bg-dark-bg flex items-center justify-center p-4">
            <span className="text-[10px] uppercase tracking-widest text-[#D1D1D1]/40 text-center">Lyrics</span>
          </div>
          <div className="aspect-square bg-dark-bg flex items-center justify-center p-4">
            <span className="text-[10px] uppercase tracking-widest text-[#D1D1D1]/40 text-center">Scores</span>
          </div>
          <div className="aspect-square bg-dark-bg flex items-center justify-center p-4">
            <span className="text-[10px] uppercase tracking-widest text-[#D1D1D1]/40 text-center">History</span>
          </div>
          <div className="aspect-square bg-dark-bg flex items-center justify-center p-4">
            <span className="text-[10px] uppercase tracking-widest text-[#D1D1D1]/40 text-center">Audio</span>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

function activeGenreText(title: string) {
  if (title.includes('Zed Pop')) return 'text-brand-gold';
  return 'text-white';
}
