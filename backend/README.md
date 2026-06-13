# SANOS Driving School Backend Specification

This document describes the backend that should be built for the SANOS Driving School frontend.

The current frontend is a React/Vite marketing site plus several mock flows for booking, auth, learner dashboards, and instructor dashboards. There is no real backend wired up yet, so this README defines the backend that the frontend should eventually connect to.

## 1. Project Goal

Build a production-ready backend for a driving school website that supports:

- public marketing content
- lesson/package booking
- contact form submissions
- user authentication and role-based access
- learner dashboard data
- instructor dashboard data
- vehicle-specific instructor matching for learners
- shortest-path based nearby instructor filtering
- learner documentation intake and verification
- instructor request, acceptance, and assignment workflow
- progress continuity when a learner changes instructors mid-course
- resource and informational pages
- optional admin management for content and bookings

The site is for **SANOS Driving School** in **Adelaide, South Australia**.

## 2. Frontend Summary

The frontend is a single-page application built with:

- React 19
- React Router
- Vite
- Lucide icons

It uses static pages, mock forms, and placeholder dashboards. Important frontend routes already exist and should be supported by the backend in a way that matches the UI.

### Main frontend routes

- `/` Home
- `/pricing`
- `/packages`
- `/overseas`
- `/hub`
- `/resources`
- `/contact`
- `/book`
- `/login`
- `/signup`
- `/learner-dashboard`
- `/instructor-dashboard`

### Placeholder routes already referenced in the UI

- `/areas`
- `/countries`
- `/faq`
- `/testimonials`
- `/about`
- `/quote`

These can be implemented later, but the backend should be designed so they can be added without breaking the API.

## 3. Business Domain

SANOS Driving School offers:

- learner driver lessons
- overseas licence conversion help
- lesson packages
- test-day packages
- instructor-led training
- vehicle-specific learning requests, such as manual, automatic, test vehicle, overseas conversion, or other supported special vehicle categories
- nearest suitable instructor matching based on pickup location, route distance, availability, service area, and vehicle expertise
- learner progress tracking
- progress handover if the learner changes instructors before completing training
- instructor schedule management

### Service area

- Adelaide and surrounding suburbs
- South Australia

### Contact details used in the frontend

- Phone: `0414 475 393` in the header CTA
- General phone: `1300 000 000` in the footer/contact page
- Email: `info@sanosdriving.com.au`

The backend should let these values be managed from configuration or admin settings rather than hardcoding them everywhere.

## 4. Frontend Behavior the Backend Must Support

### 4.1 Booking flow

The booking page is currently a multi-step mock wizard:

1. Choose lesson type
2. Choose package
3. Pick date and time
4. Review payment
5. Booking confirmation

The backend should support:

- available lesson/package types
- available time slots
- booking creation
- booking status updates
- payment intent or placeholder payment handling
- booking confirmation email

### Booking types shown in the frontend

- `learner`
- `overseas`
- `test`

### Booking packages shown in the frontend

- `single`
- `bulk10`
- `complete`
- `testday`
- `learner1test`
- `overseas`

The frontend currently shows fixed prices, but the backend should be able to store and manage pricing centrally.

### 4.2 Auth flow

The auth page is currently a mock login/register screen.

The backend should support:

- register as learner
- register as instructor
- login
- password reset request
- role-based session/JWT auth
- dashboard access based on role

### 4.3 Learner dashboard

The learner dashboard currently displays:

- upcoming lesson
- progress percentage
- skill checklist
- instructor notes
- lesson history
- total hours logged

The backend should provide:

- upcoming bookings
- lesson history
- progress records
- instructor notes
- logbook hours
- completion status for driving milestones

### 4.4 Instructor dashboard

The instructor dashboard currently displays:

- today’s lessons
- quick stats
- student roster
- search over students

The backend should provide:

- instructor schedule
- student list
- student progress
- lesson completion actions
- instructor notes
- search/filter support

### 4.5 Contact form

The contact page includes a simple form with:

- full name
- email
- phone number
- message

The backend should store contact requests and optionally send an email notification.

