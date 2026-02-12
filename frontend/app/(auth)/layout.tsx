// 'use client';

// import { useAuth } from '@/lib/context/AuthContext';
// import { useRouter } from 'next/navigation';
// import { useEffect } from 'react';

// export default function AuthLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const { user, loading } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     // If user is already logged in, redirect to dashboard
//     if (!loading && user) {
//       router.push('/dashboard');
//     }
//   }, [user, loading, router]);

//   // Show nothing while checking auth state
//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
//       </div>
//     );
//   }

//   // Don't render auth pages if user is logged in
//   if (user) {
//     return null;
//   }

//   return <>{children}</>;
// }


'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return <>{children}</>;
}