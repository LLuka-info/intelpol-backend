import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import UploadBuletin from "../components/UploadBuletin";
import OfiteriActivi from "../components/OfiteriActivi";
import PanouDev from "../components/PanouDeveloper";
import axios from "axios";
import styles from "./styles/index.module.css";
import rankStyles from "./styles/gradeOfiteri.module.css";
import { getRankSymbol } from "../utils/gradelePolitie";

export default function Home() {
  const router = useRouter();
  const [officerData, setOfficerData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString("ro-RO"));
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleString("ro-RO"));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchOfficerProfile = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/ofiteri/profile", {
          headers: { Authorization: `Bearer ${localStorage.getItem("auth-token")}` },
        });
        setOfficerData(res.data);
        localStorage.setItem("officer", JSON.stringify(res.data));
      } catch (err) {
        console.error("Eroare preluare profil:", err);
      } finally {
        setIsLoading(false);
      }
    };

    const token = localStorage.getItem("auth-token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchOfficerProfile();
  }, [router]);

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);
    setHighlightedIndex(-1);
    if (!val.trim()) return setSuggestions([]);

    const searchType = /^[0-9]{1,13}$/.test(val) ? "CNP" : "Nume";
    try {
      const res = await axios.post(
        "http://localhost:3001/api/cetateni/search",
        { searchType, searchValue: val },
        { headers: { Authorization: `Bearer ${localStorage.getItem("auth-token")}` } }
      );
      setSuggestions(res.data);
    } catch (err) {
      console.error("Eroare căutare autocomplete:", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!suggestions.length) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
        break;
      case "Enter":
        if (highlightedIndex >= 0) {
          e.preventDefault();
          router.push(`/cetateni/${suggestions[highlightedIndex].cnp}`);
          setSuggestions([]);
          setSearchValue("");
        }
        break;
      case "Escape":
        setSuggestions([]);
        break;
    }
  };

  const handleSelectSuggestion = (citizen: any) => {
    router.push(`/cetateni/${citizen.cnp}`);
    setSuggestions([]);
    setSearchValue("");
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUploadClick = () => {
    if (!selectedFile) fileInputRef.current?.click();
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    e.target.value = "";
  };

  const rankInfo = officerData?.rank
    ? getRankSymbol(officerData.rank)
    : { symbol: "?", className: "gradNecunoscut" };

  if (isLoading) return null;

  return (
    <>
      <Head>
        <title>INTELPOL</title>
      </Head>

      <div className={styles.container}>
        {/* HEADER */}
        <div className={styles.header}>
          <div className={styles.logo}>
            <button className={styles.sidebarToggle} onClick={toggleSidebar}>
              <i className={`fas fa-${isSidebarVisible ? "times" : "bars"}`}></i>
            </button>
            <i className="fas fa-shield-alt"></i> INTELPOL
          </div>

          <div className={styles.searchWrapper} ref={suggestionsRef}>
            <input
              type="text"
              placeholder="Caută..."
              value={searchValue}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              className={styles.searchBar}
              autoComplete="off"
            />
            <i className={`fas fa-search ${styles.searchIcon}`}></i>
            {suggestions.length > 0 && (
              <div className={styles.suggestionsBox}>
                {suggestions.map((citizen, idx) => (
                  <div
                    key={citizen.cnp}
                    onMouseDown={() => handleSelectSuggestion(citizen)}
                    className={`${styles.suggestionItem} ${
                      idx === highlightedIndex ? styles.highlighted : ""
                    }`}
                  >
                    {citizen.fullName} - {citizen.cnp}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.profileBox}>
            <div className={`${styles.profileCircle} ${rankStyles[rankInfo.className]}`} />
            <span>
              {officerData?.fullName}
              <div className={styles.rank}>{officerData?.rank}</div>
            </span>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className={styles.mainContent}>
          {isSidebarVisible && (
            <div className={styles.sidebarOverlay} onClick={toggleSidebar} />
          )}

          <div
            className={`${styles.sidebar} ${
              isSidebarVisible ? styles.sidebarVisible : styles.sidebarHidden
            }`}
          >
            <h2>Ofițeri Activ</h2>
            <OfiteriActivi />
          </div>

          {/* Floating Open Sidebar Button on Mobile */}
          {!isSidebarVisible && (
            <button
              className={styles.openSidebarButton}
              onClick={toggleSidebar}
              aria-label="Open sidebar"
            >
              <i className="fas fa-bars"></i>
            </button>
          )}

          <div className={styles.centerPanel}>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
              accept="image/*,application/pdf"
              disabled={!!selectedFile}
            />

            {!selectedFile ? (
              <>
                <div
                  className={styles.actionButton}
                  onClick={handleUploadClick}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" || e.key === " ") handleUploadClick();
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="160"
                    height="160"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    style={{ marginRight: "8px", verticalAlign: "middle" }}
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path d="M20 3H4a2 2 0 00-2 2v14a2 2 0 002 2h16a2 2 0 002-2V5a2 2 0 00-2-2zM4 5h16v2H4V5zm0 14v-10h16v10H4z" />
                    <circle cx="8" cy="14" r="2" />
                    <path d="M14 13h4v1h-4zm0 2h4v1h-4z" />
                  </svg>
                  SCANARE BULETIN
                </div>
              </>
            ) : (
              <UploadBuletin file={selectedFile} onDone={() => setSelectedFile(null)} />
            )}

            {officerData?.role === "admin" && !selectedFile && (
              <div className={styles.dynamicPanel}>
                <p className="text-center text-gray-600 italic">
                  Selectează o acțiune din panoul de mai sus
                </p>
                <PanouDev />
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM PANEL */}
        <div className={styles.bottomPanel}>
          <div className={styles.datetime}>{currentTime}</div>
          <button
            className={styles.logoutButton}
            onClick={async () => {
              await axios.post(
                "http://localhost:3001/api/auth/logout",
                {},
                { headers: { Authorization: `Bearer ${localStorage.getItem("auth-token")}` } }
              );
              localStorage.removeItem("auth-token");
              localStorage.removeItem("officer");
              router.push("/login");
            }}
          >
            <i className="fas fa-sign-out-alt"></i> Deconectare
          </button>
        </div>
      </div>
    </>
  );
}
