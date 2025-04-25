import React, { useState, useEffect } from "react";
import "./History.scss";

const History = () => {
  const [logs, setLogs] = useState([]);
  
  useEffect(() => {
    fetch("http://localhost:5050/api/logs/device", {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    })
      .then(res => res.json())
      .then(json => {
        const logList = json.logs;
        setLogs(logList);
      })
      .catch(err => console.log(err));
  }, []);

  return (
    <div className="history">
      <h1>Lịch Sử Thiết Bị</h1>
      <table>
        <thead>
          <tr>
            <th>Mã Thiết Bị</th>
            <th>Tên Thiết Bị</th>
            <th>Thương Hiệu</th>
            <th>Mô Hình</th>
            <th>Vị Trí</th>
            <th>Thời Gian Sử Dụng</th>
            <th>Trạng Thái</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, index) => (
            <tr key={index}>
              <td>{log.deviceId}</td>
              <td>{log.name}</td>
              <td>{log.brand}</td>
              <td>{log.model}</td>
              <td>{log.buildingName} - {log.roomNumber}</td>
              <td>{log.usageTime}</td>
              <td>{log.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default History;
