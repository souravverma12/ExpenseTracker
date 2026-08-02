import React from 'react';
import { useApp } from '../../context/AppContext';
import type { ActiveTab } from '../../types';
import { 
  LayoutDashboard, 
  Receipt, 
  Wallet, 
  Calendar, 
  Tags, 
  Settings, 
  Plus, 
  TrendingUp,
  LogIn,
  LogOut,
  CloudLightning,
  Database
} from 'lucide-react';

interface SidebarProps {
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpenMobile, setIsOpenMobile }) => {
  const { 
    activeTab, 
    setActiveTab, 
    setIsAddModalOpen, 
    setEditingTransaction,
    user,
    signInWithGoogle,
    logout,
    isFirebaseConfigured
  } = useApp();

  const navItems: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'budgets', label: 'Budgets', icon: Wallet },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'categories', label: 'Categories', icon: Tags },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsOpenMobile(false);
  };

  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setIsAddModalOpen(true);
    setIsOpenMobile(false);
  };

  return (
    <>
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 glass-card border-r border-slate-800/60 flex flex-col justify-between p-4 transition-transform duration-300 md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo Brand */}
          <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-slate-800/40">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-100 tracking-tight leading-none">ApexFinance</h1>
              <span className="text-[11px] font-medium text-indigo-400 tracking-wider uppercase">Personal Tracker</span>
            </div>
          </div>

          {/* Quick Add Button */}
          <button
            onClick={handleOpenAddModal}
            className="w-full mb-6 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Authentication & Storage Panel */}
        <div className="space-y-3">
          {/* User Authentication Display */}
          {user ? (
            <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User profile'}
                    className="w-9 h-9 rounded-full object-cover border border-slate-700/60"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-sm shrink-0">
                    {(user.displayName || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-100 truncate">
                    {user.displayName || 'User'}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {user.email}
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-850 transition-colors shrink-0"
                title="Log Out Profile"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : isFirebaseConfigured ? (
            <button
              onClick={signInWithGoogle}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <LogIn className="w-3.5 h-3.5 text-indigo-400" />
              <span>Google Sign-In</span>
            </button>
          ) : (
            <div className="py-2.5 px-3 rounded-xl border border-dashed border-slate-800 text-center text-[10px] text-slate-500 font-semibold leading-relaxed">
              🔐 Cloud features disabled (Setup .env details)
            </div>
          )}

          {/* Database/Storage Status Indicator */}
          <div className="p-3 rounded-xl bg-slate-900/30 border border-slate-800/40">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-medium">Data Storage</span>
              <span className="font-semibold flex items-center gap-1">
                {user ? (
                  <>
                    <CloudLightning className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-indigo-400">Cloud Firestore</span>
                  </>
                ) : (
                  <>
                    <Database className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">IndexedDB (Local)</span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
