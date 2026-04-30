/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { View, User, Mood } from './types';
import Welcome from './pages/Welcome';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Rooms from './pages/Rooms';
import Emergency from './pages/Emergency';
import Profile from './pages/Profile';
import VIP from './pages/VIP';
import Shop from './pages/Shop';
import Navigation from './components/Navigation';

export default function App() {
  const [view, setView] = useState<View>('welcome');
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('recomecar_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setView('home'); 
      } catch (e) {
        console.error('Failed to parse user', e);
      }
    }
  }, []);

  const handleStartOnboarding = () => setView('onboarding');
  
  const handleCompleteOnboarding = (userData: User) => {
    setUser(userData);
    localStorage.setItem('recomecar_user', JSON.stringify(userData));
    setView('home');
  };

  const navigate = (newView: View) => {
    // If it's the emergency view, we don't want to change the "main" view state necessarily 
    // unless it replaces it. For now, let's just switch.
    setView(newView);
  };

  const renderView = () => {
    switch (view) {
      case 'welcome':
        return <Welcome onStart={handleStartOnboarding} />;
      case 'onboarding':
        return <Onboarding onComplete={handleCompleteOnboarding} />;
      case 'home':
        return <Home user={user} navigate={navigate} />;
      case 'chat':
        return <Chat user={user} navigate={navigate} />;
      case 'rooms':
        return <Rooms navigate={navigate} />;
      case 'emergency':
        return <Emergency onClose={() => navigate('home')} />;
      case 'profile':
        return <Profile user={user} navigate={navigate} onLogout={() => {
          localStorage.removeItem('recomecar_user');
          setUser(null);
          setView('welcome');
        }} />;
      case 'vip':
        return <VIP navigate={navigate} />;
      case 'shop':
        return <Shop navigate={navigate} />;
      default:
        return <Home user={user} navigate={navigate} />;
    }
  };

  const showNav = user && !['welcome', 'onboarding', 'emergency'].includes(view);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-brand-gray flex flex-col max-w-md mx-auto shadow-2xl">
      <main className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="h-full w-full"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {showNav && (
        <Navigation currentView={view} navigate={navigate} />
      )}
    </div>
  );
}
