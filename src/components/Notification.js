import React, { useEffect, useState, useContext } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axiosConfig";

export default function Notification({ show, onClose }) {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [browserPermission, setBrowserPermission] = useState(
    typeof window !== "undefined" && "Notification" in window
      ? window.Notification.permission
      : "denied"
  );

  // 🔔 Ask browser permission
  const requestBrowserPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      try {
        const permission = await window.Notification.requestPermission();
        console.log("Notification permission:", permission);
        setBrowserPermission(permission);
      } catch (err) {
        console.error("Permission Request Failed:", err);
      }
    }
  };

  useEffect(() => {
    if (!user || !show) return;

    // 📌 Fetch Notifications
    const fetchNotifications = async () => {
      try {
        const res = await api.get(`/api/notifications`, {
          params: { userId: user.id },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };
    fetchNotifications();

    // 🛰 Setup WebSocket
    console.log("Opening WebSocket...");
    const socket = new SockJS(`${process.env.REACT_APP_API_URL}/ws`);
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (msg) => console.log(msg),
      connectHeaders: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    stompClient.onConnect = () => {
      console.log("WebSocket Connected!");

      // 🔐 Subscribe to alerts
      stompClient.subscribe(
        `/topic/alerts/${user.id}`,
        (message) => {
          if (message.body) {
            try {
              const notification = JSON.parse(message.body);
              setMessages((prev) => [notification, ...prev]);

              // 🔔 Show browser popups if user allowed
              if (browserPermission === "granted") {
                new window.Notification(notification.title, {
                  body: notification.message,
                });
              }
            } catch (err) {
              console.error("Failed to parse notification:", err);
            }
          }
        },
        {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      );
    };

    stompClient.activate();

    return () => stompClient.deactivate();
  }, [user, show, browserPermission]);

  // ✳ Mark notification as read
  const markAsRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`, null, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, read: true } : msg))
      );
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  if (!user || !show) return null;

  return (
    <div className="fixed top-4 right-4 w-80 glass-box bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg rounded-xl p-4 z-50 animate-slide-in">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-lg text-white/90">🔔 Notifications</h3>
        <button
          onClick={onClose}
          className="text-red-400 font-bold text-md hover:text-red-600"
        >
          X
        </button>
      </div>

      {/* Show button only if permission not granted */}
      {browserPermission !== "granted" && (
        <button
          onClick={requestBrowserPermission}
          className="w-full mb-2 p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
        >
          Enable Browser Notifications
        </button>
      )}

      {messages.length === 0 ? (
        <p className="text-gray-300 text-sm">No notifications yet.</p>
      ) : (
        <ul className="max-h-64 overflow-auto">
          {messages.map((msg) => (
            <li
              key={msg.id}
              className={`border-b border-white/20 py-2 text-sm ${
                msg.read ? "text-white/70" : "font-bold text-white/90"
              } cursor-pointer`}
              onClick={() => markAsRead(msg.id)}
            >
              <strong>{msg.title}</strong>: {msg.message} <br />
              <small>{new Date(msg.createdAt).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
