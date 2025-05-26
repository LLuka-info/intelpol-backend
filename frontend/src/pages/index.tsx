import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

import UploadBuletin from "./components/UploadBuletin";
import CautaCetatean from "./components/CautaCetatean";
import OfiteriActivi from "./components/OfiteriActivi";
import PanouDev from "./components/PanouDeveloper";
import styles from "./styles/index.module.css";
export default function Home() {
  const router = useRouter();
  const [activeComponent, setActiveComponent] = useState<"upload" | "cauta" | null>(null);
  const [officerData, setOfficerData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const token = localStorage.getItem("auth-token");
      if (!token) {
        router.push("/login");
        return;
      }

      const storedOfficer = localStorage.getItem("officer");
      if (storedOfficer) {
        setOfficerData(JSON.parse(storedOfficer));
      }

      setIsLoading(false);
    }, [router]);


  if (isLoading) return null; // Sau returnează un spinner/loading indicator

  return (
    <>
      <Head>
        <title>INTELPOL</title>
      </Head>

      <main className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto p-4">
          {officerData?.role === 'admin' && <PanouDev />}
          {/* Header Panel */}
          <div className="flex gap-4 mb-6">
            {/* Officer Info */}
            <div className="bg-white p-4 rounded-lg shadow flex-1">
              {officerData ? (
                <>
                  <h2 className="text-xl font-bold">{officerData.fullName}</h2>
                  <p className="text-gray-600">
                    {officerData.rank} • #{officerData.badgeNumber}
                  </p>
                </>
              ) : (
                <p className="text-gray-400 italic">Se încarcă datele ofițerului...</p>
              )}
            </div>

            {/* Real-Time Officers */}
            <div className="flex-1">
              <OfiteriActivi />
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveComponent("cauta")}
                className={`flex-1 py-2 rounded text-white font-semibold ${
                  activeComponent === "cauta"
                    ? "bg-blue-800"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                Căutare Cetățean
              </button>
              <button
                onClick={() => setActiveComponent("upload")}
                className={`flex-1 py-2 rounded text-white font-semibold ${
                  activeComponent === "upload"
                    ? "bg-blue-800"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                Încarcă Buletin
              </button>
            </div>
          </div>

          {/* Main Panel */}
          <div className="bg-white rounded-lg shadow p-6">
            {activeComponent === "cauta" && <CautaCetatean />}
            {activeComponent === "upload" && <UploadBuletin />}
            {!activeComponent && (
              <p className="text-gray-500 text-center italic">
                Selectați o acțiune de mai sus
              </p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
