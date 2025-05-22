import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

const UploadBuletin = () => {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const router = useRouter();

 const handleUpload = async () => {
  if (!file) {
    alert("Vă rugăm să selectați un fișier.");
    return;
  }

  setLoading(true);

  const formData = new FormData();
  formData.append("image", file);

  try {
    const res = await axios.post('http://localhost:3001/api/cetateni/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    if (!res.data.success) {
      throw new Error(res.data.message || 'Eroare necunoscută');
    }

    if (res.data.createNew) {
      setExtractedData({
        ...res.data.extractedData,
        address: res.data.extractedData.address || "Adresă necunoscută"
      });
      setShowModal(true);
    } else {
      setResult(res.data.citizen);
      alert("Cetățean existent în baza de date");
    }
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || 
                    err.message || 
                    "Eroare la procesarea buletinului";
    
    alert(`Eroare: ${errorMsg}`);
    
    if (err.response?.data?.debug) {
      console.error("Debug info:", err.response.data.debug);
    }
  } finally {
    setLoading(false);
  }
};

  const handleConfirmCreate = () => {
    setShowModal(false);
    router.push({
      pathname: "/cauta",
      query: {
        createNew: true,
        fullName: extractedData?.fullName,
        cnp: extractedData?.cnp,
        address: extractedData?.address
      }
    });
  };

  const handleCancelCreate = () => {
    setShowModal(false);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Încarcă Buletin</h1>
      <div className="border-2 border-dashed p-4 mb-4">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          accept="image/*"
          className="mb-2 w-full p-2 border rounded"
        />

        <button
          onClick={handleUpload}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "Procesare..." : "Procesează Imagine"}
        </button>
      </div>

      {result && (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-2">Date extrase:</h2>
          <p className="mb-1">Nume: {result.fullName || "-"}</p>
          <p className="mb-1">CNP: {result.cnp || "-"}</p>
          <p>Adresă: {result.address || "-"}</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Cetățean negăsit</h2>
            <p className="mb-4">Doriți să creați un dosar nou cu următoarele date?</p>
            
            <div className="space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="font-medium">Nume:</span>
                <span>{extractedData?.fullName || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">CNP:</span>
                <span className="font-mono">{extractedData?.cnp || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Adresă:</span>
                <span className="text-right">{extractedData?.address || "-"}</span>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelCreate}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                Anulează
              </button>
              <button
                onClick={handleConfirmCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Confirmă
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadBuletin;