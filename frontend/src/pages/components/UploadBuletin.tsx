import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

const UploadBuletin = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

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
    const res = await axios.post("http://localhost:3001/api/cetateni/upload", formData, {
      headers: { 
        Authorization: `Bearer ${localStorage.getItem("auth-token")}`
      }
    });

    if (res.data.extractedData.cnp) {
      router.push(`/cetateni/${res.data.extractedData.cnp}`);
    } else {
      alert("CNP nu a putut fi extras din document!");
    }
  } catch (err: any) {
      alert(`Eroare: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
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
          className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? "Procesare..." : "Procesează Imagine"}
        </button>
      </div>
    </div>
  );
};

export default UploadBuletin;
