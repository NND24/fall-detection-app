import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const host = " https://35de-2a09-bac5-d46d-16dc-00-247-fe.ngrok-free.app";
  const [email, setEmail] = useState("ngocdatnguyen2404@gmail.com");
  const [password, setPassword] = useState("123456789");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(host + "/api/public/v1/authenticate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
