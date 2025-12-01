
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import styles from './style.module.css';
import { useAuth, UserRole } from '@/contexts/auth-context';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>('admin');
    const router = useRouter();
    const { toast } = useToast();
    const { login } = useAuth();

    const handleLogin = () => {
        let loginSuccessful = false;

        if (email === 'admin@example.com' && password === 'password' && role === 'admin') {
            loginSuccessful = true;
        } else if (email === 'producer@example.com' && password === 'password1' && role === 'producer') {
            loginSuccessful = true;
        }

        if (loginSuccessful) {
            login(role);
            toast({
                title: 'Login Successful',
                description: 'Welcome back!',
            });
            if (role === 'producer') {
                router.push('/producer-portal');
            } else {
                router.push('/dashboard');
            }
        } else {
            toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: 'Invalid email, password, or role combination.',
            });
        }
    };

    return (
        <div
            className={`flex items-center justify-center min-h-screen bg-cover bg-center ${styles.container}`}>
            <div className="absolute inset-0 bg-black/50" />
            <Card className="w-full max-w-sm z-10">
                <CardHeader>
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>
                        Enter your email below to login to your account.
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
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Role</Label>
                        <RadioGroup value={role} onValueChange={(value: UserRole) => setRole(value)} className="flex gap-4">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="admin" id="admin" />
                                <Label htmlFor="admin">Admin</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="producer" id="producer" />
                                <Label htmlFor="producer">Producer</Label>
                            </div>
                        </RadioGroup>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={handleLogin}>
                        Sign in
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
