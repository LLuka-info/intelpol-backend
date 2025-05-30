
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

const CautaCetatean = () => {
  const router = useRouter();
  const [searchType, setSearchType] = useState("CNP");
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [result, setResult] = useState(null);

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
      const res = await axios.post("http://localhost:3001/api/cetateni/search", {
        searchType,
        searchValue
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("auth-token")}` }
      });

      if (res.data.createNew) {
        setShowNewForm(true);
        setNewCitizen(prev => ({ ...prev, cnp: searchValue }));
        setSuggestions([]);
        setShowSuggestions(false);
      } else {
        setSuggestions(res.data);
        setShowSuggestions(true);
        setShowNewForm(false);
        setResult(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Eroare la căutare");
    }
  };

  const handleSelect = (citizen: any) => {
    router.push(`/cetateni/${citizen.cnp}`);
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

      <div className="relative mb-6">
        <input
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="flex-1 p-2 border w-full"
          placeholder={`Introdu ${searchType}`}
        />
        <button
          onClick={handleSearch}
          className="absolute right-0 top-0 h-full bg-blue-600 text-white px-4"
        >
          Caută
        </button>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full bg-white border mt-1 rounded shadow-lg">
            {suggestions.map((citizen) => (
              <div
                key={citizen.cnp}
                onClick={() => handleSelect(citizen)}
                className="p-2 hover:bg-blue-50 cursor-pointer"
              >
                {citizen.fullName} - {citizen.cnp}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CautaCetatean;