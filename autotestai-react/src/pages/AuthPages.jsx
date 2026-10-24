import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, LockKeyhole, UserRound } from 'lucide-react';
import { AuthLayout, Button, ErrorBanner } from '../components/Ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { errorMessage } from '../lib/api.js';

export function LoginPage() {
  const { user, login, loading } = useAuth(); const navigate = useNavigate();
  const [email,setEmail] = useState(''); const [password,setPassword] = useState(''); const [show,setShow] = useState(false); const [error,setError] = useState('');
  if (user) return <Navigate to="/" replace/>;
  async function submit(e) { e.preventDefault(); setError(''); try { await login({email:email.trim(),password}); navigate('/',{replace:true}); } catch(err) { setError(errorMessage(err)); } }
  return <AuthLayout subtitle="Welcome back"><form className="auth-form" onSubmit={submit}>{error && <ErrorBanner>{error}</ErrorBanner>}<label>Email address</label><div className="input-wrap"><Mail size={17}/><input type="email" autoComplete="email" placeholder="you@company.com" value={email} onChange={e=>setEmail(e.target.value)} required/></div><div className="field-row"><label>Password</label><span className="field-hint">Use your account password</span></div><div className="input-wrap"><LockKeyhole size={17}/><input type={show?'text':'password'} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={1}/><button className="input-action" type="button" onClick={()=>setShow(!show)} aria-label="Toggle password visibility">{show?<EyeOff size={17}/>:<Eye size={17}/>}</button></div><Button className="auth-submit" type="submit" loading={loading}>Sign in <span>→</span></Button><p className="auth-switch">New to AutoTestAI? <Link to="/register">Create an account</Link></p></form></AuthLayout>;
}
export function RegisterPage() {
  const { user, register, loading } = useAuth(); const navigate = useNavigate();
  const [name,setName] = useState(''); const [email,setEmail] = useState(''); const [password,setPassword] = useState(''); const [show,setShow] = useState(false); const [error,setError] = useState(''); const [success,setSuccess] = useState('');
  if (user) return <Navigate to="/" replace/>;
  async function submit(e) { e.preventDefault(); setError(''); setSuccess(''); try { await register({name:name.trim(),email:email.trim(),password}); setSuccess('Account created. You can now sign in.'); setTimeout(()=>navigate('/login'),900); } catch(err) { setError(errorMessage(err)); } }
  return <AuthLayout subtitle="Create your account"><form className="auth-form" onSubmit={submit}>{error && <ErrorBanner>{error}</ErrorBanner>}{success && <div className="success-banner">{success}</div>}<label>Full name</label><div className="input-wrap"><UserRound size={17}/><input autoComplete="name" placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} required minLength={2}/></div><label>Email address</label><div className="input-wrap"><Mail size={17}/><input type="email" autoComplete="email" placeholder="you@company.com" value={email} onChange={e=>setEmail(e.target.value)} required/></div><label>Password</label><div className="input-wrap"><LockKeyhole size={17}/><input type={show?'text':'password'} autoComplete="new-password" placeholder="Create a password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={8}/><button className="input-action" type="button" onClick={()=>setShow(!show)} aria-label="Toggle password visibility">{show?<EyeOff size={17}/>:<Eye size={17}/>}</button></div><p className="password-note">Use at least 8 characters.</p><Button className="auth-submit" type="submit" loading={loading}>Create account <span>→</span></Button><p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p></form></AuthLayout>;
}
