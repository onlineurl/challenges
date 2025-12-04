import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided in environment variables.');
}

const getDeviceId = () => {
    // Check if running in a browser environment
    if (typeof window === 'undefined') return 'unknown_device';
    
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
        deviceId = `dev_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
}


export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    // This automatically adds the device ID to every request,
    // which is used by database policies (RLS) for guest security.
    global: {
        headers: {
            'x-device-id': getDeviceId()
        }
    }
});
