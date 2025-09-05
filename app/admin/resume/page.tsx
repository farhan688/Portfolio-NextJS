"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { Resume } from "@/app/types";

// Helper to parse JSON strings from API response
const parseJsonField = (data: any, field: string, defaultValue: any) => {
  if (data && typeof data[field] === 'string') {
    try {
      return JSON.parse(data[field]);
    } catch (e) {
      console.error(`Failed to parse ${field}`, e);
      return defaultValue;
    }
  }
  return data?.[field] || defaultValue;
};

export default function AdminResume() {
  const [formData, setFormData] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [newEducation, setNewEducation] = useState({
    degree: "",
    university: "",
    year: "",
    courses: [] as string[],
  });
  const [newExperience, setNewExperience] = useState({
    title: "",
    company: "",
    period: "",
    achievements: [] as string[],
  });
  const [courseInput, setCourseInput] = useState("");
  const [achievementInput, setAchievementInput] = useState("");

  useEffect(() => {
    fetchResume();
  }, []);

  async function fetchResume() {
    try {
      const response = await fetch("/api/resume");
      if (!response.ok) throw new Error("Failed to fetch resume");
      let data = await response.json();

      if (data) {
        const cleanData: Resume = {
          id: data.id,
          personalInfo: parseJsonField(data, 'personalInfo', {}),
          summary: data.summary,
          education: parseJsonField(data, 'education', []),
          experience: parseJsonField(data, 'experience', []),
          pdfFileName: data.pdfFileName,
          contentType: data.contentType,
          pdfFile: null,
        };

        if (!Array.isArray(cleanData.education)) {
          cleanData.education = [];
        }
        if (!Array.isArray(cleanData.experience)) {
          cleanData.experience = [];
        }

        setFormData(cleanData);
      } else {
        // Initialize with default structure if no data exists
        setFormData({
          personalInfo: { name: "", email: "", location: "", linkedin: "" },
          summary: "",
          education: [],
          experience: [],
          pdfFileName: null,
          contentType: null,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData) return;
    
    try {
      const submitFormData = new FormData();
      
      // Append PDF file if exists
      // The type definition for pdfFile is File | null, so check instanceof File
      if (formData.pdfFile instanceof File) {
        submitFormData.append('pdfFile', formData.pdfFile);
      }

      // Prepare resume data by stringifying JSON fields
      const resumeDataToSend = {
        id: formData.id, // Include ID for update
        personalInfo: JSON.stringify(formData.personalInfo),
        summary: formData.summary,
        education: JSON.stringify(formData.education),
        experience: JSON.stringify(formData.experience),
        // pdfFile, pdfFileName, contentType are handled separately or already in formData
      };

      submitFormData.append('resumeData', JSON.stringify(resumeDataToSend));

      const response = await fetch("/api/resume", {
        method: "PUT",
        body: submitFormData,
      });

      if (!response.ok) {
        let errorMessage = "Failed to save resume";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // Response was not JSON, use default error message
          console.error("Could not parse error response as JSON:", e);
        }
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      
      const updatedResume: Resume = {
        id: responseData.id,
        personalInfo: parseJsonField(responseData, 'personalInfo', {}),
        summary: responseData.summary,
        education: parseJsonField(responseData, 'education', []),
        experience: parseJsonField(responseData, 'experience', []),
        pdfFileName: responseData.pdfFileName,
        contentType: responseData.contentType,
        pdfFile: formData.pdfFile, // Keep the existing file object
      };

      if (!Array.isArray(updatedResume.education)) {
        updatedResume.education = [];
      }
      if (!Array.isArray(updatedResume.experience)) {
        updatedResume.experience = [];
      }

      setFormData(updatedResume);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Submit error:', err);
      setError(err instanceof Error ? err.message : "Failed to save");
    }
  };

  const addEducation = () => {
    if (newEducation.degree && newEducation.university) {
      setFormData((prevFormData) => {
        if (!prevFormData) return null;
        return {
          ...prevFormData,
          education: [
            ...prevFormData.education,
            {
              ...newEducation,
              // No _id needed for new items, Prisma will assign 'id'
              courses: [...newEducation.courses],
            },
          ],
        };
      });
      setNewEducation({
        degree: "",
        university: "",
        year: "",
        courses: [],
      });
    }
  };

  const addExperience = () => {
    if (newExperience.title && newExperience.company) {
      setFormData((prevFormData) => {
        if (!prevFormData) return null;
        return {
          ...prevFormData,
          experience: [
            ...prevFormData.experience,
            {
              ...newExperience,
              // No _id needed for new items, Prisma will assign 'id'
              achievements: [...newExperience.achievements],
            },
          ],
        };
      });
      setNewExperience({
        title: "",
        company: "",
        period: "",
        achievements: [],
      });
    }
  };

  const removeEducation = (indexToRemove: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pendidikan ini?")) return;
    setFormData((prevFormData) => {
      if (!prevFormData) return null;
      return {
        ...prevFormData,
        education: prevFormData.education.filter((_, index) => index !== indexToRemove),
      };
    });
  };

  const removeExperience = (indexToRemove: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pengalaman ini?")) return;
    setFormData((prevFormData) => {
      if (!prevFormData) return null;
      return {
        ...prevFormData,
        experience: prevFormData.experience.filter((_, index) => index !== indexToRemove),
      };
    });
  };

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (error) return <div className="text-center text-red-500 p-8">{error}</div>;
  if (!formData) return <div className="text-center p-8">No resume data available.</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Resume</h1>
          <button
            onClick={() => (window.location.href = "/admin")}
            className="bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            Back to Dashboard
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <section className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">Name</label>
                <input
                  type="text"
                  value={formData.personalInfo.name || ""}
                  onChange={(e) =>
                    setFormData((prev) => {
                      if (!prev) return null;
                      return {
                        ...prev,
                        personalInfo: {
                          name: e.target.value,
                          email: prev.personalInfo.email,
                          location: prev.personalInfo.location,
                          linkedin: prev.personalInfo.linkedin,
                        },
                      };
                    })
                  }
                  className="w-full bg-gray-700 p-2 rounded"
                />
              </div>
              <div>
                <label className="block mb-2">Email</label>
                <input
                  type="email"
                  value={formData.personalInfo.email || ""}
                  onChange={(e) =>
                    setFormData((prev) => {
                      if (!prev) return null;
                      return {
                        ...prev,
                        personalInfo: {
                          name: prev.personalInfo.name,
                          email: e.target.value,
                          location: prev.personalInfo.location,
                          linkedin: prev.personalInfo.linkedin,
                        },
                      };
                    })
                  }
                  className="w-full bg-gray-700 p-2 rounded"
                />
              </div>
              <div>
                <label className="block mb-2">Location</label>
                <input
                  type="text"
                  value={formData.personalInfo.location || ""}
                  onChange={(e) =>
                    setFormData((prev) => {
                      if (!prev) return null;
                      return {
                        ...prev,
                        personalInfo: {
                          name: prev.personalInfo.name,
                          email: prev.personalInfo.email,
                          location: e.target.value,
                          linkedin: prev.personalInfo.linkedin,
                        },
                      };
                    })
                  }
                  className="w-full bg-gray-700 p-2 rounded"
                />
              </div>
              <div>
                <label className="block mb-2">LinkedIn</label>
                <input
                  type="url"
                  value={formData.personalInfo.linkedin || ""}
                  onChange={(e) =>
                    setFormData((prev) => {
                      if (!prev) return null;
                      return {
                        ...prev,
                        personalInfo: {
                          name: prev.personalInfo.name,
                          email: prev.personalInfo.email,
                          location: prev.personalInfo.location,
                          linkedin: e.target.value,
                        },
                      };
                    })
                  }
                  className="w-full bg-gray-700 p-2 rounded"
                />
              </div>
            </div>
          </section>

          {/* Summary */}
          <section className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Career Summary</h2>
            <textarea
              value={formData.summary || ""}
              onChange={(e) =>
                setFormData((prev) =>
                  prev ? { ...prev, summary: e.target.value } : null
                )
              }
              className="w-full bg-gray-700 p-2 rounded h-32"
            />
          </section>

          {/* Education */}
          <section className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Education</h2>
            <div className="space-y-4 mb-4">
              {formData.education.map((edu, index) => (
                <div key={index} className="bg-gray-700 p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{edu.degree}</h3>
                      <p>{edu.university}, {edu.year}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {edu.courses?.map((course, courseIndex) => (
                          <span key={courseIndex} className="bg-blue-500 px-2 py-1 rounded-full text-sm">
                            {course}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeEducation(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Degree"
                  value={newEducation.degree}
                  onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                  className="bg-gray-700 p-2 rounded"
                />
                <input
                  type="text"
                  placeholder="University"
                  value={newEducation.university}
                  onChange={(e) => setNewEducation({ ...newEducation, university: e.target.value })}
                  className="bg-gray-700 p-2 rounded"
                />
                <input
                  type="text"
                  placeholder="Year"
                  value={newEducation.year}
                  onChange={(e) => setNewEducation({ ...newEducation, year: e.target.value })}
                  className="bg-gray-700 p-2 rounded"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add Course"
                  value={courseInput}
                  onChange={(e) => setCourseInput(e.target.value)}
                  className="flex-1 bg-gray-700 p-2 rounded"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (courseInput.trim()) {
                      setNewEducation({
                        ...newEducation,
                        courses: [...newEducation.courses, courseInput.trim()],
                      });
                      setCourseInput("");
                    }
                  }}
                  className="bg-blue-600 px-4 rounded hover:bg-blue-700"
                >
                  Add Course
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {newEducation.courses.map((course, index) => (
                  <span
                    key={index}
                    className="bg-blue-500 px-2 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {course}
                    <button
                      type="button"
                      onClick={() =>
                        setNewEducation({
                          ...newEducation,
                          courses: newEducation.courses.filter((_, i) => i !== index),
                        })
                      }
                      className="hover:text-red-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={addEducation}
                className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
              >
                Add Education
              </button>
            </div>
          </section>

          {/* Experience */}
          <section className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Professional Experience</h2>
            <div className="space-y-4 mb-4">
              {formData.experience.map((exp, index) => (
                <div key={index} className="bg-gray-700 p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{exp.title}</h3>
                      <p>{exp.company}, {exp.period}</p>
                      <ul className="list-disc list-inside mt-2">
                        {exp.achievements?.map((achievement, achievementIndex) => (
                          <li key={achievementIndex} className="text-gray-300">
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExperience(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Job Title"
                  value={newExperience.title}
                  onChange={(e) => setNewExperience({ ...newExperience, title: e.target.value })}
                  className="bg-gray-700 p-2 rounded"
                />
                <input
                  type="text"
                  placeholder="Company"
                  value={newExperience.company}
                  onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                  className="bg-gray-700 p-2 rounded"
                />
                <input
                  type="text"
                  placeholder="Period"
                  value={newExperience.period}
                  onChange={(e) => setNewExperience({ ...newExperience, period: e.target.value })}
                  className="bg-gray-700 p-2 rounded"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add Achievement"
                  value={achievementInput}
                  onChange={(e) => setAchievementInput(e.target.value)}
                  className="flex-1 bg-gray-700 p-2 rounded"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (achievementInput.trim()) {
                      setNewExperience({
                        ...newExperience,
                        achievements: [...newExperience.achievements, achievementInput.trim()],
                      });
                      setAchievementInput("");
                    }
                  }}
                  className="bg-blue-600 px-4 rounded hover:bg-blue-700"
                >
                  Add Achievement
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {newExperience.achievements.map((achievement, index) => (
                  <span
                    key={index}
                    className="bg-blue-500 px-2 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {achievement}
                    <button
                      type="button"
                      onClick={() =>
                        setNewExperience({
                          ...newExperience,
                          achievements: newExperience.achievements.filter((_, i) => i !== index),
                        })
                      }
                      className="hover:text-red-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={addExperience}
                className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
              >
                Add Experience
              </button>
            </div>
          </section>

          {/* Resume PDF */}
          <section className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Resume PDF</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-2">Upload PDF</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormData((prev) => ({
                        ...(prev as Resume), // Cast to Resume to ensure type safety
                        pdfFile: file,
                        pdfFileName: file.name,
                      }));
                    }
                  }}
                  className="w-full bg-gray-700 p-2 rounded"
                />
              </div>
              {formData.pdfFileName && (
                <p className="text-sm text-gray-400">
                  Current file: {formData.pdfFileName}
                </p>
              )}
              {formData.pdfFileName && (
                <a
                  href={`/api/resume?download=true`} // Updated download URL
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline text-sm"
                >
                  Download Current PDF
                </a>
              )}
            </div>
          </section>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              className="bg-blue-600 px-6 py-2 rounded hover:bg-blue-700"
            >
              Save Resume
            </button>
            {success && (
              <span className="text-green-500">
                Resume saved successfully!
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}