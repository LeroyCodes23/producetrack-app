"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('producer');
    const { toast } = useToast();
    const router = useRouter();

    const handleRegister = async () => {
        if (password !== confirmPassword) {
            toast({
                variant: 'destructive',
                title: 'Passwords do not match',
            });
            return;
        }
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, role }),
        });
        const data = await res.json();
        if (res.ok) {
            toast({ title: 'Registration successful', description: 'You can now log in.' });
            router.push('/login');
        } else {
            toast({ variant: 'destructive', title: 'Registration failed', description: data.error || 'Try again.' });
        }
    };

        return (
            <div className={`flex items-center justify-center min-h-screen bg-cover bg-center ${require('./style.module.css').container}`}>
                <div className="absolute inset-0 bg-black/50" />
                <Card className="w-full z-10" style={{ maxWidth: '420px', minWidth: '340px', minHeight: '420px', padding: '0' }}>
                    <CardHeader className="flex flex-col items-center justify-center">
                        <CardTitle className="text-2xl text-center">Register</CardTitle>
                        <CardDescription className="text-center">Create your account below.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input id="confirmPassword" type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Role</Label>
                            <RadioGroup value={role} onValueChange={setRole} className="flex gap-4">
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
                    <CardFooter className="flex flex-col gap-2">
                        <Button className="w-full" onClick={handleRegister}>Register</Button>
                        <a href="/login" className="text-sm text-blue-400 hover:underline text-center mt-2">Back to Login</a>
                    </CardFooter>
                </Card>
            </div>
        );
}
