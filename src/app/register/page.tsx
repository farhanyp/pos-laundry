import { RegisterForm } from "./register-form";
import { ShieldCheck, Zap, MessageSquare, WashingMachine } from "lucide-react";
import Image from "next/image";

export default function RegisterPage() {
  return (
    <>
    <main className="min-h-screen w-full bg-[#fefae0] flex flex-col md:flex-row overflow-x-hidden font-sans text-[#1d1c0d]">
      {/* Left Column (45%) */}
      <section className="hidden md:flex md:w-[45%] bg-gradient-to-br from-[#283618] to-[#485422] p-16 flex-col justify-between relative overflow-hidden">
        {/* Decorative Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #fefae0 1px, transparent 0)', backgroundSize: '32px 32px' }}
        ></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <WashingMachine className="text-[#dbe9a9] w-8 h-8" />
            <span className="text-2xl font-bold text-[#dbe9a9] tracking-tight">FreshPress</span>
          </div>
          <h1 className="text-[40px] font-semibold text-[#bfcd8f] mb-10 leading-tight tracking-[-0.02em]">
            Bergabung dengan Tim FreshPress
          </h1>
          <ul className="space-y-6">
            <li className="flex items-center gap-6 text-[#dbe9a9]">
              <div className="h-10 w-10 rounded-full bg-[#606c38] flex items-center justify-center text-white">
                <ShieldCheck className="w-5 h-5 fill-current" />
              </div>
              <span className="text-lg">Akses POS Cepat</span>
            </li>
            <li className="flex items-center gap-6 text-[#dbe9a9]">
              <div className="h-10 w-10 rounded-full bg-[#606c38] flex items-center justify-center text-white">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <span className="text-lg">Notifikasi Tugas Real-time</span>
            </li>
            <li className="flex items-center gap-6 text-[#dbe9a9]">
              <div className="h-10 w-10 rounded-full bg-[#606c38] flex items-center justify-center text-white">
                <MessageSquare className="w-5 h-5 fill-current" />
              </div>
              <span className="text-lg">Dashboard Personal</span>
            </li>
          </ul>
        </div>
        
        <div className="relative z-10 mt-16">
          <div className="p-6 rounded-xl bg-[#606c38]/30 border border-[#dbe9a9]/20">
            <p className="text-[#dbe9a9] italic text-base">
              "Bergabung dengan 500+ pengusaha laundry yang telah mengotomasi bisnis mereka dengan FreshPress."
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
    <footer className="hidden md:flex w-full py-6 bg-[#fefae0] border-t border-[#77786b]/10 flex-col md:flex-row justify-between items-center px-8 gap-6 font-sans">
      <span className="text-sm font-medium text-[#46483c] opacity-60">
        © 2026 Launderly Systems. All rights reserved.
      </span>
      <div className="flex gap-10">
        <a className="text-sm font-medium text-[#46483c] hover:text-[#485422] transition-colors hover:underline underline-offset-4" href="#">Privacy Policy</a>
        <a className="text-sm font-medium text-[#46483c] hover:text-[#485422] transition-colors hover:underline underline-offset-4" href="#">Terms of Service</a>
        <a className="text-sm font-medium text-[#46483c] hover:text-[#485422] transition-colors hover:underline underline-offset-4" href="#">Support</a>
      </div>
    </footer>
    </>
  );
}
