// These types are for the frontend state and should match the parsed API responses.

export interface Project {
  id?: string;
  title: string;
  description: string;
  techStack: string[]; // Parsed from JSON string
  imageUrl: string;
  demoUrl?: string;
  repoUrl?: string;
  createdAt?: string; // Dates will be strings after JSON serialization
  updatedAt?: string;
}

export interface Experience {
  id?: string;
  role: string;
  company: string;
  startDate: string;
  endDate?: string | null;
  description: string[]; // Parsed from JSON string
  period?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Certificate {
  id?: string;
  title: string;
  organization: string;
  date: string;
  credentialUrl?: string | null;
  imageUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Skill {
  id?: string;
  name: string;
  category: string;
}

export interface About {
  id?: string;
  title: string;
  description: string;
  imageUrl: string;
  socialLinks: { // Parsed from JSON string
    github?: string;
    linkedin?: string;
    twitter?: string;
    email?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Resume {
    id?: string;
    personalInfo: {
        name?: string;
        email?: string;
        location?: string;
        linkedin?: string;
    }; // Parsed from JSON string
    summary: string;
    education: {
        degree?: string;
        university?: string;
        year?: string;
        courses?: string[];
    }[]; // Parsed from JSON string
    experience: {
        title?: string;
        company?: string;
        period?: string;
        achievements?: string[];
    }[]; // Parsed from JSON string
    pdfFile?: File | null;
    pdfFileData?: string | null;
    pdfFileName?: string | null;
    contentType?: string | null;
    createdAt?: string;
    updatedAt?: string;
}


export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  createdAt?: string;
}
