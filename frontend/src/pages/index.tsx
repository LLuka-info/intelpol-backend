import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import UploadBuletin from "../components/UploadBuletin";
import OfiteriActivi from "../components/OfiteriActivi";
import PanouDev from "../components/PanouDeveloper";
import axios from "axios";
import styles from "./styles/index.module.css";
import styleEpoleti from "./styles/gradeOfiteri.module.css";
import getEpoleti from "../utils/gradelePolitie";
import { useRedirectDacaNelogat } from "../hooks/useAuthRedirect"; 

function Home() {
  const isLoadingAuth = useRedirectDacaNelogat();

  const router = useRouter();
  const [dateOfiter, setDateOfiter] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString("ro-RO"));
  const [searchValue, setSearchValue] = useState("");
  const [sugestii, setSugestii] = useState<any[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isSidebarVisibil, setIsSidebarVisibil] = useState(true);
  const sugestiiRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const isLoading = isLoadingAuth || isLoadingProfile;

  const toggleSidebar = () => {
    setIsSidebarVisibil(!isSidebarVisibil);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleString("ro-RO"));
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    if (isLoadingAuth) return;

    const fetchOfficerProfile = async () => {
      try {
        const token = typeof window !== 'undefined' 
          ? localStorage.getItem("auth-token") 
          : null;

        if (!token) {
          router.push("/login");
          return;
        }

        const res = await axios.get("http://localhost:3001/api/ofiteri/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDateOfiter(res.data);
        localStorage.setItem("officer", JSON.stringify(res.data));
      } catch (err) {
        console.error("Eroare preluare profil:", err);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchOfficerProfile();
  }, [router, isLoadingAuth]);

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);
    setHighlightedIndex(-1);
    if (!val.trim()) return setSugestii([]);

    const searchType = /^[0-9]{1,13}$/.test(val) ? "CNP" : "Nume";
    try {
      const token = typeof window !== 'undefined' 
        ? localStorage.getItem("auth-token") 
        : null;

      const res = await axios.post(
        "http://localhost:3001/api/cetateni/search",
        { searchType, searchValue: val },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSugestii(res.data);
    } catch (err) {
      console.error("Eroare căutare autocomplete:", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!sugestii.length) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % sugestii.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev <= 0 ? sugestii.length - 1 : prev - 1));
        break;
      case "Enter":
        if (highlightedIndex >= 0) {
          e.preventDefault();
          router.push(`/cetateni/${sugestii[highlightedIndex].cnp}`);
          setSugestii([]);
          setSearchValue("");
        }
        break;
      case "Escape":
        setSugestii([]);
        break;
    }
  };

  const handleSelectSuggestion = (citizen: any) => {
    router.push(`/cetateni/${citizen.cnp}`);
    setSugestii([]);
    setSearchValue("");
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sugestiiRef.current && !sugestiiRef.current.contains(e.target as Node)) {
        setSugestii([]);
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

  const gradInfo = dateOfiter?.rank
    ? getEpoleti(dateOfiter.rank)
    : { symbol: "?", className: "gradNecunoscut" };

  if (isLoading) return null;

  return (
    <>
      <Head>
        <title>INTELPOL</title>
      </Head>

      <div className={styles.container}>

        <div className={styles.header}>
          <div className={styles.logo}>
            <button className={styles.sidebarToggle} onClick={toggleSidebar}>
            </button>
              INTELPOL
          </div>

          <div className={styles.searchWrapper} ref={sugestiiRef}>
            <input
              type="text"
              placeholder="Caută..."
              value={searchValue}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              className={styles.searchBar}
              autoComplete="off"
            />

            {sugestii.length > 0 && (
              <div className={styles.sugestiiBox}>
                {sugestii.map((citizen, idx) => (
                  <div
                    key={citizen.cnp}
                    onMouseDown={() => handleSelectSuggestion(citizen)}
                    className={`${styles.sugestie} ${
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
            <div className={`${styles.profileCircle} ${styleEpoleti[gradInfo.className]}`} />
            <span>
              {dateOfiter?.fullName}
              <div className={styles.rank}>{dateOfiter?.rank}</div>
            </span>
          </div>
        </div>

        <div className={styles.mainContent}>
          {isSidebarVisibil && (
            <div className={styles.sidebarOverlay} onClick={toggleSidebar} />
          )}

          <div
            className={`${styles.sidebar} ${
              isSidebarVisibil ? styles.sidebarVisible : styles.sidebarHidden
            }`}
          >
            <h2>Ofițeri Activi</h2>
            <OfiteriActivi />
          </div>

          {!isSidebarVisibil && (
            <button
              className={styles.openSidebarButton}
              onClick={toggleSidebar}
              aria-label="Open sidebar"
            >
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
                  onKeyDown={(e) => {
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

            {dateOfiter?.role === "admin" && !selectedFile && (
              <div className={styles.dynamicPanel}>
                <p className="text-center text-gray-600 italic">
                  Selectează o acțiune din panoul de mai sus
                </p>
                <PanouDev />
              </div>
            )}
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.datetime}>{currentTime}</div>
          <button
            className={styles.butonLogout}
            onClick={async () => {
              try {
                const token = typeof window !== 'undefined' 
                  ? localStorage.getItem("auth-token") 
                  : null;
                  
                if (token) {
                  await axios.post(
                    "http://localhost:3001/api/auth/logout",
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                }
                
                if (typeof window !== 'undefined') {
                  localStorage.removeItem("auth-token");
                  localStorage.removeItem("officer");
                }
                router.push("/login");
              } catch (error) {
                console.error("Eroare la deconectare:", error);
              }
            }}
          >
            Deconectare
          </button>
        </div>
      </div>
    </>
  );
}

export default Home;