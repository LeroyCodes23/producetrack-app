'use client';

import { Suspense } from 'react';
import ResetPasswordPage from '../reset-password';

export default function ResetPasswordRoute() {
	return (
		<Suspense fallback={null}>
			<ResetPasswordPage />
		</Suspense>
	);
}
