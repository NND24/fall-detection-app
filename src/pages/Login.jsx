import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const host = "https://2cc8-123-21-232-106.ngrok-free.app";
  const [email, setEmail] = useState("levandung.it03@gmail.com");
  const [password, setPassword] = useState("123123");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(host + "/api/public/v1/authenticate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": true,
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Đăng nhập thất bại");
      } else {
        alert("Đăng nhập thành công!");
        navigate("/");
      }
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  return (
    <div className='auth-container'>
      <h2>Đăng nhập</h2>
      <form onSubmit={handleLogin}>
        <input type='email' placeholder='Email' required value={email} onChange={(e) => setEmail(e.target.value)} />
        <input
          type='password'
          placeholder='Mật khẩu'
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type='submit'>Đăng nhập</button>
      </form>
      <p>
        Chưa có tài khoản? <Link to='/register'>Đăng ký</Link>
      </p>
    </div>
  );
}
