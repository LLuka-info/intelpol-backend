import React from "react";
import styles from "../pages/styles/Istoric.module.css";

interface Convictie {
  tip: string;          // "Amendă" or "Avertisment"
  descriere: string;    // motivele
  data?: string;        // optional if needed
  ora?: string;         // optional if needed
}

interface AuditEntry {
  timestamp: string;
  officer?: {
    fullName: string;
  };
  addedConvictii?: Convictie[];
}

interface IstoricProps {
  history: AuditEntry[];
}

const Istoric: React.FC<IstoricProps> = ({ history }) => {
  if (!history || history.length === 0) {
    return <div className={styles.empty}>Nicio activitate înregistrată.</div>;
  }

  return (
    <div className={styles.istoricContainer}>
      <h2 className={styles.title}>Istoric acțiuni:</h2>
      <ul className={styles.list}>
        {history.map((entry, index) => {
          const date = new Date(entry.timestamp);
          const dateString = date.toLocaleDateString("ro-RO");
          const timeString = date.toLocaleTimeString("ro-RO", { hour: '2-digit', minute: '2-digit' });
          const copName = entry.officer?.fullName ?? "Agent necunoscut";

          if (!entry.addedConvictii || entry.addedConvictii.length === 0) {
            // If no convictions added, just show a generic entry (optional)
            return (
              <li key={index} className={styles.item}>
                <div>
                  {dateString} | {timeString} | {copName} | Fără amendă sau avertisment
                </div>
              </li>
            );
          }

          // Otherwise list all added convictions on separate lines:
          return entry.addedConvictii.map((conv, i) => (
            <li key={`${index}-${i}`} className={styles.item}>
              <div>
                {dateString} | {timeString} | {copName} | {conv.tip} - {conv.descriere}
              </div>
            </li>
          ));
        })}
      </ul>
    </div>
  );
};

export default Istoric;
