'use client';

import React from 'react';

export default function StepProgressBar({ currentStep = 1, category = 'saloon' }) {
  // Clinic & Diagnostic Lab have 3 steps (operating shifts omitted); Saloon & Parlour have 4 steps
  let steps = [];
  if (category === 'clinic') {
    steps = [
      { number: 1, label: 'Clinic Details', sub: 'Name & Address' },
      { number: 2, label: 'Storefront', sub: 'Clinic Facade' },
      { number: 3, label: 'Doctors', sub: 'OPD Days & Slots' },
    ];
  } else if (category === 'diagnostic_lab') {
    steps = [
      { number: 1, label: 'Lab Details', sub: 'Name & Address' },
      { number: 2, label: 'Storefront', sub: 'Lab Facade' },
      { number: 3, label: 'Test Catalog', sub: 'Tests & Days' },
    ];
  } else {
    steps = [
      { number: 1, label: 'Center Details', sub: 'Name & Address' },
      { number: 2, label: 'Working Slots', sub: 'Operating Shifts' },
      { number: 3, label: 'Storefront', sub: 'Salon Facade' },
      {
        number: 4,
        label: category === 'parlour' ? 'Stylists' : 'Barbers & Stylists',
        sub: 'Team & Login',
      },
    ];
  }

  const categoryNames = {
    saloon: 'Saloon',
    parlour: 'Beauty Parlour',
    clinic: 'Clinic',
    diagnostic_lab: 'Diagnostic Centre',
  };

  const totalSteps = steps.length;
  const currentStepObj = steps.find((s) => s.number === currentStep) || steps[0];

  return (
    <div className="w-full mb-8">
      {/* Category Tag & Step Indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
            {categoryNames[category] || 'Business'} Setup
          </span>
          <span className="text-xs font-semibold text-slate-400">
            Step {currentStep} of {totalSteps}
          </span>
        </div>
        <div className="text-xs font-bold text-slate-600">
          Step {currentStep}/{totalSteps}: {currentStepObj.label}
        </div>
      </div>

      {/* Progress Bar Line & Step Circles */}
      <div className="relative">
        {/* Track Line perfectly centered at circle center (y = 18px) */}
        <div className="absolute top-[18px] left-[18px] right-[18px] h-1 bg-slate-200 -translate-y-1/2 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>

        {/* Step Points */}
        <div className="relative z-10 flex justify-between">
          {steps.map((s) => {
            const isCompleted = currentStep > s.number;
            const isCurrent = currentStep === s.number;

            return (
              <div key={s.number} className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black transition shadow-xs ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                      : 'bg-white text-slate-400 border-2 border-slate-200'
                  }`}
                >
                  {isCompleted ? '✓' : s.number}
                </div>
                <div className="text-center mt-2 hidden sm:block">
                  <p
                    className={`text-xs font-bold ${
                      isCurrent || isCompleted ? 'text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {s.label}
                  </p>
                  <p className="text-[10px] text-slate-400">{s.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
