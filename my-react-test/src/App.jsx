import React, { useState } from "react";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";

const App = () => {
  const [user, setUser] = useState(null); // lưu thông tin user sau login
  // useEffect(() => {
  //   // Khi reload, nếu có token → gọi API /api/auth/me để lấy user
  //   const token = localStorage.getItem("accessToken");
  //   if (token) {
  //     fetch("http://localhost:4000/api/auth/me", {
  //       headers: { Authorization: `Bearer ${token}` },
  //     })
  //       .then((res) => res.json())
  //       .then((data) => {
  //         if (data.success) setUser(data.user);
  //         else localStorage.removeItem("accessToken");
  //       })
  //       .catch(() => localStorage.removeItem("accessToken"));
  //   }
  // }, []);
  // Nếu chưa login → hiện LoginPage, ngược lại render HomePage
  if (!user) return <LoginPage onLogin={setUser} />;

  return <HomePage user={user} />;
};

export default App;
