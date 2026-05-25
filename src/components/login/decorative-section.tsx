import { Leaf } from "lucide-react";

export function DecorativeSection() {
  return (
    <div className="hidden md:block relative order-1 md:order-2 overflow-hidden h-full min-h-[700px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="absolute inset-0 w-full h-full object-cover"
        alt="A bright and airy modern laundry facility"
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9Fcgoy6tVnPUcadzFk1XTsWwFWAoswWkKI_8tJHuCYqtJoTEK5FhpX0InxBeyr-JjGmZT_DhaRbR20CF6Mej4optOgUizaFKfGpSx39HnArQfNV8tARcR1JVdW8aFDRMumbYf-3GGQtmC4_tqfiZhFROh8QwSQDENk4pzgFRgB7lgejBUwczXGIXQQDBeJGd-x3mN905veAqWrgq6exZxu_3ZBTpFVN-4734ghy-_7EexiO_p55eiM3zJzmjE_hKutlFrfHJQkvYQ"
      />
      
      <div className="absolute inset-0 bg-gradient-to-b from-[#485422]/10 to-[#485422]/60 flex flex-col justify-end p-10">
        <div className="backdrop-blur-md bg-white/10 p-10 rounded-xl border border-white/20">
          <h2 className="font-sans text-[40px] font-semibold leading-[48px] tracking-[-0.02em] text-white mb-2">
            Freshly Managed.
          </h2>
          <p className="font-sans text-lg text-white/90">
            Seamless Point of Sale for Modern Care. Track every cycle, manage every station, and delight every customer.
          </p>
        </div>
      </div>
      
      <div className="absolute top-16 right-16">
        <div className="bg-[#485422]/90 backdrop-blur-sm text-white px-6 py-3 rounded-lg flex items-center gap-3 shadow-lg border border-white/10">
          <Leaf className="w-5 h-5" />
          <span className="font-sans text-sm font-semibold tracking-[0.01em]">100% Eco-Friendly</span>
        </div>
      </div>
    </div>
  );
}
