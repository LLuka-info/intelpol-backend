import { useEffect, useState } from "react";
import axios from "axios";
import styles from "../pages/styles/baraofiteri.module.css";
import rankStyles from "../pages/styles/gradeOfiteri.module.css";
import getEpoleti from "../utils/gradelePolitie";

const OfiteriActivi = () => {
  const [officers, setOfficers] = useState<any[]>([]);

  useEffect(() => {
    const fetchOfficers = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/ofiteri/activi", {
          headers: { Authorization: `Bearer ${localStorage.getItem("auth-token")}` }
        });
        setOfficers(res.data);
      } catch (err) {
        console.error("Eroare la preluare ofițeri:", err);
      }
    };
    
    fetchOfficers();
    const interval = setInterval(fetchOfficers, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.ofiteriContainer}>
      <div className="space-y-3">
        {officers.map(officer => {
          const rankInfo = getEpoleti(officer.rank);
          
          return (
            <div key={officer._id} className={`${styles.ofiteriBox}`}>
              <div className={styles.ofiteriInfoContainer}>
                <div className={styles.rankCircle}>
                  <div className={`${rankStyles.rankInsignia} ${rankStyles[rankInfo.className]}`} />
                </div>
                <div className={styles.ofiteriTextContainer}>
                  <p className={styles.ofiteriNume}>{officer.fullName}</p>
                  <p className={styles.ofiteriGrad}>{officer.rank}</p>
                </div>
              </div>
              <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OfiteriActivi;