### 4.6 Resources / informational content

The frontend contains pages for:

- driving lesson pricing
- learner packages
- overseas licence conversion
- licensing hub
- online resources

These are currently static, but the backend should support CMS-style content in case these pages become editable later.

### 4.7 Vehicle-specific learner request flow

When a learner comes to the site, they should be able to select the vehicle or training category they want to learn.

Examples include:

- standard learner car training
- manual transmission
- automatic transmission
- test-day vehicle support
- overseas licence conversion training
- any future special vehicle category supported by SANOS

The backend should support:

- storing the requested vehicle or training category
- matching only instructors who are approved for that vehicle or category
- filtering by learner location, pickup suburb, availability, package type, and instructor service area
- saving the selected vehicle type on bookings, lessons, progress records, and instructor assignments

### 4.8 Shortest-path nearby instructor matching

The app should not only show all instructors. It should filter and rank suitable instructors near the learner.

The backend should support a matching service that:

- accepts the learner pickup address, suburb, postcode, latitude, and longitude
- geocodes or stores instructor base locations and service areas
- filters instructors by active status, availability, vehicle category, service radius, and existing schedule conflicts
- calculates route distance or travel time using a shortest-path approach, such as Dijkstra or A* over a road network, or an external routing provider that returns road-route distance
- sorts instructors by shortest route distance or shortest estimated travel time, not only by straight-line distance
- returns the best nearby instructor options to the learner before the booking or request is submitted
- caches route distance results where possible to reduce repeated calculations

For a first version, the backend can use geolocation plus a routing API. If an internal map graph is used later, the shortest-path module should be kept separate from booking and user logic.

### 4.9 Learner documentation and detailed form flow

Before or during booking, learners should fill out a detailed intake form.

The backend should store:

- full name, email, phone, date of birth, and address
- pickup address and preferred pickup suburb
- licence or permit type
- current driving experience and logbook hours
- preferred vehicle or training category
- preferred lesson times and availability
- emergency contact, if required
- uploaded documents, if required, such as licence, learner permit, ID, or overseas licence documents
- document verification status
- notes about special requirements

The documentation flow should support pending, submitted, verified, rejected, and needs-update statuses.

### 4.10 Instructor request, acceptance, and learner handover flow

The instructor portal should allow instructors to see learner requests that match their vehicle category, location, and availability.

The backend should support:

- learners sending a request or demand to a specific matched instructor
- instructors viewing incoming requests in their portal
- instructors accepting, rejecting, or asking for more information
- accepted requests becoming active learner-instructor assignments
- automatic creation of the first lesson or booking after acceptance, if payment and scheduling are complete
- learner and instructor notifications when a request is accepted, rejected, or updated

If a learner starts with Instructor A and leaves in the middle, the app should not lose the learner's history. The backend should support transferring the learner to Instructor B while preserving:

- completed lessons
- total hours logged
- skill progress
- previous instructor notes, subject to privacy rules
- pending bookings
- payment and package balance
- documents and verification status

The new instructor should be able to continue from the learner's existing progress instead of starting from zero. Every transfer should create an audit record showing the previous instructor, new instructor, reason, date, and transferred progress summary.

## 5. Recommended Backend Stack

You can implement the backend in any stack, but the cleanest fit is:

- Node.js
- Express or Fastify
- PostgreSQL
- Prisma or Sequelize
- JWT auth
- Nodemailer or a transactional email provider
- Zod or Joi validation
- geocoding/routing provider or an internal shortest-path service for nearby instructor matching

If you prefer Python, a Django REST or FastAPI implementation would also work, but the API contract below should stay the same.

## 6. Core Data Models

## 6.1 User

Represents both learners and instructors.

Suggested fields:

- `id`
- `fullName`
- `email`
- `phone`
- `passwordHash`
- `role` (`learner` | `instructor` | `admin`)
- `status` (`active` | `pending` | `disabled`)
- `createdAt`
- `updatedAt`

### Learner-specific fields

