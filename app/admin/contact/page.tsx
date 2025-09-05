"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ContactMessage } from "@/app/types";
import { format } from "date-fns";

export default function AdminContact() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    try {
      const response = await fetch("/api/contact");
      if (!response.ok) throw new Error("Failed to fetch messages");
      const data: ContactMessage[] = await response.json();
      setMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    
    try {
      const response = await fetch(`/api/contact?id=${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete message");
      }
      
      await fetchMessages(); // Re-fetch messages after successful deletion
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (error) return <div className="text-center text-red-500 p-8">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Contact Messages</h1>
          <button
            onClick={() => (window.location.href = "/admin")}
            className="bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              No messages yet
            </div>
          ) : (
            messages.map((message) => (
              <motion.div
                key={message.id || `message-${message.email}`} // Use message.id
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 p-6 rounded-lg"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">{message.name}</h2>
                    <p className="text-gray-400">{message.email}</p>
                    {message.phone && (
                      <p className="text-gray-400">{message.phone}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500 text-sm">
                      {message.createdAt && format(new Date(message.createdAt), 'PPpp')}
                    </span>
                    <button
                      onClick={() => message.id && handleDelete(message.id)} // Use message.id
                      className="text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="text-gray-300 whitespace-pre-wrap">{message.message}</p>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}