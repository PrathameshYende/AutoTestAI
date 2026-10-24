import { LoaderCircle, Search, Bell, Sun, Moon, Menu, X, ChevronDown, LogOut, UserRound, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

export function Button({ children, variant='primary', className='', loading=false, ...props }) {
  return <button className={`btn btn-${variant} ${className}`} disabled={loading || props.disabled} {...props}>{loading && <LoaderCircle size={16} className="animate-spin" />}{children}</button>;
}
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return <button className="icon-btn" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} aria-label="Toggle theme">{theme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}</button>;
}
const navItems = [
  { label:'Overview', to:'/', icon:'◫' }, { label:'Projects', to:'/projects', icon:'▦' },
  { label:'Video analysis', to:'/analysis', icon:'▷' }, { label:'Test cases', to:'/test-cases', icon:'☷' }, { label:'Automation code', to:'/automation', icon:'</>' },
];
export function AppShell({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false); const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuth(); const navigate = useNavigate();
  const name = user?.name || user?.full_name || user?.email?.split('@')[0] || 'Workspace user';
  function signOut() { logout(); navigate('/login'); }
  return <div className="app-shell">
    {mobileOpen && <button className="mobile-backdrop" onClick={() => setMobileOpen(false)} aria-label="Close navigation"/>}
    <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
      <Link to="/" className="brand"><span className="brand-mark"><Sparkles size={20}/></span><span>AutoTest<span className="brand-ai">AI</span><small>INTELLIGENT QA PLATFORM</small></span></Link>
      <div className="workspace-label">WORKSPACE <ChevronDown size={13}/></div>
      <nav className="side-nav">{navItems.map((item) => <NavLink key={item.to} to={item.to} end={item.to==='/'} onClick={() => setMobileOpen(false)} className={({isActive}) => `nav-item ${isActive ? 'nav-active' : ''}`}><span className="nav-glyph">{item.icon}</span>{item.label}{item.label==='Projects' && <span className="nav-soon">API</span>}</NavLink>)}</nav>
      <div className="sidebar-bottom"><div className="plan-card"><span className="plan-icon"><Sparkles size={16}/></span><strong>AI-powered testing</strong><p>Turn screen recordings into actionable tests.</p><Link to="/analysis" onClick={() => setMobileOpen(false)}>Explore analysis <span>↗</span></Link></div><div className="sidebar-user"><div className="avatar">{name.slice(0,1).toUpperCase()}</div><div className="user-copy"><strong>{name}</strong><span>{user?.email || 'Signed in'}</span></div><button className="user-logout" title="Sign out" onClick={signOut}><LogOut size={16}/></button></div></div>
    </aside>
    <div className="main-area"><header className="topbar"><div className="topbar-left"><button className="icon-btn mobile-menu" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">{mobileOpen ? <X size={19}/> : <Menu size={19}/>}</button><div className="breadcrumb"><span>Workspace</span><span className="crumb-slash">/</span><strong>{navItems.find(n => n.to === window.location.pathname)?.label || (window.location.pathname === '/projects' ? 'Projects' : 'Overview')}</strong></div></div><div className="topbar-right"><div className="status-pill"><span className="status-dot"/>API connected</div><button className="icon-btn" aria-label="Search" onClick={() => navigate('/projects')}><Search size={17}/></button><button className="icon-btn" aria-label="Notifications" title="Notifications"><Bell size={17}/></button><ThemeToggle/><div className="profile-wrap"><button className="profile-button" onClick={() => setProfileOpen(!profileOpen)}><span className="avatar avatar-small">{name.slice(0,1).toUpperCase()}</span><ChevronDown size={14}/></button>{profileOpen && <div className="profile-menu"><div className="profile-menu-info"><strong>{name}</strong><span>{user?.email}</span></div><button onClick={signOut}><LogOut size={15}/> Sign out</button></div>}</div></div></header><main className="page-content">{children}</main><footer className="footer"><span>AutoTestAI <span className="footer-dot">•</span> Intelligent test automation</span><span>Built for better software quality</span></footer></div>
  </div>;
}
export function PageHeading({ eyebrow, title, description, action }) { return <div className="page-heading"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{action && <div className="heading-action">{action}</div>}</div>; }
export function StatCard({ label, value, note, icon: Icon, tone='violet' }) { return <div className="stat-card"><div className="stat-top"><span>{label}</span><span className={`stat-icon stat-${tone}`}>{Icon && <Icon size={18}/>}</span></div><div className="stat-value">{value ?? '—'}</div><div className="stat-note">{note}</div></div>; }
export function LoadingBlock({ label='Loading...' }) { return <div className="loading-block"><LoaderCircle className="animate-spin" size={22}/><span>{label}</span></div>; }
export function EmptyState({ title, description, action }) { return <div className="empty-state"><div className="empty-symbol"><Sparkles size={22}/></div><h3>{title}</h3><p>{description}</p>{action}</div>; }
export function ErrorBanner({ children }) { return <div className="error-banner">{children}</div>; }
export function AuthLayout({ children, subtitle }) { const { theme, toggleTheme } = useTheme(); return <div className="auth-layout"><div className="auth-decoration auth-decoration-one"/><div className="auth-decoration auth-decoration-two"/><header className="auth-header"><Link to="/login" className="brand"><span className="brand-mark"><Sparkles size={20}/></span><span>AutoTest<span className="brand-ai">AI</span><small>INTELLIGENT QA PLATFORM</small></span></Link><button className="icon-btn" onClick={toggleTheme} aria-label="Toggle theme">{theme==='dark' ? <Sun size={18}/> : <Moon size={18}/>}</button></header><div className="auth-main"><div className="auth-intro"><div className="auth-kicker"><span className="status-dot"/> NEXT-GENERATION TEST AUTOMATION</div><h1>Ship with confidence.<br/><span>Test intelligently.</span></h1><p>Turn your testing workflow into a smarter, faster quality engine.</p><div className="auth-feature-list"><span>✓ AI-assisted test workflows</span><span>✓ Clear execution insights</span><span>✓ One place for your QA projects</span></div></div><div className="auth-card"><div className="auth-card-heading"><div className="auth-card-icon"><Sparkles size={19}/></div><h2>{subtitle}</h2><p>Access your AutoTestAI workspace.</p></div>{children}</div></div><div className="auth-footer">© {new Date().getFullYear()} AutoTestAI <span>•</span> Intelligent software quality</div></div>; }
