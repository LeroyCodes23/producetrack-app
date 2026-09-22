'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import styles from './style.module.css';
import { signInWithMicrosoft } from './actions';

export default function LoginPage() {
  return (
    <div className={`flex items-center justify-center min-h-screen bg-cover bg-center ${styles.container}`}>
      <div className="absolute inset-0 bg-black/50" />
      <Card className="w-full z-10" style={{ maxWidth: '420px', minWidth: '340px', padding: '0' }}>
        <CardHeader className="flex flex-col items-center justify-center">
          <img
            src="/Citrusdal_Light.png"
            alt="Citrusdal Logo"
            className="dark:hidden"
            style={{ width: '120px', height: 'auto', marginBottom: '4px' }}
          />
          <img
            src="/Citrusdal_Dark.png"
            alt="Citrusdal Logo"
            className="hidden dark:block"
            style={{ width: '120px', height: 'auto', marginBottom: '4px' }}
          />
          <CardTitle className="text-2xl text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Sign in with your Microsoft account to access ProduceTrack.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form action={signInWithMicrosoft} className="grid gap-2">
            <button
              type="submit"
              className="w-full py-3 px-4 bg-[#0078d4] hover:bg-[#005a9e] text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 23 23"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path fill="#f35325" d="M1 1h10v10H1z" />
                <path fill="#81bc06" d="M12 1h10v10H12z" />
                <path fill="#05a6f0" d="M1 12h10v10H1z" />
                <path fill="#ffba08" d="M12 12h10v10H12z" />
              </svg>
              Sign in with Microsoft
            </button>
          </form>
          <p className="text-xs text-gray-500 text-center mt-2">
            Don't have an account? Just sign in — you'll be registered automatically as a Producer.
          </p>
          <p className="text-xs text-gray-400 text-center">
            For Admin access, contact IT.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}