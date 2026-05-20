import { Metadata } from 'next';
import AppLayout from '@/components/layout/AppLayout';

export const metadata: Metadata = { title: 'Recycle Bin — Yarana LifeOS' };
export default function TrashLayout({ children }: { children: React.ReactNode }) {
  return <AppLayout pageTitle="Recycle Bin">{children}</AppLayout>;
}