- `dateOfBirth`
- `address`
- `suburb`
- `postcode`
- `licenseType`
- `preferredVehicleType`
- `transmissionPreference`
- `pickupAddress`
- `pickupSuburb`
- `pickupLatitude`
- `pickupLongitude`
- `documentationStatus`
- `logbookHours`
- `progressPercent`

### Instructor-specific fields

- `licenseNumber`
- `serviceAreas`
- `vehicleTypesSupported`
- `baseAddress`
- `baseLatitude`
- `baseLongitude`
- `serviceRadiusKm`
- `maxTravelDistanceKm`
- `bio`
- `availability`

## 6.2 Lesson Package

Suggested fields:

- `id`
- `code`
- `name`
- `description`
- `price`
- `durationMinutes`
- `isActive`
- `category`

Examples:

- `single-1hr`
- `single-1_5hr`
- `single-2hr`
- `bulk-10`
- `bulk-20`
- `test-day`
- `complete-learner`
- `learner-plus-1-test`
- `overseas-conversion`

## 6.3 Booking

Suggested fields:

- `id`
- `bookingNumber`
- `userId`
- `bookingType`
- `vehicleType`
- `packageId`
- `lessonDate`
- `lessonTime`
- `status`
- `paymentStatus`
- `price`
- `notes`
- `pickupSuburb`
- `pickupAddress`
- `instructorId`
- `createdAt`
- `updatedAt`

### Booking statuses

- `draft`
- `pending`
- `confirmed`
- `completed`
- `cancelled`
- `rescheduled`

## 6.4 Contact Request

Suggested fields:

- `id`
- `name`
- `email`
- `phone`
- `message`
- `status`
- `createdAt`

### Status values

- `new`
- `in_progress`
- `replied`
- `closed`

## 6.5 Lesson / Session

Suggested fields:

- `id`
- `bookingId`
- `studentId`
- `instructorId`
- `date`
- `startTime`
- `endTime`
- `location`
- `lessonType`
- `vehicleType`
- `status`
- `notes`

## 6.6 Student Progress

Suggested fields:

- `id`
- `studentId`
- `skillName`
- `vehicleType`
- `status`
- `percentComplete`
- `lastUpdatedBy`
- `notes`

Examples from the frontend:

- Basic Car Control
- Steering & Turning
- Parallel Parking
- Highway Driving

## 6.7 Instructor Note

Suggested fields:

- `id`
- `studentId`
- `instructorId`
- `note`
- `createdAt`

## 6.8 Content Page

Useful if you want the backend to manage static content later.

Suggested fields:

- `id`
- `slug`
- `title`
- `content`
- `seoTitle`
- `seoDescription`
- `isPublished`

## 6.9 Vehicle Type / Training Category

Represents the type of vehicle or training category the learner wants and the instructor can teach.

Suggested fields:

- `id`
- `code`
- `name`
- `description`
- `requiresDocumentVerification`
- `isActive`

Examples:

- `standard-car`
- `manual-car`
- `automatic-car`
- `test-vehicle`
- `overseas-conversion`

## 6.10 Learner Documentation

Stores detailed learner intake information and uploaded documents.

Suggested fields:

- `id`
- `studentId`
- `documentType`
- `fileUrl`
- `status` (`pending` | `submitted` | `verified` | `rejected` | `needs_update`)
- `verifiedBy`
- `rejectionReason`
- `createdAt`
- `updatedAt`

## 6.11 Instructor Match / Route Result

Stores or returns nearby instructor ranking results. This can also be a computed response without permanent storage.

Suggested fields:

- `id`
- `studentId`
- `instructorId`
- `pickupLatitude`
- `pickupLongitude`
- `instructorLatitude`
- `instructorLongitude`
- `vehicleType`
- `routeDistanceKm`
- `estimatedTravelMinutes`
- `algorithm`
- `score`
- `createdAt`

## 6.12 Training Request

Represents a learner request or demand sent to an instructor.

Suggested fields:

- `id`
- `studentId`
- `instructorId`
- `vehicleType`
- `packageId`
- `preferredDate`
- `preferredTime`
- `pickupAddress`
- `message`
- `status` (`pending` | `accepted` | `rejected` | `more_info_required` | `cancelled`)
- `responseMessage`
- `respondedAt`
- `createdAt`
- `updatedAt`

