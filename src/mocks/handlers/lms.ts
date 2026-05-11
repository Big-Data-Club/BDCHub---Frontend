import { http, HttpResponse } from 'msw'
import { faker } from '@faker-js/faker'

// ─── MOCK DATABASE IN-MEMORY ────────────────────────────────────────────────
const db = {
  courses: Array.from({ length: 6 }).map(() => ({
    id: faker.string.uuid(),
    title: faker.commerce.productName() + " Course",
    description: faker.lorem.paragraph(),
    thumbnail: `https://picsum.photos/seed/${faker.string.alphanumeric(5)}/400/225`,
    instructor_id: faker.string.uuid(),
    price: faker.number.int({ min: 100000, max: 2000000 }),
    level: faker.helpers.arrayElement(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
    sections: Array.from({ length: 3 }).map((_, sIdx) => ({
      id: faker.string.uuid(),
      title: `Chapter ${sIdx + 1}: ${faker.lorem.words(3)}`,
      contents: Array.from({ length: 4 }).map((_, cIdx) => ({
        id: faker.string.uuid(),
        title: `Lesson ${cIdx + 1}: ${faker.lorem.words(4)}`,
        type: faker.helpers.arrayElement(['VIDEO', 'DOCUMENT', 'QUIZ']),
        duration: "10:00",
        is_preview: cIdx === 0
      }))
    }))
  })),
  roles: ['ADMIN', 'TEACHER', 'STUDENT']
}

export const lmsHandlers = [
  // 0. My Roles
  http.get('*/lmsapiv1/me/roles', () => {
    return HttpResponse.json({
      data: { roles: db.roles }
    })
  }),

  // 1. List Courses
  http.get('*/lmsapiv1/lms/courses', () => {
    return HttpResponse.json(db.courses)
  }),

  // 2. Course Details
  http.get('*/lmsapiv1/lms/courses/:id', ({ params }) => {
    const { id } = params
    const course = db.courses.find(c => c.id === id) || db.courses[0]
    return HttpResponse.json(course)
  }),

  // 3. Enroll
  http.post('*/lmsapiv1/lms/enroll', async ({ request }) => {
    const { course_id } = await request.json() as any
    return HttpResponse.json({
      message: 'Enrolled successfully',
      enrollment_id: faker.string.uuid(),
      course_id,
      status: 'ACTIVE'
    })
  })
]
