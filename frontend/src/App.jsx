import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth,
} from "@clerk/react";

function App() {
  const { getToken } = useAuth();

  const testBackend = async () => {
    const token = await getToken();

    const res = await fetch("http://127.0.0.1:8000/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    console.log(data);
    console.log(token);
  };

  return (
    <>
      <header>
        <Show when="signed-out">
          <SignInButton />
          <SignUpButton />
        </Show>

        <Show when="signed-in">
          <UserButton />
          <button onClick={testBackend}>Test Backend</button>
        </Show>
      </header>
    </>
  );
}

export default App;
