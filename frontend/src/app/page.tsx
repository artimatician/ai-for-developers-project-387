'use client';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';

export default function HomePage() {
  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <Navbar variant="landing" />
      <HeroSection />
    </div>
  );
}
