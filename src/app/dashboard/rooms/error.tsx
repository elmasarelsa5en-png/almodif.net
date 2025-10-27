"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex items-center justify-center p-4">
      <div className="bg-white/10 border border-white/20 rounded-lg p-6 max-w-md w-full text-center">
        <h2 className="text-xl font-bold text-white mb-4">حدث خطأ غير متوقع</h2>
        <p className="text-white/80 mb-4">
          عذراً، حدث خطأ أثناء تحميل الصفحة. يرجى المحاولة مرة أخرى.
        </p>
        <button
          onClick={reset}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
}