## 6.13 Student Instructor Assignment

Represents the active relationship between a learner and an instructor.

Suggested fields:

- `id`
- `studentId`
- `instructorId`
- `vehicleType`
- `status` (`active` | `paused` | `completed` | `transferred` | `cancelled`)
- `startedAt`
- `endedAt`
- `sourceTrainingRequestId`

## 6.14 Instructor Transfer Request

Tracks the case where a learner leaves Instructor A in the middle and continues with Instructor B.

Suggested fields:

- `id`
- `studentId`
- `fromInstructorId`
- `toInstructorId`
- `currentAssignmentId`
- `newAssignmentId`
- `reason`
- `status` (`requested` | `approved` | `rejected` | `completed`)
- `progressSnapshot`
- `hoursTransferred`
- `packageBalanceTransferred`
- `requestedAt`
- `completedAt`

## 7. API Design

## 7.1 Auth

### `POST /api/auth/register`
Register a learner or instructor.

Request:

```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "secret123",
  "phone": "0400000000",
  "role": "learner",
  "preferredVehicleType": "manual-car",
  "pickupSuburb": "Adelaide"
}
```

### `POST /api/auth/login`
Login and receive access token plus user profile.

### `POST /api/auth/logout`
Invalidate session or token.

### `POST /api/auth/forgot-password`
Send password reset link.

### `POST /api/auth/reset-password`
Set a new password using a reset token.

### `GET /api/auth/me`
Return current authenticated user.

## 7.2 Users

### `GET /api/users/me`
Return profile for current user.

### `PATCH /api/users/me`
Update own profile.

### `GET /api/users`
Admin/instructor listing endpoint with search, role filter, vehicle type filter, location filter, and pagination.

### `GET /api/users/:id`
Fetch a specific learner or instructor profile.

### `PATCH /api/users/:id`
Update user profile or admin-controlled fields.

## 7.3 Packages

### `GET /api/packages`
Return all active packages and pricing.

### `GET /api/packages/:code`
Return package details.

### `POST /api/packages`
Admin create package.

### `PATCH /api/packages/:id`
Admin edit package.

### `DELETE /api/packages/:id`
Admin archive package.

## 7.4 Bookings

### `GET /api/bookings`
Return bookings for current user or admin scope.

Query support:

- `status`
- `bookingType`
- `from`
- `to`
- `instructorId`
- `studentId`
- `page`
- `limit`

### `POST /api/bookings`
Create a new booking.

Request should support:

- booking type
- vehicle or training category
- package code or package ID
- lesson date
- lesson time
- pickup details
- matched instructor ID, if the learner selected one
- user contact info if guest booking is allowed

### `GET /api/bookings/:id`
Get booking details.

### `PATCH /api/bookings/:id`
Update booking details, reschedule, or change status.

### `POST /api/bookings/:id/confirm`
Confirm booking after payment or manual review.

### `POST /api/bookings/:id/cancel`
Cancel booking.

## 7.5 Availability

### `GET /api/availability`
Return available dates and time slots.

Suggested query params:

- `date`
- `instructorId`
- `lessonType`
- `vehicleType`
- `duration`

This should drive the booking step that currently shows fixed time slots.

## 7.6 Contact

### `POST /api/contact`
Store contact form submission.

