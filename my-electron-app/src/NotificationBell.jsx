import { useEffect, useState } from "react";
import { Bell, Briefcase, Calendar, CheckCircle2, X, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import "./Notificationbell.css";

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const token = localStorage.getItem("token");

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/notifications/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (Array.isArray(data)) {
        const sorted = data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setNotifications(sorted);
      }
    } catch {
      toast.error("Failed to load notifications");
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Mark as read
  const markAsRead = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      toast.error("Failed to update notification");
    }
  };

  // Clear all
  const clearAll = async () => {
    try {
      await fetch("http://localhost:5000/api/notifications/clear", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications([]);
      toast.success("All notifications cleared");
    } catch {
      toast.error("Failed to clear notifications");
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "invite":
        return <Calendar size={18} color="#60a5fa" />;
      case "offer":
        return <Briefcase size={18} color="#10b981" />;
      case "system":
        return <CheckCircle2 size={18} color="#facc15" />;
      default:
        return <Bell size={18} color="#9ca3af" />;
    }
  };

  return (
    <>
      {/* Floating Bell */}
      <button className="global-bell-btn" onClick={() => setOpen(!open)}>
        <Bell size={22} />
        {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
      </button>

      {open && <div className="notification-overlay" onClick={() => setOpen(false)} />}

      {open && (
        <div className="notification-sidebar-fixed">
          <div className="sidebar-header">
            <h3>Notifications</h3>
            <div className="header-actions">
              {notifications.length > 0 && (
                <button className="clear-btn" onClick={clearAll} title="Clear all">
                  <Trash2 size={16} />
                </button>
              )}
              <button className="close-btn" onClick={() => setOpen(false)}>
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">No notifications yet</div>
            ) : (
              notifications.map((note) => (
                <div
                  key={note._id}
                  className={`notification-card-fixed ${
                    note.isRead ? "" : "unread"
                  } ${note.type === "invite" ? "highlight" : ""}`}
                  onClick={() => markAsRead(note._id)}
                >
                  <div className="note-icon">{getIcon(note.type)}</div>
                  <div className="note-content">
                    <h4>{note.title}</h4>
                    <p>{note.message}</p>

                    {/* Highlight Interview Details */}
                    {note.type === "invite" && (
  <div className="interview-details">
    {note.companyName && (
      <div>
        <strong>Company:</strong> {note.companyName}
      </div>
    )}
    {note.role && (
      <div>
        <strong>Role:</strong> {note.role}
      </div>
    )}
    {note.interviewDate && (
      <div>
        <strong>Schedule:</strong>{" "}
        {new Date(note.interviewDate).toLocaleDateString()} |{" "}
        {new Date(note.interviewDate).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    )}
    {note.interviewLink && (
      <div>
        <a
          href={note.interviewLink}
          target="_blank"
          rel="noreferrer"
          className="note-link"
        >
          Join Interview →
        </a>
      </div>
    )}
  </div>
)}

                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default NotificationBell;
