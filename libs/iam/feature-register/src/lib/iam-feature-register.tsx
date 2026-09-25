'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, ArrowRight } from 'lucide-react';
import { useAuth } from '@workspace/iam-data-access';
import { Button, Input } from '@workspace/ui-primitives';

export function IamFeatureRegister() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: '',
    password: '',
    username: '',
    fullName: '',
    branch: 'CSE',
  });
  const { register, loading, error } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await register(form, () => router.push('/dashboard'));
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Join Campus Workspace</h1>
            <p className="text-xs text-slate-400">Multi-Tenant University Platform</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-xs leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Official University Email"
            type="email"
            required
            placeholder="e.g. rohan@iiitnr.edu.in"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.currentTarget.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Full Name"
              type="text"
              required
              placeholder="Rohan Bhandari"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.currentTarget.value })}
            />
            <Input
              label="Username"
              type="text"
              required
              placeholder="rohan_iiitnr"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.currentTarget.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-medium block mb-1 text-xs">Branch</label>
              <select
                value={form.branch}
                onChange={(e) => setForm({ ...form, branch: e.currentTarget.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors text-xs"
              >
                <option value="CSE">CSE</option>
                <option value="DSAI">DSAI</option>
                <option value="ECE">ECE</option>
              </select>
            </div>
            <Input
              label="Password"
              type="password"
              required
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.currentTarget.value })}
            />
          </div>

          <Button type="submit" loading={loading}>
            Create Campus Account <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <p className="text-center text-slate-500 text-xs mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}