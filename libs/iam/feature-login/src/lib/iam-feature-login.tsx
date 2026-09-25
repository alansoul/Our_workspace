'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, LogIn } from 'lucide-react';
import { useAuth } from '@workspace/iam-data-access';
import { Button, Input } from '@workspace/ui-primitives';

export function IamFeatureLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const { login, loading, error } = useAuth();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    await login(form, () => router.push('/dashboard'));
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Student Sign In</h1>
            <p className="text-xs text-slate-400">Access your university hub & gigs</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-xs leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="University Email"
            type="email"
            required
            placeholder="rohan@iiitnr.edu.in"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.currentTarget.value })}
          />
          <Input
            label="Password"
            type="password"
            required
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.currentTarget.value })}
          />
          <Button type="submit" loading={loading}>
            Sign In <LogIn className="w-4 h-4" />
          </Button>
        </form>

        <p className="text-center text-slate-500 text-xs mt-6">
          New to the workspace?{' '}
          <Link href="/register" className="text-blue-400 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}