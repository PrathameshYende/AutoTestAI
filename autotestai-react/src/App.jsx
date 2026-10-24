import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { AppShell, LoadingBlock } from './components/Ui.jsx';
import { LoginPage, RegisterPage } from './pages/AuthPages.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Projects from './pages/Projects.jsx';
import { AnalysisPage } from './pages/Placeholder.jsx';
import TestCases from './pages/TestCases.jsx';
import Automation from './pages/Automation.jsx';
function Protected({ children }) { const { user } = useAuth(); const location = useLocation(); if (!localStorage.getItem('autotestai_token') && !user) return <Navigate to="/login" state={{from:location}} replace/>; return <AppShell>{children}</AppShell>; }
export default function App() { return <Routes><Route path="/login" element={<LoginPage/>}/><Route path="/register" element={<RegisterPage/>}/><Route path="/" element={<Protected><Dashboard/></Protected>}/><Route path="/projects" element={<Protected><Projects/></Protected>}/><Route path="/analysis" element={<Protected><AnalysisPage/></Protected>}/><Route path="/test-cases" element={<Protected><TestCases/></Protected>}/><Route path="/automation" element={<Protected><Automation/></Protected>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes>; }
