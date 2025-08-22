"use client";

import { useState, useCallback, useEffect } from "react";
import useUpload from "@/utils/useUpload";
import { useIdleTimer } from 'react-idle-timer/dist/hooks'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [upload, { loading: uploadLoading }] = useUpload();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [entries, setEntries] = useState([]);
  const [currentTheme, setCurrentTheme] = useState("light");
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  // Theme configurations (same as main gallery)
  const themes = {
    light: {
      name: "☀️ Light",
      background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
      header: "linear-gradient(90deg, #1f2937, #374151)",
      card: "rgba(255,255,255,0.95)",
      text: "#1f2937",
      accent: "linear-gradient(45deg, #3b82f6, #6366f1)",
    },
    dark: {
      name: "🌙 Dark",
      background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
      header: "linear-gradient(90deg, #000000, #1f2937)",
      card: "rgba(31, 41, 55, 0.95)",
      text: "#e5e7eb",
      accent: "linear-gradient(45deg, #6366f1, #8b5cf6)",
    },
  };

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("zarVaultTheme") || "light";
    setCurrentTheme(savedTheme);
  }, []);

  // Save theme to localStorage
  const changeTheme = (themeName) => {
    setCurrentTheme(themeName);
    localStorage.setItem("zarVaultTheme", themeName);
    setShowThemeMenu(false);
  };

  // Check for saved authentication on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem("zarVaultAdmin");
    if (savedAuth === "true") {
      setIsAuthenticated(true);
      fetchEntries();
    }
  }, []);

  // Fetch gallery entries for admin overview
  const fetchEntries = async () => {
    try {
      const response = await fetch("/api/gallery");
      if (response.ok) {
        const data = await response.json();
        setEntries(data.entries || []);
      }
    } catch (error) {
      console.error("Failed to fetch entries:", error);
    }
  };

  // Close theme menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowThemeMenu(false);
    if (showThemeMenu) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showThemeMenu]);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordInput === "a6uzar") {
      setIsAuthenticated(true);
      localStorage.setItem("zarVaultAdmin", "true");
      setMessage("");
      fetchEntries();
    } else {
      setMessage("Incorrect password!");
      setTimeout(() => setMessage(""), 3000);
    }
    setPasswordInput("");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("zarVaultAdmin");
    setPasswordInput("");
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImageUrl(""); // Clear URL if file is selected
    }
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!selectedFile && !imageUrl) {
        setMessage("Please select a photo or provide an image URL!");
        setTimeout(() => setMessage(""), 3000);
        return;
      }

      setSubmitting(true);
      setMessage("");

      try {
        let finalImageUrl = imageUrl;

        // If file is selected, upload it first
        if (selectedFile) {
          const { url, error: uploadError } = await upload({
            file: selectedFile,
          });

          if (uploadError) {
            setMessage(`Upload failed: ${uploadError}`);
            setTimeout(() => setMessage(""), 5000);
            return;
          }
          finalImageUrl = url;
        }

        // Save to database
        const response = await fetch("/api/gallery", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image_url: finalImageUrl,
            caption: caption.trim() || null,
          }),
        });

        if (response.ok) {
          setMessage("Photo uploaded successfully! 🎉");
          setSelectedFile(null);
          setImageUrl("");
          setCaption("");
          // Reset file input
          const fileInput = document.querySelector('input[type="file"]');
          if (fileInput) fileInput.value = "";
          fetchEntries(); // Refresh entries
          setTimeout(() => setMessage(""), 3000);
        } else {
          throw new Error("Failed to save photo");
        }
      } catch (error) {
        console.error("Upload error:", error);
        setMessage("Failed to upload photo. Please try again.");
        setTimeout(() => setMessage(""), 5000);
      } finally {
        setSubmitting(false);
      }
    },
    [selectedFile, imageUrl, caption, upload],
  );

  const theme = themes[currentTheme];

  // Password screen
  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen"
        style={{
          background: theme.background,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <div
          style={{
            background: theme.card,
            padding: "40px",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            minWidth: window.innerWidth < 768 ? "300px" : "400px",
            color: theme.text,
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <div
              style={{
                fontSize: window.innerWidth < 768 ? "24px" : "28px",
                fontWeight: "bold",
                background: theme.accent,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                marginBottom: "10px",
              }}
            >
              ⚡ ZarVault Admin ⚡
            </div>
            <div
              style={{
                fontSize: "14px",
                color: currentTheme === "dark" ? "#9ca3af" : "#666",
              }}
            >
              Photo Upload Panel
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit}>
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                  color: theme.text,
                }}
              >
                Access Password
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter admin password"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: `2px solid ${currentTheme === "dark" ? "#374151" : "#e2e8f0"}`,
                  borderRadius: "8px",
                  fontSize: "14px",
                  transition: "all 0.3s ease",
                  background: currentTheme === "dark" ? "#1f2937" : "white",
                  color: theme.text,
                }}
                autoFocus
              />
            </div>

            {message && (
              <div
                style={{
                  background: "#fee2e2",
                  border: "1px solid #fecaca",
                  color: "#dc2626",
                  padding: "12px",
                  borderRadius: "6px",
                  marginBottom: "20px",
                  fontSize: "14px",
                }}
              >
                ❌ {message}
              </div>
            )}

            <button
              type="submit"
              style={{
                width: "100%",
                background: theme.accent,
                color: "white",
                border: "none",
                padding: "12px",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              🔓 Access Admin Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Main admin interface
  return (
    <div
      className="min-h-screen"
      style={{
        background: theme.background,
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: theme.header,
          color: "white",
          padding: "20px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: window.innerWidth < 768 ? "20px" : "24px",
              fontWeight: "bold",
              color: "white",
              textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
            }}
          >
            ⚡ ZarVault Admin ⚡
          </div>
          <div style={{ fontSize: "14px", opacity: "0.8", color: "white" }}>
            Photo Upload & Management
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "15px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {/* Theme Selector */}
          <div style={{ position: "relative" }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowThemeMenu(!showThemeMenu);
              }}
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "white",
                padding: "8px 16px",
                borderRadius: "20px",
                cursor: "pointer",
                fontSize: "14px",
                transition: "all 0.3s ease",
              }}
            >
              🎨 {theme.name}
            </button>

            {showThemeMenu && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: "0",
                  marginTop: "5px",
                  background: theme.card,
                  borderRadius: "12px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                  padding: "10px",
                  minWidth: "160px",
                  zIndex: 100,
                }}
              >
                {Object.entries(themes).map(([key, themeOption]) => (
                  <button
                    key={key}
                    onClick={() => changeTheme(key)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "none",
                      background:
                        currentTheme === key
                          ? "rgba(0,0,0,0.1)"
                          : "transparent",
                      color: theme.text,
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "14px",
                      textAlign: "left",
                      transition: "all 0.2s ease",
                      marginBottom: "2px",
                    }}
                  >
                    {themeOption.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <a
            href="/"
            style={{
              color: "rgba(255,255,255,0.8)",
              textDecoration: "none",
              fontSize: "14px",
              transition: "color 0.3s ease",
            }}
          >
            🏠 View Gallery
          </a>
          <button
            onClick={handleLogout}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "white",
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              transition: "all 0.3s ease",
            }}
          >
            🚪 Logout
          </button>
        </div>
      </div>

      <div
        style={{ padding: window.innerWidth < 768 ? "20px 15px" : "30px 20px" }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          {/* Upload Form */}
          <div
            style={{
              background: theme.card,
              borderRadius: "12px",
              padding: window.innerWidth < 768 ? "20px" : "30px",
              marginBottom: "30px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              color: theme.text,
            }}
          >
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                marginBottom: "20px",
                color: theme.text,
                borderBottom: `2px solid ${currentTheme === "dark" ? "#374151" : "#e2e8f0"}`,
                paddingBottom: "10px",
              }}
            >
              📸 Upload New Photo
            </h2>

            <form onSubmit={handleSubmit}>
              {/* File Upload */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "500",
                    color: theme.text,
                  }}
                >
                  Photo Upload
                </label>
                <div
                  style={{
                    border: `2px dashed ${currentTheme === "dark" ? "#374151" : "#cbd5e0"}`,
                    borderRadius: "8px",
                    padding: "20px",
                    textAlign: "center",
                    transition: "all 0.3s ease",
                    background:
                      currentTheme === "dark" ? "#1f2937" : "transparent",
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{
                      width: "100%",
                      padding: "10px",
                      fontSize: "14px",
                      background: "transparent",
                      color: theme.text,
                    }}
                  />
                  {selectedFile && (
                    <div
                      style={{
                        marginTop: "10px",
                        fontSize: "14px",
                        color: "#059669",
                      }}
                    >
                      ✓ Selected: {selectedFile.name}
                    </div>
                  )}
                </div>
              </div>

              <div
                style={{
                  textAlign: "center",
                  margin: "20px 0",
                  color: currentTheme === "dark" ? "#9ca3af" : "#666",
                  fontSize: "14px",
                }}
              >
                OR
              </div>

              {/* Image URL */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "500",
                    color: theme.text,
                  }}
                >
                  Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: `2px solid ${currentTheme === "dark" ? "#374151" : "#e2e8f0"}`,
                    borderRadius: "8px",
                    fontSize: "14px",
                    background: currentTheme === "dark" ? "#1f2937" : "white",
                    color: theme.text,
                  }}
                />
              </div>

              {/* Caption */}
              <div style={{ marginBottom: "25px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "500",
                    color: theme.text,
                  }}
                >
                  Caption (Optional)
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Add a description or caption for this photo..."
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: `2px solid ${currentTheme === "dark" ? "#374151" : "#e2e8f0"}`,
                    borderRadius: "8px",
                    fontSize: "14px",
                    resize: "vertical",
                    fontFamily: "Arial, sans-serif",
                    background: currentTheme === "dark" ? "#1f2937" : "white",
                    color: theme.text,
                  }}
                />
              </div>

              {/* Message */}
              {message && (
                <div
                  style={{
                    background: message.includes("successfully")
                      ? "#d1fae5"
                      : "#fee2e2",
                    border: `1px solid ${message.includes("successfully") ? "#a7f3d0" : "#fecaca"}`,
                    color: message.includes("successfully")
                      ? "#065f46"
                      : "#dc2626",
                    padding: "12px",
                    borderRadius: "6px",
                    marginBottom: "20px",
                    fontSize: "14px",
                  }}
                >
                  {message}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || uploadLoading}
                style={{
                  width: "100%",
                  background:
                    submitting || uploadLoading ? "#9ca3af" : theme.accent,
                  color: "white",
                  border: "none",
                  padding: "15px",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "500",
                  cursor:
                    submitting || uploadLoading ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                {submitting || uploadLoading
                  ? "⏳ Uploading..."
                  : "🚀 Upload Photo"}
              </button>
            </form>
          </div>

          {/* Recent Uploads */}
          <div
            style={{
              background: theme.card,
              borderRadius: "12px",
              padding: window.innerWidth < 768 ? "20px" : "30px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              color: theme.text,
            }}
          >
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                marginBottom: "20px",
                color: theme.text,
                borderBottom: `2px solid ${currentTheme === "dark" ? "#374151" : "#e2e8f0"}`,
                paddingBottom: "10px",
              }}
            >
              📋 Recent Uploads ({entries.length})
            </h2>

            {entries.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: currentTheme === "dark" ? "#9ca3af" : "#666",
                }}
              >
                No photos uploaded yet. Start uploading to see them here!
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: "15px",
                  maxHeight: "400px",
                  overflowY: "auto",
                }}
              >
                {entries.slice(0, 12).map((entry) => (
                  <div
                    key={entry.id}
                    style={{
                      border: `2px solid ${currentTheme === "dark" ? "#374151" : "#e2e8f0"}`,
                      borderRadius: "8px",
                      padding: "10px",
                      background:
                        currentTheme === "dark" ? "#1f2937" : "#f8f9fa",
                    }}
                  >
                    <img
                      src={entry.image_url}
                      alt={entry.caption || "Gallery photo"}
                      style={{
                        width: "100%",
                        height: "120px",
                        objectFit: "cover",
                        borderRadius: "4px",
                        marginBottom: "8px",
                      }}
                    />
                    {entry.caption && (
                      <div
                        style={{
                          fontSize: "12px",
                          color: currentTheme === "dark" ? "#d1d5db" : "#666",
                          marginBottom: "5px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {entry.caption}
                      </div>
                    )}
                    <div
                      style={{
                        fontSize: "11px",
                        color: currentTheme === "dark" ? "#9ca3af" : "#999",
                      }}
                    >
                      {new Date(entry.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
