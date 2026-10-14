import React,{useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
const ADMIN_URL='https://earnbd.work/admin.html';
function AdminEntry(){useEffect(()=>{window.location.replace(ADMIN_URL)},[]);return <main className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-white"><section className="text-center"><h1 className="text-2xl font-bold">EarnBD Admin Console</h1><p className="mt-4">নতুন অ্যাডমিন প্যানেলে যাচ্ছেন…</p><a className="block mt-5 text-cyan-300" href={ADMIN_URL}>অ্যাডমিন প্যানেল খুলুন ↗</a></section></main>}
createRoot(document.getElementById('root')!).render(<AdminEntry/>);
