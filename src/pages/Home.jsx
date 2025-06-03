import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  //http://127.0.0.1:8000
  const host = "https://2cc8-123-21-232-106.ngrok-free.app";
  const navigate = useNavigate();

  const [prediction, setPrediction] = useState("Unknown");
  const [mergedResult, setMergedResult] = useState(null);
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
  }, [navigate, userId]);

  useEffect(() => {
    if (user) {
      setNewUrl(user.esp32_url || "");
    }
  }, [user]);

  useEffect(() => {
    let isActive = true;

    const pollPrediction = async () => {
      if (!isActive) return;

      try {
        const response = await fetch(host + "/api/public/v1/prediction", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-User-Id": userId,
            "ngrok-skip-browser-warning": true,
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setPrediction(data.label);
      } catch (error) {
        console.error("Error fetching prediction:", error);
        setPrediction("Error fetching prediction");
      }

      if (isActive) {
        // Chờ 2s mới fetch tiếp để tránh overload
        setTimeout(pollPrediction, 2000);
      }
    };

    if (isRecording) {
      pollPrediction();
    }

    return () => {
      isActive = false; // Dừng polling khi component unmount hoặc isRecording = false
    };
  }, [isRecording, userId]);

  useEffect(() => {
    let isActive = true;

    const pollPrediction = async () => {
      if (!isActive) return;

      try {
        const response = await fetch(host + "/api/private/user/v1/latest-merged-result", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-User-Id": userId,
            "ngrok-skip-browser-warning": true,
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
        setMergedResult(data);
      } catch (error) {
        console.error("Error fetching prediction:", error);
        setMergedResult("Error fetching prediction");
      }

      if (isActive) {
        // Chờ 2s mới fetch tiếp để tránh overload
        setTimeout(pollPrediction, 2000);
      }
    };

    pollPrediction();

    return () => {
      isActive = false; // Dừng polling khi component unmount hoặc isRecording = false
    };
  }, [userId]);

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

  const [frameSrc, setFrameSrc] = useState(null);
  const isFetchingRef = React.useRef(false);

  useEffect(() => {
    let intervalId;

    if (isRecording) {
      intervalId = setInterval(async () => {
        if (isFetchingRef.current) return; // Nếu đang fetch thì bỏ qua
        isFetchingRef.current = true;

        try {
          const timestamp = new Date().getTime();
          const url = `${host}/api/public/v1/frame?t=${timestamp}`;

          const response = await fetch(url, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
            credentials: "include",
          });

          if (!response.ok) throw new Error("Failed to fetch frame");

          const blob = await response.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
            setFrameSrc(reader.result);
            isFetchingRef.current = false;
          };
          reader.readAsDataURL(blob);
        } catch (error) {
          console.error("Error fetching frame:", error);
          isFetchingRef.current = false;
        }
      }, 300); // thử 300ms
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [isRecording]);

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
          <h2>Kết quả</h2>

          <div className='result-table'>
            <div className='result-header'>
              <div className='result-cell'>Cảm biến</div>
              <div className='result-cell'>Camera</div>
              <div className='result-cell'>Thời gian</div>
            </div>

            {mergedResult &&
              mergedResult?.slice(0, 5)?.map((item, index) => (
                <div className='result-row' key={index}>
                  <div className='result-cell'>{item.mpu6050_res}</div>
                  <div className='result-cell'>{item.camera_res}</div>
                  <div className='result-cell'>
                    {new Date(item.created_time.replace(" ", "T")).toLocaleString("vi-VN")}
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className='right-panel'>
          {isRecording && (
            <>
              <h2>Live Stream</h2>
              <img src={frameSrc} alt='Live Stream' />
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
