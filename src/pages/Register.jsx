import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [esp32Url, setEsp32Url] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPass) {
      alert("Mật khẩu không khớp!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/api/public/v1/register", {
        full_name: fullName,
        email,
        password,
        esp32_url: esp32Url,
      });

      alert("Đăng ký thành công! Mời bạn đăng nhập.");
      navigate("/login");
    } catch (error) {
      console.error(error);
      alert("Đăng ký thất bại. Vui lòng kiểm tra lại thông tin!");
    }
  };

  return (
    <div className='auth-container'>
      <h2>Đăng ký</h2>
      <form onSubmit={handleRegister}>
        <input
          type='text'
          placeholder='Họ và tên'
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <input type='email' placeholder='Email' required value={email} onChange={(e) => setEmail(e.target.value)} />
        <input
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
