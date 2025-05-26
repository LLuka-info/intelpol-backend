import { useState } from "react";
import axios from "axios";

const AdminPanel = () => {
  const [newOfficer, setNewOfficer] = useState({
    fullName: "",
    badgeNumber: "",
    rank: "Agent",
    password: "",
    role: "officer"
  });

  const handleCreateOfficer = async () => {
    try {
      await axios.post("http://localhost:3001/api/ofiteri", newOfficer, {
        headers: { Authorization: `Bearer ${localStorage.getItem("auth-token")}` }
      });
      alert("Ofițer creat cu succes!");
      setNewOfficer({
        fullName: "",
        badgeNumber: "",
        rank: "Agent",
        password: "",
        role: "officer"
      });
    } catch (err) {
      alert(err.response?.data?.message || "Eroare la creare");
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow mt-4">
      <h2 className="text-xl font-bold mb-4">Creare Ofițer Nou</h2>
      <div className="grid grid-cols-2 gap-4">
        <input
          placeholder="Nume complet"
          value={newOfficer.fullName}
          onChange={e => setNewOfficer({...newOfficer, fullName: e.target.value})}
          className="p-2 border rounded"
        />
        <input
          placeholder="Număr insignă"
          value={newOfficer.badgeNumber}
          onChange={e => setNewOfficer({...newOfficer, badgeNumber: e.target.value})}
          className="p-2 border rounded"
        />
        <select
          value={newOfficer.rank}
          onChange={e => setNewOfficer({...newOfficer, rank: e.target.value})}
          className="p-2 border rounded"
        >
          <option>Agent</option>
          <option>Sergent</option>
          <option>Locotenent</option>
          <option>Căpitan</option>
        </select>
        <select
          value={newOfficer.role}
          onChange={e => setNewOfficer({...newOfficer, role: e.target.value})}
          className="p-2 border rounded"
        >
          <option value="officer">Ofițer</option>
          <option value="admin">Administrator</option>
        </select>
        <input
          type="password"
          placeholder="Parolă"
          value={newOfficer.password}
          onChange={e => setNewOfficer({...newOfficer, password: e.target.value})}
          className="p-2 border rounded"
        />
        <button 
          onClick={handleCreateOfficer}
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Crează Ofițer
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;