import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [esp32Url, setEsp32Url] = useState("");
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();

    if (password !== confirmPass) {
      alert("Mật khẩu không khớp!");
      return;
    }

    // Giả sử chỉ lưu 1 user cho đơn giản
    const userData = {
      email,
      password,
      esp32Url,
    };

    localStorage.setItem("user", JSON.stringify(userData));

    alert("Đăng ký thành công! Mời bạn đăng nhập.");
    navigate("/login");
  };

  return (
    <div className='auth-container'>
      <h2>Đăng ký</h2>
      <form onSubmit={handleRegister}>
        <input type='email' placeholder='Email' required value={email} onChange={(e) => setEmail(e.target.value)} />
        <input
          name='url'
          type='text'
          placeholder='Nhập url của ESP32-CAM'
          required
          value={esp32Url}
          onChange={(e) => setEsp32Url(e.target.value)}
        />
        <input
          type='password'
          placeholder='Mật khẩu'
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type='password'
          placeholder='Xác nhận mật khẩu'
          required
          value={confirmPass}
          onChange={(e) => setConfirmPass(e.target.value)}
        />
        <button type='submit'>Đăng ký</button>
      </form>
      <p>
        Đã có tài khoản? <Link to='/login'>Đăng nhập</Link>
      </p>
    </div>
  );
}
