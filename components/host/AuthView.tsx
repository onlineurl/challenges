import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../../supabaseClient';
import { PartyPopper } from 'lucide-react';

export default function AuthView() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <PartyPopper className="mx-auto h-12 w-12 text-indigo-500" />
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-800">ATR - Anfitrión</h1>
            <p className="mt-2 text-md text-slate-600">Inicia sesión o regístrate para gestionar tus eventos.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-lg">
            <Auth
                supabaseClient={supabase}
                appearance={{ theme: ThemeSupa }}
                providers={['google', 'github']} 
                theme="light"
                localization={{
                    variables: {
                        sign_in: {
                            email_label: 'Correo electrónico',
                            password_label: 'Contraseña',
                            button_label: "Iniciar sesión",
                            social_provider_text: "Iniciar con {{provider}}",
                            email_input_placeholder: "Tu correo electrónico",
                            password_input_placeholder: "Tu contraseña",
                            link_text: "¿Ya tienes cuenta? Inicia sesión",
                        },
                        sign_up: {
                            email_label: 'Correo electrónico',
                            password_label: 'Crea una contraseña',
                            button_label: "Registrarse",
                            social_provider_text: "Registrarse con {{provider}}",
                            email_input_placeholder: "Tu correo electrónico",
                            password_input_placeholder: "Crea una contraseña segura",
                            link_text: "¿No tienes cuenta? Regístrate",
                        },
                        forgotten_password: {
                            link_text: "¿Olvidaste tu contraseña?",
                            button_label: "Enviar instrucciones",
                            email_label: "Correo electrónico",
                            password_label: "Tu contraseña",
                            email_input_placeholder: "Tu correo electrónico",
                        }
                    }
                }}
            />
        </div>
      </div>
    </div>
  );
}