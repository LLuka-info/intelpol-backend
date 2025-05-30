import { useState, useEffect } from "react";
import axios from "axios";

type Officer = {
  _id: string;
  fullName: string;
  rank: string;
  role: string;
  password?: string; 
};

type Citizen = {
  fullName: string;
  cnp: string;
  address: string;
  drivingInfo: {
    vehicleInfo: string;
  };
};

const PanouDev = () => {
  const [mode, setMode] = useState<"officer" | "citizen" | "editOfficer">("officer");

  const [newOfficer, setNewOfficer] = useState<Omit<Officer, "_id">>({
    fullName: "",
    rank: "Agent",
    password: "",
    role: "officer",

  });

  const [newCitizen, setNewCitizen] = useState<Citizen>({
    fullName: "",
    cnp: "",
    address: "",
    drivingInfo: {
      vehicleInfo: "",
    },
  });

  const [officers, setOfficers] = useState<Officer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);

  useEffect(() => {
    if (mode === "editOfficer") {
      fetchOfficers();
    }
  }, [mode]);

  const fetchOfficers = async () => {
    try {
      const { data } = await axios.get<Officer[]>(
        "http://localhost:3001/api/ofiteri",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("auth-token")}` },
        }
      );
      setOfficers(data);
    } catch (err) {
      alert("Eroare la încărcarea ofițerilor");
    }
  };

  const handleCreateOfficer = async () => {
    try {
      await axios.post(
        "http://localhost:3001/api/ofiteri",
        newOfficer,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("auth-token")}` },
        }
      );
      alert("Ofițer creat cu succes!");
      setNewOfficer({
        fullName: "",
        rank: "Agent",
        password: "",
        role: "officer",
      });
      fetchOfficers();
    } catch (err: any) {
      alert(err.response?.data?.message || "Eroare la creare ofițer");
    }
  };

  const handleCreateCitizen = async () => {
    try {
      await axios.post(
        `http://localhost:3001/api/cetateni`,
        newCitizen,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("auth-token")}` },
        }
      );
      alert("Cetățean creat cu succes!");
      setNewCitizen({
        fullName: "",
        cnp: "",
        address: "",
        drivingInfo: {
          vehicleInfo: "",
        },
      });
    } catch (err: any) {
      alert(err.response?.data?.message || "Eroare la creare cetățean");
    }
  };

  const handleUpdateOfficer = async () => {
    if (!selectedOfficer) return;
    try {
      const updateData: Partial<Officer> = {
        fullName: selectedOfficer.fullName,
        rank: selectedOfficer.rank,
        role: selectedOfficer.role,
      };
      if (selectedOfficer.password && selectedOfficer.password.trim() !== "") {
        updateData.password = selectedOfficer.password;
      }

      await axios.put(
        `http://localhost:3001/api/ofiteri/${selectedOfficer._id}`,
        updateData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("auth-token")}` },
        }
      );
      alert("Ofițer actualizat cu succes!");
      setSelectedOfficer(null);
      fetchOfficers();
    } catch (err: any) {
      alert(err.response?.data?.message || "Eroare la actualizarea ofițerului");
    }
  };

  const filteredOfficers = officers.filter((officer) =>
    officer.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 bg-white rounded-lg shadow mt-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Panou Admin</h2>

      {/* Mode switch */}
      <div className="mb-6 space-x-2">
        <button
          onClick={() => setMode("officer")}
          className={`p-2 rounded ${mode === "officer" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        >
          Creare Ofițer
        </button>
        <button
          onClick={() => setMode("citizen")}
          className={`p-2 rounded ${mode === "citizen" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        >
          Creare Cetățean
        </button>
        <button
          onClick={() => setMode("editOfficer")}
          className={`p-2 rounded ${mode === "editOfficer" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        >
          Editare Ofițer
        </button>
      </div>

      {/* Create Officer */}
      {mode === "officer" && (
        <div>
          <h3 className="font-semibold mb-4">Creare Ofițer Nou</h3>
          <div className="grid grid-cols-2 gap-4">
            <input
              placeholder="Nume complet"
              value={newOfficer.fullName}
              onChange={(e) => setNewOfficer({ ...newOfficer, fullName: e.target.value })}
              className="p-2 border rounded"
            />
            <input
              placeholder="Grad de poliție"
              value={newOfficer.rank}
              onChange={(e) => setNewOfficer({ ...newOfficer, rank: e.target.value })}
              className="p-2 border rounded"
            />
            <select
              value={newOfficer.role}
              onChange={(e) => setNewOfficer({ ...newOfficer, role: e.target.value })}
              className="p-2 border rounded"
            >
              <option value="officer">Ofițer</option>
              <option value="admin">Administrator</option>
            </select>
            <input
              type="password"
              placeholder="Parolă"
              value={newOfficer.password}
              onChange={(e) => setNewOfficer({ ...newOfficer, password: e.target.value })}
              className="p-2 border rounded"
            />
            <button
              onClick={handleCreateOfficer}
              className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 col-span-2"
            >
              Crează Ofițer
            </button>
          </div>
        </div>
      )}

      {mode === "citizen" && (
        <div>
          <h3 className="font-semibold mb-4">Creare Cetățean Nou</h3>
          <div className="grid grid-cols-2 gap-4">
            <input
              placeholder="Nume complet"
              value={newCitizen.fullName}
              onChange={(e) => setNewCitizen({ ...newCitizen, fullName: e.target.value })}
              className="p-2 border rounded"
            />
            <input
              placeholder="CNP"
              value={newCitizen.cnp}
              onChange={(e) => setNewCitizen({ ...newCitizen, cnp: e.target.value })}
              className="p-2 border rounded"
            />
            <input
              placeholder="Adresă"
              value={newCitizen.address}
              onChange={(e) => setNewCitizen({ ...newCitizen, address: e.target.value })}
              className="p-2 border rounded"
            />
            <input
              placeholder="Informații vehicul"
              value={newCitizen.drivingInfo.vehicleInfo}
              onChange={(e) =>
                setNewCitizen({
                  ...newCitizen,
                  drivingInfo: { ...newCitizen.drivingInfo, vehicleInfo: e.target.value },
                })
              }
              className="p-2 border rounded"
            />
            <button
              onClick={handleCreateCitizen}
              className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 col-span-2"
            >
              Crează Cetățean
            </button>
          </div>
        </div>
      )}

      {/* Edit Officer */}
      {mode === "editOfficer" && (
        <div>
          <h3 className="font-semibold mb-4">Editare Ofițer</h3>

          {/* Search input */}
          <input
            type="text"
            placeholder="Caută ofițer după nume..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border rounded w-full mb-4"
          />

          {/* Autocomplete list */}
          <div className="max-h-48 overflow-auto border rounded mb-4">
            {filteredOfficers.length === 0 && (
              <p className="p-2 text-gray-500">Nu s-au găsit ofițeri.</p>
            )}
            {filteredOfficers.map((officer) => (
              <div
                key={officer._id}
                onClick={() => {
                  setSelectedOfficer({ ...officer, password: "" });
                  setSearchTerm("");
                }}
                className="p-2 cursor-pointer hover:bg-gray-100 border-b last:border-b-0"
              >
                {officer.fullName}
              </div>
            ))}
          </div>

          {/* Edit form */}
          {selectedOfficer && (
            <div className="grid grid-cols-2 gap-4">
              <input
                placeholder="Nume complet"
                value={selectedOfficer.fullName}
                onChange={(e) =>
                  setSelectedOfficer({ ...selectedOfficer, fullName: e.target.value })
                }
                className="p-2 border rounded"
              />
              <input
                placeholder="Grad de poliție"
                value={selectedOfficer.rank}
                onChange={(e) =>
                  setSelectedOfficer({ ...selectedOfficer, rank: e.target.value })
                }
                className="p-2 border rounded"
              />
              <select
                value={selectedOfficer.role}
                onChange={(e) =>
                  setSelectedOfficer({ ...selectedOfficer, role: e.target.value })
                }
                className="p-2 border rounded"
              >
                <option value="officer">Ofițer</option>
                <option value="admin">Administrator</option>
              </select>
              <input
                type="password"
                placeholder="Parolă (lasă gol pentru a nu schimba)"
                value={selectedOfficer.password}
                onChange={(e) =>
                  setSelectedOfficer({ ...selectedOfficer, password: e.target.value })
                }
                className="p-2 border rounded"
              />
              <button
                onClick={handleUpdateOfficer}
                className="bg-green-600 text-white p-2 rounded hover:bg-green-700 col-span-2"
              >
                Salvează Modificările
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PanouDev;
