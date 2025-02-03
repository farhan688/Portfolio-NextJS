"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import type { About } from "@/app/types"

export default function AdminAbout() {
  const [formData, setFormData] = useState<About>({
    _id: undefined,
    title: "",
    description: "",
    imageUrl: "",
    socialLinks: {
      github: "",
      linkedin: "",
      twitter: "",
      email: ""
    }
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchAbout() {
      try {
        const response = await fetch("/api/about");
        if (!response.ok) throw new Error("Failed to fetch about data");
        const data = await response.json();
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
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('socialLinks', JSON.stringify(formData.socialLinks));
      formDataToSend.append('imageUrl', formData.imageUrl || '');

      // Append the file if it exists
      if (selectedFile) {
        formDataToSend.append('image', selectedFile);
      }

      // Append _id only if it exists and is a valid string
      if (formData._id && typeof formData._id === 'string') {
        formDataToSend.append('_id', formData._id);
      }

      const response = await fetch('/api/about', {
        method: formData._id ? 'PUT' : 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save about data');
      }

      const updatedData = await response.json();
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
                  value={formData.socialLinks?.github}
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
                  value={formData.socialLinks?.linkedin}
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
                  value={formData.socialLinks?.twitter}
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
                  value={formData.socialLinks?.email}
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