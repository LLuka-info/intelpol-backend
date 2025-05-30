import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

interface UploadBuletinProps {
  file: File;
  onDone: () => void;
}

const UploadBuletin = ({ file, onDone }: UploadBuletinProps) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const uploadFile = async () => {
      setLoading(true);
      setErrorMsg(null);

      const formData = new FormData();
      formData.append("image", file);

      try {
        const res = await axios.post(
          "http://localhost:3001/api/cetateni/upload",
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
            },
          }
        );

        if (res.data.extractedData?.cnp) {
          router.push(`/cetateni/${res.data.extractedData.cnp}`);
        } else {
          setErrorMsg("CNP nu a putut fi extras din document!");
        }
      } catch (err: any) {
        setErrorMsg(err.response?.data?.message || err.message || "Eroare necunoscută");
      } finally {
        setLoading(false);
        onDone();
      }
    };

    uploadFile();
  }, [file, onDone, router]);

  return (
    <div className="p-4 max-w-2xl mx-auto border rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Încarcă Buletin</h1>

      {loading && (
        <p className="text-blue-600 font-medium">Procesare document...</p>
      )}

      {errorMsg && (
        <div className="mt-4 text-red-600 font-semibold">
          {errorMsg}
          <button
            onClick={onDone}
            className="ml-4 px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
          >
            Închide
          </button>
        </div>
      )}

      {!loading && !errorMsg && (
        <p className="text-green-600 font-medium">Fișierul a fost procesat.</p>
      )}
    </div>
  );
};

export default UploadBuletin;
