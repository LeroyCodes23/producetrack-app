export const dynamic = 'force-static';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function ResetPasswordPage() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) {
            toast({ variant: 'destructive', title: 'Passwords do not match' });
            return;
        }
        const res = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, newPassword }),
        });
        const data = await res.json();
        if (res.ok) {
            toast({ title: 'Password reset successful', description: 'You can now log in.' });
            router.push('/login');
        } else {
            toast({ variant: 'destructive', title: 'Reset failed', description: data.error || 'Try again.' });
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-cover bg-center">
            <div className="absolute inset-0 bg-black/50" />
            <Card className="w-full z-10" style={{ maxWidth: '420px', minWidth: '340px', minHeight: '320px', padding: '0' }}>
                <CardHeader className="flex flex-col items-center justify-center">
                    <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
                    <CardDescription className="text-center">Enter your new password below.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input id="newPassword" type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input id="confirmPassword" type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={handleResetPassword}>Reset Password</Button>
                </CardFooter>
            </Card>
        </div>
    );
}
