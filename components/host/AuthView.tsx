import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../../supabaseClient';
import { PartyPopper, ShoppingBag, AlertTriangle } from 'lucide-react';
import { WHATSAPP_CONTACT_URL } from '../../utils/links';

export default function AuthView() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
            <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-200 mb-4">
                <PartyPopper className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">ATR Party</h1>
            <p className="mt-2 text-md text-slate-600">Acceso para Anfitriones</p>
        </div>

        {/* Purchase Warning Banner */}
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-r-lg shadow-sm">
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                </div>
                <div className="ml-3 w-full">
                    <h3 className="text-sm font-bold text-amber-800">¿Tienes tu Código de Licencia?</h3>
                    <div className="mt-2 text-sm text-amber-700">
                        <p>Para crear y activar eventos en la app, necesitas comprar un código de acceso.</p>
                    </div>
                    <div className="mt-3">
                        <a 
                            href={WHATSAPP_CONTACT_URL}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 shadow-sm transition-colors"
                        >
                            <ShoppingBag className="w-4 h-4" />
                            Comprar Código por WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
            <Auth
                supabaseClient={supabase}
                appearance={{ 
                    theme: ThemeSupa,
                    variables: {
                        default: {
                            colors: {
                                brand: '#4f46e5',
                                brandAccent: '#4338ca',
                            }
                        }
                    },
                    className: {
                        button: 'rounded-xl',
                        input: 'rounded-lg'
                    }
                }}
                // Only Google and Email allowed
                providers={['google']} 
                theme="light"
                localization={{
                    variables: {
                        sign_in: {
                            email_label: 'Correo electrónico',
                            password_label: 'Contraseña',
                            button_label: "Iniciar sesión",
                            social_provider_text: "Continuar con {{provider}}",
                            email_input_placeholder: "tu@email.com",
                            password_input_placeholder: "••••••••",
                            link_text: "¿Ya tienes cuenta? Inicia sesión",
                        },
                        sign_up: {
                            email_label: 'Correo electrónico',
                            password_label: 'Crea una contraseña',
                            button_label: "Registrarse",
                            social_provider_text: "Registrarse con {{provider}}",
                            email_input_placeholder: "tu@email.com",
                            password_input_placeholder: "Mínimo 6 caracteres",
                            link_text: "¿No tienes cuenta? Regístrate",
                        },
                        forgotten_password: {
                            link_text: "¿Olvidaste tu contraseña?",
                            button_label: "Recuperar contraseña",
                            email_label: "Correo electrónico",
                            password_label: "Tu contraseña",
                            email_input_placeholder: "tu@email.com",
                        }
                    }
                }}
            />
        </div>
        <p className="text-center text-xs text-slate-400 mt-6">
            Al continuar, aceptas los términos y condiciones de ATR Party.
        </p>
      </div>
    </div>
  );
}