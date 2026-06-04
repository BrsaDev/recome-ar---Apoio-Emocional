/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { View, User, Mood, RoomGender } from './types';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import Rooms from './pages/Rooms';
import Emergency from './pages/Emergency';
import Profile from './pages/Profile';
import VIP from './pages/VIP';
import Shop from './pages/Shop';
import LiveRoom from './pages/LiveRoom';
import Forum from './pages/Forum';
import TopicDetail from './pages/TopicDetail';
import Navigation from './components/Navigation';
import { ForumTopic } from './types';
import { INITIAL_FORUM_TOPICS } from './data/forumData';
import TermsModal from './components/TermsModal';
import { apiService } from './services/api';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Support from './pages/Support';
import Admin from './pages/Admin';
import WelcomePromoModal from './components/WelcomePromoModal';

export default function App() {
  const [view, setView] = useState<View>('welcome');
  const [privacyPolicyFrom, setPrivacyPolicyFrom] = useState<View>('welcome');
  const [supportFrom, setSupportFrom] = useState<View>('profile');
  const [user, setUser] = useState<User | null>(null);
  
  // Track mock user signups for the welcome limit gift
  const [userCount, setUserCount] = useState<number>(() => {
    const saved = localStorage.getItem('recomecar_user_count');
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed)) return parsed;
    }
    localStorage.setItem('recomecar_user_count', '498');
    return 498;
  });

  const [showPromoModal, setShowPromoModal] = useState<boolean>(() => {
    const hasSeen = localStorage.getItem('recomecar_has_seen_promo');
    return hasSeen !== 'true';
  });
  const [activeRoom, setActiveRoom] = useState<{ name: string; gender: RoomGender; invitedAngels?: string[] } | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [forumTopics, setForumTopics] = useState<ForumTopic[]>(() => {
    const saved = localStorage.getItem('recomecar_forum_topics');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved forum topics', e);
      }
    }
    return INITIAL_FORUM_TOPICS;
  });

  const handleUpdateForumTopics = (updated: ForumTopic[]) => {
    setForumTopics(updated);
    localStorage.setItem('recomecar_forum_topics', JSON.stringify(updated));
  };

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('recomecar_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        const initialView = 'home';
        setView(initialView);
        window.history.replaceState({ view: initialView }, '', '');
      } catch (e) {
        console.error('Failed to parse user', e);
        window.history.replaceState({ view: 'welcome' }, '', '');
      }
    } else {
      window.history.replaceState({ view: 'welcome' }, '', '');
    }
  }, []);

  // Sync state with History API
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.view) {
        setView(event.state.view);
        if (event.state.activeRoom) setActiveRoom(event.state.activeRoom);
        if (event.state.topicId) setSelectedTopicId(event.state.topicId);
        if (event.state.postId) setSelectedPostId(event.state.postId);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (newView: View, state?: any) => {
    if (newView !== view || state) {
      if (newView === 'privacy-policy' && view !== 'privacy-policy') {
        setPrivacyPolicyFrom(view);
      }
      if (newView === 'support' && view !== 'support') {
        setSupportFrom(view);
      }
      window.history.pushState({ view: newView, ...state }, '', '');
      setView(newView);
      if (state?.activeRoom) setActiveRoom(state.activeRoom);
      if (state?.topicId) setSelectedTopicId(state.topicId);
      setSelectedPostId(state?.postId || null);
    }
  };

  const handleStartOnboarding = () => navigate('login', { isSignUp: true });
  
  const handleCompleteOnboarding = (userData: User) => {
    const updated = {
      ...user,
      ...userData,
    };
    setUser(updated);
    localStorage.setItem('recomecar_user', JSON.stringify(updated));
    navigate('home');
  };

  const renderView = () => {
    switch (view) {
      case 'welcome':
        return <Welcome onStart={handleStartOnboarding} onLogin={() => navigate('login', { isSignUp: false })} onViewPrivacy={() => navigate('privacy-policy')} />;
      case 'login':
        return (
          <Login
            initialIsSignUp={window.history.state?.isSignUp || false}
            onComplete={(userData, isNew) => {
              setUser(userData);
              localStorage.setItem('recomecar_user', JSON.stringify(userData));
              
              if (isNew) {
                navigate('onboarding');
              } else {
                navigate('home');
              }
            }}
            onBack={() => navigate('welcome')}
          />
        );
      case 'onboarding':
        return <Onboarding onComplete={handleCompleteOnboarding} initialName={user?.name || ''} />;
      case 'home':
        return <Home user={user} navigate={navigate} />;
      case 'rooms':
        return <Rooms user={user} navigate={navigate} />;
      case 'live-room':
        return (
          <LiveRoom 
            user={user} 
            navigate={navigate} 
            roomName={activeRoom?.name || 'Sala'} 
            gender={activeRoom?.gender || 'mixed'} 
            onUpdateUser={(updated) => {
              setUser(updated);
              localStorage.setItem('recomecar_user', JSON.stringify(updated));
            }}
          />
        );
      case 'forum':
        return (
          <Forum 
            user={user} 
            navigate={navigate} 
            topics={forumTopics} 
            onUpdateTopics={handleUpdateForumTopics} 
          />
        );
      case 'topic-detail':
        return (
          <TopicDetail 
            user={user} 
            navigate={navigate} 
            topicId={selectedTopicId || ''} 
            postId={selectedPostId}
            topics={forumTopics} 
            onUpdateTopics={handleUpdateForumTopics} 
            onUpdateUser={(updated) => {
              setUser(updated);
              localStorage.setItem('recomecar_user', JSON.stringify(updated));
            }}
          />
        );
      case 'emergency':
        return <Emergency onClose={() => navigate('home')} />;
      case 'profile':
        return (
          <Profile 
            user={user} 
            navigate={navigate} 
            topics={forumTopics}
            onUpdateTopics={handleUpdateForumTopics}
            onLogout={() => {
              localStorage.removeItem('recomecar_user');
              setUser(null);
              navigate('welcome');
            }} 
            onUpdateUser={(updated) => {
              setUser(updated);
              localStorage.setItem('recomecar_user', JSON.stringify(updated));
            }}
          />
        );
      case 'vip':
        return (
          <VIP 
            user={user} 
            navigate={navigate} 
            onUpdateUser={(updated) => {
              setUser(updated);
              localStorage.setItem('recomecar_user', JSON.stringify(updated));
            }}
          />
        );
      case 'shop':
        return <Shop navigate={navigate} />;
      case 'privacy-policy':
        return <PrivacyPolicy navigate={navigate} fromView={privacyPolicyFrom} />;
      case 'support':
        return <Support navigate={navigate} fromView={supportFrom} />;
      case 'admin':
        return (
          <Admin 
            navigate={navigate} 
            forumTopics={forumTopics} 
            onUpdateForumTopics={handleUpdateForumTopics} 
          />
        );
      default:
        return <Home user={user} navigate={navigate} />;
    }
  };

  const showNav = user && !['welcome', 'login', 'onboarding', 'emergency', 'live-room', 'privacy-policy', 'support', 'admin'].includes(view);

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-brand-gray flex flex-col max-w-md mx-auto shadow-2xl">
      <main className="flex-1 relative overflow-hidden flex flex-col">
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

      {user && !user.termsAccepted && (
        <TermsModal
          user={user}
          onAccept={(acceptedAt, version) => {
            const updated = {
              ...user,
              termsAccepted: true,
              termsAcceptedAt: acceptedAt,
              termsVersion: version
            };
            setUser(updated);
            localStorage.setItem('recomecar_user', JSON.stringify(updated));
            
            // Background api synchronizations
            apiService.profile.acceptTerms(user.name, acceptedAt, version).catch(err => {
              console.warn('[API Sync] Terms registration failed (Expected in sandbox mode):', err);
            });
            apiService.profile.sync(updated).catch(err => {
              console.warn('[API Sync] Profile sync failed (Expected in sandbox mode):', err);
            });
          }}
        />
      )}

      {user && showPromoModal && !['welcome', 'onboarding'].includes(view) && (
        <WelcomePromoModal
          user={user}
          onUpdateUser={(updated) => {
            setUser(updated);
            localStorage.setItem('recomecar_user', JSON.stringify(updated));
          }}
          userCount={userCount}
          onUpdateUserCount={(newCount) => {
            setUserCount(newCount);
            localStorage.setItem('recomecar_user_count', String(newCount));
          }}
          onClose={() => {
            setShowPromoModal(false);
            localStorage.setItem('recomecar_has_seen_promo', 'true');
          }}
        />
      )}
    </div>
  );
}
