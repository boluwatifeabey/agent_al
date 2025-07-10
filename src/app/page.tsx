"use client";


import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Home() {

  const { data: session } = authClient.useSession() 
 
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = () => {
    authClient.signUp
      .email({
        email,
        name,
        password,
      }, {
        onSuccess: (data) => {
          window.alert("successfully signed up");
        },
        onError: (error) => {
          window.alert("Something went wrong: ");
        } 
      })
  };
  const onLogin = () => {
    authClient.signIn
      .email({
        email,
        password,
      }, {
        onSuccess: (data) => {
          window.alert("successfully signed up");
        },
        onError: (error) => {
          window.alert("Something went wrong: ");
        } 
      })
  };

  if (session) {
    return (
      <div className="flex flex-col p-4 gap-y-4">
        <p>Logged in as {session.user.name}</p>
        <Button onClick={() => authClient.signOut({})}>
          Sign Out
        </Button>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-y-10">
      <div className="p-4 flex flex-col gap-y-4">
        <input
          placeholder="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={onSubmit}>create account</button>
      </div>
      <div className="p-4 flex flex-col gap-y-4">
        <input
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={onLogin}>Login </button>
      </div>
    </div>
  );
}
