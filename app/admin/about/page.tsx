"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { About } from "@/app/types";

// Helper to ensure socialLinks is an object
const parseSocialLinks = (data: any): About['socialLinks'] => {
  // Ensure data and socialLinks exist and socialLinks is a string
  if (data && typeof data.socialLinks === 'string' && data.socialLinks.trim() !== '') {
    try {
      return JSON.parse(data.socialLinks);
    } catch (e) {
      console.error("Failed to parse socialLinks", e);
      // If parsing fails, return an empty object to prevent further errors
      return {};
    }
  }
  // If socialLinks is not a string, or is empty, or data is null/undefined, return an empty object
  return {};
};

export default function AdminAbout() {
  const [formData, setFormData] = useState<About | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchAbout() {
      try {
        const response = await fetch("/api/about");
        if (!response.ok) throw new Error("Failed to fetch about data");
        let data = await response.json();
        
        // Ensure data is not null and parse socialLinks
        if (data && data.id) { // Check if data is a real record
            data.socialLinks = parseSocialLinks(data);
        } else {
            // Initialize with default structure if no data exists
            data = {
                title: "",
                description: "",
                imageUrl: "",
                socialLinks: { github: "", linkedin: "", twitter: "", email: "" }
            };
        }
        setFormData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchAbout();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('socialLinks', JSON.stringify(formData.socialLinks));
      formDataToSend.append('imageUrl', formData.imageUrl || '');

      if (selectedFile) {
        formDataToSend.append('image', selectedFile);
      }

      // Use 'id' from prisma
      if (formData.id) {
        formDataToSend.append('id', formData.id);
      }

      // The API now uses PUT for upserting, so method is always PUT
      const response = await fetch('/api/about', {
        method: 'PUT',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save about data');
      }

      let updatedData = await response.json();
      // Also parse social links from the response of the update
      if (updatedData) {
        updatedData.socialLinks = parseSocialLinks(updatedData);
      }

      setFormData(updatedData);
      setSelectedFile(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Submit error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (error) return <div className="text-center text-red-500 p-8">{error}</div>;
  // Render form only when formData is not null
  if (!formData) return <div className="text-center p-8">No data available.</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage About</h1>
          <button
            onClick={() => window.location.href = "/admin"}
            className="bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            Back to Dashboard
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg">
          <div className="space-y-4">
            <div>
              <label className="block mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-gray-700 p-2 rounded"
              />
            </div>
            
            <div>
              <label className="block mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-gray-700 p-2 rounded h-40"
              />
            </div>

            <div>
              <label className="block mb-2">Upload Image (JPEG/PNG)</label>
              <input
                type="file"
                accept="image/jpeg, image/png"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="w-full bg-gray-700 p-2 rounded"
              />
              {formData.imageUrl && (
                <div className="mt-2 text-sm text-gray-400">
                  Current image: {formData.imageUrl.substring(0, 50)}...
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">GitHub URL</label>
                <input
                  type="url"
                  value={formData.socialLinks?.github || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, github: e.target.value }
                  })}
                  className="w-full bg-gray-700 p-2 rounded"
                />
              </div>

              <div>
                <label className="block mb-2">LinkedIn URL</label>
                <input
                  type="url"
                  value={formData.socialLinks?.linkedin || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, linkedin: e.target.value }
                  })}
                  className="w-full bg-gray-700 p-2 rounded"
                />
              </div>

              <div>
                <label className="block mb-2">Twitter URL</label>
                <input
                  type="url"
                  value={formData.socialLinks?.twitter || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, twitter: e.target.value }
                  })}
                  className="w-full bg-gray-700 p-2 rounded"
                />
              </div>

              <div>
                <label className="block mb-2">Email</label>
                <input
                  type="email"
                  value={formData.socialLinks?.email || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, email: e.target.value }
                  })}
                  className="w-full bg-gray-700 p-2 rounded"
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
            >
              Save Changes
            </button>
            {success && (
              <span className="ml-4 text-green-500">
                Changes saved successfully!
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
