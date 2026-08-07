"use client";

import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { Search, UserPlus, Users, Inbox, UserMinus, Check, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Dashboard/Sidebar';
import WorkspaceShell from '@/components/layout/WorkspaceShell';
import api from '@/services/api';
import { useToastStore } from '@/store/useToastStore';
import { useAuthStore } from '@/store/useAuthStore';

const TABS = [
  { id: 'friends', label: 'Friends', icon: Users },
  { id: 'requests', label: 'Requests', icon: Inbox },
  { id: 'add', label: 'Add Friend', icon: UserPlus },
];

export default function SocialPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const isJwtReady = useAuthStore((s) => s.isJwtReady);
  const { showToast } = useToastStore();

  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  
  const [activeTab, setActiveTab] = useState(tabParam || 'friends');

  useEffect(() => {
    if (tabParam && ['friends', 'requests', 'add'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);
  const [friends, setFriends] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  const fetchFriends = useCallback(async () => {
    try {
      const data = await api.get('/api/social/friends');
      setFriends(data.friends || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load friends list.', 'error');
    }
  }, [showToast]);

  const fetchRequests = useCallback(async () => {
    try {
      const data = await api.get('/api/social/requests');
      setIncomingRequests(data.incoming || []);
      setOutgoingRequests(data.outgoing || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load friend requests.', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !isJwtReady) return;
    
    const loadData = async () => {
      setIsFetchingData(true);
      if (activeTab === 'friends') {
        await fetchFriends();
      } else if (activeTab === 'requests') {
        await fetchRequests();
      }
      setIsFetchingData(false);
    };

    loadData();
  }, [activeTab, isLoaded, isSignedIn, isJwtReady, fetchFriends, fetchRequests]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const data = await api.get(`/api/social/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchResults(data.users || []);
    } catch (err) {
      console.error(err);
      showToast('Search failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (targetClerkId) => {
    setActionLoading((prev) => ({ ...prev, [targetClerkId]: true }));
    try {
      await api.post('/api/social/request', { targetClerkId });
      showToast('Friend request sent!', 'success');
      // Update search results state locally
      setSearchResults((prev) =>
        prev.map((u) => (u.clerk_id === targetClerkId ? { ...u, relationship: 'sent_pending' } : u))
      );
    } catch (err) {
      showToast(err.message || 'Failed to send request.', 'error');
    } finally {
      setActionLoading((prev) => ({ ...prev, [targetClerkId]: false }));
    }
  };

  const handleAcceptRequest = async (senderClerkId) => {
    setActionLoading((prev) => ({ ...prev, [senderClerkId]: true }));
    try {
      await api.post('/api/social/accept', { senderClerkId });
      showToast('Friend request accepted!', 'success');
      fetchRequests();
    } catch (err) {
      showToast(err.message || 'Failed to accept request.', 'error');
    } finally {
      setActionLoading((prev) => ({ ...prev, [senderClerkId]: false }));
    }
  };

  const handleRejectRequest = async (senderClerkId) => {
    setActionLoading((prev) => ({ ...prev, [senderClerkId]: true }));
    try {
      await api.post('/api/social/reject', { senderClerkId });
      showToast('Request declined.', 'info');
      fetchRequests();
    } catch (err) {
      showToast(err.message || 'Failed to decline request.', 'error');
    } finally {
      setActionLoading((prev) => ({ ...prev, [senderClerkId]: false }));
    }
  };

  const handleRemoveFriend = async (friendClerkId) => {
    if (!confirm('Are you sure you want to remove this friend?')) return;
    setActionLoading((prev) => ({ ...prev, [friendClerkId]: true }));
    try {
      await api.delete('/api/social/remove', { friendClerkId });
      showToast('Friend removed.', 'info');
      fetchFriends();
    } catch (err) {
      showToast(err.message || 'Failed to remove friend.', 'error');
    } finally {
      setActionLoading((prev) => ({ ...prev, [friendClerkId]: false }));
    }
  };

  if (!isLoaded || !isJwtReady) {
    return (
      <div className="min-h-[calc(100vh-76px)] flex items-center justify-center">
        <Loader2 className="animate-spin text-zk-text" size={32} />
      </div>
    );
  }

  return (
    <WorkspaceShell contentClassName="social-shell">
      <section className="flex flex-col gap-6 md:gap-8">
        <div className="border-b-[3px] border-zk-border pb-4">
          <h2 className="font-['Amatic_SC'] text-5xl font-black text-zk-text uppercase tracking-tight">
            Zinko Social Club
          </h2>
          <p className="text-sm font-bold text-zk-text/60 font-['Outfit'] mt-1">
            Connect with friends, share knowledge, and learn together.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-3">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2 border-[3px] border-zk-border rounded-xl font-['Amatic_SC'] text-2xl font-bold transition-colors !shadow-none ${
                  isActive
                    ? 'bg-[#5D3FD3] text-white'
                    : 'bg-zk-panel-bg text-zk-text hover:bg-zk-bg/30'
                }`}
              >
                <Icon size={20} strokeWidth={3} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="w-full">
          {activeTab === 'friends' && (
            <div className="flex flex-col gap-4">
              {isFetchingData ? (
                <div className="flex justify-center p-10">
                  <Loader2 className="animate-spin text-zk-text" size={32} />
                </div>
              ) : friends.length === 0 ? (
                <div className="zk-panel !shadow-none p-10 text-center bg-zk-panel-bg border-[3px] border-zk-border rounded-2xl">
                  <p className="text-lg font-bold text-zk-text/70 font-['Outfit']">
                    Your friends list is currently empty. Go to the "Add Friend" tab to start adding!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {friends.map((friend) => (
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
                          <p className="font-['Outfit'] font-black text-zk-text text-lg group-hover:text-zk-blue transition-colors">
                            {friend.first_name || friend.username}
                          </p>
                          <p className="font-['Outfit'] text-sm text-zk-text/60">
                            @{friend.username}
                          </p>
                        </div>
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleRemoveFriend(friend.clerk_id)}
                        disabled={actionLoading[friend.clerk_id]}
                        className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-xl border-2 border-zk-border transition-colors"
                      >
                        {actionLoading[friend.clerk_id] ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : (
                          <UserMinus size={18} />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="flex flex-col gap-6">
              {isFetchingData ? (
                <div className="flex justify-center p-10">
                  <Loader2 className="animate-spin text-zk-text" size={32} />
                </div>
              ) : (
                <>
                  {/* Incoming requests */}
                  <div>
                    <h3 className="font-['Amatic_SC'] text-3xl font-bold text-zk-text mb-3">
                      Incoming Requests ({incomingRequests.length})
                    </h3>
                    {incomingRequests.length === 0 ? (
                      <div className="p-6 bg-zk-panel-bg/50 border-2 border-dashed border-zk-border/35 rounded-2xl text-center">
                        <p className="font-['Outfit'] text-zk-text/55">No incoming friend requests.</p>
                      </div>
                    ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {incomingRequests.map((req) => (
                      <div
                        key={req.clerk_id}
                        className="bg-zk-panel-bg border-[3px] border-zk-border rounded-2xl p-4 flex items-center justify-between !shadow-none"
                      >
                        <Link href={`/u/${req.username || req.clerk_id}`} className="flex items-center gap-3 cursor-pointer group">
                          <img
                            src={req.avatar_url || '/images/avatars/default.png'}
                            alt={req.username}
                            className="w-12 h-12 rounded-full border-2 border-zk-border object-cover group-hover:scale-105 transition-transform"
                          />
                          <div>
                            <p className="font-['Outfit'] font-black text-zk-text group-hover:text-zk-blue transition-colors">
                              {req.first_name || req.username}
                            </p>
                            <p className="font-['Outfit'] text-xs text-zk-text/60">
                              @{req.username}
                            </p>
                          </div>
                        </Link>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleAcceptRequest(req.clerk_id)}
                            disabled={actionLoading[req.clerk_id]}
                            className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-xl border-2 border-zk-border transition-colors"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectRequest(req.clerk_id)}
                            disabled={actionLoading[req.clerk_id]}
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-xl border-2 border-zk-border transition-colors"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Outgoing requests */}
              <div>
                <h3 className="font-['Amatic_SC'] text-3xl font-bold text-zk-text mb-3">
                  Sent Requests ({outgoingRequests.length})
                </h3>
                {outgoingRequests.length === 0 ? (
                  <div className="p-6 bg-zk-panel-bg/50 border-2 border-dashed border-zk-border/35 rounded-2xl text-center">
                    <p className="font-['Outfit'] text-zk-text/55">No sent friend requests.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {outgoingRequests.map((req) => (
                      <div
                        key={req.clerk_id}
                        className="bg-zk-panel-bg border-[3px] border-zk-border rounded-2xl p-4 flex items-center justify-between opacity-80"
                      >
                        <Link href={`/u/${req.username || req.clerk_id}`} className="flex items-center gap-3 cursor-pointer group">
                          <img
                            src={req.avatar_url || '/images/avatars/default.png'}
                            alt={req.username}
                            className="w-12 h-12 rounded-full border-2 border-zk-border object-cover group-hover:scale-105 transition-transform"
                          />
                          <div>
                            <p className="font-['Outfit'] font-black text-zk-text group-hover:text-zk-blue transition-colors">
                              {req.first_name || req.username}
                            </p>
                            <p className="font-['Outfit'] text-xs text-zk-text/60">
                              @{req.username}
                            </p>
                          </div>
                        </Link>
                        <span className="font-['Outfit'] text-xs font-bold bg-zk-bg text-zk-text px-2 py-1 rounded border border-zk-border">
                          Pending
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'add' && (
            <div className="flex flex-col gap-6">
              <form onSubmit={handleSearch} className="flex gap-3 max-w-lg">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by username..."
                    className="w-full bg-zk-panel-bg border-[3px] border-zk-border rounded-xl p-3 pl-10 font-['Outfit'] text-sm"
                  />
                  <Search className="absolute left-3 top-3.5 text-zk-text/50" size={18} />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-zk-purple text-white px-6 rounded-xl border-[3px] border-zk-border font-['Amatic_SC'] text-2xl font-bold hover:bg-zk-blue transition-colors"
                >
                  Search
                </button>
              </form>

              {/* Search Results */}
              <div className="flex flex-col gap-4">
                {loading ? (
                  <div className="flex justify-center p-6">
                    <Loader2 className="animate-spin text-zk-text" size={24} />
                  </div>
                ) : searchResults.length === 0 && searchQuery ? (
                  <p className="font-['Outfit'] text-zk-text/60">No users found matching that username.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {searchResults.map((result) => (
                      <div
                        key={result.clerk_id}
                        className="bg-zk-panel-bg border-[3px] border-zk-border rounded-2xl p-4 flex items-center justify-between !shadow-none"
                      >
                        <Link href={`/u/${result.username || result.clerk_id}`} className="flex items-center gap-3 cursor-pointer group">
                          <img
                            src={result.avatar_url || '/images/avatars/default.png'}
                            alt={result.username}
                            className="w-12 h-12 rounded-full border-2 border-zk-border object-cover group-hover:scale-105 transition-transform"
                          />
                          <div>
                            <p className="font-['Outfit'] font-black text-zk-text group-hover:text-zk-blue transition-colors">
                              {result.first_name || result.username}
                            </p>
                            <p className="font-['Outfit'] text-xs text-zk-text/60">
                              @{result.username}
                            </p>
                          </div>
                        </Link>

                        <div>
                          {result.relationship === 'none' && (
                            <button
                              type="button"
                              onClick={() => handleSendRequest(result.clerk_id)}
                              disabled={actionLoading[result.clerk_id]}
                              className="bg-zk-purple hover:bg-zk-blue text-white px-3 py-1.5 rounded-xl border-2 border-zk-border font-['Outfit'] text-xs font-bold transition-all"
                            >
                              Add Friend
                            </button>
                          )}
                          {result.relationship === 'sent_pending' && (
                            <span className="font-['Outfit'] text-xs font-bold bg-zk-bg text-zk-text px-2 py-1 rounded border border-zk-border">
                              Sent
                            </span>
                          )}
                          {result.relationship === 'received_pending' && (
                            <span className="font-['Outfit'] text-xs font-bold bg-zk-blue text-white px-2 py-1 rounded border border-zk-border">
                              Review Request
                            </span>
                          )}
                          {result.relationship === 'friends' && (
                            <span className="font-['Outfit'] text-xs font-bold bg-green-500 text-white px-2 py-1 rounded border border-zk-border">
                              Friends
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </WorkspaceShell>
  );
}
