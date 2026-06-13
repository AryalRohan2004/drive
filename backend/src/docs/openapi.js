const genericObjectSchema = {
  type: 'object',
  additionalProperties: true,
};

const errorSchema = {
  type: 'object',
  required: ['status', 'message'],
  properties: {
    status: { type: 'string', example: 'error' },
    message: { type: 'string' },
  },
};

const response = (example, description = 'Success') => ({
  description,
  content: {
    'application/json': {
      schema: genericObjectSchema,
      example,
    },
  },
});

const errorResponse = (status, message) => ({
  description: `${status} ${message}`,
  content: {
    'application/json': {
      schema: errorSchema,
      example: {
        status: 'error',
        message,
      },
    },
  },
});

const body = (example) => ({
  required: true,
  content: {
    'application/json': {
      schema: genericObjectSchema,
      example,
    },
  },
});

const noContent = (description = 'No Content') => ({
  description,
});

const commonErrors = {
  400: errorResponse(400, 'Invalid request payload'),
  401: errorResponse(401, 'Authentication required'),
  403: errorResponse(403, 'You do not have permission to access this resource'),
  404: errorResponse(404, 'Resource not found'),
  409: errorResponse(409, 'Resource already exists'),
  500: errorResponse(500, 'Internal server error'),
};

const now = '2026-06-11T17:41:51.517Z';

const userExample = {
  id: '6f4e5f64-9d5b-4241-adf4-a48ec7d59516',
  fullName: 'Learner One',
  email: 'learner1@example.com',
  phone: '0400000000',
  role: 'learner',
  status: 'active',
  dateOfBirth: null,
  address: null,
  suburb: 'Adelaide',
  postcode: '5000',
  licenseType: null,
  transmissionPreference: 'manual',
  logbookHours: 0,
  progressPercent: 0,
  licenseNumber: null,
  serviceAreas: ['Adelaide'],
  bio: 'Ready to learn',
  availability: [],
  preferredVehicleType: 'manual-car',
  pickupAddress: '1 King William St, Adelaide SA',
  pickupSuburb: 'Adelaide',
  pickupLatitude: -34.9285,
  pickupLongitude: 138.6007,
  emergencyContactName: null,
  emergencyContactPhone: null,
  preferredLessonTimes: ['weekend'],
  specialRequirements: null,
  documentationStatus: 'pending',
  vehicleTypesSupported: ['manual-car'],
  baseAddress: null,
  baseLatitude: null,
  baseLongitude: null,
  serviceRadiusKm: 25,
  maxTravelDistanceKm: 25,
  createdAt: now,
  updatedAt: now,
};

const instructorExample = {
  ...userExample,
  id: '3fa1793c-86e3-42a5-af47-95510c8f2d50',
  fullName: 'Instructor One',
  email: 'instructor1@example.com',
  role: 'instructor',
  serviceAreas: ['Adelaide', 'Glenelg'],
  vehicleTypesSupported: ['manual-car', 'automatic-car'],
  baseAddress: '12 Main Rd',
  baseLatitude: -34.9285,
  baseLongitude: 138.6007,
  serviceRadiusKm: 30,
  maxTravelDistanceKm: 30,
};

const authResponseExample = {
  user: userExample,
  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
};

const packageExample = {
  id: 'pkg-1',
  code: 'single-1hr',
  name: '1 Hour Lesson',
  description: 'Perfect for a quick refresher or assessment.',
  price: 135,
  durationMinutes: 60,
  category: 'single',
  isActive: true,
  includedItems: ['Door-to-door pickup & drop-off', 'Modern dual-control vehicle', '1-on-1 instruction'],
  createdAt: now,
  updatedAt: now,
};

const contentExample = {
  id: 'content-1',
  slug: 'pricing',
  title: 'Driving Lessons & Pricing',
  content: '<p>Lesson pricing information...</p>',
  seoTitle: 'Driving Lessons & Pricing',
  seoDescription: 'Driving Lessons & Pricing for SANOS Driving School',
  isPublished: true,
  createdAt: now,
  updatedAt: now,
};

const vehicleTypeExample = {
  id: 'vehicle-1',
  code: 'manual-car',
  name: 'Manual Car',
  description: 'Manual transmission lessons',
  requiresDocumentVerification: false,
  isActive: true,
  createdAt: now,
  updatedAt: now,
};

const contactRequestExample = {
  id: 'contact-1',
  name: 'Alex Learner',
  email: 'alex@example.com',
  phone: '0400111222',
  message: 'I would like to ask about lesson availability.',
  status: 'new',
  createdAt: now,
  updatedAt: now,
};

