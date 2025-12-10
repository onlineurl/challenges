import { useState, useEffect } from 'react';
import { useDataService } from '../../hooks/useDataService';
import { supabase } from '../../supabaseClient';
import type { Session } from '@supabase/supabase-js';
import { ShieldCheck, LogOut, Copy, RefreshCw, Key, ArrowLeft, ShieldAlert } from 'lucide-react';
import AuthView from '../host/AuthView';
import { Spinner } from '../common/Spinner';

interface AdminDashboardProps {
  onBack: () => void;
}

interface AdminAccessCode {
  id: string;
  code: string;
  created_at: string;
  event_title?: string;
  event_status?: string;
  host_email?: string;
}

// ⚠️ IMPORTANT: Add your email here to allow access to the UI.
const ALLOWED_ADMIN_EMAILS = [
    'apixelarte@gmail.com', // CAMBIA ESTO POR TU EMAIL REAL
    'admin@atrparty.com'
];

export default function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  
  const dataService = useDataService();
  const [codes, setCodes] = useState<AdminAccessCode[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [newCodePrefix, setNewCodePrefix] = useState('PRO');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      checkAdminStatus(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      checkAdminStatus(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = (session: Session | null) => {
    // In Mock mode, we bypass email check for testing
    if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        setIsAdmin(true);
        setIsLoadingAuth(false);
        return;
    }

    // Strict Check: User must be logged in AND their email must be in the whitelist
    if (session?.user?.email && ALLOWED_ADMIN_EMAILS.includes(session.user.email)) {
        setIsAdmin(true); 
    } else {
        setIsAdmin(false);
    }
    setIsLoadingAuth(false);
  };

  const fetchCodes = async () => {
    setIsLoadingData(true);
    try {
        const data = await dataService.getAdminAccessCodes();
        setCodes(data);
    } catch (error) {
        console.error(error);
        alert("Error cargando códigos. Verifica que tu usuario tenga permisos de Super Admin en la base de datos.");
    } finally {
        setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
        fetchCodes();
    }
  }, [isAdmin]);

  const handleGenerateCode = async () => {
    try {
        const code = await dataService.generateAccessCode(newCodePrefix.toUpperCase());
        setGeneratedCode(code);
        fetchCodes();
    } catch (error) {
        alert("Error generando código. Permisos insuficientes.");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Copiado: ${text}`);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // Only go back if fully signing out from a non-admin state or voluntarily
    if (!session) onBack(); 
  };

  if (isLoadingAuth) return <div className="flex justify-center p-10 min-h-screen bg-slate-800"><Spinner className="text-white border-white" /></div>;

  // 1. Force Login if not authenticated
  if (!session) {
    return (
        <div className="min-h-screen bg-slate-800 flex flex-col items-center justify-center p-4">
            <button onClick={onBack} className="absolute top-4 left-4 text-white flex items-center gap-2 hover:underline">
                <ArrowLeft className="w-4 h-4"/> Volver
            </button>
            <div className="bg-white rounded-lg p-2 w-full max-w-md">
                <div className="text-center pt-4">
                    <ShieldCheck className="w-12 h-12 text-indigo-600 mx-auto" />
                    <h2 className="text-xl font-bold mt-2">Acceso Restringido</h2>
                    <p className="text-sm text-slate-500">Super Admin Login</p>
                </div>
                <AuthView />
            </div>
        </div>
    );
  }

  // 2. Access Denied if logged in but not whitelisted
  if (session && !isAdmin) {
      return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white text-center">
             <ShieldAlert className="w-20 h-20 text-red-500 mb-6" />
             <h2 className="text-3xl font-bold mb-2">Acceso Denegado</h2>
             <p className="text-slate-400 mb-8 max-w-md">
                El usuario <b>{session.user.email}</b> no tiene permisos de Super Administrador para acceder a este panel.
             </p>
             <div className="flex gap-4">
                <button onClick={onBack} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition">
                    Volver al Inicio
                </button>
                <button onClick={handleSignOut} className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition">
                    Cerrar Sesión
                </button>
             </div>
        </div>
      );
  }

  // 3. Admin Dashboard UI
  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="flex items-center gap-3">
                <div className="bg-indigo-600 p-2 rounded-lg">
                    <ShieldCheck className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Super Admin</h1>
                    <p className="text-sm text-slate-500">Gestión de Licencias ATR</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <p className="text-sm text-slate-600 mr-2 hidden md:block">Logueado como: <b>{session.user.email}</b></p>
                <button onClick={fetchCodes} className="p-2 bg-white rounded-full text-slate-600 hover:text-indigo-600 shadow-sm"><RefreshCw className="w-5 h-5"/></button>
                <button onClick={handleSignOut} className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition">
                    <LogOut className="w-4 h-4"/> Salir
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Generate Section */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-md border border-indigo-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Key className="w-5 h-5 text-indigo-500"/> Generar Licencia</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Prefijo (Cliente/Evento)</label>
                            <input 
                                type="text" 
                                value={newCodePrefix} 
                                onChange={(e) => setNewCodePrefix(e.target.value.toUpperCase())}
                                className="w-full rounded-lg border-slate-300 uppercase font-mono tracking-wider focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="BODA-JUAN"
                                maxLength={10}
                            />
                        </div>
                        <button 
                            onClick={handleGenerateCode}
                            disabled={!newCodePrefix}
                            className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                        >
                            Generar Código
                        </button>
                    </div>

                    {generatedCode && (
                        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg animate-fade-in">
                            <p className="text-xs text-green-800 font-bold uppercase mb-1">¡Código Creado!</p>
                            <div className="flex items-center justify-between bg-white p-2 rounded border border-green-200">
                                <span className="font-mono text-lg font-bold text-slate-800">{generatedCode}</span>
                                <button onClick={() => copyToClipboard(generatedCode)} className="p-1 hover:bg-slate-100 rounded text-slate-500"><Copy className="w-4 h-4"/></button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* List Section */}
            <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200">
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                        <h3 className="font-bold text-slate-700">Historial de Licencias</h3>
                    </div>
                    
                    {isLoadingData ? (
                        <div className="p-12 text-center"><Spinner /></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3">Código</th>
                                        <th className="px-6 py-3">Estado</th>
                                        <th className="px-6 py-3">Evento / Host</th>
                                        <th className="px-6 py-3">Fecha</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {codes.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50 transition">
                                            <td className="px-6 py-4 font-medium">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-slate-700">{item.code}</span>
                                                    <button onClick={() => copyToClipboard(item.code)} className="text-slate-300 hover:text-indigo-500"><Copy className="w-3 h-3"/></button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.event_title ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        Usado
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Disponible
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.event_title ? (
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-slate-800">{item.event_title}</span>
                                                        <span className="text-xs text-slate-500">{item.host_email}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 italic">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {codes.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                                No hay códigos generados aún.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
