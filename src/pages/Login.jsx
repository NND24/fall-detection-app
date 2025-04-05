import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:8000/api/public/v1/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Đăng nhập thất bại");
      }

      const data = await response.json();
      localStorage.setItem("user", JSON.stringify(data.user));

      alert("Đăng nhập thành công!");
      navigate("/");
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
