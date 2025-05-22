import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

import UploadBuletin from "./components/UploadBuletin";
import CautaCetatean from "./components/CautaCetatean";
//import OfiteriActivi from "./components/OfiteriActivi";

export default function Home() {
  const router = useRouter();
  const [activeComponent, setActiveComponent] = useState(null); // 'upload' | 'cauta' | 'ofiteri' | null

  useEffect(() => {
    const token = localStorage.getItem("auth-token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  return (
    <>
      <Head>
        <title>INTELPOL</title>
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-100 p-4">
        <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md w-full">
          <h1 className="text-3xl font-bold mb-4 text-blue-900">INTELPOL</h1>
          <p className="text-gray-700 mb-6">
            Platforma oficială pentru verificări și intervenții ale agenților de poliție.
          </p>

          <div className="mt-6 space-y-3 max-w-sm mx-auto">
            <button
              onClick={() => setActiveComponent("cauta")}
              className={`block w-full py-2 rounded ${
                activeComponent === "cauta"
                  ? "bg-blue-800 text-white"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Căutare Cetățean
            </button>

            <button
              onClick={() => setActiveComponent("upload")}
              className={`block w-full py-2 rounded ${
                activeComponent === "upload"
                  ? "bg-blue-800 text-white"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Încarcă Buletin
            </button>

            <button
              onClick={() => setActiveComponent("ofiteri")}
              className={`block w-full py-2 rounded ${
                activeComponent === "ofiteri"
                  ? "bg-blue-800 text-white"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Ofițeri Activi
            </button>
          </div>
        </div>

        <div className="w-full max-w-3xl mt-10">
          {activeComponent === "cauta" && <CautaCetatean />}
          {activeComponent === "upload" && <UploadBuletin />}

        </div>
      </main>
    </>
  );
}
