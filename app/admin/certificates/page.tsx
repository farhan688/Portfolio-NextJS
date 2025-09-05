"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { Certificate } from "@/app/types";

export default function AdminCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [newCertificate, setNewCertificate] = useState<Certificate>({
    title: "",
    organization: "",
    date: "", // YYYY-MM-DD format for input type="date"
    credentialUrl: "",
    imageUrl: "",
  });
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchCertificates() {
      try {
        const response = await fetch("/api/certificates");
        if (!response.ok) throw new Error("Failed to fetch certificates");
        const data: Certificate[] = await response.json();
        // Format date for input type="date" (YYYY-MM-DD)
        const formattedData = data.map(cert => ({
          ...cert,
          date: cert.date ? new Date(cert.date).toISOString().split('T')[0] : "",
        }));
        setCertificates(formattedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchCertificates();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] || null);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', newCertificate.title);
      formDataToSend.append('organization', newCertificate.organization);
      formDataToSend.append('date', newCertificate.date);
      formDataToSend.append('credentialUrl', newCertificate.credentialUrl || '');
      
      if (selectedFile) {
        formDataToSend.append('image', selectedFile);
      } else if (newCertificate.imageUrl) {
        formDataToSend.append('imageUrl', newCertificate.imageUrl);
      }

      const response = await fetch('/api/certificates', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add certificate');
      }

      const addedCert: Certificate = await response.json();
      // Format date for input type="date"
      addedCert.date = addedCert.date ? new Date(addedCert.date).toISOString().split('T')[0] : "";
      setCertificates([...certificates, addedCert]);
      setNewCertificate({
        title: "",
        organization: "",
        date: "",
        credentialUrl: "",
        imageUrl: "",
      });
      setSelectedFile(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Add error:', err);
      setError(err instanceof Error ? err.message : 'Failed to add');
    }
  };

  const handleEditClick = (cert: Certificate) => {
    setEditingCertificate({ ...cert });
    setSelectedFile(null); // Clear selected file when starting edit
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCertificate || !editingCertificate.id) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('_id', editingCertificate.id); // Use '_id' for update to match API
      formDataToSend.append('title', editingCertificate.title);
      formDataToSend.append('organization', editingCertificate.organization);
      formDataToSend.append('date', editingCertificate.date);
      formDataToSend.append('credentialUrl', editingCertificate.credentialUrl || '');
      formDataToSend.append('imageUrl', editingCertificate.imageUrl || ''); // Send existing image URL

      if (selectedFile) {
        formDataToSend.append('image', selectedFile);
      }

      const response = await fetch('/api/certificates', {
        method: 'PUT',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update certificate');
      }

      const updatedCert: Certificate = await response.json();
      // Format date for input type="date"
      updatedCert.date = updatedCert.date ? new Date(updatedCert.date).toISOString().split('T')[0] : "";
      setCertificates(certificates.map(cert => 
        cert.id === updatedCert.id ? updatedCert : cert
      ));
      setEditingCertificate(null);
      setSelectedFile(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Edit error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this certificate?")) return;
    try {
      const response = await fetch(`/api/certificates?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete certificate');
      }

      setCertificates(certificates.filter(cert => cert.id !== id));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Delete error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (error) return <div className="text-center text-red-500 p-8">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Certificates</h1>
          <button
            onClick={() => window.location.href = "/admin"}
            className="bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Add New Certificate Form */}
        <form onSubmit={handleAddSubmit} className="bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-bold mb-4">Add New Certificate</h2>
          <div className="space-y-4">
            <div>
              <label className="block mb-2">Title</label>
              <input
                type="text"
                value={newCertificate.title}
                onChange={(e) => setNewCertificate({ ...newCertificate, title: e.target.value })}
                className="w-full bg-gray-700 p-2 rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-2">Organization</label>
              <input
                type="text"
                value={newCertificate.organization}
                onChange={(e) => setNewCertificate({ ...newCertificate, organization: e.target.value })}
                className="w-full bg-gray-700 p-2 rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-2">Date (YYYY-MM-DD)</label>
              <input
                type="date"
                value={newCertificate.date}
                onChange={(e) => setNewCertificate({ ...newCertificate, date: e.target.value })}
                className="w-full bg-gray-700 p-2 rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-2">Credential URL</label>
              <input
                type="url"
                value={newCertificate.credentialUrl || ''}
                onChange={(e) => setNewCertificate({ ...newCertificate, credentialUrl: e.target.value })}
                className="w-full bg-gray-700 p-2 rounded"
              />
            </div>
            <div>
              <label className="block mb-2">Image (JPEG/PNG)</label>
              <input
                type="file"
                accept="image/jpeg, image/png"
                onChange={handleFileChange}
                className="w-full bg-gray-700 p-2 rounded"
              />
            </div>
          </div>
          <div className="mt-6">
            <button
              type="submit"
              className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
            >
              Add Certificate
            </button>
            {success && (
              <span className="ml-4 text-green-500">
                Certificate added successfully!
              </span>
            )}
          </div>
        </form>

        {/* Certificates List */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Existing Certificates</h2>
          {certificates.length === 0 ? (
            <p>No certificates found. Add one above!</p>
          ) : (
            <div className="space-y-4">
              {certificates.map((cert) => (
                <div key={cert.id} className="bg-gray-700 p-4 rounded flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold">{cert.title}</h3>
                    <p className="text-gray-400">{cert.organization} - {cert.date}</p>
                    {cert.credentialUrl && (
                      <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-sm">View Credential</a>
                    )}
                  </div>
                  <div>
                    <button
                      onClick={() => handleEditClick(cert)}
                      className="bg-yellow-600 px-3 py-1 rounded mr-2 hover:bg-yellow-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => cert.id && handleDelete(cert.id)}
                      className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit Certificate Modal/Form */}
        {editingCertificate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">Edit Certificate</h2>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block mb-2">Title</label>
                  <input
                    type="text"
                    value={editingCertificate.title}
                    onChange={(e) => setEditingCertificate({ ...editingCertificate, title: e.target.value })}
                    className="w-full bg-gray-700 p-2 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2">Organization</label>
                  <input
                    type="text"
                    value={editingCertificate.organization}
                    onChange={(e) => setEditingCertificate({ ...editingCertificate, organization: e.target.value })}
                    className="w-full bg-gray-700 p-2 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2">Date (YYYY-MM-DD)</label>
                  <input
                    type="date"
                    value={editingCertificate.date}
                    onChange={(e) => setEditingCertificate({ ...editingCertificate, date: e.target.value })}
                    className="w-full bg-gray-700 p-2 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2">Credential URL</label>
                  <input
                    type="url"
                    value={editingCertificate.credentialUrl || ''}
                    onChange={(e) => setEditingCertificate({ ...editingCertificate, credentialUrl: e.target.value })}
                    className="w-full bg-gray-700 p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-2">Image (JPEG/PNG)</label>
                  <input
                    type="file"
                    accept="image/jpeg, image/png"
                    onChange={handleFileChange}
                    className="w-full bg-gray-700 p-2 rounded"
                  />
                  {editingCertificate.imageUrl && (
                    <div className="mt-2 text-sm text-gray-400">
                      Current image: {editingCertificate.imageUrl.substring(0, 50)}...
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setEditingCertificate(null)}
                    className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}