import React, { forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {label}
        </label>
        <input
          ref={ref}
          className={`px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 border-lightBorder dark:border-darkBorder text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition duration-200 text-sm ${
            error ? "border-rose-500 focus:ring-rose-500/10 focus:border-rose-500" : ""
          } ${className}`}
          {...props}
        />
        {error && (
          <span className="text-xs font-semibold text-rose-500 mt-0.5">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { label: string; value: string }[];
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {label}
        </label>
        <select
          ref={ref}
          className={`px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 border-lightBorder dark:border-darkBorder text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition duration-200 text-sm ${
            error ? "border-rose-500 focus:ring-rose-500/10 focus:border-rose-500" : ""
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <span className="text-xs font-semibold text-rose-500 mt-0.5">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {label}
        </label>
        <textarea
          ref={ref}
          className={`px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 border-lightBorder dark:border-darkBorder text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition duration-200 text-sm ${
            error ? "border-rose-500 focus:ring-rose-500/10 focus:border-rose-500" : ""
          } ${className}`}
          {...props}
        />
        {error && (
          <span className="text-xs font-semibold text-rose-500 mt-0.5">
            {error}
          </span>
        )}
      </div>
    );
  }
);

TextArea.displayName = "TextArea";
