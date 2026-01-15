import React from 'react';
import { twMerge } from 'tailwind-merge';

const Input = React.forwardRef(({ label, className, ...props }, ref) => {
    return (
        <div className="flex flex-col gap-1.5 w-full">
            {label && <label className="text-sm font-medium text-slate-300 ml-1">{label}</label>}
            <input
                ref={ref}
                className={twMerge(
                    "px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all",
                    className
                )}
                {...props}
            />
        </div>
    );
});

Input.displayName = "Input";

export default Input;
