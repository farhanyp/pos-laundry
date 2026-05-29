"use client";

import { LoginForm } from "@/components/login/login-form";
import { DecorativeSection } from "@/components/login/decorative-section";
import { GuestGuard } from "@/components/auth/GuestGuard";

export default function LoginPage() {
  return (
    <GuestGuard>
      <main className="min-h-screen w-full bg-surface-container flex items-center justify-center p-4 md:p-8 overflow-hidden">
        {/* Decorative Blur Backgrounds for Mobile */}
        <div className="md:hidden fixed bottom-0 left-0 w-64 h-64 bg-primary/20 rounded-full -translate-x-1/2 translate-y-1/2 blur-3xl -z-10"></div>
        <div className="md:hidden fixed top-0 right-0 w-48 h-48 bg-secondary/10 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl -z-10"></div>
        
        <div className="w-full max-w-[1200px] grid grid-cols-1 md:grid-cols-2 bg-surface-container-lowest rounded-2xl shadow-xl overflow-hidden min-h-[95vh] md:min-h-[700px] border border-outline-variant/30 relative z-10">
          <LoginForm />
          <DecorativeSection />
        </div>
      </main>
    </GuestGuard>
  );
}
