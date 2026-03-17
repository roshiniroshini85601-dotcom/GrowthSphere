import { PrismaClient, Role, ReviewStatus, TaskStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { subDays } from 'date-fns'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  const hashedPassword123 = await bcrypt.hash('password123', 10)
  const hashedDefaultPassword = await bcrypt.hash('changeme123', 10)

  // 1. Clean existing data (careful with dependencies)
  await prisma.internMilestone.deleteMany()
  await prisma.review.deleteMany()
  await prisma.task.deleteMany()
  await prisma.mentorMentee.deleteMany()
  await prisma.topicMilestone.deleteMany()
  await prisma.topic.deleteMany()
  await prisma.employee.deleteMany()

  console.log('Cleared database.')

  // 2. Create Topics and Milestones
  const topicsData = [
    { name: 'Onboarding & Setup' },
    { name: 'Core Web Technologies' },
    { name: 'Backend Frameworks' },
    { name: 'Database Management' },
    { name: 'DevOps & Deployment' },
  ]

  const topics = []
  for (const t of topicsData) {
    const topic = await prisma.topic.create({
      data: {
        name: t.name,
        milestones: {
          create: [
            { name: `${t.name} - Phase 1`, content: `Core concepts of ${t.name}`, link: 'https://docs.example.com' },
            { name: `${t.name} - Phase 2`, content: `Advanced application of ${t.name}`, link: 'https://advanced.example.com' },
          ],
        },
      },
      include: { milestones: true },
    })
    topics.push(topic)
  }
  console.log(`Created ${topics.length} topics.`)

  // 3. Create Admin Users (3)
  const admins = []
  // Specific Demo Admin
  const demoAdmin = await prisma.employee.create({
    data: {
      name: 'Xavier Babu',
      email: 'xavier.babu@org.com',
      password: hashedPassword123,
      contactNo: '9000000001',
      role: Role.ADMIN,
    },
  })
  admins.push(demoAdmin)
  for (let i = 2; i <= 3; i++) {
    const admin = await prisma.employee.create({
      data: {
        name: `Admin User ${i}`,
        email: `admin${i}@growthpulse.com`,
        password: hashedDefaultPassword,
        contactNo: `900000000${i}`,
        role: Role.ADMIN,
      },
    })
    admins.push(admin)
  }
  console.log('Created 3 admins.')

  // 4. Create Mentor Users (15)
  const mentors = []
  // Specific Demo Mentor
  const demoMentor = await prisma.employee.create({
    data: {
      name: 'Xavier Praveen',
      email: 'xavier.praveen@org.com',
      password: hashedPassword123,
      contactNo: '8000000001',
      role: Role.MENTOR,
    },
  })
  mentors.push(demoMentor)

  for (let i = 2; i <= 15; i++) {
    const mentor = await prisma.employee.create({
      data: {
        name: `Mentor ${i}`,
        email: `mentor${i}@growthpulse.com`,
        password: hashedDefaultPassword,
        contactNo: `80000000${i.toString().padStart(2, '0')}`,
        role: Role.MENTOR,
      },
    })
    mentors.push(mentor)
  }
  console.log('Created 15 mentors.')

  // 5. Create Non-Mentor Employees (5)
  for (let i = 1; i <= 5; i++) {
    await prisma.employee.create({
      data: {
        name: `Employee ${i}`,
        email: `employee${i}@growthpulse.com`,
        password: hashedDefaultPassword,
        contactNo: `70000000${i.toString().padStart(2, '0')}`,
        role: Role.NOT_MENTOR,
      },
    })
  }
  console.log('Created 5 non-mentor employees.')

  // 6. Create Interns (50) and assign to mentors
  const interns = []
  // Specific Demo Intern
  const demoIntern = await prisma.employee.create({
    data: {
      name: 'Roshini',
      email: 'roshini@org.com',
      password: hashedPassword123,
      contactNo: '6000000001',
      role: Role.INTERN,
      collegeName: 'Bannari Institute of Technology',
      degree: 'Bachelor of Technology',
    },
  })
  interns.push(demoIntern)
  const demoIntern1 = await prisma.employee.create({
    data: {
      name: 'Lipiga',
      email: 'lipiga@org.com',
      password: hashedPassword123,
      contactNo: '60000003243',
      role: Role.INTERN,
      collegeName: 'Kongu Institute of Technology',
      degree: 'Bachelor of Technology',
    },
  })
  interns.push(demoIntern1)

  // Assign demo intern to demo mentor
  await prisma.mentorMentee.create({
    data: {
      mentorId: demoMentor.id,
      menteeId: demoIntern.id,
    },
  })

  // Add progress for demo intern
  for (const topic of topics) {
    for (const ms of topic.milestones) {
      await prisma.internMilestone.create({
        data: {
          internId: demoIntern.id,
          milestoneId: ms.id,
          dateAssigned: new Date(),
          internStatus: Math.random() > 0.5,
        },
      })
    }
    for (let j = 1; j <= 2; j++) {
      await prisma.task.create({
        data: {
          name: `${topic.name} Task ${j}`,
          description: `A practical exercise based on ${topic.name} modules.`,
          internId: demoIntern.id,
          reviewerId: demoMentor.id,
          dateReviewed: subDays(new Date(), Math.floor(Math.random() * 7)),
          status: Math.random() > 0.5 ? TaskStatus.COMPLETED : TaskStatus.PENDING,
          internStatus: Math.random() > 0.7,
          feedback: [
            { text: 'Great progress on this initial phase.', date: subDays(new Date(), 1).toISOString(), author: demoMentor.name },
            { text: 'Good understanding of the core concepts.', date: new Date().toISOString(), author: demoMentor.name }
          ],
        },
      })
    }
    for (let j = 1; j <= 2; j++) {
      await prisma.review.create({
        data: {
          title: `${topic.name} Review ${j}`,
          description: `Checking conceptual understanding of ${topic.name}.`,
          internId: demoIntern.id,
          reviewerId: demoMentor.id,
          dateReviewed: subDays(new Date(), Math.floor(Math.random() * 7)),
          status: Math.random() > 0.5 ? ReviewStatus.COMPLETED : ReviewStatus.PENDING,
          internStatus: Math.random() > 0.6,
          feedback: [
            { text: 'Concepts are clear, needs more practice on implementation.', date: subDays(new Date(), 1).toISOString(), author: demoMentor.name },
            { text: 'Final review: Well presented and explained.', date: new Date().toISOString(), author: demoMentor.name }
          ],
        },
      })
    }
  }

  for (let i = 2; i <= 50; i++) {
    const intern = await prisma.employee.create({
      data: {
        name: `Intern ${i}`,
        email: `intern${i}@growthpulse.com`,
        password: 'changeme123',
        contactNo: `60000000${i.toString().padStart(2, '0')}`,
        role: Role.INTERN,
        collegeName: 'Global Institute of Technology',
        degree: 'Bachelor of Technology',
      },
    })
    interns.push(intern)

    // Assign to a mentor in round-robin fashion
    const mentor = mentors[(i - 1) % mentors.length]
    await prisma.mentorMentee.create({
      data: {
        mentorId: mentor.id,
        menteeId: intern.id,
      },
    })

    // 7. For each intern, create data for each topic
    for (const topic of topics) {
      // Assign Milestones
      for (const ms of topic.milestones) {
        await prisma.internMilestone.create({
          data: {
            internId: intern.id,
            milestoneId: ms.id,
            dateAssigned: new Date(),
            internStatus: Math.random() > 0.5, // Randomly set some as done
          },
        })
      }

      // Create 2 Tasks for this topic
      for (let j = 1; j <= 2; j++) {
        await prisma.task.create({
          data: {
            name: `${topic.name} Task ${j}`,
            description: `A practical exercise based on ${topic.name} modules.`,
            internId: intern.id,
            reviewerId: mentor.id,
            dateReviewed: subDays(new Date(), Math.floor(Math.random() * 7)),
            status: Math.random() > 0.5 ? TaskStatus.COMPLETED : TaskStatus.PENDING,
            internStatus: Math.random() > 0.7,
            feedback: [
              { text: 'Initial feedback: The approach looks solid.', date: subDays(new Date(), 2).toISOString(), author: mentor.name },
              { text: 'Implementation feedback: Clean code and good modularity.', date: subDays(new Date(), 1).toISOString(), author: mentor.name }
            ],
          },
        })
      }

      // Create 2 Reviews for this topic
      for (let j = 1; j <= 2; j++) {
        await prisma.review.create({
          data: {
            title: `${topic.name} Review ${j}`,
            description: `Checking conceptual understanding of ${topic.name}.`,
            internId: intern.id,
            reviewerId: mentor.id,
            dateReviewed: subDays(new Date(), Math.floor(Math.random() * 7)),
            status: Math.random() > 0.5 ? ReviewStatus.COMPLETED : ReviewStatus.PENDING,
            internStatus: Math.random() > 0.6,
            feedback: [
              { text: 'Review feedback: Concepts are well understood.', date: subDays(new Date(), 2).toISOString(), author: mentor.name },
              { text: 'Clarification: Good explanation of the edge cases.', date: subDays(new Date(), 1).toISOString(), author: mentor.name }
            ],
          },
        })
      }
    }
  }

  console.log(`Successfully created 50 interns with progress data.`)
  console.log('Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
