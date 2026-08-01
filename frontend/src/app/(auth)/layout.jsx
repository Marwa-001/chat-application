import RedirectIfAuthed from "@/components/auth/RedirectIfAuthed";

export default function AuthLayout({ children }) {
  return (
    <RedirectIfAuthed>
      <div className="flex min-h-[100dvh] items-center justify-center bg-gray-50 px-4 py-8">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          {children}
        </div>
      </div>
    </RedirectIfAuthed>
  );
}