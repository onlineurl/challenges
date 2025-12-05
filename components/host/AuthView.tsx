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
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-800">Host Access</h1>
            <p className="mt-2 text-md text-slate-600">Sign in or create an account to manage your events.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-lg">
            <Auth
                supabaseClient={supabase}
                appearance={{ theme: ThemeSupa }}
                providers={['google', 'github']} // Example providers, customize as needed
                theme="light"
                localization={{
                    variables: {
                        sign_in: {
                            email_label: 'Email address',
                            password_label: 'Password',
                        },
                        sign_up: {
                            email_label: 'Email address',
                            password_label: 'Create a Password',
                        }
                    }
                }}
            />
        </div>
      </div>
    </div>
  );
}
