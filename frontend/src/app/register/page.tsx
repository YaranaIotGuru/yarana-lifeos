'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Smartphone, Lock, Loader2, ArrowRight, User, Zap } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', mobile: '', password: '', confirmPassword: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.mobile || !form.password) { toast.error('Please fill all fields'); return; }
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password min 6 characters'); return; }
    try {
      await register(form.name, form.mobile, form.password);
      toast.success('Welcome to Yarana LifeOS! 🚀');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err?.message || 'Registration failed');
    }
  };

  const inp: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 12, padding: '13px 16px 13px 44px', color: 'white', outline: 'none',
    fontSize: 15, boxSizing: 'border-box', transition: 'border-color 0.2s',
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#090912', display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 16, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: -120, left: -120, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -120, right: -120, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 68, height: 68, borderRadius: 20, margin: '0 auto 14px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #ec4899 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
          }}>
            <Zap size={30} color="white" />
          </div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>
            Yarana{' '}
            <span style={{ background: 'linear-gradient(to right, #818cf8, #a78bfa, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              LifeOS
            </span>
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: '#6b7280' }}>Start managing your life better today</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 20, padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}>
          <h2 style={{ margin: '0 0 22px', fontSize: 18, fontWeight: 600, color: 'white' }}>🚀 Create your account</h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#9ca3af', marginBottom: 7 }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} color="#6b7280" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input autoFocus style={inp} placeholder="Your full name" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(99,102,241,0.6)'}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.12)'}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#9ca3af', marginBottom: 7 }}>Mobile Number</label>
              <div style={{ position: 'relative' }}>
                <Smartphone size={18} color="#6b7280" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input type="tel" style={inp} placeholder="10-digit mobile number" value={form.mobile}
                  onChange={e => setForm({ ...form, mobile: e.target.value })}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(99,102,241,0.6)'}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.12)'}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#9ca3af', marginBottom: 7 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#6b7280" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input type={showPassword ? 'text' : 'password'} style={{ ...inp, paddingRight: 44 }} placeholder="Min 6 characters"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(99,102,241,0.6)'}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.12)'}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                }}>
                  {showPassword ? <EyeOff size={18} color="#6b7280" /> : <Eye size={18} color="#6b7280" />}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#9ca3af', marginBottom: 7 }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#6b7280" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input type="password" style={inp} placeholder="Repeat password"
                  value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(99,102,241,0.6)'}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.12)'}
                />
              </div>
            </div>

            <button type="submit" disabled={isLoading} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '13px', borderRadius: 12, fontSize: 15, fontWeight: 600,
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              color: 'white', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.8 : 1,
              boxShadow: '0 4px 20px rgba(79,70,229,0.4)',
              marginTop: 4,
            }}>
              {isLoading ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <>Create Account <ArrowRight size={18} /></>}
            </button>
          </form>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 22, paddingTop: 18, textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
