'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import styles from './style.module.css';
import { useAuth } from '@/contexts/auth-context';
import { signInWithMicrosoft } from './actions';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();
    const { login } = useAuth();

    const handleLogin = async () => {
        setIsLoading(true);

        try {
            console.log('[CLIENT] Attempting login for:', email);

            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            console.log('[CLIENT] Login response status:', response.status);
            console.log('[CLIENT] Login response data:', data);

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            console.log('[CLIENT] Token stored, user:', data.user);

            login(
                data.user.userType === 'Admin' ? 'admin' : 'producer',
                {
                    id: data.user.id,
                    email: data.user.email,
                    username: data.user.username,
                    userType: data.user.userType,
                    firstName: data.user.firstName,
                    lastName: data.user.lastName,
                }
            );

            toast({
                title: 'Login Successful',
                description: `Welcome back, ${data.user.firstName || data.user.email}!`,
            });

            const redirectPath = data.user.userType === 'Admin' ? '/dashboard' : '/producer-portal';
            console.log('[CLIENT] Redirecting to:', redirectPath);

            router.push(redirectPath);

        } catch (err: any) {
            console.error('[CLIENT] Login error:', err);
            toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: err.message || 'Invalid email or password.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className={`flex items-center justify-center min-h-screen bg-cover bg-center ${styles.container}`}>
            <div className="absolute inset-0 bg-black/50" />
            <Card
                className="w-full z-10"
                style={{ maxWidth: '420px', minWidth: '340px', minHeight: '420px', padding: '0' }}
            >
                <CardHeader className="flex flex-col items-center justify-center">
                    <img
                        src="/citrusdal-logo.jpg"
                        alt="Citrusdal Logo"
                        style={{ width: '120px', height: 'auto', marginBottom: '4px', display: 'block' }}
                    />
                    <CardTitle className="text-2xl text-center">Login</CardTitle>
                    <CardDescription className="text-center">
                        Sign in with your Microsoft account or use your email and password.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    {/* Microsoft Sign-in Button */}
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

                    {/* Divider */}
                    <div className="relative my-2">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                        </div>
                    </div>

                    {/* Email / Password Form */}
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleLogin();
                                }
                            }}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    <Button className="w-full" onClick={handleLogin} disabled={isLoading}>
                        {isLoading ? 'Signing in...' : 'Sign in'}
                    </Button>
                    <div className="flex justify-between w-full mt-2">
                        <a href="/login/register" className="text-sm text-blue-400 hover:underline">Register</a>
                        <a href="/login/forgot-password" className="text-sm text-blue-400 hover:underline">Forgot Password?</a>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}