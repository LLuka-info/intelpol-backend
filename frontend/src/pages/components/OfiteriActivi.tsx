// components/OfiteriActivi.tsx
import { useEffect, useState } from "react";
import axios from "axios";

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
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-bold mb-4">Ofițeri în patrulare</h3>
      <div className="space-y-2">
        {officers.map(officer => (
          <div key={officer._id} className="flex items-center p-2 bg-gray-50 rounded">
            <div className="flex-1">
              <p className="font-medium">{officer.fullName}</p>
              <p className="text-sm text-gray-600">{officer.rank} • #{officer.badgeNumber}</p>
            </div>
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
          </div>
        ))}
        {officers.length === 0 && <p className="text-gray-500">Niciun ofițer activ</p>}
      </div>
    </div>
  );
};

export default OfiteriActivi;