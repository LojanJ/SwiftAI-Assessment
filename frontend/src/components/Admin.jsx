/* eslint-disable react-hooks/exhaustive-deps */
import axios from "axios";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";

export const AdminPanel = () => {
  const { isDark } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(false);

  const endpointURL = import.meta.env.VITE_ENDPOINT_URL;

  useEffect(() => {
    setLoading(true);
    async function fetchUsers() {
      try {
        const res = await axios.get(`${endpointURL}/admin/users`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
        });
        if (Array.isArray(res.data.data)) {
          setUsers(res.data.data);
        } else {
          setError("API did not return an array. Check backend/proxy.");
        }
      } catch {
        setError("Unable to fetch Users");
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, [refresh]);

  const handleDelete = (id) => {
    if(window.confirm("Are you sure you want to delete this user?")) {
      axios.delete(`/admin/user/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })
      .then(() => setRefresh((ref) => !ref))
      .catch(() => alert("Failed attempt to delete user"));
    }
  }

  if (loading) return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: isDark ? '#181818' : '#f8f9fa',
      color: isDark ? '#eee' : '#222',
      transition: 'background 0.3s, color 0.3s',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <div className="text-secondary d-flex flex-column align-items-center">
        <Loader className="mb-2 spinner" size={32} />
        <span>Loading users...</span>
      </div>
    </div>
  );
  if (error) return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: isDark ? '#181818' : '#f8f9fa',
      color: isDark ? '#eee' : '#222',
      transition: 'background 0.3s, color 0.3s',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <div className="p-4 border border-danger rounded bg-light shadow-sm">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        {error}
      </div>
    </div>
  );

  const themeStyles = {
    fontFamily: `'Inter', 'Segoe UI', sans-serif`,
    background: isDark ? "#121212" : "#f2f2f2",
    color: isDark ? "#e0e0e0" : "#1a1a1a",
    transition: "all 0.3s ease-in-out",
    minHeight: "100vh",
    padding: "2rem 1rem",
  };

  const containerStyles = {
    background: isDark ? "#1f1f1f" : "#ffffff",
    borderRadius: "12px",
    padding: "2rem",
    boxShadow: isDark
      ? "0 4px 20px rgba(0,0,0,0.6)"
      : "0 4px 20px rgba(0,0,0,0.08)",
    maxWidth: "100%",
    overflowX: "auto",
  };

  const headerCellStyle = {
    padding: "1rem",
    textAlign: "left",
    fontWeight: "600",
    whiteSpace: "nowrap",
    fontSize: "0.95rem",
    backgroundColor: isDark ? "#2a2a2a" : "#f8f9fa",
    color: isDark ? "#f1f1f1" : "#333",
    borderBottom: isDark ? "1px solid #444" : "1px solid #ccc",
  };

  const cellStyle = {
    padding: "0.9rem 0.75rem",
    fontSize: "0.9rem",
    borderBottom: isDark ? "1px solid #444" : "1px solid #e0e0e0",
    backgroundColor: isDark ? "#1f1f1f" : "#fff",
    color: isDark ? "#e0e0e0" : "#333",
    whiteSpace: "nowrap",
  };

  if (loading)
    return (
      <div style={{ ...themeStyles, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div className="text-secondary d-flex flex-column align-items-center">
          <Loader className="mb-2 spinner" size={32} />
          <span>Loading users...</span>
        </div>
      </div>
    );

  if (error)
    return (
      <div style={{ ...themeStyles, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div className="alert alert-danger shadow-sm" role="alert">
          {error}
        </div>
      </div>
    );

  return (
    <div style={themeStyles}>
      <div style={containerStyles}>
        <h2 className="mb-4" style={{ fontWeight: 700, fontSize: "1.5rem" }}>
          All Users
        </h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={headerCellStyle}>Email</th>
                <th style={headerCellStyle}>Name</th>
                <th style={headerCellStyle}>Role</th>
                <th style={headerCellStyle}>Created At</th>
                <th style={headerCellStyle}>Contacts</th>
                <th style={headerCellStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td style={cellStyle}>{user.email || "—"}</td>
                  <td style={cellStyle}>{user.name || "—"}</td>
                  <td style={cellStyle}>{user.role || "—"}</td>
                  <td style={cellStyle}>
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleString()
                      : "—"}
                  </td>
                  <td align="center" style={cellStyle}>
                    {Array.isArray(user.contacts) ? user.contacts.length : 0}
                  </td>
                  <td style={cellStyle}>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(user.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}