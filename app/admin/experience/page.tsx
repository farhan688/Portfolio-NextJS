"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { Experience } from "@/app/types";



export default function AdminExperience() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [formData, setFormData] = useState<Partial<Experience>>({
    role: "",
    company: "",
    startDate: "",
    endDate: "",
    description: [],
  });
  const [descriptionInput, setDescriptionInput] = useState(""); // Renamed from achievementInput
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchExperiences();
  }, []);

  async function fetchExperiences() {
    try {
      const response = await fetch("/api/experience");
      if (!response.ok) throw new Error("Failed to fetch experiences");
      const data: any[] = await response.json(); // Treat as any to avoid lying to TS

      // Manually parse the description field for each experience
      const formattedData = data.map(exp => {
        let desc: string[] = [];
        if (typeof exp.description === 'string') {
          try {
            // Ensure what's parsed is an array
            const parsed = JSON.parse(exp.description);
            if (Array.isArray(parsed)) {
              desc = parsed;
            }
          } catch (e) {
            console.error("Failed to parse description:", e);
            // desc remains []
          }
        } else if (Array.isArray(exp.description)) {
          // It's already an array
          desc = exp.description;
        }

        return {
          ...exp,
          description: desc, // Now it's guaranteed to be an array
          startDate: exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : "",
          endDate: exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : "",
        };
      });

      setExperiences(formattedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      const method = isEditing ? "PUT" : "POST";
      
      const dataToSend = {
        id: isEditing ? formData.id : undefined, // Include ID only for PUT
        role: formData.role || "",
        company: formData.company || "",
        startDate: formData.startDate || "",
        endDate: formData.endDate || null,
        description: JSON.stringify(formData.description || []), // Stringify array for API
      };

      const response = await fetch("/api/experience", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to save experience");
      }

      await fetchExperiences();
      resetForm();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Submit error:', err);
      setError(err instanceof Error ? err.message : "Failed to save");
    }
  };

  const handleEdit = (exp: Experience) => {
    setFormData({
      id: exp.id, // Use 'id'
      role: exp.role || "",
      company: exp.company || "",
      startDate: exp.startDate || "",
      endDate: exp.endDate || "",
      description: Array.isArray(exp.description) ? [...exp.description] : [], // Ensure it's an array
    });
    setIsEditing(true);
    setDescriptionInput(""); // Clear input for new description items
    setError(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pengalaman kerja ini? Tindakan ini tidak dapat dibatalkan.")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/experience?id=${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal menghapus pengalaman");
      }
      
      await fetchExperiences();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus");
    }
  };

  const resetForm = () => {
    setFormData({
      role: "",
      company: "",
      startDate: "",
      endDate: "",
      description: [],
    });
    setIsEditing(false);
    setDescriptionInput("");
  };

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (error) return <div className="text-center text-red-500 p-8">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Experience</h1>
          <button
            onClick={() => (window.location.href = "/admin")}
            className="bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500 text-white p-4 rounded-lg mb-4">
            Experience saved successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Role (e.g., Software Engineer)"
              value={formData.role || ""}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="bg-gray-700 p-2 rounded"
              required
            />
            <input
              type="text"
              placeholder="Company"
              value={formData.company || ""}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="bg-gray-700 p-2 rounded"
              required
            />
            <div>
              <label className="block mb-2 text-sm text-gray-400">Start Date</label>
              <input
                type="date"
                value={formData.startDate || ""}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="bg-gray-700 p-2 rounded w-full"
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-sm text-gray-400">End Date (Optional)</label>
              <input
                type="date"
                value={formData.endDate || ""}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="bg-gray-700 p-2 rounded w-full"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block mb-2">Description / Achievements</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add description item"
                value={descriptionInput}
                onChange={(e) => setDescriptionInput(e.target.value)}
                className="flex-1 bg-gray-700 p-2 rounded"
              />
              <button
                type="button"
                onClick={() => {
                  if (descriptionInput.trim()) {
                    setFormData({
                      ...formData,
                      description: [...(formData.description || []), descriptionInput.trim()]
                    });
                    setDescriptionInput("");
                  }
                }}
                className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
              >
                Add
              </button>
            </div>

            <div className="space-y-2">
              {formData.description?.map((item, index) => (
                <div key={index} className="flex items-center gap-2 bg-gray-700 p-2 rounded">
                  <span className="flex-1">{item}</span>
                  <button
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      description: formData.description?.filter((_, i) => i !== index)
                    })}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
          >
            {isEditing ? "Update Experience" : "Add Experience"}
          </button>
        </form>

        <div className="space-y-4">
          {experiences.map((exp) => (
            <motion.div
              key={exp.id} // Use exp.id
              className="bg-gray-800 p-6 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{exp.role}</h3> {/* Use exp.role */}
                  <p className="text-gray-400">{exp.company}</p>
                  <p className="text-gray-500">{exp.startDate} - {exp.endDate || "Present"}</p> {/* Use start/end dates */}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(exp)}
                    className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => exp.id && handleDelete(exp.id)} // Use exp.id
                    className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <ul className="list-disc list-inside space-y-1">
                {exp.description.map((item, index) => (
                  <li key={index} className="text-gray-300">
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}