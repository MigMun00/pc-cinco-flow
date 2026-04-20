import { SignUp } from "@clerk/react";

import AuthShell from "../components/AuthShell";

export default function Register() {
  return (
    <AuthShell>
      <SignUp
        routing="path"
        path="/register"
        signInUrl="/login"
        fallbackRedirectUrl="/"
      />
    </AuthShell>
  );
}