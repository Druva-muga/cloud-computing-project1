import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import moment from "moment";
import "./Overview.css";

function Overview() {
  const [summary, setSummary] = useState({});
  const [attendanceDetails, setAttendanceDetails] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(moment().format("MM"));
  const [selectedYear, setSelectedYear] = useState(moment().format("YYYY"));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const backend = "https://cloud-computing-project1.onrender.com";

    const userId = jwtDecode(token).id;

    const fetchAttendanceSummary = () => {
      setLoading(true);
      axios
        .get(`${backend}/api/attendance/summary/${userId}`, {
          params: { year: selectedYear, month: selectedMonth },
        })
        .then(({ data }) => {
          setSummary(data);
          setLoading(false);
        })
        .catch(() => {
          alert("Failed to load data");
          setLoading(false);
        });
    };

    const fetchDailyAttendance = () => {
      setLoading(true);
      axios
        .get(`${backend}/api/attendance/details/${userId}`, {
          params: { year: selectedYear, month: selectedMonth },
        })
        .then(({ data }) => {
          setAttendanceDetails(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    };

    fetchAttendanceSummary();
    fetchDailyAttendance();
  }, [selectedMonth, selectedYear, navigate]);

  const getAllDaysOfMonth = () => {
    const daysInMonth = moment(
      `${selectedYear}-${selectedMonth}`,
      "YYYY-MM"
    ).daysInMonth();

    return Array.from({ length: daysInMonth }, (_, index) => {
      const date = moment(
        `${selectedYear}-${selectedMonth}-${index + 1}`,
        "YYYY-MM-DD"
      ).format("YYYY-MM-DD");

      const record = attendanceDetails.find(
        (att) => moment(att.date).format("YYYY-MM-DD") === date
      );

      return { date, status: record ? record.status : "No Record" };
    });
  };

  return (
    <div className="overview-container">
      <div className="filter-container">
        <label>Year:</label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="input-select"
        >
          {[2023, 2024, 2025].map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <label>Month:</label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="input-select"
        >
          {Array.from({ length: 12 }).map((_, index) => (
            <option key={index} value={String(index + 1).padStart(2, "0")}>
              {moment().month(index).format("MMMM")}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Year</th>
              <th>Month</th>
              <th>Present Days</th>
              <th>Absent Days</th>
              <th>Leave Days</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{summary.userName}</td>
              <td>{summary.userEmail}</td>
              <td>{selectedYear}</td>
              <td>{moment(selectedMonth, "MM").format("MMMM")}</td>
              <td>{summary.presentDays || 0}</td>
              <td>{summary.absentDays || 0}</td>
              <td>{summary.leaveDays || 0}</td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Overview;
