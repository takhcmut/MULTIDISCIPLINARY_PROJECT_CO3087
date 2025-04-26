// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Box, Typography, Card, CardContent, Grid } from "@mui/material";
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import "./Dashboard.scss";

const AIO_USERNAME = "BaoLong2004";
const ADA_BASE_URL = `https://io.adafruit.com/api/v2/${AIO_USERNAME}/feeds`;

const Dashboard = () => {
  const [light, setLight] = useState(0);
  const [temp, setTemp] = useState(0);
  const [lightHistory, setLightHistory] = useState([]);
  const [tempHistory, setTempHistory] = useState([]);

  const fetchSensor = async (feedName, setter, historySetter) => {
    try {
      const res = await fetch(`${ADA_BASE_URL}/${feedName}/data?limit=20`);
      const data = await res.json();
      if (data.length > 0) {
        setter(Number(data[0].value));
        const historyData = data.map((item) => ({
          time: new Date(item.created_at).toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
          }),
          value: Number(item.value),
        })).reverse();
        historySetter(historyData);
      }
    } catch (err) {
      console.error("Error fetching sensor:", err);
    }
  };

  useEffect(() => {
    fetchSensor("cambien2", setLight, setLightHistory);
    fetchSensor("cambien1", setTemp, setTempHistory);
    const interval = setInterval(() => {
      fetchSensor("cambien2", setLight, setLightHistory);
      fetchSensor("cambien1", setTemp, setTempHistory);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>

      {/* Mini Cards ở trên */}
      <Grid container spacing={3} justifyContent="center" className="miniCards">
        <Grid item xs={12} sm={6} md={4}>
          <Card className="miniCard" sx={{ borderLeft: "6px solid #4f9c80" }}>
            <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <ThermostatIcon fontSize="large" sx={{ color: "#4f9c80" }} />
              <Box>
                <Typography variant="h6" sx={{ color: "#ccc" }}>Nhiệt độ</Typography>
                <Typography variant="h4" sx={{ color: "#fff" }}>{temp}°C</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card className="miniCard" sx={{ borderLeft: "6px solid #FFD700" }}>
            <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <WbSunnyIcon fontSize="large" sx={{ color: "#FFD700" }} />
              <Box>
                <Typography variant="h6" sx={{ color: "#ccc" }}>Ánh sáng</Typography>
                <Typography variant="h4" sx={{ color: "#fff" }}>{light}%</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Biểu đồ */}
      <div className="charts">
        <div className="chartBox">
          <h4>Biểu đồ nhiệt độ</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={tempHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#4f9c80" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chartBox">
          <h4>Biểu đồ ánh sáng</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lightHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#FFD700" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
