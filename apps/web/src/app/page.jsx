"use client";

import { useState, useEffect, useRef } from "react";

export default function GalleryPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentTheme, setCurrentTheme] = useState("light");
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  // Theme configurations
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

  // Fetch gallery entries
  const fetchEntries = async () => {
    try {
      const response = await fetch("/api/gallery");
      if (response.ok) {
        const data = await response.json();
        setEntries(data.entries || []);
      }
    } catch (error) {
      console.error("Failed to fetch entries:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch entries on mount and set up polling for real-time updates
  useEffect(() => {
    fetchEntries();

    // Poll every 3 seconds for real-time updates
    const interval = setInterval(fetchEntries, 3000);

    return () => clearInterval(interval);
  }, []);

  // Format actual upload date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle keyboard navigation for image viewer
  useEffect(() => {
    if (selectedImage !== null) {
      const handleKeyPress = (e) => {
        if (e.key === "Escape") {
          setSelectedImage(null);
        } else if (e.key === "ArrowLeft" && selectedImage > 0) {
          setSelectedImage(selectedImage - 1);
        } else if (
          e.key === "ArrowRight" &&
          selectedImage < entries.length - 1
        ) {
          setSelectedImage(selectedImage + 1);
        }
      };

      window.addEventListener("keydown", handleKeyPress);
      return () => window.removeEventListener("keydown", handleKeyPress);
    }
  }, [selectedImage, entries.length]);

  // Handle touch/swipe navigation for image viewer
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && selectedImage < entries.length - 1) {
      setSelectedImage(selectedImage + 1);
    }
    if (isRightSwipe && selectedImage > 0) {
      setSelectedImage(selectedImage - 1);
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

  const theme = themes[currentTheme];

  if (loading) {
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
            padding: "30px",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            fontFamily: "Arial, sans-serif",
            fontSize: "16px",
            color: theme.text,
            textAlign: "center",
            minWidth: "200px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              border: `4px solid ${theme.text}20`,
              borderTop: `4px solid ${theme.text}80`,
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 15px",
            }}
          ></div>
          Loading ZarVault...
          <style jsx global>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <>
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
            padding: "15px 20px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div style={{ flex: "1", minWidth: "200px" }}>
            <div
              style={{
                fontSize: window.innerWidth < 768 ? "20px" : "24px",
                fontWeight: "bold",
                color: "white",
                textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
              }}
            >
              ⚡ ZarVault ⚡
            </div>
          </div>

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
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(255,255,255,0.2)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(255,255,255,0.1)";
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
                    onMouseEnter={(e) => {
                      if (currentTheme !== key) {
                        e.target.style.background = "rgba(0,0,0,0.05)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentTheme !== key) {
                        e.target.style.background = "transparent";
                      }
                    }}
                  >
                    {themeOption.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div
          style={{
            padding: window.innerWidth < 768 ? "20px 15px" : "30px 20px",
          }}
        >
          {/* Gallery Grid */}
          {entries.length === 0 ? (
            <div
              style={{
                background: theme.card,
                borderRadius: "12px",
                padding: window.innerWidth < 768 ? "40px 20px" : "60px 40px",
                textAlign: "center",
                fontSize: window.innerWidth < 768 ? "16px" : "18px",
                color: theme.text,
                boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                maxWidth: "500px",
                margin: "0 auto",
              }}
            >
              <div
                style={{
                  fontSize: window.innerWidth < 768 ? "32px" : "48px",
                  marginBottom: "20px",
                }}
              >
                📸
              </div>
              No photos yet! Upload some memories to get started.
            </div>
          ) : (
            <>
              {/* Vertical Gallery Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    window.innerWidth < 768
                      ? "repeat(auto-fit, minmax(280px, 1fr))"
                      : "repeat(auto-fit, minmax(320px, 1fr))",
                  gap: window.innerWidth < 768 ? "20px" : "25px",
                  maxWidth: "1200px",
                  margin: "0 auto",
                }}
              >
                {entries.map((entry, index) => (
                  <div
                    key={entry.id}
                    style={{
                      background: theme.card,
                      borderRadius: "12px",
                      padding: "15px",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-5px)";
                      e.currentTarget.style.boxShadow =
                        "0 12px 40px rgba(0,0,0,0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 32px rgba(0,0,0,0.2)";
                    }}
                    onClick={() => setSelectedImage(index)}
                  >
                    {/* Photo */}
                    <div
                      style={{
                        borderRadius: "8px",
                        overflow: "hidden",
                        marginBottom: "12px",
                        background:
                          currentTheme === "dark" ? "#374151" : "#f8f9fa",
                      }}
                    >
                      <img
                        src={entry.image_url}
                        alt={entry.caption || "Gallery photo"}
                        style={{
                          width: "100%",
                          height: window.innerWidth < 768 ? "200px" : "240px",
                          objectFit: "cover",
                          display: "block",
                          transition: "transform 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = "scale(1.05)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = "scale(1)";
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>

                    {/* Caption */}
                    {entry.caption && (
                      <div
                        style={{
                          background:
                            currentTheme === "dark"
                              ? "linear-gradient(135deg, #374151, #4b5563)"
                              : "linear-gradient(135deg, #f8f9fa, #e9ecef)",
                          borderRadius: "6px",
                          padding: "10px",
                          fontSize: "14px",
                          marginBottom: "10px",
                          color: theme.text,
                          lineHeight: "1.4",
                        }}
                      >
                        {entry.caption}
                      </div>
                    )}

                    {/* Date/Time */}
                    <div
                      style={{
                        fontSize: "12px",
                        color: currentTheme === "dark" ? "#9ca3af" : "#868e96",
                        textAlign: "right",
                        fontWeight: "500",
                      }}
                    >
                      📅 {formatDate(entry.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Full Screen Image Viewer */}
      {selectedImage !== null && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.95)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: window.innerWidth < 768 ? "10px" : "20px",
          }}
          onClick={() => setSelectedImage(null)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div
            style={{
              position: "relative",
              maxWidth: "90vw",
              maxHeight: "90vh",
            }}
          >
            <img
              src={entries[selectedImage]?.image_url}
              alt={entries[selectedImage]?.caption || "Gallery photo"}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                borderRadius: "8px",
              }}
              onClick={(e) => e.stopPropagation()}
            />

            {/* Navigation buttons */}
            {selectedImage > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(selectedImage - 1);
                }}
                style={{
                  position: "absolute",
                  left: window.innerWidth < 768 ? "-50px" : "-60px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  borderRadius: "50%",
                  width: window.innerWidth < 768 ? "40px" : "50px",
                  height: window.innerWidth < 768 ? "40px" : "50px",
                  color: "white",
                  fontSize: window.innerWidth < 768 ? "16px" : "20px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "rgba(255,255,255,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "rgba(255,255,255,0.2)";
                }}
              >
                ←
              </button>
            )}

            {selectedImage < entries.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(selectedImage + 1);
                }}
                style={{
                  position: "absolute",
                  right: window.innerWidth < 768 ? "-50px" : "-60px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  borderRadius: "50%",
                  width: window.innerWidth < 768 ? "40px" : "50px",
                  height: window.innerWidth < 768 ? "40px" : "50px",
                  color: "white",
                  fontSize: window.innerWidth < 768 ? "16px" : "20px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "rgba(255,255,255,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "rgba(255,255,255,0.2)";
                }}
              >
                →
              </button>
            )}

            {/* Close button */}
            <button
              onClick={() => setSelectedImage(null)}
              style={{
                position: "absolute",
                top: window.innerWidth < 768 ? "-10px" : "-15px",
                right: window.innerWidth < 768 ? "-10px" : "-15px",
                background: "rgba(255,255,255,0.2)",
                border: "none",
                borderRadius: "50%",
                width: window.innerWidth < 768 ? "35px" : "40px",
                height: window.innerWidth < 768 ? "35px" : "40px",
                color: "white",
                fontSize: window.innerWidth < 768 ? "16px" : "18px",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(255,255,255,0.3)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(255,255,255,0.2)";
              }}
            >
              ×
            </button>

            {/* Image info */}
            {entries[selectedImage]?.caption && (
              <div
                style={{
                  position: "absolute",
                  bottom: window.innerWidth < 768 ? "-50px" : "-60px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "rgba(0,0,0,0.8)",
                  color: "white",
                  padding: window.innerWidth < 768 ? "8px 16px" : "10px 20px",
                  borderRadius: "20px",
                  fontSize: window.innerWidth < 768 ? "12px" : "14px",
                  maxWidth: window.innerWidth < 768 ? "280px" : "400px",
                  textAlign: "center",
                }}
              >
                {entries[selectedImage].caption}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        /* Webkit browsers */
        ::-webkit-scrollbar {
          height: 8px;
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.3);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.5);
        }
        
        /* Mobile optimizations */
        @media (max-width: 768px) {
          body {
            -webkit-overflow-scrolling: touch;
          }
          
          /* Hide scrollbars on mobile */
          ::-webkit-scrollbar {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
