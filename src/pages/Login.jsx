import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // 👉 Giả sử đăng nhập luôn thành công (bạn có thể thêm logic thực tế sau)
    if (email && password) {
      // Có thể lưu vào localStorage nếu muốn
      localStorage.setItem("user", JSON.stringify({ email }));

      // 👉 Điều hướng sang trang chủ
      navigate("/");
    } else {
      alert("Vui lòng nhập đầy đủ email và mật khẩu.");
    }
  };

  return (
    <div className='auth-container'>
      <h2>Đăng nhập</h2>
      <form onSubmit={handleSubmit}>
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
