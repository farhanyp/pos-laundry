import Link from 'next/link';

export default function DashboardPage() {
  return (
    <>
      <header className="flex justify-between items-center px-margin-desktop w-full h-16 bg-background border-b border-outline-variant/15 sticky top-0 z-40 backdrop-blur-md bg-background/80">
        <div className="flex items-center gap-6">
          <h1 className="font-display text-headline-md font-bold text-primary">Analytics Hub</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <span className="material-symbols-outlined p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors cursor-pointer" data-icon="notifications">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-background"></span>
          </div>
          <button className="bg-primary text-on-primary font-label-md px-4 py-2 rounded-lg hover:bg-primary-container transition-colors active:scale-95 duration-150">
            New Order
          </button>
        </div>
      </header>

      <div className="p-margin-desktop max-w-[1600px] mx-auto space-y-md">
        {/* Metric Snapshot Cards (Elevated Row) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {/* Gross Revenue */}
          <div className="bg-surface-container-low p-md rounded-lg border border-outline-variant/15 flex flex-col justify-between hover:shadow-sm transition-shadow">
            <div className="flex justify-between items-start">
              <span className="text-on-surface-variant font-label-md">Gross Revenue</span>
              <span className="text-primary bg-primary-container/20 px-2 py-1 rounded text-[10px] font-bold">+12.4%</span>
            </div>
            <div className="mt-4">
              <h2 className="font-display text-headline-lg text-primary">$42,890.50</h2>
              <p className="text-on-surface-variant text-[12px] mt-1 italic">Last 30 days</p>
            </div>
          </div>
          {/* Total Orders */}
          <div className="bg-surface-container-low p-md rounded-lg border border-outline-variant/15 flex flex-col justify-between hover:shadow-sm transition-shadow">
            <div className="flex justify-between items-start">
              <span className="text-on-surface-variant font-label-md">Total Orders</span>
              <span className="text-primary bg-primary-container/20 px-2 py-1 rounded text-[10px] font-bold">+8.1%</span>
            </div>
            <div className="mt-4">
              <h2 className="font-display text-headline-lg text-primary">1,248</h2>
              <p className="text-on-surface-variant text-[12px] mt-1 italic">Last 30 days</p>
            </div>
          </div>
          {/* Active Customers */}
          <div className="bg-surface-container-low p-md rounded-lg border border-outline-variant/15 flex flex-col justify-between hover:shadow-sm transition-shadow">
            <div className="flex justify-between items-start">
              <span className="text-on-surface-variant font-label-md">Active Customers</span>
              <span className="text-primary bg-primary-container/20 px-2 py-1 rounded text-[10px] font-bold">+5.2%</span>
            </div>
            <div className="mt-4">
              <h2 className="font-display text-headline-lg text-primary">842</h2>
              <p className="text-on-surface-variant text-[12px] mt-1 italic">Last 30 days</p>
            </div>
          </div>
          {/* Average Order Value */}
          <div className="bg-surface-container-low p-md rounded-lg border border-outline-variant/15 flex flex-col justify-between hover:shadow-sm transition-shadow">
            <div className="flex justify-between items-start">
              <span className="text-on-surface-variant font-label-md">Avg. Order Value</span>
              <span className="text-error bg-error-container/20 px-2 py-1 rounded text-[10px] font-bold">-1.4%</span>
            </div>
            <div className="mt-4">
              <h2 className="font-display text-headline-lg text-primary">$34.37</h2>
              <p className="text-on-surface-variant text-[12px] mt-1 italic">Last 30 days</p>
            </div>
          </div>
        </div>

        {/* Main Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter h-full">
          {/* Revenue Over Time Line Graph (Bento-style 2/3 width) */}
          <div className="lg:col-span-2 bg-surface-container-low rounded-lg border border-outline-variant/15 p-md flex flex-col min-h-[450px]">
            <div className="flex justify-between items-center mb-md">
              <div>
                <h3 className="font-headline-md text-primary">Revenue Performance</h3>
                <p className="text-on-surface-variant text-label-sm">Daily financial tracking vs. target projection</p>
              </div>
              <div className="flex gap-2">
                <button className="text-label-sm px-3 py-1 bg-surface-container-highest rounded-full text-on-surface-variant">Weekly</button>
                <button className="text-label-sm px-3 py-1 bg-primary text-on-primary rounded-full">Monthly</button>
              </div>
            </div>
            {/* Chart Simulation Area */}
            <div className="flex-grow relative mt-4 border-l border-b border-outline-variant/30 ml-8 mb-8">
              {/* Y-Axis Labels */}
              <div className="absolute -left-8 top-0 h-full flex flex-col justify-between text-[10px] text-on-surface-variant py-2">
                <span>$5k</span>
                <span>$4k</span>
                <span>$3k</span>
                <span>$2k</span>
                <span>$1k</span>
                <span>0</span>
              </div>
              {/* X-Axis Labels */}
              <div className="absolute -bottom-8 left-0 w-full flex justify-between text-[10px] text-on-surface-variant px-2">
                <span>01 May</span>
                <span>07 May</span>
                <span>14 May</span>
                <span>21 May</span>
                <span>28 May</span>
              </div>
              {/* Simplified SVG Line Graph */}
              <svg className="absolute inset-0 w-full h-full preserve-3d" preserveAspectRatio="none" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="grad" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: 'rgba(72, 84, 34, 0.2)', stopOpacity: 1 }}></stop>
                    <stop offset="100%" style={{ stopColor: 'rgba(72, 84, 34, 0)', stopOpacity: 1 }}></stop>
                  </linearGradient>
                </defs>
                {/* Baseline Projection */}
                <path d="M0,80 L20,75 L40,78 L60,65 L80,68 L100,55" fill="none" stroke="#c7c8b9" strokeDasharray="2,2" strokeWidth="0.5"></path>
                {/* Actual Revenue Area */}
                <path d="M0,100 L0,90 L10,85 L25,70 L40,82 L55,50 L70,55 L85,30 L100,20 L100,100 Z" fill="url(#grad)"></path>
                {/* Actual Revenue Line */}
                <path d="M0,90 L10,85 L25,70 L40,82 L55,50 L70,55 L85,30 L100,20" fill="none" stroke="#485422" strokeWidth="2"></path>
                {/* Interactive Points */}
                <circle cx="55" cy="50" fill="#485422" r="1.5"></circle>
                <circle cx="85" cy="30" fill="#485422" r="1.5"></circle>
              </svg>
              {/* Tooltip Overlay (Mockup) */}
              <div className="absolute top-[35%] left-[55%] bg-primary-container text-on-primary-container px-3 py-2 rounded shadow-lg text-[11px] transform -translate-x-1/2 -translate-y-full">
                <span className="block font-bold">May 18</span>
                <span className="block">$2,840.00 Rev</span>
              </div>
            </div>
          </div>

          {/* Payment Breakdown (Bento-style 1/3 width) */}
          <div className="bg-surface-container-low rounded-lg border border-outline-variant/15 p-md flex flex-col justify-between">
            <div>
              <h3 className="font-headline-md text-primary">Payment Volume</h3>
              <p className="text-on-surface-variant text-label-sm">Distribution by transaction type</p>
            </div>
            <div className="space-y-xl my-md">
              {/* Digital Payments */}
              <div className="space-y-xs">
                <div className="flex justify-between text-body-md">
                  <span className="font-medium text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]" data-icon="credit_card">credit_card</span>
                    Digital Gateway
                  </span>
                  <span className="text-on-surface-variant">72%</span>
                </div>
                <div className="h-4 w-full bg-secondary-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[72%] transition-all duration-1000 ease-out"></div>
                </div>
                <p className="text-on-surface-variant text-[12px]">$30,881.16 in card/mobile payments</p>
              </div>
              {/* Cash Payments */}
              <div className="space-y-xs">
                <div className="flex justify-between text-body-md">
                  <span className="font-medium text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]" data-icon="payments">payments</span>
                    Cash
                  </span>
                  <span className="text-on-surface-variant">28%</span>
                </div>
                <div className="h-4 w-full bg-secondary-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[28%] transition-all duration-1000 ease-out"></div>
                </div>
                <p className="text-on-surface-variant text-[12px]">$12,009.34 in cash payments</p>
              </div>
            </div>
            <div className="p-4 bg-surface-variant/40 rounded-lg border border-outline-variant/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <span className="material-symbols-outlined text-primary text-sm" data-icon="trending_up" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
                </div>
                <div>
                  <p className="text-label-sm font-bold text-primary">Trend Insight</p>
                  <p className="text-[12px] text-on-surface-variant">Digital payments are up 14% since you integrated Apple Pay.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer-style Recent Transaction Peek */}
        <div className="bg-surface-container-low rounded-lg border border-outline-variant/15 p-md overflow-hidden">
          <div className="flex justify-between items-center mb-md">
            <h3 className="font-label-md text-primary">Live Activity Feed</h3>
            <button className="text-label-sm text-primary hover:underline">View All Logs</button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-outline-variant/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded bg-primary-container/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined" data-icon="local_laundry_service">local_laundry_service</span>
                </div>
                <div>
                  <p className="text-body-md font-medium">Order #4421 Complete</p>
                  <p className="text-[12px] text-on-surface-variant">Wash & Fold • Express</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-body-md font-bold text-primary">+$45.00</p>
                <p className="text-[10px] text-on-surface-variant">2 mins ago</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-outline-variant/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded bg-primary-container/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined" data-icon="person_add">person_add</span>
                </div>
                <div>
                  <p className="text-body-md font-medium">New Customer Registered</p>
                  <p className="text-[12px] text-on-surface-variant">Sarah Jenkins • Premium Tier</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-body-md font-bold text-primary">Account Active</p>
                <p className="text-[10px] text-on-surface-variant">14 mins ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
