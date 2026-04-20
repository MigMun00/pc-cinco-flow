import { SignIn } from "@clerk/react";

export default function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-(--border) bg-(--surface) p-2 shadow-xl">
        <SignIn />
      </div>
    </div>
  );
}
