import { http, HttpResponse } from 'msw'
import { faker } from '@faker-js/faker'

// ─── MOCK DATABASE IN-MEMORY ────────────────────────────────────────────────
// Dữ liệu được khởi tạo một lần duy nhất khi module được load, giúp đồng bộ giữa các trang
const db = {
  currentUser: {
    userId: 1,
    name: 'Thanh Admin',
    email: 'admin@bigdataclub.io',
    role: 'ADMIN',
    expiresIn: 3600 * 24 * 7,
  },
  announcements: Array.from({ length: 5 }).map(() => ({
    id: faker.string.uuid(),
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraphs(1),
    priority: faker.helpers.arrayElement(['HIGH', 'MEDIUM', 'LOW']),
    created_at: faker.date.recent().toISOString(),
  })),
  tasks: Array.from({ length: 8 }).map(() => ({
    id: faker.string.uuid(),
    title: faker.lorem.words(3),
    description: faker.lorem.sentence(),
    deadline: faker.date.future().toISOString(),
    status: faker.helpers.arrayElement(['PENDING', 'IN_PROGRESS', 'COMPLETED']),
    score: faker.number.int({ min: 0, max: 100 }),
  })),
  events: Array.from({ length: 4 }).map(() => ({
    id: faker.string.uuid(),
    title: faker.lorem.words(4),
    start_time: faker.date.soon().toISOString(),
    end_time: faker.date.future().toISOString(),
    location: faker.location.streetAddress(),
    description: faker.lorem.sentence(),
  })),
  users: Array.from({ length: 25 }).map((_, idx) => ({
    id: idx + 1,
    name: faker.person.fullName(),
    email: faker.internet.email(),
    role: faker.helpers.arrayElement(['ADMIN', 'TEACHER', 'STUDENT']),
    team: faker.helpers.arrayElement(['Team AI', 'Team Web', 'Team Mobile']),
    code: `BDC${1000 + idx}`,
    type: faker.helpers.arrayElement(['Member', 'Core Team', 'Lead']),
    active: true,
    totalScore: faker.number.int({ min: 100, max: 2000 }),
    profilePicture: `https://i.pravatar.cc/150?u=${idx}`,
  })),
  pendingUsers: Array.from({ length: 3 }).map((_, idx) => ({
    id: 500 + idx,
    name: faker.person.fullName(),
    email: faker.internet.email(),
    role: 'STUDENT',
    team: 'None',
    code: `PEND${idx}`,
    type: 'Member',
    active: false,
    totalScore: 0,
  })),
}

export const authHandlers = [
  // 1. Login
  http.post('*/apiv1/auth/login', async ({ request }) => {
    console.log('🚀 [MSW] Incoming Login Request:', request.url)
    const { email, password } = await request.json() as any
    console.log('📧 [MSW] Attempting login with:', email)

    if (email === 'admin@bigdataclub.io' && password === '123456') {
      console.log('✅ [MSW] Login Successful')
      return HttpResponse.json(db.currentUser, {
        headers: {
          'Set-Cookie': [
            'authToken=mock-access-token-123; Path=/; HttpOnly',
            'refreshToken=mock-refresh-token-456; Path=/; HttpOnly',
          ].join(', '),
        },
      })
    }
    console.log('❌ [MSW] Login Failed: Invalid credentials')
    return new HttpResponse(null, { status: 401 })
  }),

  // 2. Announcements
  http.get('*/apiv1/announcements', () => {
    return HttpResponse.json(db.announcements)
  }),

  // 3. Tasks
  http.get('*/apiv1/tasks', () => {
    return HttpResponse.json(db.tasks)
  }),

  // 4. Events
  http.get('*/apiv1/events', () => {
    return HttpResponse.json(db.events)
  }),

  // 5. Users List
  http.get('*/apiv1/users', () => {
    return HttpResponse.json(db.users)
  }),

  // 6. Pending Users
  http.get('*/apiv1/users/pending', () => {
    return HttpResponse.json(db.pendingUsers)
  }),

  // 7. Approve User (Ví dụ về tính đồng bộ: Xóa khỏi pending, thêm vào users)
  http.patch('*/apiv1/users/:id/approve', ({ params }) => {
    const id = Number(params.id)
    const userIndex = db.pendingUsers.findIndex(u => u.id === id)
    if (userIndex !== -1) {
      const user = db.pendingUsers.splice(userIndex, 1)[0];
      db.users.push({ 
        ...user, 
        role: user.role as any, // Cast để khớp type
        team: user.team as any,
        type: user.type as any,
        active: true, 
        profilePicture: `https://i.pravatar.cc/150?u=${user.id}` 
      });
      return HttpResponse.json({ message: 'User approved' });
    }
    return new HttpResponse(null, { status: 404 })
  })
]
