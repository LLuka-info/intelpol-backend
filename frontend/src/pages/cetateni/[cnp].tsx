import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import styles from "../styles/profilCetatean.module.css";
import modalStyles from "../styles/Istoric.module.css";
import Istoric from "../../components/Istoric";
import NumereInmatriculareModal from "../../components/NumereInmatriculareModal";
import {
  getBirthdateFromCNP,
  getAgeFromBirthdate,
  extractCityCountyStreet
} from "../../utils/extragereDateCNP-Adresa";

const ProfilCetatean = () => {
  const router = useRouter();
  const { cnp } = router.query;

  const [citizen, setCitizen] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    amenzi: "",
    avertismente: "",
    observatii: ""
  });
  const [editMode, setEditMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authHeader = {
          headers: { Authorization: `Bearer ${localStorage.getItem("auth-token")}` }
        };

        const res = await axios.get(`http://localhost:3001/api/cetateni/${cnp}`, authHeader);
        const citizenData = res.data;

        setCitizen(citizenData);
        setFormData({
          amenzi: "",
          avertismente: "",
          observatii: citizenData.observatii || ""
        });

        const historyRes = await axios.get(
          `http://localhost:3001/api/cetateni/istoric/${citizenData._id}`,
          authHeader
        );
        setHistory(historyRes.data);
      } catch (err) {
        console.error("Eroare la încărcare:", err);
        alert("Nu s-au putut încărca datele cetățeanului.");
      }
    };

    if (cnp) fetchData();
  }, [cnp]);

  const handleUpdate = async () => {
    try {
      const officerRaw = localStorage.getItem("officer");
      const agent = officerRaw ? JSON.parse(officerRaw).fullName : "Agent Necunoscut";
      const now = new Date();

      const createEntries = (type: string, lines: string[]) =>
        lines.map((descriere) => ({
          tip: type,
          descriere: descriere.trim(),
          data: now.toISOString(),
          ora: now.toTimeString().slice(0, 5),
          agent
        }));

      const newEntries = [
        ...createEntries("Amendă", formData.amenzi.split("\n").filter(Boolean)),
        ...createEntries("Avertisment", formData.avertismente.split("\n").filter(Boolean))
      ];

      const updatedConvictii = [...(citizen.convictii || []), ...newEntries];

      await axios.put(
        `http://localhost:3001/api/cetateni/${citizen._id}`,
        {
          observatii: formData.observatii,
          convictii: updatedConvictii
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("auth-token")}` }
        }
      );

      setCitizen((prev: any) => ({
        ...prev,
        observatii: formData.observatii,
        convictii: updatedConvictii
      }));

      setFormData({ amenzi: "", avertismente: "", observatii: formData.observatii });
      setEditMode(false);
      alert("Datele au fost actualizate cu succes.");
    } catch (err) {
      console.error("Eroare actualizare:", err);
    }
  };

  if (!citizen) return <div className="p-4 text-white">Se încarcă...</div>;

  const birthDate = getBirthdateFromCNP(citizen.cnp);
  const age = getAgeFromBirthdate(birthDate);
  const { judet, oras, strada } = extractCityCountyStreet(citizen.address || "");
  const vehiclePlates = Array.isArray(citizen.drivingInfo?.vehicleInfo)
    ? citizen.vehicleInfo.map((v) =>
        typeof v === "string" ? v : v.numar || JSON.stringify(v)
      ).filter(Boolean)
    : typeof citizen.drivingInfo?.vehicleInfo === "string"
      ? citizen.drivingInfo.vehicleInfo
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean)
      : [];

  return (
    <div className={styles.container}>
      <button onClick={() => router.back()} className={styles.backButton}>
        ← Înapoi la căutare
      </button>

      <div className={styles.profileWrapper}>
        <div className={styles.leftPanel}>
          <h2 className={styles.title}>Date personale:</h2>
          <div className={styles.label}><span>Nume Prenume:</span> {citizen.fullName}</div>
          <div className={styles.label}><span>Vârsta:</span> {age ?? "—"}</div>
          <div className={styles.label}><span>Județ:</span> {judet}</div>
          <div className={styles.label}><span>Oraș:</span> {oras}</div>
          <div className={styles.label}><span>Adresă:</span> {strada}</div>
          <div className={styles.label}><span>CNP:</span> {citizen.cnp}</div>

          <div className={styles.label}>
            <span
              style={{ color: "#4fc3f7", cursor: "pointer", textDecoration: "underline" }}
              onClick={() => setShowModal(true)}
            >
              Numere de înmatriculare
            </span>
          </div>

          <NumereInmatriculareModal
            open={showModal}
            onClose={() => setShowModal(false)}
            vehicleInfo={vehiclePlates}
          />

          {/* Mobile-only Istoric link */}
          <div className={`${styles.label} ${styles.mobileOnly}`}>
            <span
              style={{ color: "#4fc3f7", cursor: "pointer", textDecoration: "underline" }}
              onClick={() => setShowHistoryModal(true)}
            >
              Istoric
            </span>
          </div>

          <div className={styles.editSection}>
            {editMode ? (
              <>
                <textarea
                  placeholder="Amenzi (una pe linie)"
                  value={formData.amenzi}
                  onChange={(e) => setFormData({ ...formData, amenzi: e.target.value })}
                  className={styles.textArea}
                />
                <textarea
                  placeholder="Avertismente (una pe linie)"
                  value={formData.avertismente}
                  onChange={(e) => setFormData({ ...formData, avertismente: e.target.value })}
                  className={styles.textArea}
                />
                <textarea
                  placeholder="Observații"
                  value={formData.observatii}
                  onChange={(e) => setFormData({ ...formData, observatii: e.target.value })}
                  className={styles.textArea}
                />
                <button onClick={handleUpdate} className={styles.saveButton}>Salvează</button>
              </>
            ) : (
              <div className={styles.label}><span>Modifica date</span></div>
            )}
            <button onClick={() => setEditMode(!editMode)} className={styles.editButton}>
              {editMode ? "Anulează" : "Editează"}
            </button>
          </div>
        </div>

        <div className={styles.rightPanel}>
          {/* Show inline Istoric on desktop */}
          <div className={styles.desktopHistory}>
            <Istoric history={history} />
          </div>
        </div>
      </div>

      {/* MOBILE HISTORY MODAL */}
      {showHistoryModal && (
         <div
            className={modalStyles.overlay}
            onClick={() => setShowHistoryModal(false)} // Clicking outside the panel closes modal
          >
            <div
              className={modalStyles.panel}
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside panel
            >
              <button
                className={modalStyles.closeBtn}
                onClick={() => setShowHistoryModal(false)} // Clicking "X" closes modal
              >
                ×
              </button>
              <Istoric history={history} />
            </div>
          </div>
      )}
    </div>
  );
};

export default ProfilCetatean;
