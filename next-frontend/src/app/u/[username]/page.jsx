"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Calendar, User, BookOpen, Users } from 'lucide-react';
import api from '@/services/api';
import Navbar from '@/components/global/Navbar';
import QuizCard from '@/components/Dashboard/QuizCard';
import { useProfileStore } from '@/store/useProfileStore';

export default function UserProfilePage() {
  const { username } = useParams();
  const router = useRouter();
  
  const cachedProfile = useProfileStore(state => state.profiles[username]);
  const setCachedProfile = useProfileStore(state => state.setProfile);

  const [profile, setProfile] = useState(cachedProfile || null);
  const [loading, setLoading] = useState(!cachedProfile);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('quizzes'); // 'quizzes', 'followers', 'following'

  useEffect(() => {
    if (!username) return;

    if (cachedProfile) {
      setProfile(cachedProfile);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await api.get(`/api/user/profile/${username}`);
        setProfile(data);
        setCachedProfile(username, data);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to load user profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username, cachedProfile, setCachedProfile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zk-bg flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-zk-text" size={48} />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-zk-bg flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <h2 className="font-['Amatic_SC'] text-6xl font-black text-zk-text mb-4">404</h2>
          <p className="font-bold text-zk-text/70 mb-6">{error || 'User not found.'}</p>
          <button 
            onClick={() => router.push('/dashboard/social')}
            className="bg-zk-purple text-white px-6 py-2 rounded-xl border-[3px] border-zk-border font-['Amatic_SC'] text-2xl font-bold hover:bg-zk-blue transition-colors"
          >
            Back to Social
          </button>
        </div>
      </div>
    );
  }

  const { user, quizzes, stats } = profile;

  return (
    <div className="min-h-screen bg-zk-bg flex flex-col">
      <Navbar />
      
      {/* Back button */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-4">
        <button 
          onClick={() => {
            if (activeTab !== 'quizzes') {
              setActiveTab('quizzes');
            } else {
              router.back();
            }
          }}
          className="flex items-center gap-2 text-zk-text/60 font-bold hover:text-zk-text transition-colors w-fit"
        >
          <ArrowLeft size={18} /> Back
        </button>
      </div>

      {/* Cover Photo */}
      <div className="w-full h-32 md:h-56 relative overflow-hidden bg-zk-panel-bg border-y-[3px] border-zk-border shrink-0">
        {user.coverUrl ? (
          <img src={user.coverUrl} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-zk-blue/20 to-zk-purple/20" />
        )}
      </div>
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 pb-12 flex flex-col md:flex-row gap-8">
        
        {/* Left Sidebar - Profile Info */}
        <aside className="w-full md:w-1/4 flex flex-col gap-6 -mt-12 md:-mt-16 relative z-10">
          <div className="bg-zk-panel-bg border-[3px] border-zk-border rounded-2xl p-6 pt-0 flex flex-col items-center text-center !shadow-none">
            <img 
              src={user.avatarUrl || '/images/avatars/default.png'} 
              alt={user.username}
              className="w-28 h-28 md:w-32 md:h-32 rounded-full border-[6px] border-zk-panel-bg object-cover -mt-12 md:-mt-16 mb-4 bg-zk-panel-bg"
            />
            <h1 className="font-['Outfit'] font-black text-zk-text text-2xl break-all">
              {user.firstName || user.username || 'Anonymous User'}
            </h1>
            {user.username && (
              <h2 className="font-['Outfit'] text-lg text-zk-text/60 font-bold mb-4 break-all">
                @{user.username}
              </h2>
            )}

            <div className="w-full h-px bg-zk-border/30 my-2"></div>

            <div className="flex flex-col gap-3 w-full text-left mt-2">
              <div className="flex items-center gap-3 text-zk-text/80 font-bold text-sm">
                <Calendar size={18} />
                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-3 text-zk-text/80 font-bold text-sm">
                <BookOpen size={18} />
                <span 
                  className={`cursor-pointer hover:text-zk-blue transition-colors ${activeTab === 'quizzes' ? 'text-zk-blue' : ''}`}
                  onClick={() => setActiveTab('quizzes')}
                >
                  {stats.totalPublicQuizzes} Public Quizzes
                </span>
              </div>
              <div className="flex items-center gap-3 text-zk-text/80 font-bold text-sm">
                <Users size={18} />
                <span 
                  className={`cursor-pointer hover:text-zk-blue transition-colors ${activeTab === 'followers' ? 'text-zk-blue' : ''}`}
                  onClick={() => setActiveTab('followers')}
                >
                  Follower: {stats.followers}
                </span>
                <span>,</span>
                <span 
                  className={`cursor-pointer hover:text-zk-blue transition-colors ${activeTab === 'following' ? 'text-zk-blue' : ''}`}
                  onClick={() => setActiveTab('following')}
                >
                  Following: {stats.following}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content - Quizzes & Activity */}
        <section className="flex-1 flex flex-col gap-8 md:pt-4">
          
          {/* Stats / Activity Overview */}
          <div>
            <h3 className="font-['Amatic_SC'] text-4xl font-bold text-zk-text mb-4 uppercase">
              Activity Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-zk-panel-bg border-[3px] border-zk-border rounded-xl p-4 flex flex-col items-center justify-center text-center !shadow-none">
                <span className="text-4xl font-black text-[#5D3FD3] font-['Outfit']">{stats.totalPublicQuizzes}</span>
                <span className="font-bold text-zk-text/70 text-sm uppercase mt-1">Quizzes Created</span>
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-zk-border/30"></div>

          {/* Public Quizzes */}
          {activeTab === 'quizzes' && (
            <div>
              <h3 className="font-['Amatic_SC'] text-4xl font-bold text-zk-text mb-4 uppercase">
                Public Quizzes
              </h3>
              
              {quizzes.length === 0 ? (
                <div className="p-10 bg-zk-panel-bg/50 border-2 border-dashed border-zk-border/35 rounded-2xl text-center">
                  <p className="font-['Outfit'] font-bold text-zk-text/55">
                    {user.username ? `@${user.username}` : (user.firstName || 'This user')} hasn't published any quizzes yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {quizzes.map((quiz) => (
                    <QuizCard key={quiz.id} quiz={quiz} isDiscoveryMode={true} />
                  ))}
                </div>
              )}
            </div>
          )}

          {(activeTab === 'followers' || activeTab === 'following') && (
            <div>
              <h3 className="font-['Amatic_SC'] text-4xl font-bold text-zk-text mb-4 uppercase">
                {activeTab === 'followers' ? 'Followers' : 'Following'}
              </h3>
              
              {profile.friends?.length === 0 ? (
                <div className="p-10 bg-zk-panel-bg/50 border-2 border-dashed border-zk-border/35 rounded-2xl text-center">
                  <p className="font-['Outfit'] font-bold text-zk-text/55">
                    No {activeTab === 'followers' ? 'followers' : 'following'} to show.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {profile.friends?.map((friend) => (
                    <div
                      key={friend.clerk_id}
                      className="bg-zk-panel-bg border-[3px] border-zk-border rounded-2xl p-4 flex items-center justify-between !shadow-none"
                    >
                      <Link href={`/u/${friend.username || friend.clerk_id}`} className="flex items-center gap-3 cursor-pointer group">
                        <img
                          src={friend.avatar_url || '/images/avatars/default.png'}
                          alt={friend.username}
                          className="w-12 h-12 rounded-full border-2 border-zk-border object-cover group-hover:scale-105 transition-transform"
                        />
                        <div>
                          <p className="font-['Outfit'] font-black text-zk-text group-hover:text-zk-blue transition-colors">
                            {friend.first_name || friend.username}
                          </p>
                          <p className="font-['Outfit'] text-xs text-zk-text/60">
                            @{friend.username}
                          </p>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </section>
      </main>
    </div>
  );
}
