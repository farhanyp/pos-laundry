import { RegisterForm } from "./register-form";
import { ShieldCheck, Zap, MessageSquare, WashingMachine } from "lucide-react";
import Image from "next/image";
import { GuestGuard } from "@/components/auth/GuestGuard";

export default function RegisterPage() {
  return (
    <GuestGuard>
      <main className="min-h-screen w-full bg-surface-container-lowest flex flex-col md:flex-row overflow-x-hidden font-body text-on-surface">
        {/* Left Column (45%) */}
        <section className="hidden md:flex md:w-[45%] bg-gradient-to-br from-primary to-tertiary p-16 flex-col justify-between relative overflow-hidden">
          {/* Decorative Pattern Overlay */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }}
          ></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-16">
              <WashingMachine className="text-on-primary w-8 h-8" />
              <span className="text-2xl font-bold text-on-primary tracking-tight">Mari Laundry</span>
            </div>
            <h1 className="text-[40px] font-bold text-on-primary mb-10 leading-tight tracking-tight font-display">
              Bergabung dengan Tim Mari Laundry
            </h1>
            <ul className="space-y-6">
              <li className="flex items-center gap-6 text-on-primary">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                  <ShieldCheck className="w-5 h-5 fill-current" />
                </div>
                <span className="font-label-lg font-bold">Akses Kasir Cepat</span>
              </li>
              <li className="flex items-center gap-6 text-on-primary">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <span className="font-label-lg font-bold">Notifikasi Tugas Real-time</span>
              </li>
              <li className="flex items-center gap-6 text-on-primary">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                  <MessageSquare className="w-5 h-5 fill-current" />
                </div>
                <span className="font-label-lg font-bold">Dasbor Personal</span>
              </li>
            </ul>
          </div>

          <div className="relative z-10 mt-16">
            <div className="p-6 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm">
              <p className="text-on-primary font-body-lg italic">
                "Bergabung dengan 500+ pengusaha laundry yang telah mengotomasi bisnis mereka dengan Mari Laundry."
              </p>
            </div>
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Laundry machines"
            className="absolute bottom-[-100px] right-[-50px] w-80 h-80 object-cover rounded-full mix-blend-overlay opacity-30 grayscale"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDC7gY-QQQam32vuVSv8VlbbcorbmS_dHv-Sq3d4ixLjvMxgd2wc2dc_rRUCESPy4AGBLvbH7XIlFLhatTLmuoPB0Ao3JB3pwGpKKTKA5DsbQ9Gq6SdIfeaMFAY_EAHK_XrKtYZSpB2Upoo279LX5GUYowwz7I12la3iNTGH_4y_gsV4HdSP9y0gNmViubpn8XuKAZeQw99hq4uQcedSK9p3u3yhb61UHTRKCbfI9yhNPXbeCPtFfOYY31zwFsLuGr2wqfUftj94cf"
          />
        </section>

        {/* Right Column (55%) */}
        <section className="w-full md:w-[55%] flex items-center justify-center p-4 md:p-16">
          <RegisterForm />
        </section>
      </main>

      {/* Shared Component: Footer (Desktop) */}
      <footer className="hidden md:flex w-full py-6 bg-surface-container border-t border-outline-variant/20 flex-col md:flex-row justify-between items-center px-8 gap-6 font-body">
        <span className="font-label-md font-medium text-on-surface-variant">
          © 2026 Mari Laundry Systems. Seluruh hak cipta dilindungi.
        </span>
      </footer>
    </GuestGuard>
  );
}
