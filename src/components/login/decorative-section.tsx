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
      
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-primary/80 flex flex-col justify-end p-10">
        <div className="backdrop-blur-md bg-white/10 p-10 rounded-2xl border border-white/20">
          <h2 className="font-display text-[40px] font-bold leading-[48px] tracking-tight text-white mb-3">
            Mari Laundry.
          </h2>
          <p className="font-body text-lg text-white/90">
            Sistem Kasir Pintar untuk Laundry Modern. Lacak setiap proses, kelola setiap outlet, dan layani setiap pelanggan dengan lebih baik.
          </p>
        </div>
      </div>
      
      <div className="absolute top-10 right-10">
        <div className="bg-primary/90 backdrop-blur-sm text-on-primary px-6 py-3 rounded-full flex items-center gap-3 shadow-lg border border-white/20">
          <Leaf className="w-5 h-5" />
          <span className="font-label-md font-bold">100% Ramah Lingkungan</span>
        </div>
      </div>
    </div>
  );
}
