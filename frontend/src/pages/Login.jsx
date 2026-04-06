import { SignIn } from "@clerk/react";

export default function Login() {
  return (
    <div className="flex items-center justify-center h-screen">
      <SignIn />
    </div>
  );
}
