"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

// TODO: Replace with your deployed API base URL
const API_BASE_URL = "https://0oydyvf3jc.execute-api.ap-south-1.amazonaws.com/uat";

export default function PayPage() {
  const params = useParams();
  const locationId = params.locationId as string;

  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setMessage("Please enter a valid positive amount.");
      return;
    }
    setLoading(true);
    setMessage("");
    const data = {
      uuid: uuidv4(),
      location: locationId,
      amount: Number(amount),
    };
    try {
      const response = await axios.post(`${API_BASE_URL}/payment`, data);
      setMessage("Payment successful!");
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 409) {
          setMessage("Concurrent transaction exists for this location. Please wait until the previous transaction is processed.");
        } else if (error.response.status === 400) {
          setMessage("Invalid input. Please check your data.");
        } else {
          setMessage(error.response.data?.error || "Payment failed. Please try again.");
        }
      } else {
        setMessage("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Pay at {locationId}</h1>
      <label className="block mb-2">Amount</label>
      <input
        type="number"
        className="w-full p-2 border rounded mb-4"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        min="0.01"
        step="0.01"
        disabled={loading}
      />
      <button
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        onClick={handlePay}
        disabled={loading}
      >
        {loading ? "Processing..." : "Pay"}
      </button>
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
} 