Request:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "0400000000",
  "message": "I would like to book a lesson."
}
```

### `GET /api/contact`
Admin list of contact submissions.

### `PATCH /api/contact/:id`
Update contact request status.

## 7.7 Dashboards

### `GET /api/dashboard/learner`
Return learner dashboard payload:

- upcoming lesson
- lesson history
- progress
- notes
- hours logged
- active instructor assignment
- documentation status
- transfer status, if the learner is changing instructors

### `GET /api/dashboard/instructor`
Return instructor dashboard payload:

- today’s schedule
- student roster
- incoming training requests
- accepted learner assignments
- transfer requests
- summary stats
- lesson counts

### `POST /api/dashboard/instructor/lessons/:id/complete`
Mark a lesson completed.

### `PATCH /api/dashboard/learner/progress`
Update learner skills and progress.

## 7.8 Content / CMS

If you want the backend to manage future informational pages:

- `GET /api/content/:slug`
- `GET /api/content`
- `POST /api/content`
- `PATCH /api/content/:id`

## 7.9 Vehicle Types

### `GET /api/vehicle-types`
Return all active vehicle or training categories.

### `POST /api/vehicle-types`
Admin create a vehicle or training category.

### `PATCH /api/vehicle-types/:id`
Admin update a vehicle or training category.

## 7.10 Nearby Instructor Matching

### `GET /api/instructors/nearby`
Return suitable instructors ranked by shortest route distance or shortest estimated travel time.

Suggested query params:

- `pickupAddress`
- `pickupSuburb`
- `postcode`
- `latitude`
- `longitude`
- `vehicleType`
- `lessonType`
- `date`
- `time`
- `duration`
- `limit`

The endpoint should return only instructors who are active, available, able to teach the requested vehicle type, and within the configured service area.

### `POST /api/matching/route-distance`
Optional internal endpoint or service method for calculating and caching route distance between learner pickup location and instructor location.

## 7.11 Training Requests

### `POST /api/training-requests`
Learner sends a request to a matched instructor.

### `GET /api/training-requests`
Return requests for the current learner, instructor, or admin scope.

### `GET /api/training-requests/:id`
Return request details.

### `POST /api/training-requests/:id/accept`
Instructor accepts the learner request and creates or activates the student-instructor assignment.

### `POST /api/training-requests/:id/reject`
Instructor rejects the request with an optional reason.

### `POST /api/training-requests/:id/more-info`
Instructor asks the learner for more information before accepting.

## 7.12 Learner Documentation

### `POST /api/learner-documents`
Upload or submit learner documentation.

### `GET /api/learner-documents/me`
Return current learner documentation and verification status.

### `PATCH /api/learner-documents/:id/status`
Admin or authorised instructor updates document verification status.

## 7.13 Instructor Assignments and Transfers

### `GET /api/assignments/me`
Return the learner's active instructor assignment or the instructor's assigned learners.

### `POST /api/assignments/:id/transfer-request`
Learner requests to leave the current instructor and continue with a different instructor.

### `GET /api/transfer-requests`
Return transfer requests for learner, instructor, or admin scope.

### `POST /api/transfer-requests/:id/approve`
Approve a transfer and create the new assignment while preserving progress.

### `POST /api/transfer-requests/:id/reject`
Reject a transfer request with a reason.

### `POST /api/transfer-requests/:id/complete`
Finalize the transfer and move progress, hours, documents, and remaining package balance to the new assignment.

## 8. Business Rules

## 8.1 Booking rules

- A booking must have a valid package or service type.
- A booking should not be double-booked for the same instructor and time.
- Lessons must respect instructor availability.
- Test-day and overseas packages should be distinguishable from standard lessons.
- Booking confirmation should create a record that appears in the learner and instructor dashboards.

## 8.2 Role rules

- Learners can view and manage their own bookings and progress only.
- Instructors can view assigned students and their own schedule only.
- Admins can manage all records.

## 8.3 Progress rules

- Progress should be measurable in percent and/or by milestones.
- Notes from instructors should be visible to the learner.
- Completed lessons can update total logbook hours.
- Progress must belong to the learner, not only to one instructor, so it can continue if the instructor changes.

## 8.4 Instructor matching rules

- Instructor search must filter by vehicle type or training category before ranking by distance.
- Instructors should only appear if they are active, available, and approved for the requested training category.
- Route distance or estimated travel time should be preferred over straight-line distance.
- The matching algorithm should avoid instructors who are already booked at the requested time.
- Matching results should include enough explanation for the frontend, such as distance, estimated travel time, supported vehicle types, and next available slot.

## 8.5 Learner documentation rules

- Learners must submit required documentation before a confirmed lesson if the selected vehicle category or licence type requires verification.
- Rejected documents should include a reason and allow re-upload.
- Instructors should only see documents needed for teaching or verification, not unnecessary private data.
- Admins should be able to review and verify documentation.

## 8.6 Training request and acceptance rules

- A learner can send a request to an instructor from the nearby matched list.
- An instructor must accept the request before becoming the active assigned instructor, unless an admin manually assigns the learner.
- A learner should not have multiple active instructors for the same vehicle category unless admin enables it.
- If an instructor rejects a request, the learner should be able to choose another matched instructor.
- Accepted requests should appear in both learner and instructor dashboards.

## 8.7 Instructor transfer rules

- A learner may request to leave Instructor A and continue with Instructor B.
- Transfer should preserve lesson history, progress percentage, skill checklist, logbook hours, documentation status, and remaining package balance.
- The previous assignment should be marked as transferred or ended, not deleted.
- The new instructor should receive a progress snapshot before continuing classes.
- Transfer actions should be audited for learner safety, payment tracking, and dispute handling.

## 9. Suggested Response Shapes

## 9.1 Auth response

```json
{
  "user": {
    "id": "u_123",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "learner"
  },
  "accessToken": "jwt-token-here"
}
```

## 9.2 Booking response

```json
{
  "id": "b_123",
  "bookingNumber": "SANOS-2026-0001",
  "bookingType": "learner",
  "packageCode": "complete",
  "lessonDate": "2026-06-12",
  "lessonTime": "14:00",
  "status": "confirmed",
  "price": 3500
}
```

## 9.3 Learner dashboard response

```json
{
  "upcomingLesson": {},
  "progressPercent": 45,
  "hoursLogged": 14,
  "skills": [],
  "lessonHistory": [],
  "instructorNotes": []
}
```

## 9.4 Nearby instructor response

```json
{
  "pickup": {
    "suburb": "Adelaide",
    "latitude": -34.9285,
    "longitude": 138.6007
  },
  "vehicleType": "manual-car",
  "matches": [
    {
      "instructorId": "u_456",
      "fullName": "Instructor A",
      "vehicleTypesSupported": ["manual-car", "automatic-car"],
      "routeDistanceKm": 4.2,
      "estimatedTravelMinutes": 11,
      "nextAvailableSlot": "2026-06-12T14:00:00+09:30",
      "score": 95
    }
  ]
}
```

## 9.5 Training request response

```json
{
  "id": "tr_123",
  "studentId": "u_123",
  "instructorId": "u_456",
  "vehicleType": "manual-car",
  "status": "pending",
  "message": "I want to start manual driving lessons from next week."
}
```

## 9.6 Transfer request response

```json
{
  "id": "tf_123",
  "studentId": "u_123",
  "fromInstructorId": "u_456",
  "toInstructorId": "u_789",
  "status": "requested",
  "hoursTransferred": 8,
  "progressSnapshot": {
    "progressPercent": 45,
    "completedSkills": ["Basic Car Control", "Steering & Turning"]
  }
}
```

## 10. Validation Requirements

Backend validation should enforce:

- required name, email, and password for registration
- valid email format
- strong password policy
- valid booking date and time
- valid package code
- valid vehicle or training category
- valid pickup address, suburb, postcode, latitude, and longitude when nearby matching is used
- valid instructor availability before request acceptance
- valid learner documentation status before lesson confirmation where required
- valid phone number format
- message length limits for contact form
- role checking for protected routes

## 11. Security Requirements

Implement:

- password hashing
- JWT or secure sessions
- authentication middleware
- role-based authorization
- input validation
- secure file upload validation for learner documents
- private document storage with signed URLs or equivalent access control
- rate limiting on auth and contact routes
- CORS configured for the frontend domain
- environment variable support for secrets

### Suggested environment variables

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `FRONTEND_URL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `EMAIL_FROM`
- `GEOCODING_API_KEY`
- `ROUTING_API_KEY`
- `DOCUMENT_STORAGE_BUCKET`

