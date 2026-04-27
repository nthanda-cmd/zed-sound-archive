import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../App';
import { motion } from 'motion/react';
import { Send, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';

export default function Apply() {
  const { user, profile } = useAuth();
  const [statement, setStatement] = useState('');
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    
    setSending(true);
    setError(null);

    try {
      // Check if already applied
      const q = query(collection(db, 'applications'), where('userId', '==', user.uid), where('status', '==', 'pending'));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        setError("You already have a pending application. Please wait for our team to review it.");
        setSending(false);
        return;
      }

      await addDoc(collection(db, 'applications'), {
        userId: user.uid,
        email: user.email,
        statement,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'applications');
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-6">
        <ShieldAlert className="w-16 h-16 text-amber-500 mx-auto" />
        <h1 className="text-3xl font-serif font-bold">Authentication Required</h1>
        <p className="text-[#7a7a70]">You must be signed in to apply for curation access.</p>
        <button 
          onClick={() => navigate('/')} 
          className="px-8 py-3 bg-[#5A5A40] text-white rounded-full font-bold"
        >
          Return Home
        </button>
      </div>
    );
  }

  if (profile?.role !== 'user') {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-6">
        <Sparkles className="w-16 h-16 text-emerald-500 mx-auto" />
        <h1 className="text-3xl font-serif font-bold">You are already a {profile?.role}!</h1>
        <p className="text-[#7a7a70]">You already have access to manage and curate the archive.</p>
        <button 
          onClick={() => navigate('/admin')} 
          className="px-8 py-3 bg-[#5A5A40] text-white rounded-full font-bold"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  if (submitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto py-20 text-center space-y-6 bg-white border border-[#e5e5df] rounded-[40px] p-12"
      >
        <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto" />
        <h1 className="text-4xl font-serif font-bold">Application Received!</h1>
        <p className="text-lg text-[#7a7a70] leading-relaxed">
          Thank you for your interest in preserving Zambian music. 
          Our administrators will review your application and contact 
          you via email within 3-5 business days.
        </p>
        <button 
          onClick={() => navigate('/')} 
          className="px-8 py-3 bg-[#5A5A40] text-white rounded-full font-bold hover:bg-[#4a4a30] transition-colors"
        >
          Back to Home
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-12">
      <header className="text-center space-y-4">
        <h1 className="text-5xl font-serif font-bold text-[#1a1a1a]">Join the Curators</h1>
        <p className="text-lg text-[#7a7a70]">Help us document, translate, and preserve Zambian musical heritage.</p>
      </header>

      <div className="bg-white border border-[#e5e5df] rounded-[40px] overflow-hidden shadow-sm">
        <div className="bg-[#5A5A40] p-8 text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5" /> Curation Application
          </h2>
          <p className="text-white/70 text-sm mt-1">Applying as {user.email}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
          <div className="space-y-4">
            <label className="block font-bold text-[#1a1a1a]">Why do you want to join our team of curators?</label>
            <p className="text-sm text-[#7a7a70]">
              Tell us about your background in music, your connection to Zambian culture, or your specific skills (e.g., translation, transcription, history).
            </p>
            <textarea
              required
              rows={6}
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              placeholder="I grew up listening to Kalindula and have spent the last 5 years transcribing scores for traditional guitar..."
              className="w-full p-6 bg-[#f5f5f0] border border-[#e5e5df] rounded-2xl focus:outline-none focus:ring-4 ring-[#5A5A40]/10 transition-all font-serif italic text-lg"
            />
          </div>

          {error && (
            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm flex gap-3">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="flex items-center justify-between pt-4">
            <p className="text-xs text-[#7a7a70] max-w-xs">
              By submitting, you agree to follow our metadata standards and cultural sensitivity guidelines.
            </p>
            <button
              type="submit"
              disabled={sending}
              className="flex items-center gap-2 px-10 py-4 bg-[#5A5A40] text-white rounded-full font-bold hover:bg-[#4a4a30] transition-all disabled:opacity-50"
            >
              {sending ? 'Sending...' : 'Submit Application'}
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-amber-50 rounded-3xl space-y-2">
          <h4 className="font-bold text-amber-900">Translation</h4>
          <p className="text-xs text-amber-800 opacity-70">Provide English translations for Bemba, Nyanja, Tonga, and other local songs.</p>
        </div>
        <div className="p-6 bg-emerald-50 rounded-3xl space-y-2">
          <h4 className="font-bold text-emerald-900">Transcription</h4>
          <p className="text-xs text-emerald-800 opacity-70">Create sheet music and chord charts for traditional rhythmic patterns.</p>
        </div>
        <div className="p-6 bg-blue-50 rounded-3xl space-y-2">
          <h4 className="font-bold text-blue-900">Education</h4>
          <p className="text-xs text-blue-800 opacity-70">Write about the history of genres like Kalindula and Zamrock.</p>
        </div>
      </div>
    </div>
  );
}
