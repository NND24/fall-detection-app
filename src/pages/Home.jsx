import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";

const Home = () => {
  const navigate = useNavigate();

  const [prediction, setPrediction] = useState("Unknown");
  const [isRecording, setIsRecording] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
    } else {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

  useEffect(() => {
    console.log(user);
    if (user) {
      setNewUrl(user.esp32_url || "");
    }
  }, [user]);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        fetch(`http://127.0.0.1:8000/api/public/v1/prediction`)
          .then((response) => response.json())
          .then((data) => setPrediction(data.label))
          .catch((error) => console.error("Error fetching prediction:", error));
      }, 1000);
    }
    return () => interval && clearInterval(interval);
  }, [isRecording]);

  const toggleRecording = async () => {
    const url = isRecording ? `http://127.0.0.1:8000/api/public/v1/stop` : `http://127.0.0.1:8000/api/public/v1/start`;
    try {
      const response = await fetch(url, { method: "POST" });
      if (!response.ok) throw new Error("Failed to toggle recording");
      const data = await response.json();
      console.log(data.message);
      setIsRecording((prev) => !prev);
    } catch (error) {
      console.error("Recording toggle error:", error);
      alert("Không thể thực hiện hành động ghi hình. Vui lòng kiểm tra lại server.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    alert("Đăng xuất thành công!");
    navigate("/login");
  };

  const saveNewUrl = () => {
    setShowUrlInput(false);
  };

  const [sensorData, setSensorData] = useState({
    accelerationX: "Loading...",
    accelerationY: "Loading...",
    accelerationZ: "Loading...",
    gyroX: "Loading...",
    gyroY: "Loading...",
    gyroZ: "Loading...",
    gesture: "Loading...",
  });

  useEffect(() => {
    // Tạo khung 3D
    const canvas = document.getElementById("3d-model");
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    // Tạo một hình hộp đại diện cho cảm biến
    const geometry = new THREE.BoxGeometry(2, 1, 4);
    const material = new THREE.MeshBasicMaterial({
      color: 0x0077ff,
      wireframe: false,
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Thêm ánh sáng
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5).normalize();
    scene.add(light);

    camera.position.z = 5;

    // Hàm xoay dựa trên dữ liệu cảm biến
    function updateModel(gyroX, gyroY, gyroZ) {
      cube.rotation.x = THREE.MathUtils.degToRad(gyroX * 10);
      cube.rotation.y = THREE.MathUtils.degToRad(gyroY * 10);
      cube.rotation.z = THREE.MathUtils.degToRad(gyroZ * 10);
    }

    // Hàm vẽ lại khung hình
    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }

    animate();

    // Kết nối dữ liệu cảm biến từ API
    async function fetchSensorData() {
      try {
        const response = await fetch("http://192.168.43.113/");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // Cập nhật state với dữ liệu cảm biến
        setSensorData({
          accelerationX: `${data.acceleration_x.toFixed(2)} m/s²`,
          accelerationY: `${data.acceleration_y.toFixed(2)} m/s²`,
          accelerationZ: `${data.acceleration_z.toFixed(2)} m/s²`,
          gyroX: `${data.gyro_x.toFixed(2)} rad/s`,
          gyroY: `${data.gyro_y.toFixed(2)} rad/s`,
          gyroZ: `${data.gyro_z.toFixed(2)} rad/s`,
          gesture: data.prediction,
        });

        // Gọi hàm updateModel với dữ liệu cảm biến
        updateModel(data.gyro_x, data.gyro_y, data.gyro_z);
      } catch (error) {
        console.error("Error fetching sensor data:", error);
      }
    }

    // const interval = setInterval(fetchSensorData, 100); // Lấy dữ liệu mỗi 100ms

    // return () => clearInterval(interval); // Cleanup khi component unmounts
  }, []);

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
        <div className='left-panel'>
          <canvas className='model-3d-frame' id='3d-model'></canvas>
        </div>
        <div className='right-panel'>
          {isRecording && (
            <>
              <h2>Live Stream</h2>
              <img src={`http://127.0.0.1:8000/api/public/v1/video_feed`} alt='Live Stream' />
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
            <div className='group'>
              <div className='data-item'>
                Acceleration X: <span>{sensorData.accelerationX}</span>
              </div>
              <div className='data-item'>
                Acceleration Y: <span>{sensorData.accelerationY}</span>
              </div>
              <div className='data-item'>
                Acceleration Z: <span>{sensorData.accelerationZ}</span>
              </div>
            </div>
            <div className='group'>
              <div className='data-item'>
                Gyro X: <span>{sensorData.gyroX}</span>
              </div>
              <div className='data-item'>
                Gyro Y: <span>{sensorData.gyroY}</span>
              </div>
              <div className='data-item'>
                Gyro Z: <span>{sensorData.gyroZ}</span>
              </div>
            </div>
            <div className='data-item'>
              Gesture: <span>{prediction}</span>
            </div>
          </div>
        </div>
        <div className='info-box'>
          <h3>Camera Info</h3>

          <div className='data-item'>
            Gesture: <span>{sensorData.gesture}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
