"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import Image from 'next/image';

// --- Location Data Interface (can be shared or redefined) ---
interface Location {
  id: string;
  name: string;
  price: number;
  logoUrl?: string;
}

// TODO: Replace with your deployed API base URL (or pass via props/env var)
const API_BASE_URL = "https://0oydyvf3jc.execute-api.ap-south-1.amazonaws.com/uat";

interface PayClientComponentProps {
  location: Location; // Receive location data as a prop
}

export default function PayClientComponent({ location }: PayClientComponentProps) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // useEffect is no longer needed here for finding location or setting title

  const handlePay = async () => {
    if (!location) return;

    setLoading(true);
    setMessage("");
    const data = {
      uuid: uuidv4(),
      location: location.id,
      amount: location.price, // Use the price from the passed location prop
    };
    try {
      const response = await axios.post(`${API_BASE_URL}/payment`, data);
      setMessage("Payment successful!");
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 409) {
          setMessage("Previous transaction delivery not complete for this location. Please wait.");
        } else if (error.response.status === 400) {
          setMessage("Invalid input. Please check data.");
        } else {
          setMessage(error.response.data?.error || "Payment failed. Please try again.");
        }
      } else {
        if (error.message.includes('Network Error')) {
          setMessage("Network Error: Could not reach server. Check connection or CORS policy.");
        } else {
          setMessage(`Payment failed: ${error.message}`);
        }
        console.error("Payment Error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Location is guaranteed to be passed as a prop now
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center text-blue-600 font-bold">
            {location.logoUrl ? (
              <Image src={location.logoUrl} alt={`${location.name} Logo`} width={40} height={40} className="rounded-full" />
            ) : (
              <span>{location.name.charAt(0)}</span>
            )}
          </div>
          <span className="text-xl font-semibold">{location.name} Payments</span>
        </div>
      </header>

       {/* Optional Banner */}
       <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center p-6 shadow-lg">
         <h1 className="text-3xl font-bold">Welcome to {location.name}!</h1>
         <p className="mt-2">Complete your secure payment below.</p>
       </div>


      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8 flex justify-center items-start">
          <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-xl">
              <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">Confirm Payment</h2>

              <div className="mb-6 p-4 bg-gray-100 rounded border border-gray-200">
                 <p className="text-lg text-gray-800">
                    Location: <span className="font-semibold">{location.name}</span>
                 </p>
                 <p className="text-lg text-gray-800 mt-2">
                    Amount: <span className="font-semibold text-green-600">${location.price.toFixed(2)}</span>
                 </p>
              </div>

              <button
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
                onClick={handlePay}
                disabled={loading}
              >
                 {loading && (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                 )}
                <span>{loading ? "Processing..." : `Pay $${location.price.toFixed(2)}`}</span>
              </button>

              {message && (
                <p className={`mt-6 text-center font-medium ${message.includes('successful') ? 'text-green-600' : 'text-red-600'}`}>
                    {message}
                </p>
              )}
          </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center p-4 mt-auto">
        © {new Date().getFullYear()} Your Company Name. All rights reserved.
      </footer>
    </div>
  );
} 