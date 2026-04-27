import { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { EducationalContent } from '../types';
import { motion } from 'motion/react';
import { GraduationCap, History, Music, Library, Compass } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function Education() {
  const [content, setContent] = useState<EducationalContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<EducationalContent['category'] | 'all'>('all');

  useEffect(() => {
    async function fetchContent() {
      setLoading(true);
      try {
        const q = query(collection(db, 'education'), orderBy('category'));
        const querySnapshot = await getDocs(q);
        const results = querySnapshot.docs.map(doc => {
          const data = doc.data() as any;
          return { id: doc.id, ...data } as EducationalContent;
        });
        setContent(results);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'education');
      } finally {
        setLoading(false);
      }
    }
    fetchContent();
  }, []);

  const filtered = activeCategory === 'all' ? content : content.filter(c => c.category === activeCategory);

  const categories = [
    { id: 'all', label: 'All Resources', icon: Library },
    { id: 'theory', label: 'Music Theory', icon: GraduationCap },
    { id: 'history', label: 'Music History', icon: History },
    { id: 'instruments', label: 'Zambian Instruments', icon: Music },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
      <header className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-5xl font-serif font-bold text-[#1a1a1a]">Knowledge Vault</h1>
        <p className="text-lg text-[#7a7a70]">
          Deepen your understanding of Zambian musical heritage through theory, 
          history, and instrument studies.
        </p>
      </header>

      <div className="flex flex-wrap justify-center gap-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
              activeCategory === cat.id 
              ? 'bg-[#5A5A40] text-white shadow-md' 
              : 'bg-white text-[#7a7a70] border border-[#e5e5df] hover:border-[#5A5A40]'
            }`}
          >
            <cat.icon className="w-4 h-4" />
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-64 bg-white rounded-3xl animate-pulse" />)
        ) : filtered.length > 0 ? (
          filtered.map((item) => (
            <motion.div 
              key={item.id}
              layout
              className="bg-white border border-[#e5e5df] rounded-3xl p-8 hover:shadow-xl transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#5A5A40] bg-[#f5f5f0] px-3 py-1 rounded-full">
                  {item.category}
                </span>
                <Compass className="w-5 h-5 text-[#e5e5df] group-hover:text-[#5A5A40] transition-colors" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-[#1a1a1a] mb-4">{item.title}</h3>
              <div className="prose prose-sm text-[#7a7a70] line-clamp-4 mb-6">
                <ReactMarkdown>{item.content}</ReactMarkdown>
              </div>
              <button className="text-[#5A5A40] font-bold text-sm flex items-center gap-1 hover:underline">
                Read Full Context
              </button>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white border border-[#e5e5df] rounded-3xl border-dashed">
            <p className="text-[#7a7a70]">No articles cataloged in this category yet.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
