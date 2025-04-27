// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField
} from "@mui/material";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import "./Dashboard.scss";

const AIO_USERNAME = "BaoLong2004";
const ADA_BASE_URL  = `https://io.adafruit.com/api/v2/${AIO_USERNAME}/feeds`;

export default function Dashboard() {
  // current values & histories
  const [light, setLight]       = useState(0);
  const [temp,  setTemp]        = useState(0);
  const [lightHistory, setLH]   = useState([]);
  const [tempHistory,  setTH]   = useState([]);
  const [lightError,   setLE]   = useState(null);
  const [tempError,    setTE]   = useState(null);

  // === pickers vs filters ===
  // user-adjusted picker values
  const [startPicker, setStartPicker] = useState(dayjs().startOf('day'));
  const [endPicker,   setEndPicker]   = useState(dayjs().endOf('day'));
  // actual filters used to fetch
  const [startDateTime, setStartDateTime] = useState(dayjs().startOf('day'));
  const [endDateTime,   setEndDateTime]   = useState(dayjs().endOf('day'));

  const fetchSensor = async (feedName, setHistory, setError) => {
    const dayStart = startDateTime.toISOString();
    const dayEnd   = endDateTime.toISOString();
    const url = `${ADA_BASE_URL}/${feedName}/data/chart`
      + `?start_time=${encodeURIComponent(dayStart)}`
      + `&end_time=${encodeURIComponent(dayEnd)}`
      + `&limit=100`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        let msg;
        switch (res.status) {
          case 400: msg = "400 Bad Request — Invalid format."; break;
          case 401: msg = "401 Unauthorized — Check your key."; break;
          case 403: msg = "403 Forbidden — Action not allowed."; break;
          case 404: msg = "404 Not Found — Feed doesn’t exist."; break;
          case 406: msg = "406 Not Acceptable — Unsupported format."; break;
          case 422: msg = "422 Unprocessable — Missing/invalid value."; break;
          case 429: msg = "429 Too Many Requests — Slow down!"; break;
          case 500: msg = "500 Internal Error — Try again later."; break;
          case 503: msg = "503 Service Unavailable — Maintenance."; break;
          default:  msg = `${res.status} ${res.statusText}`; 
        }
        setError(msg);
        return;
      }
      setError(null);

      const json = await res.json();
      const chartData = (json.data || []).map(([dateStr, valStr]) => {
        const d = new Date(dateStr);
        return {
          time: d.toLocaleString('vi-VN', {
            hour:   '2-digit',
            minute: '2-digit',
            day:    '2-digit',
            month:  '2-digit',
          }),
          value: Number(valStr).toFixed(2),
        };
      });
      setHistory(chartData);
    } catch (err) {
      setError(`Network error: ${err.message}`);
    }
  };
  const fetchLatestSensor = async (feedName, setValue, setError) => {
    const url = `${ADA_BASE_URL}/${feedName}/data?limit=1`;
  
    try {
      const res = await fetch(url);
      if (!res.ok) {
        let msg;
        switch (res.status) {
          case 400: msg = "400 Bad Request — Invalid format."; break;
          case 401: msg = "401 Unauthorized — Check your key."; break;
          case 403: msg = "403 Forbidden — Action not allowed."; break;
          case 404: msg = "404 Not Found — Feed doesn’t exist."; break;
          case 406: msg = "406 Not Acceptable — Unsupported format."; break;
          case 422: msg = "422 Unprocessable — Missing/invalid value."; break;
          case 429: msg = "429 Too Many Requests — Slow down!"; break;
          case 500: msg = "500 Internal Error — Try again later."; break;
          case 503: msg = "503 Service Unavailable — Maintenance."; break;
          default:  msg = `${res.status} ${res.statusText}`; 
        }
        setError(msg);
        return;
      }
      setError(null);
  
      const json = await res.json();
      const latestValue = Number(json[0].value).toFixed(2);
      setValue(latestValue);
    } catch (err) {
      setError(`Network error: ${err.message}`);
    }
  };
  

  useEffect(() => {
    // fetch history immediately whenever time range changes
    fetchSensor("cambien2", setLH, setLE);
    fetchSensor("cambien1",  setTH, setTE);
  
    // also set a 5s interval to refresh the charts
    const historyInterval = setInterval(() => {
      fetchSensor("cambien2", setLH, setLE);
      fetchSensor("cambien1",  setTH, setTE);
    }, 5000);
  
    // set a 2s interval to fetch latest values separately
    const latestInterval = setInterval(() => {
      fetchLatestSensor("cambien2", setLight, setLE);
      fetchLatestSensor("cambien1", setTemp,  setTE);
    }, 2000);
  
    return () => {
      clearInterval(historyInterval);
      clearInterval(latestInterval);
    };
  }, [startDateTime, endDateTime]);
  

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>

      {/* Mini Cards */}
      <Grid container spacing={3} justifyContent="center" className="miniCards">
        <Grid item xs={12} sm={6} md={4}>
          <Card className="miniCard" sx={{ borderLeft: "6px solid #4f9c80" }}>
            <CardContent sx={{
              display:        "flex",
              alignItems:     "center",
              justifyContent: "space-between"
            }}>
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
            <CardContent sx={{
              display:        "flex",
              alignItems:     "center",
              justifyContent: "space-between"
            }}>
              <WbSunnyIcon fontSize="large" sx={{ color: "#FFD700" }} />
              <Box>
                <Typography variant="h6" sx={{ color: "#ccc" }}>Ánh sáng</Typography>
                <Typography variant="h4" sx={{ color: "#fff" }}>{light}%</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* From / To DateTime Pickers */}
      <Box display="flex" justifyContent="center" gap={2} mb={4}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateTimePicker
            label="Từ (ngày giờ)"
            value={startPicker}
            onChange={v => v && setStartPicker(v)}
            // only confirm when user clicks "OK"
            onAccept={v => {
              if (v.isAfter(endDateTime)) {
                toast.error("Thời gian bắt đầu phải trước hoặc bằng thời gian kết thúc.");
              } else {
                setStartDateTime(v);
              }
            }}
            renderInput={params => <TextField {...params} size="small" />}
          />
          <DateTimePicker
            label="Đến (ngày giờ)"
            value={endPicker}
            onChange={v => v && setEndPicker(v)}
            onAccept={v => {
              if (v.isBefore(startDateTime)) {
                toast.error("Thời gian kết thúc phải sau hoặc bằng thời gian bắt đầu.");
              } else {
                setEndDateTime(v);
              }
            }}
            renderInput={params => <TextField {...params} size="small" />}
          />
        </LocalizationProvider>
      </Box>

      {/* Charts */}
      <div className="charts">
        {/* Temperature */}
        <div className="chartBox">
          <h4>Biểu đồ nhiệt độ</h4>
          {tempError ? (
            <Typography color="error" align="center">{tempError}</Typography>
          ) : tempHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={tempHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#4f9c80" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Typography align="center">Không có dữ liệu cho khoảng đã chọn.</Typography>
          )}
        </div>

        {/* Light */}
        <div className="chartBox">
          <h4>Biểu đồ ánh sáng</h4>
          {lightError ? (
            <Typography color="error" align="center">{lightError}</Typography>
          ) : lightHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lightHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#FFD700" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Typography align="center">Không có dữ liệu cho khoảng đã chọn.</Typography>
          )}
        </div>
      </div>
    </div>
  );
}
