import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import {
  Sun,
  Moon,
  Menu,
  X,
  PlusCircle,
  Search,
  Inbox,
  ArrowLeftRight,
  LogOut,
  ShieldCheck,
  HelpCircle,
  User,
  Sparkles,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import { MOCK_USERS } from '../../api/mockData';

export const Navbar = () => {
  const { user, login, logout, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userSwitcherOpen, setUserSwitcherOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSwitchUser = (targetUser) => {
    login(targetUser, 'mock_token_' + Date.now());
    setUserSwitcherOpen(false);
    toast.success(`Switched active profile to ${targetUser.name}!`);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-paper-light/95 dark:bg-paper-dark/95 backdrop-blur-md border-b border-paper-sand dark:border-paper-sandDark transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-marigold flex items-center justify-center font-bold text-ink text-lg font-serif shadow-sm transition-transform group-hover:-rotate-3">
              B
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-black text-lg tracking-tight text-ink dark:text-ink-dark leading-none">
                BBB
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-terracotta dark:text-terracotta-light">
                Borrow Before Buy
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/search"
              className={`text-sm font-medium transition-colors ${
                isActive('/search') ? 'text-terracotta font-semibold' : 'text-ink-muted dark:text-ink-darkMuted hover:text-ink dark:hover:text-ink-dark'
              }`}
            >
              Browse Items
            </Link>
            <Link
              to="/lend"
              className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/lend') || isActive('/post-item') ? 'text-terracotta font-semibold' : 'text-ink-muted dark:text-ink-darkMuted hover:text-ink dark:hover:text-ink-dark'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5 text-terracotta" />
              Lend Gear
            </Link>
            <Link
              to="/how-it-works"
              className={`text-sm font-medium transition-colors ${
                isActive('/how-it-works') ? 'text-terracotta font-semibold' : 'text-ink-muted dark:text-ink-darkMuted hover:text-ink dark:hover:text-ink-dark'
              }`}
            >
              How it works
            </Link>
            <Link
              to="/safety"
              className={`text-sm font-medium transition-colors ${
                isActive('/safety') ? 'text-terracotta font-semibold' : 'text-ink-muted dark:text-ink-darkMuted hover:text-ink dark:hover:text-ink-dark'
              }`}
            >
              Safety
            </Link>
            <Link
              to="/leaderboard"
              className={`text-sm font-medium transition-colors ${
                isActive('/leaderboard') ? 'text-terracotta font-semibold' : 'text-ink-muted dark:text-ink-darkMuted hover:text-ink dark:hover:text-ink-dark'
              }`}
            >
              Leaderboard
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/dashboard') ? 'text-terracotta font-semibold' : 'text-ink-muted dark:text-ink-darkMuted hover:text-ink dark:hover:text-ink-dark'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/requests"
                  className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/requests') ? 'text-terracotta font-semibold' : 'text-ink-muted dark:text-ink-darkMuted hover:text-ink dark:hover:text-ink-dark'
                  }`}
                >
                  <Inbox className="w-4 h-4" />
                  Requests
                </Link>
                <Link
                  to="/transactions"
                  className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/transactions') ? 'text-terracotta font-semibold' : 'text-ink-muted dark:text-ink-darkMuted hover:text-ink dark:hover:text-ink-dark'
                  }`}
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  Exchanges
                </Link>
              </>
            )}
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-ink-muted dark:text-ink-darkMuted hover:text-ink dark:hover:text-ink-dark hover:bg-paper-sand/40 dark:hover:bg-paper-sandDark/40 transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-marigold" /> : <Moon className="w-4 h-4" />}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-3 relative">
                {(user?.role === 'ADMIN' || user?.role === 'MODERATOR') && (
                  <Link
                    to="/admin"
                    className="text-xs font-bold px-2.5 py-1 rounded-lg bg-terracotta/15 text-terracotta border border-terracotta/30 flex items-center gap-1.5 hover:bg-terracotta hover:text-white transition-all shadow-xs"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Admin
                  </Link>
                )}

                <Link to="/lend">
                  <Button variant="primary" size="sm" className="gap-1.5 shadow-sm font-bold">
                    <PlusCircle className="w-4 h-4" />
                    Lend an Item
                  </Button>
                </Link>

                {/* Profile Pill with Switcher Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserSwitcherOpen(!userSwitcherOpen)}
                    className="flex items-center gap-2 pl-2 border-l border-paper-sand dark:border-paper-sandDark hover:opacity-85 transition-opacity cursor-pointer text-left"
                    title="Click to switch student profile or view trust score"
                  >
                    <Avatar name={user.name} size="sm" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-ink dark:text-ink-dark leading-tight flex items-center gap-1">
                        {user.name.split(' ')[0]}
                        <span className="text-[10px] text-sage font-bold">⭐ {user.lenderScore || 95}</span>
                      </span>
                      <span className="text-[10px] text-ink-muted hover:text-terracotta font-semibold">
                        Switch Profile ▾
                      </span>
                    </div>
                  </button>

                  {/* Quick Profile Switcher Dropdown */}
                  {userSwitcherOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-paper-cardDark border border-paper-sand dark:border-paper-sandDark shadow-paperHover py-2 z-50">
                      <div className="px-3 py-1.5 border-b border-paper-sand dark:border-paper-sandDark text-[11px] font-bold text-ink-muted uppercase">
                        Switch Student Profile
                      </div>
                      {MOCK_USERS.slice(0, 3).map((u) => (
                        <button
                          key={u.id}
                          onClick={() => handleSwitchUser(u)}
                          className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-paper-sand/20 dark:hover:bg-paper-sandDark/20 cursor-pointer ${
                            user.collegeEmail === u.collegeEmail ? 'font-bold text-terracotta' : 'text-ink dark:text-ink-dark'
                          }`}
                        >
                          <span>{u.name}</span>
                          <span className="text-[10px] text-sage font-bold">⭐ {u.lenderScore}</span>
                        </button>
                      ))}
                      <div className="pt-1 mt-1 border-t border-paper-sand dark:border-paper-sandDark">
                        <Link
                          to="/profile"
                          onClick={() => setUserSwitcherOpen(false)}
                          className="block px-3 py-1.5 text-xs text-ink-muted hover:text-ink"
                        >
                          View Full Profile
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="p-1.5 ml-1 text-ink-muted dark:text-ink-darkMuted hover:text-brick transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/lend">
                  <Button variant="secondary" size="sm" className="gap-1.5 font-bold">
                    <PlusCircle className="w-3.5 h-3.5 text-terracotta" />
                    Lend Gear
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="accent" size="sm" className="font-bold">
                    Get started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-ink-muted dark:text-ink-darkMuted"
            >
              {isDark ? <Sun className="w-4 h-4 text-marigold" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-ink dark:text-ink-dark"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-paper-sand dark:border-paper-sandDark bg-white dark:bg-paper-cardDark px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/search"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-ink dark:text-ink-dark hover:bg-paper-light dark:hover:bg-paper-dark"
          >
            Browse Items
          </Link>
          <Link
            to="/lend"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-bold text-terracotta bg-terracotta/10"
          >
            + Lend Gear to Batch
          </Link>
          <Link
            to="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-ink dark:text-ink-dark hover:bg-paper-light dark:hover:bg-paper-dark"
          >
            How it works
          </Link>
          <Link
            to="/safety"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-ink dark:text-ink-dark hover:bg-paper-light dark:hover:bg-paper-dark"
          >
            Safety
          </Link>
          <Link
            to="/leaderboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-ink dark:text-ink-dark hover:bg-paper-light dark:hover:bg-paper-dark"
          >
            Leaderboard
          </Link>

          {isAuthenticated ? (
            <div className="pt-3 border-t border-paper-sand dark:border-paper-sandDark space-y-2">
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-ink dark:text-ink-dark"
              >
                Student Dashboard
              </Link>
              <Link
                to="/requests"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-ink dark:text-ink-dark"
              >
                Requests Inbox
              </Link>
              <Link
                to="/transactions"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-ink dark:text-ink-dark"
              >
                Borrowing & Lending Exchanges
              </Link>
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full gap-2 text-brick"
              >
                <LogOut className="w-4 h-4" />
                Log out ({user.name})
              </Button>
            </div>
          ) : (
            <div className="pt-3 border-t border-paper-sand dark:border-paper-sandDark flex gap-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1">
                <Button variant="secondary" size="md" className="w-full">
                  Log in
                </Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="flex-1">
                <Button variant="accent" size="md" className="w-full">
                  Get started
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
