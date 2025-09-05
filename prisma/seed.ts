import { PrismaClient } from '../lib/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  await prisma.resume.upsert({
    where: { id: 'clw9111110000000000000000' }, // Use a fixed ID for upsert
    update: {},
    create: {
      id: 'clw9111110000000000000000',
      personalInfo: JSON.stringify({
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '123-456-7890',
        linkedin: 'linkedin.com/in/johndoe',
        github: 'github.com/johndoe',
        website: 'johndoe.com',
      }),
      summary: 'A highly motivated and results-oriented software engineer with a passion for building innovative solutions.',
      education: JSON.stringify([
        {
          degree: 'Master of Science in Computer Science',
          university: 'University of Example',
          year: '2023',
        },
      ]),
      experience: JSON.stringify([
        {
          role: 'Software Engineer',
          company: 'Tech Solutions Inc.',
          startDate: '2023-01-01T00:00:00.000Z',
          endDate: null,
          description: JSON.stringify([
            'Developed and maintained web applications using React and Node.js.',
            'Collaborated with cross-functional teams to deliver high-quality software.',
          ]),
        },
      ]),
      pdfFileData: null, // No PDF data for now
      pdfFileName: null,
      contentType: null,
    },
  });
  console.log('Resume seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
