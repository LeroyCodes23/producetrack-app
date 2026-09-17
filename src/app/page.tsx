// src/app/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const userType = (session.user as any).userType;
  if (userType === 'Admin') {
    redirect('/dashboard');
  }
  redirect('/producer-portal');
}