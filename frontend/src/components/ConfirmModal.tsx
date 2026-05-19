import React from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDanger = true,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-darkCard border border-lightBorder dark:border-darkBorder rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in scale-in duration-200">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full ${isDanger ? "bg-rose-50 dark:bg-rose-950/20 text-rose-600" : "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600"}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              {title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            type="button"
            className="px-4 py-2 border border-lightBorder dark:border-darkBorder rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            {cancelText}
          </button>
          
          <button
            onClick={onConfirm}
            type="button"
            className={`px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-lg transition ${
              isDanger
                ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
                : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
export default ConfirmModal;
