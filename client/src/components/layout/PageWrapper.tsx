import { motion } from 'framer-motion';
import Navbar from './Navbar';

export default function PageWrapper({ children, noNav }: { children: React.ReactNode; noNav?: boolean }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {!noNav && <Navbar />}
      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={!noNav ? 'pt-16' : ''}
      >
        {children}
      </motion.main>
    </div>
  );
}
