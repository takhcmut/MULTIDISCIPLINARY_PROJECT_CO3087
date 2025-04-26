// src/pages/history/History.jsx
import React, { useState, useEffect, useMemo } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./History.scss";

const DADN_BASE = "http://localhost:8080/dadn";

export default function History() {
  const username = localStorage.getItem("username");
  const token    = localStorage.getItem("token");

  const [devices, setDevices]       = useState([]);
  const [selectedId, setSelectedId] = useState("all");
  const [logs, setLogs]             = useState([]);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [loadingLogs, setLoadingLogs]       = useState(false);

  // phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const pageCount = Math.ceil(logs.length / pageSize);

  // sort
  const [sortKey, setSortKey]       = useState("historyId");
  const [sortOrder, setSortOrder]   = useState("desc"); // 'asc' hoặc 'desc'

  // 1) Load danh sách thiết bị
  useEffect(() => {
    setLoadingDevices(true);
    fetch(`${DADN_BASE}/${username}/getequip`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(list => setDevices(list))
      .catch(() => toast.error("Không tải được danh sách thiết bị"))
      .finally(() => setLoadingDevices(false));
  }, [username, token]);

  // 2) Load lịch sử khi selectedId hoặc devices thay đổi
  useEffect(() => {
    setLoadingLogs(true);
    (async () => {
      try {
        let allLogs = [];
        if (selectedId === "all") {
          const responses = await Promise.all(
            devices.map(d =>
              fetch(`${DADN_BASE}/${username}/gethistory/${d.equipKey.equipId}`, {
                headers: { "Authorization": `Bearer ${token}` }
              })
            )
          );
          const arrays = await Promise.all(responses.map(r => r.json()));
          arrays.forEach(arr => allLogs.push(...arr));
        } else {
          const res = await fetch(
            `${DADN_BASE}/${username}/gethistory/${selectedId}`, {
              headers: { "Authorization": `Bearer ${token}` }
            }
          );
          allLogs = await res.json();
        }
        setLogs(allLogs);
        setCurrentPage(1);
      } catch {
        toast.error("Không tải được lịch sử thiết bị");
      } finally {
        setLoadingLogs(false);
      }
    })();
  }, [selectedId, devices, username, token]);

  // sort + pagination memoized
  const paginatedLogs = useMemo(() => {
    const sorted = [...logs].sort((a, b) => {
      let aval, bval;
      switch (sortKey) {
        // case "historyId":
        //   aval = a.historyKey.historyId;
        //   bval = b.historyKey.historyId;
        //   break;
        case "username":
          aval = a.username.toLowerCase();
          bval = b.username.toLowerCase();
          break;
        case "equipId":
          aval = a.equipId;
          bval = b.equipId;
          break;
        case "equipment_state":
          aval = a.equipment_state.toLowerCase();
          bval = b.equipment_state.toLowerCase();
          break;
        case "updateTime":
          aval = new Date(a.updateTime);
          bval = new Date(b.updateTime);
          break;
        default:
          return 0;
      }
      if (aval < bval) return sortOrder === "asc" ? -1 : 1;
      if (aval > bval) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [logs, sortKey, sortOrder, currentPage]);

  // xây mảng số trang hiển thị 5 gần currentPage
  const pageNumbers = [];
  const startPage = Math.max(1, currentPage - 2);
  const endPage   = Math.min(pageCount, currentPage + 2);
  for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

  const handleSort = key => {
    if (sortKey === key) {
      setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const sortIcon = key => {
    if (sortKey !== key) return "↕";
    return sortOrder === "asc" ? "▲" : "▼";
  };

  return (
    <div className="historyPage">
      <ToastContainer position="top-right" autoClose={2000} />

      <aside className="sidebar">
        <h2>Thiết bị</h2>
        {loadingDevices
          ? <div className="loading">Đang tải...</div>
          : <>
              <div
                className={`deviceItem ${selectedId === "all"? "active":""}`}
                onClick={() => setSelectedId("all")}
              >Tất cả</div>
              {devices.map(d =>
                <div
                  key={d.equipKey.equipId}
                  className={`deviceItem ${selectedId===d.equipKey.equipId? "active":""}`}
                  onClick={() => setSelectedId(d.equipKey.equipId)}
                >
                  {d.equipment_type}
                </div>
              )}
            </>
        }
      </aside>

      <main className="historyContent">
        <h1>
          Lịch sử {selectedId==="all"? "Tất cả thiết bị": `Thiết bị #${selectedId}`}
        </h1>

        {loadingLogs
          ? <div className="loading">Đang tải lịch sử...</div>
          : paginatedLogs.length === 0
            ? <div>Không có bản ghi nào.</div>
            : <>
                <table>
                  <thead>
                    <tr>
                      {/* <th onClick={() => handleSort("historyId")}>
                        ID Lịch sử {sortIcon("historyId")}
                      </th> */}
                      <th onClick={() => handleSort("username")}>
                        Username {sortIcon("username")}
                      </th>
                      <th onClick={() => handleSort("equipId")}>
                        Mã Thiết Bị {sortIcon("equipId")}
                      </th>
                      <th onClick={() => handleSort("equipment_state")}>
                        Trạng Thái {sortIcon("equipment_state")}
                      </th>
                      <th onClick={() => handleSort("updateTime")}>
                        Thời Gian {sortIcon("updateTime")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLogs.map((h, idx) => (
                      <tr key={idx}>
                        {/* <td>{h.historyKey.historyId}</td> */}
                        <td>{h.username}</td>
                        <td>{h.equipId}</td>
                        <td>{h.equipment_state}</td>
                        <td>{new Date(h.updateTime).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="pagination">
                  <button onClick={() => setCurrentPage(1)} disabled={currentPage===1}>« Đầu</button>
                  {pageNumbers.map(p =>
                    <button
                      key={p}
                      className={p===currentPage? "active": ""}
                      onClick={() => setCurrentPage(p)}
                    >{p}</button>
                  )}
                  <button onClick={() => setCurrentPage(pageCount)} disabled={currentPage===pageCount}>Cuối »</button>
                </div>
              </>
        }
      </main>
    </div>
  );
}
