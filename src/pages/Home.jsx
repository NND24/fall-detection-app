import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import axios from "axios";

const Home = () => {
  const host = "http://127.0.0.1:8000";
  const navigate = useNavigate();

  const [prediction, setPrediction] = useState("Unknown");
  const [isRecording, setIsRecording] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [user, setUser] = useState(null);
  function getCookie(name) {
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? match[2] : null;
  }

  const userId = getCookie("user_id");

  useEffect(() => {
    fetch(host + "/api/private/user/v1/find-user", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": userId,
        "ngrok-skip-browser-warning": true,
      },
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // chỉ gọi 1 lần ở đây
      })
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        } else {
          navigate("/login");
        }
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        navigate("/login");
      });
  }, [navigate]);

  useEffect(() => {
    console.log(user);
    if (user) {
      setNewUrl(user.esp32_url || "");
    }
  }, [user]);

  useEffect(() => {
    let interval;
    let timeout;

    if (isRecording) {
      // Chờ 30 giây rồi mới bắt đầu fetch mỗi 1 giây
      timeout = setTimeout(() => {
        interval = setInterval(() => {
          fetch(host + "/api/public/v1/prediction", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "X-User-Id": userId,
              "ngrok-skip-browser-warning": true,
            },
            credentials: "include",
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              return response.json();
            })
            .then((data) => {
              setPrediction(data.label);
            })
            .catch((error) => {
              console.error("Error fetching prediction:", error);
              setPrediction("Error fetching prediction");
            });
        }, 1000);
      }, 100);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [isRecording, userId]);

  const toggleRecording = async () => {
    setIsRecording((prev) => !prev);
    const url = isRecording ? `${host}/api/private/user/v1/stop` : `${host}/api/private/user/v1/start`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": userId,
          "ngrok-skip-browser-warning": true,
        },
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to toggle recording");
      const data = await response.json();
      console.log(data.message);
    } catch (error) {
      console.error("Recording toggle error:", error);
      alert("Không thể thực hiện hành động ghi hình. Vui lòng kiểm tra lại server.");
    }
  };

  const handleLogout = () => {
    alert("Đăng xuất thành công!");
    navigate("/login");
  };

  const saveNewUrl = async () => {
    if (user && newUrl !== "") {
      fetch(host + "/api/private/user/v1/change_esp32_url", {
        method: "PUT",
        credentials: "include", // Đảm bảo gửi cookie
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: user.full_name,
          account_id: user.account_id,
          esp32_url: newUrl,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {})
        .catch((error) => {
          console.error("Error:", error);
        });

      setShowUrlInput(false);
    }
  };

  return (
    <div className='video-stream'>
      {/* HEADER */}
      <div className='header'>
        <h1>Fall Detection Admin</h1>
        <div className='header-actions'>
          {user && <span>{user.full_name}</span>}
          <button className='change-url' onClick={() => setShowUrlInput(!showUrlInput)}>
            Đổi URL
          </button>
          <button className='logout' onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </div>

      {/* URL INPUT BOX */}
      {showUrlInput && (
        <div className='url-input-box'>
          <input type='text' value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder='Nhập URL mới' />
          <button onClick={saveNewUrl}>Lưu URL</button>
          <button onClick={() => setShowUrlInput(!showUrlInput)}>Đóng</button>
        </div>
      )}

      {/* NỘI DUNG CHÍNH */}
      <div className='main-content'>
        {/* <div className='left-panel'><canvas className='model-3d-frame' id='3d-model'></canvas> </div>*/}
        <div className='right-panel'>
          {isRecording && (
            <>
              <h2>Live Stream</h2>
              <img src={`${host}/api/private/user/v1/video_feed`} alt='Live Stream' />
            </>
          )}

          <button className={`record-btn ${isRecording ? "stop" : "start"}`} onClick={toggleRecording}>
            {isRecording ? "Stop Recording" : "Start Recording"}
          </button>
        </div>
      </div>

      {/* DƯỚI CÙNG */}
      <div className='bottom-section'>
        <div className='info-box'>
          <h3>Sensor Info</h3>
          <div className='data-container'>
            <div className='data-item'></div>
          </div>
        </div>
        <div className='info-box'>
          <h3>Camera Info</h3>

          <div className='data-item'>
            Gesture: <span>{prediction}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
