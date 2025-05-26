import { useState } from "react";
import axios from "axios";

const CautaCetatean = () => {
    const [searchType, setSearchType] = useState("CNP");
    const [searchValue, setSearchValue] = useState("");
    const [result, setResult] = useState(null);
    const [showNewForm, setShowNewForm] = useState(false);
    const [newCitizen, setNewCitizen] = useState({
        fullName: "",
        cnp: "",
        address: "",
        drivingInfo: {
            points: 12,
            permisSuspendat: false,
            vehicleInfo: ""
        }
    });

    const searchTypes = ["CNP", "Nume", "Adresa"];

    const handleSearch = async () => {
        try {
            const res = await axios.post("http://localhost:3001/api/cetateni/search", { searchType, searchValue }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("auth-token")}` }
            });
            
            if(res.data.createNew) {
                setShowNewForm(true);
                setNewCitizen(prev => ({ ...prev, cnp: searchValue }));
            } else {
                setResult(res.data);
            }
        } catch (err) {
            alert(err.response?.data?.message || "Eroare la căutare");
        }
    };

    const handleCreate = async () => {
        try {
            const res = await axios.post("http://localhost:3001/api/cetateni", newCitizen, {
                headers: { Authorization: `Bearer ${localStorage.getItem("auth-token")}` }
            });
            setResult(res.data);
            setShowNewForm(false);
        } catch (err) {
            alert(err.response?.data?.message || "Eroare la creare");
        }
    };

    return (
        <div className="p-4 max-w-2xl mx-auto">
            <div className="flex gap-2 mb-4">
                {searchTypes.map(type => (
                    <button 
                        key={type}
                        onClick={() => setSearchType(type)}
                        className={`px-4 py-2 ${searchType === type ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    >
                        {type}
                    </button>
                ))}
            </div>
            
            <div className="flex gap-2 mb-6">
                <input
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="flex-1 p-2 border"
                    placeholder={`Introdu ${searchType}`}
                />
                <button onClick={handleSearch} className="bg-blue-600 text-white px-4 py-2">
                    Caută
                </button>
            </div>

            {showNewForm && (
                <div className="bg-gray-100 p-4 rounded mb-4">
                    <h3 className="text-lg font-bold mb-2">Crează dosar nou</h3>
                    <input
                        placeholder="Nume complet"
                        value={newCitizen.fullName}
                        onChange={e => setNewCitizen({ ...newCitizen, fullName: e.target.value })}
                        className="block w-full p-2 mb-2"
                    />
                    <input
                        placeholder="CNP"
                        value={newCitizen.cnp}
                        disabled
                        className="block w-full p-2 mb-2 bg-gray-200"
                    />
                    <button onClick={handleCreate} className="bg-green-600 text-white px-4 py-2">
                        Salvează dosar nou
                    </button>
                </div>
            )}

            {result && (
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-xl font-bold mb-4">{result.fullName}</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p><strong>CNP:</strong> {result.cnp}</p>
                            <p><strong>Adresă:</strong> {result.address}</p>
                        </div>
                        <div>
                            <p><strong>Puncte permis:</strong> {result.drivingInfo.points}</p>
                            <p><strong>Permis suspendat:</strong> {result.drivingInfo.permisSuspendat ? 'Da' : 'Nu'}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CautaCetatean;