## 12. Email Notifications

Recommended email triggers:

- booking confirmation
- booking reschedule
- booking cancellation
- contact form received
- password reset
- learner documentation submitted
- documentation approved or rejected
- training request sent to instructor
- training request accepted, rejected, or marked as more information required
- learner transfer request created, approved, rejected, or completed

## 13. Admin Features To Plan For

Even if not built immediately, the backend should support:

- package management
- booking management
- contact request management
- user management
- content page management
- instructor assignment
- vehicle type and instructor qualification management
- learner document verification
- manual instructor matching override
- instructor transfer approval and audit history
- schedule overrides

## 14. Frontend Integration Notes

The current frontend uses static values and mock flows in several places. The backend should eventually replace those mocks:

- `src/pages/Booking.jsx` currently simulates a booking wizard
- `src/pages/Auth.jsx` currently routes directly to dashboards without real authentication
- `src/pages/Contact.jsx` currently prevents the form from submitting
- `src/pages/LearnerDashboard.jsx` and `src/pages/InstructorDashboard.jsx` currently show hardcoded data

When connecting the backend, these pages should fetch real data from API endpoints instead of relying on local state only.

New frontend flows should also be planned for:

- learner vehicle/category selection
- detailed learner documentation form
- nearby instructor results sorted by shortest route distance or travel time
- learner request/demand submission to an instructor
- instructor request inbox with accept/reject/more-info actions
- learner progress transfer when changing instructors

