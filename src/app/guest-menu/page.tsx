'use client';'use client';



import { useEffect } from 'react';import { useEffect } from 'react';

import { useRouter } from 'next/navigation';import { useRouter } from 'next/navigation';



export default function GuestMenuRedirect() {export default function GuestMenuRedirect() {

  const router = useRouter();  const router = useRouter();

  

  useEffect(() => {  useEffect(() => {

    router.replace('/guest-app');    router.replace('/guest-login');

  }, [router]);  }, [router]);



  return (  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">

      <div className="text-white text-xl">جاري التحويل للتطبيق الجديد...</div>      <div className="text-white text-center">

    </div>        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>

  );        <p className="text-xl">جاري التحويل...</p>

}      </div>

    </div>
  );
}