import React from "react";
import styles from "../pages/styles/masiniLista.module.css";

interface Props {
  open: boolean;
  onClose: () => void;
  vehicleInfo: string[];
}

const NumereInmatriculareModal: React.FC<Props> = ({ open, onClose, vehicleInfo }) => {
  if (!open) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h3 className={styles.modalTitle}>NR DE INMATRICULARE</h3>
        <ul className={styles.modalList}>
          {vehicleInfo?.length
            ? vehicleInfo.map((nr, idx) => <li key={idx}>{nr}</li>)
            : <li>—</li>
          }
        </ul>
        <button onClick={onClose} className={styles.modalClose}>Închide</button>
      </div>
    </div>
  );
};

export default NumereInmatriculareModal;
