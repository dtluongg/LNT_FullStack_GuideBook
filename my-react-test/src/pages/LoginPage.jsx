import React from "react";
import Login from "../components/auth/Login";

export default function LoginPage({ onLogin }) {
  return <Login onLogin={onLogin} />;
}