## 15. Important Content Observed in the Frontend

The backend should preserve these real-world business details where possible:

- SANOS Driving School branding
- Adelaide, South Australia location
- overseas licence conversion support
- VORT / CBT&A preparation
- learner packages including test vehicle support
- friendly/patient instructor positioning
- vehicle-specific instructor expertise
- nearest-instructor matching for Adelaide suburbs
- progress continuity even if the learner changes instructor

## 16. Suggested Implementation Order

1. Set up auth, users, and roles.
2. Add vehicle types, learner intake fields, and instructor vehicle qualifications.
3. Implement packages and bookings.
4. Add geocoding, service-area filtering, and shortest-path nearby instructor matching.
5. Add training request flow where learners send requests to instructors and instructors accept or reject them.
6. Add learner documentation upload, storage, and verification.
7. Add contact form storage and email notifications.
8. Add learner dashboard endpoints.
9. Add instructor dashboard endpoints, including request inbox and assigned learners.
10. Add transfer flow so learners can switch instructors without losing progress.
11. Add content management for static pages.
12. Add admin tools and analytics.

## 17. Notes for the AI That Will Build the Backend

If another AI is going to generate the backend, it should:

- treat this frontend as the source of truth for routes and UI behavior
- avoid changing the public wording unless the business owner asks for it
- keep booking and pricing data in the backend, not hardcoded in the frontend
- support role-based login from the beginning
- treat vehicle type, instructor location, and instructor availability as core matching data
- keep the shortest-path/routing logic in a separate service so it can be replaced later
- ensure learner progress belongs to the learner and can transfer between instructors
- make the API easy to consume from a React SPA
- keep the system flexible enough for future admin pages and content management

## 18. Local Run Guide

If you are using the backend scaffold in this folder:

1. Install dependencies:

```bash
npm install
```

2. Make sure PostgreSQL is running and the database named in `.env` exists.

3. Start the server:

```bash
npm run dev
```

### Implemented API groups in the scaffold

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/me`
- `GET /api/packages`
- `POST /api/bookings`
- `GET /api/bookings`
- `POST /api/contact`
- `GET /api/dashboard/learner`
- `GET /api/dashboard/instructor`
- `GET /api/availability`
- `GET /api/content`
- `GET /api/content/:slug`

### Additional API groups required for the new app logic

These are planned endpoints from the updated specification and may still need to be implemented in the scaffold:

- `GET /api/vehicle-types`
- `GET /api/instructors/nearby`
- `POST /api/training-requests`
- `GET /api/training-requests`
- `POST /api/training-requests/:id/accept`
- `POST /api/training-requests/:id/reject`
- `POST /api/learner-documents`
- `GET /api/learner-documents/me`
- `GET /api/assignments/me`
- `POST /api/assignments/:id/transfer-request`
- `GET /api/transfer-requests`