const bookingExample = {
  id: 'booking-1',
  bookingNumber: 'SANOS-2026-14567',
  userId: '6f4e5f64-9d5b-4241-adf4-a48ec7d59516',
  guestName: null,
  guestEmail: 'learner1@example.com',
  guestPhone: '0400000000',
  bookingType: 'learner',
  vehicleType: 'manual-car',
  vehicleCategory: 'manual-car',
  packageId: 'pkg-1',
  packageCode: 'single-1hr',
  packageName: '1 Hour Lesson',
  lessonDate: '2026-06-20',
  lessonTime: '10:00:00',
  status: 'pending',
  paymentStatus: 'unpaid',
  price: 135,
  notes: 'Need help with roundabouts.',
  pickupSuburb: 'Adelaide',
  pickupAddress: '1 King William St, Adelaide SA',
  instructorId: '3fa1793c-86e3-42a5-af47-95510c8f2d50',
  createdAt: now,
  updatedAt: now,
};

const learnerDocumentExample = {
  id: 'doc-1',
  studentId: '6f4e5f64-9d5b-4241-adf4-a48ec7d59516',
  documentType: 'identity',
  fileUrl: 'https://example.com/uploads/id-card.png',
  status: 'pending',
  verifiedBy: null,
  rejectionReason: null,
  createdAt: now,
  updatedAt: now,
};

const trainingRequestExample = {
  id: 'train-1',
  student_id: '6f4e5f64-9d5b-4241-adf4-a48ec7d59516',
  instructor_id: '3fa1793c-86e3-42a5-af47-95510c8f2d50',
  vehicle_type: 'manual-car',
  package_id: null,
  preferred_date: '2026-06-22',
  preferred_time: '10:30:00',
  pickup_address: '1 King William St, Adelaide SA',
  pickup_suburb: 'Adelaide',
  message: 'Please start next week',
  status: 'pending',
  response_message: null,
  responded_at: null,
  created_at: now,
  updated_at: now,
};

const assignmentExample = {
  id: 'assign-1',
  student_id: '6f4e5f64-9d5b-4241-adf4-a48ec7d59516',
  instructor_id: '3fa1793c-86e3-42a5-af47-95510c8f2d50',
  vehicle_type: 'manual-car',
  status: 'active',
  started_at: now,
  ended_at: null,
  source_training_request_id: 'train-1',
};

const transferRequestExample = {
  id: 'transfer-1',
  student_id: '6f4e5f64-9d5b-4241-adf4-a48ec7d59516',
  from_instructor_id: '3fa1793c-86e3-42a5-af47-95510c8f2d50',
  to_instructor_id: '46cded35-f13e-41cd-bc5e-5c2a197e1768',
  current_assignment_id: 'assign-1',
  new_assignment_id: 'assign-2',
  reason: 'Need another schedule',
  status: 'requested',
  response_message: null,
  progress_snapshot: {
    skills: [],
    logbookHours: 0,
    progressPercent: 0,
    documentationStatus: 'pending',
  },
  hours_transferred: 0,
  package_balance_transferred: '100.00',
  requested_at: now,
  completed_at: null,
  updated_at: now,
};

const dashboardLearnerExample = {
  upcomingLesson: {
    id: 'booking-1',
    bookingNumber: 'SANOS-2026-14567',
    lessonDate: '2026-06-20',
    lessonTime: '10:00:00',
    status: 'confirmed',
    packageName: '1 Hour Lesson',
    vehicleType: 'manual-car',
  },
  progressPercent: 0,
  hoursLogged: 0,
  documentationStatus: 'pending',
  preferredVehicleType: 'manual-car',
  pickupAddress: '1 King William St, Adelaide SA',
  pickupSuburb: 'Adelaide',
  activeAssignment: assignmentExample,
  completedLessons: 0,
  totalSpent: 0,
  skills: [],
  lessonHistory: [bookingExample],
  instructorNotes: [],
  learnerDocuments: [learnerDocumentExample],
  transferRequests: [transferRequestExample],
};

const dashboardInstructorExample = {
  todayLessons: [],
  students: [
    {
      id: '6f4e5f64-9d5b-4241-adf4-a48ec7d59516',
      full_name: 'Learner One',
      email: 'learner1@example.com',
      progress_percent: 0,
      logbook_hours: 0,
      package_name: '1 Hour Lesson',
      vehicle_type: 'manual-car',
      assignment_status: 'active',
    },
  ],
  incomingTrainingRequests: [trainingRequestExample],
  assignments: [assignmentExample],
  transferRequests: [transferRequestExample],
  quickStats: {
    active_students: 1,
    lessons_today: 0,
    completed_lessons: 0,
  },
};

