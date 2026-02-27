export const dynamic = 'force-static';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const { toast } = useToast();
    const router = useRouter();

    const handleForgotPassword = async () => {
        const res = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (res.ok) {
            toast({ title: 'Reset email sent', description: 'Check your inbox for reset instructions.' });
            router.push('/login');
        } else {
            toast({ variant: 'destructive', title: 'Request failed', description: data.error || 'Try again.' });
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-cover bg-center">
            <div className="absolute inset-0 bg-black/50" />
            <Card className="w-full z-10" style={{ maxWidth: '420px', minWidth: '340px', minHeight: '320px', padding: '0' }}>
                <CardHeader className="flex flex-col items-center justify-center">
                    <CardTitle className="text-2xl text-center">Forgot Password</CardTitle>
                    <CardDescription className="text-center">Enter your email to reset your password.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={handleForgotPassword}>Send Reset Link</Button>
                </CardFooter>
            </Card>
        </div>
    );
}
