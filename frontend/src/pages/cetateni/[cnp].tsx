// pages/cetateni/[cnp].tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

const ProfilCetatean = () => {
  const router = useRouter();
  const { cnp } = router.query;
  const [citizen, setCitizen] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    address: "",
    drivingInfo: {
      points: 12,
      permisSuspendat: false,
      vehicleInfo: ""
    }
  });

  useEffect(() => {
    const fetchCitizen = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/cetateni/${cnp}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("auth-token")}` }
        });
        setCitizen(res.data);
        setFormData({
          address: res.data.address,
          drivingInfo: res.data.drivingInfo
        });
      } catch (err) {
        console.error("Eroare la preluarea datelor:", err);
        alert("Cetățeanul nu a putut fi găsit");
      }
    };
    
    if (cnp) fetchCitizen();
  }, [cnp]);

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:3001/api/cetateni/${citizen._id}`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("auth-token")}` }
      });
      setEditMode(false);
      router.reload();
    } catch (err) {
      console.error("Eroare la actualizare:", err);
    }
  };

  if (!citizen) return <div className="p-4">Se încarcă...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <button onClick={() => router.back()} className="mb-4 text-blue-600 hover:underline">
        ← Înapoi la căutare
      </button>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">{citizen.fullName}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">Date personale</h2>
            <p className="mb-2"><strong>CNP:</strong> {citizen.cnp}</p>
            {editMode ? (
              <input
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full p-2 border rounded mb-2"
                placeholder="Adresă"
              />
            ) : (
              <p><strong>Adresă:</strong> {citizen.address}</p>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Permis conducere</h2>
            {editMode ? (
              <>
                <div className="mb-2">
                  <label className="block mb-1">Puncte rămase:</label>
                  <input
                    type="number"
                    value={formData.drivingInfo.points}
                    onChange={(e) => setFormData({
                      ...formData,
                      drivingInfo: {...formData.drivingInfo, points: Number(e.target.value)}
                    })}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={formData.drivingInfo.permisSuspendat}
                    onChange={(e) => setFormData({
                      ...formData,
                      drivingInfo: {...formData.drivingInfo, permisSuspendat: e.target.checked}
                    })}
                    className="mr-2"
                  />
                  <label>Permis suspendat</label>
                </div>
              </>
            ) : (
              <>
                <p><strong>Puncte:</strong> {citizen.drivingInfo.points}</p>
                <p><strong>Permis suspendat:</strong> {citizen.drivingInfo.permisSuspendat ? 'Da' : 'Nu'}</p>
              </>
            )}
          </div>

          {citizen.convictii?.length > 0 && (
            <div className="mt-4 col-span-2">
              <h3 className="text-lg font-semibold mb-2">Condamnări</h3>
              {citizen.convictii.map((convictie, index) => (
                <div key={index} className="bg-gray-50 p-2 rounded mb-2">
                  <p>{convictie.type} - {convictie.descriere}</p>
                  <p className="text-sm text-gray-500">{new Date(convictie.data).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}

        </div>

        <div className="mt-6">
          {editMode ? (
            <button
              onClick={handleUpdate}
              className="bg-green-600 text-white px-4 py-2 rounded mr-2"
            >
              Salvează modificări
            </button>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Editează informații
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilCetatean;