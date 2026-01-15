import { twMerge } from 'tailwind-merge';

const Button = ({ children, className, ...props }) => {
    return (
        <button
            className={twMerge(
                "px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