const nearbyResponseExample = {
  pickup: { latitude: -34.9285, longitude: 138.6007 },
  vehicleType: 'manual-car',
  matches: [
    {
      instructorId: '3fa1793c-86e3-42a5-af47-95510c8f2d50',
      fullName: 'Instructor One',
      email: 'instructor1@example.com',
      phone: '0400000000',
      vehicleTypesSupported: ['manual-car', 'automatic-car'],
      routeDistanceKm: 4.2,
      estimatedTravelMinutes: 11,
      algorithm: 'osrm',
      score: 58,
    },
  ],
};

const routeDistanceExample = {
  routeDistanceKm: 4.2,
  estimatedTravelMinutes: 11,
  algorithm: 'osrm',
};

const availabilityExample = {
  date: '2026-06-20',
  availableTimes: ['09:00 AM', '11:00 AM', '02:00 PM'],
};

const errorExamples = {
  authRequired: errorResponse(401, 'Authentication required'),
  forbidden: errorResponse(403, 'You do not have permission to access this resource'),
  notFound: errorResponse(404, 'Resource not found'),
  badRequest: errorResponse(400, 'Invalid request payload'),
  conflict: errorResponse(409, 'Resource already exists'),
};

const listResponse = (key, exampleItem) =>
  response(
    {
      [key]: [exampleItem],
    },
    'Success'
  );

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'SANOS Driving School API',
    version: '1.0.0',
    description:
      'REST API for SANOS Driving School. All examples below are based on the current backend responses.',
  },
  servers: [{ url: '/' }],
  tags: [
    { name: 'System' },
    { name: 'Auth' },
    { name: 'Packages' },
    { name: 'Bookings' },
    { name: 'Contact' },
    { name: 'Dashboard' },
    { name: 'Availability' },
    { name: 'Content' },
    { name: 'Users' },
    { name: 'Vehicle Types' },
    { name: 'Instructors' },
    { name: 'Training Requests' },
    { name: 'Assignments' },
    { name: 'Transfer Requests' },
    { name: 'Learner Documents' },
    { name: 'Matching' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  paths: {
    '/': {
      get: {
        tags: ['System'],
        summary: 'Service root',
        responses: {
          200: response({
            service: 'sanos-driving-backend',
            message: 'SANOS Driving School API',
            docs: '/api/health',
          }),
        },
      },
    },
    '/api/health': {
      get: {
        tags: ['System'],
        summary: 'Health check',
        responses: {
          200: response({
            ok: true,
            service: 'sanos-driving-backend',
            timestamp: now,
          }),
        },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a learner or instructor',
        requestBody: body({
          fullName: 'Learner One',
          email: 'learner1@example.com',
          password: 'LearnerPass123!',
          phone: '0400000000',
          role: 'learner',
          transmissionPreference: 'manual',
          preferredVehicleType: 'manual-car',
          pickupSuburb: 'Adelaide',
          pickupAddress: '1 King William St, Adelaide SA',
          preferredLessonTimes: ['weekend'],
          vehicleTypesSupported: ['manual-car'],
          baseAddress: '12 Main Rd',
          baseLatitude: -34.9285,
          baseLongitude: 138.6007,
          serviceRadiusKm: 25,
        }),
        responses: {
          201: response(authResponseExample),
          400: commonErrors[400],
          409: errorResponse(409, 'Email already in use'),
          500: commonErrors[500],
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login and receive a JWT',
        requestBody: body({
          email: 'learner1@example.com',
          password: 'LearnerPass123!',
        }),
        responses: {
          200: response(authResponseExample),
          400: commonErrors[400],
          401: errorResponse(401, 'Invalid email or password'),
          403: errorResponse(403, 'Account is not active'),
          500: commonErrors[500],
        },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout',
        responses: {
          200: response({ message: 'Logged out successfully' }),
        },
      },
    },
    '/api/auth/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: 'Request a password reset link',
        requestBody: body({
          email: 'learner1@example.com',
        }),
        responses: {
          200: response({
            message: 'If the account exists, a reset link will be sent shortly.',
            resetToken: 'dev-reset-token-example',
          }),
          400: commonErrors[400],
        },
      },
    },
    '/api/auth/reset-password': {
      post: {
        tags: ['Auth'],
        summary: 'Reset a password using a token',
        requestBody: body({
          token: 'dev-reset-token-example',
          password: 'LearnerPass456!',
        }),
        responses: {
          200: response({ message: 'Password reset successful' }),
          400: errorResponse(400, 'Reset token is invalid or expired'),
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get the authenticated user',
        security: [{ bearerAuth: [] }],
        responses: {
          200: response({ user: userExample }),
          401: commonErrors[401],
        },
      },
    },
    '/api/packages': {
      get: {
        tags: ['Packages'],
        summary: 'List active lesson packages',
        responses: {
          200: response({ packages: [packageExample] }),
        },
      },
      post: {
        tags: ['Packages'],
        summary: 'Create a package',
        security: [{ bearerAuth: [] }],
        requestBody: body({
          code: 'single-3hr',
          name: '3 Hour Lesson',
          description: 'Longer lesson block',
          price: 300,
          durationMinutes: 180,
          category: 'single',
          isActive: true,
          includedItems: ['Pickup', 'Instruction', 'Feedback'],
        }),
        responses: {
          201: response({ package: packageExample }),
          400: commonErrors[400],
          401: commonErrors[401],
          403: commonErrors[403],
        },
      },
    },
    '/api/packages/{code}': {
      get: {
        tags: ['Packages'],
        summary: 'Get a package by code',
        parameters: [
          { name: 'code', in: 'path', required: true, schema: { type: 'string' }, example: 'single-1hr' },
        ],
        responses: {
          200: response({ package: packageExample }),
          404: errorResponse(404, 'Package not found'),
        },
      },
    },
    '/api/packages/{id}': {
      patch: {
        tags: ['Packages'],
        summary: 'Update a package',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'pkg-1' }],
        requestBody: body({
          name: 'Updated Package',
          price: 150,
          includedItems: ['Pickup', 'Instruction'],
        }),
        responses: {
          200: response({ package: packageExample }),
          400: commonErrors[400],
          401: commonErrors[401],
          403: commonErrors[403],
          404: commonErrors[404],
        },
      },
      delete: {
        tags: ['Packages'],
        summary: 'Deactivate a package',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'pkg-1' }],
        responses: {
          204: noContent(),
          401: commonErrors[401],
          403: commonErrors[403],
          404: commonErrors[404],
        },
      },
    },
    '/api/bookings': {
      get: {
        tags: ['Bookings'],
        summary: 'List bookings',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 100 } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'bookingType', in: 'query', schema: { type: 'string' } },
          { name: 'instructorId', in: 'query', schema: { type: 'string' } },
          { name: 'studentId', in: 'query', schema: { type: 'string' } },
          { name: 'from', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'to', in: 'query', schema: { type: 'string', format: 'date' } },
        ],
        responses: {
          200: response({ page: 1, limit: 100, bookings: [bookingExample] }),
          401: commonErrors[401],
        },
      },
      post: {
        tags: ['Bookings'],
        summary: 'Create a booking',
        description: 'Auth is optional. If no token is provided, guest booking fields are used.',
        requestBody: body({
          bookingType: 'learner',
          packageCode: 'single-1hr',
          lessonDate: '2026-06-20',
          lessonTime: '10:00:00',
          pickupSuburb: 'Adelaide',
          pickupAddress: '1 King William St, Adelaide SA',
          vehicleType: 'manual-car',
          instructorId: '3fa1793c-86e3-42a5-af47-95510c8f2d50',
          notes: 'Need help with roundabouts.',
        }),
        responses: {
          201: response({ booking: bookingExample }),
          400: commonErrors[400],
          403: errorResponse(403, 'Guest bookings are disabled'),
          404: errorResponse(404, 'Package not found'),
          409: errorResponse(409, 'That time slot is already booked'),
        },
      },
    },
    '/api/bookings/{id}': {
      get: {
        tags: ['Bookings'],
        summary: 'Get a booking by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'booking-1' }],
        responses: {
          200: response({ booking: bookingExample }),
          401: commonErrors[401],
          403: errorResponse(403, 'You do not have access to this booking'),
          404: commonErrors[404],
        },
      },
      patch: {
        tags: ['Bookings'],
        summary: 'Update a booking',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'booking-1' }],
        requestBody: body({
          status: 'confirmed',
          paymentStatus: 'paid',
          lessonDate: '2026-06-21',
          lessonTime: '11:00:00',
          notes: 'Updated notes',
          instructorId: '3fa1793c-86e3-42a5-af47-95510c8f2d50',
          vehicleType: 'manual-car',
          vehicleCategory: 'manual-car',
        }),
        responses: {
          200: response({ booking: bookingExample }),
          400: commonErrors[400],
          401: commonErrors[401],
          403: commonErrors[403],
          404: commonErrors[404],
        },
      },
    },
    '/api/bookings/{id}/confirm': {
      post: {
        tags: ['Bookings'],
        summary: 'Confirm a booking',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'booking-1' }],
        responses: {
          200: response({ booking: { ...bookingExample, status: 'confirmed', paymentStatus: 'paid' } }),
          401: commonErrors[401],
          403: commonErrors[403],
          404: commonErrors[404],
        },
      },
    },
    '/api/bookings/{id}/cancel': {
      post: {
        tags: ['Bookings'],
        summary: 'Cancel a booking',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'booking-1' }],
        responses: {
          200: response({ booking: { ...bookingExample, status: 'cancelled' } }),
          401: commonErrors[401],
          403: errorResponse(403, 'You do not have access to cancel this booking'),
          404: commonErrors[404],
        },
      },
    },
    '/api/contact': {
      post: {
        tags: ['Contact'],
        summary: 'Submit a contact request',
        requestBody: body({
          name: 'Alex Learner',
          email: 'alex@example.com',
          phone: '0400111222',
          message: 'I would like to ask about lesson availability.',
        }),
        responses: {
          201: response({ contactRequest: contactRequestExample }),
          400: commonErrors[400],
        },
      },
      get: {
        tags: ['Contact'],
        summary: 'List contact requests',
        security: [{ bearerAuth: [] }],
        responses: {
          200: response({ contactRequests: [contactRequestExample] }),
          401: commonErrors[401],
          403: commonErrors[403],
        },
      },
    },
    '/api/contact/{id}': {
      patch: {
        tags: ['Contact'],
        summary: 'Update a contact request status',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'contact-1' }],
        requestBody: body({ status: 'replied' }),
        responses: {
          200: response({ contactRequest: { ...contactRequestExample, status: 'replied' } }),
          400: commonErrors[400],
          401: commonErrors[401],
          403: commonErrors[403],
          404: commonErrors[404],
        },
      },
    },
    '/api/dashboard/learner': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get the learner dashboard',
        security: [{ bearerAuth: [] }],
        responses: {
          200: response(dashboardLearnerExample),
          401: commonErrors[401],
          403: commonErrors[403],
        },
      },
    },
    '/api/dashboard/learner/progress': {
      patch: {
        tags: ['Dashboard'],
        summary: 'Update learner progress',
        security: [{ bearerAuth: [] }],
        requestBody: body({
          skillName: 'Reverse parking',
          vehicleType: 'manual-car',
          status: 'in_progress',
          percentComplete: 50,
          notes: 'Need more practice',
          logbookHoursDelta: 2,
          progressPercent: 25,
        }),
        responses: {
          200: response({ skills: [] }),
          400: commonErrors[400],
          401: commonErrors[401],
          403: commonErrors[403],
        },
      },
    },
    '/api/dashboard/instructor': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get the instructor dashboard',
        security: [{ bearerAuth: [] }],
        responses: {
          200: response(dashboardInstructorExample),
          401: commonErrors[401],
          403: commonErrors[403],
        },
      },
    },
    '/api/dashboard/instructor/lessons/{id}/complete': {
      post: {
        tags: ['Dashboard'],
        summary: 'Mark a lesson complete',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'booking-1' }],
        requestBody: body({
          notes: 'Good progress today.',
          logbookHoursAdded: 1,
          progressPercentChange: 10,
        }),
        responses: {
          200: response({ booking: { ...bookingExample, status: 'completed', paymentStatus: 'paid' } }),
          400: commonErrors[400],
          401: commonErrors[401],
          403: commonErrors[403],
          404: commonErrors[404],
        },
      },
    },
    '/api/availability': {
      get: {
        tags: ['Availability'],
        summary: 'Get available lesson times for a date',
        parameters: [
          { name: 'date', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'instructorId', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: response(availabilityExample),
        },
      },
    },
    '/api/content': {
      get: {
        tags: ['Content'],
        summary: 'List content pages',
        responses: {
          200: response({ contentPages: [contentExample] }),
        },
      },
      post: {
        tags: ['Content'],
        summary: 'Create a content page',
        security: [{ bearerAuth: [] }],
        requestBody: body({
          slug: 'faq',
          title: 'Frequently Asked Questions',
          content: '<p>FAQ content</p>',
          seoTitle: 'Frequently Asked Questions',
          seoDescription: 'Frequently Asked Questions for SANOS Driving School',
          isPublished: true,
        }),
        responses: {
          201: response({ contentPage: contentExample }),
          400: commonErrors[400],
          401: commonErrors[401],
          403: commonErrors[403],
        },
      },
    },
    '/api/content/{slug}': {
      get: {
        tags: ['Content'],
        summary: 'Get a content page by slug',
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' }, example: 'pricing' }],
        responses: {
          200: response({ contentPage: contentExample }),
          404: commonErrors[404],
        },
      },
    },
    '/api/content/{id}': {
      patch: {
        tags: ['Content'],
        summary: 'Update a content page',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'content-1' }],
        requestBody: body({
          title: 'Driving Lessons & Pricing',
          content: '<p>Updated content</p>',
          isPublished: true,
        }),
        responses: {
          200: response({ contentPage: contentExample }),
          400: commonErrors[400],
          401: commonErrors[401],
          403: commonErrors[403],
          404: commonErrors[404],
        },
      },
    },
    '/api/users/me': {
      get: {
        tags: ['Users'],
        summary: 'Get the current user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: response({ user: userExample }),
          401: commonErrors[401],
        },
      },
      patch: {
        tags: ['Users'],
        summary: 'Update the current user profile',
        security: [{ bearerAuth: [] }],
        requestBody: body({
          fullName: 'Learner One',
          phone: '0400000000',
          serviceAreas: ['Adelaide', 'Glenelg'],
          bio: 'Ready to learn',
        }),
        responses: {
          200: response({ user: { ...userExample, serviceAreas: ['Adelaide', 'Glenelg'] } }),
          400: commonErrors[400],
          401: commonErrors[401],
        },
      },
    },
    '/api/users': {
      get: {
        tags: ['Users'],
        summary: 'List users',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'role', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'vehicleType', in: 'query', schema: { type: 'string' } },
          { name: 'suburb', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
        ],
        responses: {
          200: response({ page: 1, limit: 50, users: [userExample] }),
          401: commonErrors[401],
          403: commonErrors[403],
        },
      },
    },
    '/api/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get a user by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: '6f4e5f64-9d5b-4241-adf4-a48ec7d59516' }],
        responses: {
          200: response({ user: userExample }),
          401: commonErrors[401],
          403: commonErrors[403],
          404: commonErrors[404],
        },
      },
      patch: {
        tags: ['Users'],
        summary: 'Admin update a user',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: '6f4e5f64-9d5b-4241-adf4-a48ec7d59516' }],
        requestBody: body({
          status: 'active',
          documentationStatus: 'verified',
          progressPercent: 25,
        }),
        responses: {
          200: response({ user: userExample }),
          400: commonErrors[400],
          401: commonErrors[401],
          403: commonErrors[403],
          404: commonErrors[404],
        },
      },
    },
    '/api/vehicle-types': {
      get: {
        tags: ['Vehicle Types'],
        summary: 'List active vehicle types',
        responses: {
          200: response({ vehicleTypes: [vehicleTypeExample] }),
        },
      },
      post: {
        tags: ['Vehicle Types'],
        summary: 'Create a vehicle type',
        security: [{ bearerAuth: [] }],
        requestBody: body({
          code: 'manual-car',
          name: 'Manual Car',
          description: 'Manual transmission lessons',
          requiresDocumentVerification: false,
          isActive: true,
        }),
        responses: {
          201: response({ vehicleType: vehicleTypeExample }),
          400: commonErrors[400],
          401: commonErrors[401],
          403: commonErrors[403],
        },
      },
    },
    '/api/vehicle-types/{id}': {
      patch: {
        tags: ['Vehicle Types'],
        summary: 'Update a vehicle type',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'vehicle-1' }],
        requestBody: body({
          name: 'Manual Car',
          description: 'Updated description',
          isActive: true,
        }),
        responses: {
          200: response({ vehicleType: vehicleTypeExample }),
          400: commonErrors[400],
          401: commonErrors[401],
          403: commonErrors[403],
          404: commonErrors[404],
        },
      },
    },
    '/api/instructors/nearby': {
      get: {
        tags: ['Instructors'],
        summary: 'Find nearby instructors',
        parameters: [
          { name: 'latitude', in: 'query', required: true, schema: { type: 'number' }, example: -34.9285 },
          { name: 'longitude', in: 'query', required: true, schema: { type: 'number' }, example: 138.6007 },
          { name: 'vehicleType', in: 'query', schema: { type: 'string' }, example: 'manual-car' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 5 } },
          { name: 'date', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'time', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: response(nearbyResponseExample),
        },
      },
    },
    '/api/training-requests': {
      get: {
        tags: ['Training Requests'],
        summary: 'List training requests',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'status', in: 'query', schema: { type: 'string' } }],
        responses: {
          200: response({ trainingRequests: [trainingRequestExample] }),
          401: commonErrors[401],
        },
      },
      post: {
        tags: ['Training Requests'],
        summary: 'Create a training request',
        security: [{ bearerAuth: [] }],
        requestBody: body({
          instructorId: '3fa1793c-86e3-42a5-af47-95510c8f2d50',
          vehicleType: 'manual-car',
          packageId: null,
          preferredDate: '2026-06-22',
          preferredTime: '10:30:00',
          pickupAddress: '1 King William St, Adelaide SA',
          pickupSuburb: 'Adelaide',
          message: 'Please start next week',
        }),
        responses: {
          201: response({ trainingRequest: trainingRequestExample }),
          400: commonErrors[400],
          401: commonErrors[401],
          403: commonErrors[403],
        },
      },
    },
    '/api/training-requests/{id}': {
      get: {
        tags: ['Training Requests'],
        summary: 'Get a training request by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'train-1' }],
        responses: {
          200: response({ trainingRequest: trainingRequestExample }),
          401: commonErrors[401],
          403: commonErrors[403],
          404: commonErrors[404],
        },
      },
    },
    '/api/training-requests/{id}/accept': {
      post: {
        tags: ['Training Requests'],
        summary: 'Accept a training request',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'train-1' }],
        responses: {
          200: response({ trainingRequest: { ...trainingRequestExample, status: 'accepted' }, assignment: assignmentExample }),
          400: commonErrors[400],
          401: commonErrors[401],
          403: commonErrors[403],
          404: commonErrors[404],
        },
      },
    },
    '/api/training-requests/{id}/reject': {
      post: {
        tags: ['Training Requests'],
        summary: 'Reject a training request',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'train-1' }],
        requestBody: body({ responseMessage: 'Not available at this time.' }),
        responses: {
          200: response({ trainingRequest: { ...trainingRequestExample, status: 'rejected' } }),
          400: commonErrors[400],
          401: commonErrors[401],
          403: commonErrors[403],
          404: commonErrors[404],
        },
      },
    },
    '/api/training-requests/{id}/more-info': {
      post: {
        tags: ['Training Requests'],
        summary: 'Request more information for a training request',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'train-1' }],
        requestBody: body({ responseMessage: 'Please share preferred weekdays.' }),
        responses: {
          200: response({ trainingRequest: { ...trainingRequestExample, status: 'more_info_required' } }),
          400: commonErrors[400],
          401: commonErrors[401],
          403: commonErrors[403],
          404: commonErrors[404],
        },
      },
    },
    '/api/assignments/me': {
      get: {
        tags: ['Assignments'],
        summary: 'Get assignments for the current user',
        security: [{ bearerAuth: [] }],
        responses: {
          200: response({ activeAssignment: assignmentExample, assignments: [assignmentExample] }),
          401: commonErrors[401],
        },
      },
    },
    '/api/assignments/{id}/transfer-request': {
      post: {
        tags: ['Assignments'],
        summary: 'Create a transfer request for an assignment',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'assign-1' }],
        requestBody: body({
          toInstructorId: '46cded35-f13e-41cd-bc5e-5c2a197e1768',
          reason: 'Need another schedule',
          packageBalanceTransferred: 100,
        }),
        responses: {
          201: response({ transferRequest: transferRequestExample }),
          400: commonErrors[400],
          401: commonErrors[401],
          403: commonErrors[403],
          404: commonErrors[404],
        },
      },
    },
    '/api/assignments/transfer-requests': {
      get: {
        tags: ['Assignments'],
        summary: 'List transfer requests related to the current user',
        security: [{ bearerAuth: [] }],
        responses: {
          200: response({ transferRequests: [transferRequestExample] }),
          401: commonErrors[401],
        },
      },
    },
    '/api/transfer-requests': {
      get: {
        tags: ['Transfer Requests'],
        summary: 'List transfer requests',
        security: [{ bearerAuth: [] }],
        responses: {
          200: response({ transferRequests: [transferRequestExample] }),
          401: commonErrors[401],
        },
      },
    },
    '/api/transfer-requests/{id}': {
      get: {
        tags: ['Transfer Requests'],
        summary: 'Get a transfer request by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'transfer-1' }],
        responses: {
          200: response({ transferRequest: transferRequestExample }),
          401: commonErrors[401],
          403: commonErrors[403],
          404: commonErrors[404],
        },
      },
    },
    '/api/transfer-requests/{id}/approve': {
      post: {
        tags: ['Transfer Requests'],
        summary: 'Approve a transfer request',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'transfer-1' }],
        requestBody: body({ reason: 'Approved' }),
        responses: {
          200: response({ transferRequest: { ...transferRequestExample, status: 'approved' }, assignment: assignmentExample }),
          400: commonErrors[400],
          401: commonErrors[401],
          403: commonErrors[403],
          404: commonErrors[404],
        },
      },
    },
    '/api/transfer-requests/{id}/reject': {
      post: {
        tags: ['Transfer Requests'],
        summary: 'Reject a transfer request',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'transfer-1' }],
        requestBody: body({ reason: 'No schedule availability' }),
        responses: {
          200: response({ transferRequest: { ...transferRequestExample, status: 'rejected' } }),
          400: commonErrors[400],
          401: commonErrors[401],
          403: commonErrors[403],
          404: commonErrors[404],
        },
      },
    },
    '/api/transfer-requests/{id}/complete': {
      post: {
        tags: ['Transfer Requests'],
        summary: 'Complete a transfer request',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'transfer-1' }],
        responses: {
          200: response({ transferRequest: { ...transferRequestExample, status: 'completed' }, newAssignmentId: 'assign-2' }),
          401: commonErrors[401],
          403: commonErrors[403],
          404: commonErrors[404],
        },
      },
    },
    '/api/learner-documents': {
      post: {
        tags: ['Learner Documents'],
        summary: 'Create a learner document',
        security: [{ bearerAuth: [] }],
        requestBody: body({
          documentType: 'identity',
          fileUrl: 'https://example.com/uploads/id-card.png',
          status: 'pending',
        }),
        responses: {
          201: response({ learnerDocument: learnerDocumentExample }),
          400: commonErrors[400],
          401: commonErrors[401],
          403: commonErrors[403],
        },
      },
    },
    '/api/learner-documents/me': {
      get: {
        tags: ['Learner Documents'],
        summary: 'List learner documents for the authenticated learner',
        security: [{ bearerAuth: [] }],
        responses: {
          200: response({ learnerDocuments: [learnerDocumentExample] }),
          401: commonErrors[401],
          403: commonErrors[403],
        },
      },
    },
    '/api/learner-documents/{id}/status': {
      patch: {
        tags: ['Learner Documents'],
        summary: 'Update learner document verification status',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'doc-1' }],
        requestBody: body({
          status: 'verified',
          rejectionReason: null,
        }),
        responses: {
          200: response({ learnerDocument: { ...learnerDocumentExample, status: 'verified', verifiedBy: '3fa1793c-86e3-42a5-af47-95510c8f2d50' } }),
          400: commonErrors[400],
          401: commonErrors[401],
          403: commonErrors[403],
          404: commonErrors[404],
        },
      },
    },
    '/api/matching/nearby': {
      get: {
        tags: ['Matching'],
        summary: 'Find nearby instructors using the matching service',
        parameters: [
          { name: 'latitude', in: 'query', required: true, schema: { type: 'number' }, example: -34.9285 },
          { name: 'longitude', in: 'query', required: true, schema: { type: 'number' }, example: 138.6007 },
          { name: 'vehicleType', in: 'query', schema: { type: 'string' }, example: 'manual-car' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 5 } },
          { name: 'date', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'time', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: response(nearbyResponseExample),
        },
      },
    },
    '/api/matching/route-distance': {
      post: {
        tags: ['Matching'],
        summary: 'Calculate route distance to an instructor base',
        parameters: [
          { name: 'latitude', in: 'query', required: true, schema: { type: 'number' }, example: -34.9285 },
          { name: 'longitude', in: 'query', required: true, schema: { type: 'number' }, example: 138.6007 },
          { name: 'instructorId', in: 'query', required: true, schema: { type: 'string' }, example: '3fa1793c-86e3-42a5-af47-95510c8f2d50' },
        ],
        responses: {
          200: response(routeDistanceExample),
        },
      },
    },
  },
  responses: {
    BadRequest: commonErrors[400],
    Unauthorized: commonErrors[401],
    Forbidden: commonErrors[403],
    NotFound: commonErrors[404],
    Conflict: commonErrors[409],
    ServerError: commonErrors[500],
  },
};

export default openApiSpec;
