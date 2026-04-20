import { SignIn } from "@clerk/react";

import AuthShell from "../components/AuthShell";

export default function Login() {
  return (
    <AuthShell>
      <SignIn
        routing="path"
        path="/login"
        signUpUrl="/register"
        fallbackRedirectUrl="/"
      />
    </AuthShell>
  );
}
