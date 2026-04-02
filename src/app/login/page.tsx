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

            login(data.user.userType === 'Admin' ? 'admin' : 'producer');

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
                        src="/Citrusdal_100 Jaar Logo [Final] jpeg.jpg"
                        alt="Citrusdal Logo"
                        style={{ width: '120px', height: 'auto', marginBottom: '4px', display: 'block' }}
                    />
                    <CardTitle className="text-2xl text-center">Login</CardTitle>
                    <CardDescription className="text-center">
                        Enter your email and password to login to your account.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
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