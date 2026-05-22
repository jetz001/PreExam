# API Documentation

Base URL: `/api`

## Authentication & Authorization

### Roles
- **Guest (Public)**: Can access public endpoints (e.g., Login, Register, News List).
- **User (`user`)**: Authenticated users with a valid JWT token. Can access own profile, friends, exams, and join rooms.
- **Admin (`admin`)**: Users with `role: 'admin'`. Have full access to manage content (News, Questions, Assets) and view system stats.

### Headers
- **Authorization**: `Bearer <token>` (Required for all protected routes)

---

## Authentication (`/api/auth`)

### Register
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Body**:
  - `email` (string, required)
  - `password` (string, required)
  - `display_name` (string, required)
- **Response**:
  - Success (201): `{ success: true, token: "...", user: { ... } }`
  - Error (400): `{ success: false, message: "Email already registered" }`

### Login
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Body**:
  - `email` (string, required)
  - `password` (string, required)
- **Response**:
  - Success (200): `{ success: true, token: "...", user: { ... } }`
  - Error (400): `{ success: false, message: "Invalid credentials" }`

### Google Login
- **URL**: `/api/auth/google`
- **Method**: `POST`
- **Body**:
  - `token` (string, required, Google ID Token)
- **Response**:
  - Success (200): `{ success: true, token: "...", user: { ... } }`

### Facebook Login
- **URL**: `/api/auth/facebook`
- **Method**: `POST`
- **Body**:
  - `accessToken` (string, required)
  - `userID` (string, required)
- **Response**:
  - Success (200): `{ success: true, token: "...", user: { ... } }`

### Guest Login
- **URL**: `/api/auth/guest`
- **Method**: `POST`
- **Body**:
  - `deviceId` (string, required)
- **Response**:
  - Success (200): `{ success: true, token: "...", user: { ... } }`

### Get Current User
- **URL**: `/api/auth/me`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ success: true, user: { ... } }`

---

## User (`/api/users`)

### Get Profile
- **URL**: `/api/users/profile`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: User object

### Update Profile
- **URL**: `/api/users/profile`
- **Method**: `POST` (Multipart for avatar)
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  - `display_name` (string)
  - `avatar` (file)
- **Response**: Updated user object

### Get Stats
- **URL**: `/api/users/stats`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ totalExams, averageScore, radarData }`

### Search Users
- **URL**: `/api/users/search` 
- **Method**: `GET`
- **Query Params**:
  - `q` (string, search term)
- **Response**: List of users

---

## News (`/api/news`)

### Get News
- **URL**: `/api/news`
- **Method**: `GET`
- **Access**: Public
- **Query Params**:
  - `category` (string, optional)
- **Response**: List of news items

### Get News Detail
- **URL**: `/api/news/:id`
- **Method**: `GET`
- **Access**: Public
- **Response**: News item detail (views incremented)

### Create News (Admin)
- **URL**: `/api/news`
- **Method**: `POST`
- **Access**: **Admin Only**
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  - `title` (string, required)
  - `content` (string, required)
  - `summary` (string)
  - `category` (string)
  - `image_url` (string)
  - `external_link` (string)
  - `keywords` (string)
- **Response**: Created news item

### Update News (Admin)
- **URL**: `/api/news/:id`
- **Method**: `PUT`
- **Access**: **Admin Only**
- **Headers**: `Authorization: Bearer <token>`
- **Body**: Same as Create News
- **Response**: Updated news item

### Delete News (Admin)
- **URL**: `/api/news/:id`
- **Method**: `DELETE`
- **Access**: **Admin Only**
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Success message

### Scrape Metadata
- **URL**: `/api/news/scrape`
- **Method**: `POST`
- **Access**: **Admin Only**
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  - `url` (string, required)
- **Response**: Scraped metadata `{ title, summary, image_url, keywords }`

---

## Questions (`/api/questions`)

### Get Questions
- **URL**: `/api/questions`
- **Method**: `GET`
- **Query Params**:
  - `category` (string)
  - `subject` (string)
  - `limit` (integer)
  - `orderBy` (string, e.g. 'id')
- **Response**: List of questions

### Get Subjects
- **URL**: `/api/questions/subjects`
- **Method**: `GET`
- **Response**: List of available subjects

### Get Categories
- **URL**: `/api/questions/categories`
- **Method**: `GET`
- **Response**: List of available categories

### Create Question (Admin)
- **URL**: `/api/questions`
- **Method**: `POST`
- **Access**: **Admin Only**
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  - `question_text` (string, required)
  - `choice_a`, `choice_b`, `choice_c`, `choice_d` (string, required)
  - `correct_answer` (string, 'A','B','C', or 'D')
  - `subject` (string)
  - `category` (string)
  - `explanation` (string)
- **Response**: Created question

---

## Community (`/api/community`)

### Get Threads
- **URL**: `/api/community/threads`
- **Method**: `GET`
- **Query Params**:
  - `cursor` (string, for pagination)
  - `limit` (integer)
  - `category` (string)
  - `search` (string)
  - `sort` (string, default 'newest')
- **Response**: List of threads with `nextCursor`

### Create Thread
- **URL**: `/api/community/threads`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body** (Multipart/Form-Data if image included):
  - `title` (string, required)
  - `content` (string)
  - `category` (string)
  - `tags` (JSON string array)
  - `poll` (JSON string, optional) `{ question: string, options: string[], expires_at: timestamp }`
  - `image` (file, optional)
- **Response**: Created thread

### Share News to Community
- **URL**: `/api/community/share-news`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  - `newsId` (integer, required)
  - `content` (string)
- **Response**: Created thread

### Like Thread
- **URL**: `/api/community/threads/:id/like`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ likes: count, liked: boolean }`

### Vote Poll
- **URL**: `/api/community/poll/vote`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  - `pollId` (integer)
  - `optionId` (integer)
- **Response**: Updated poll data

---

## Exams (`/api/exams`)

### Submit Exam
- **URL**: `/api/exams/submit`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  - `answers` (Object: `{ [questionId]: "A", ... }`)
  - `mode` (string)
  - `classroom_id` (integer, optional)
  - `total_time` (integer, score)
- **Response**: Exam Result object

### Get Exam History
- **URL**: `/api/exams/history`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: List of past exam results

### Get Exam Result
- **URL**: `/api/exams/:id`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Detailed exam result

---

## Friends (`/api/friends`)

### Send Friend Request
- **URL**: `/api/friends/request`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  - `friendId` (integer, required)
- **Response**: Success message

### Accept Friend Request
- **URL**: `/api/friends/accept`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  - `friendId` (integer, required, ID of the user who sent the request)
- **Response**: Success message

### Remove Friend / Cancel Request
- **URL**: `/api/friends/remove/:friendId`
- **Method**: `DELETE`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Success message

### Get Friend List
- **URL**: `/api/friends/list`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: List of friends (User objects)

### Get Pending Requests
- **URL**: `/api/friends/pending`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: List of users who sent requests

### Check Friend Status
- **URL**: `/api/friends/check/:userId`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ status: 'none' | 'friends' | 'sent' | 'received' }`

---

## Payments (`/api/payments`)

### Get PromptPay QR
- **URL**: `/api/payments/qr`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ success: true, qrCode: string, amount: number, bankDetails: object }`

### Upload Slip
- **URL**: `/api/payments/upload-slip`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  - `slip` (file, multipart/form-data)
- **Response**: Payment status

---

## Admin (`/api/admin`)

*All endpoints in this section require **Admin** Role.*

### Get Dashboard Stats
- **URL**: `/api/admin/stats`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Statistics object

### Get Users
- **URL**: `/api/admin/users`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: List of users

### Update User
- **URL**: `/api/admin/users/:id`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  - `role` (string)
  - `plan_type` (string)
- **Response**: Updated user

### Get Payment Slips
- **URL**: `/api/admin/payments`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: List of pending payments

### Approve Payment
- **URL**: `/api/admin/payments/:id/approve`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Success message

### Reject Payment
- **URL**: `/api/admin/payments/:id/reject`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Success message

### Get Messages
- **URL**: `/api/admin/messages`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: List of contact messages

---

## Reports (`/api/reports`)

### Create Report
- **URL**: `/api/reports/report` (Verify specific path in reportRoutes.js, assumed /)
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  - `question_id` (integer)
  - `reason` (string)
- **Response**: Report status

---

## Rooms (`/api/rooms`)

### Get Rooms
- **URL**: `/api/rooms`
- **Method**: `GET`
- **Query Params**:
  - `page` (integer)
  - `limit` (integer)
- **Response**: List of rooms with pagination

### Create Room
- **URL**: `/api/rooms`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  - `name` (string)
  - `mode` (string)
  - `subject` (string)
  - `category` (string)
  - `max_participants` (integer)
  - `question_count` (integer)
  - `time_limit` (integer)
  - `password` (string, optional)
  - `theme` (string, premium only)
- **Response**: Created room

### Join Room
- **URL**: `/api/rooms/join`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  - `code` (string)
  - `password` (string, optional)
- **Response**: Room data (if successful)

### Get Room Detail
- **URL**: `/api/rooms/:id`
- **Method**: `GET`
- **Response**: Room detail with participants

---

## Assets (`/api/assets`)

### Get Assets
- **URL**: `/api/assets`
- **Method**: `GET`
- **Query Params**:
  - `type` (string, e.g., 'background')
- **Response**: List of assets

### Create Asset (Admin)
- **URL**: `/api/assets`
- **Method**: `POST`
- **Access**: **Admin Only**
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  - `name` (string)
  - `type` (string)
  - `is_premium` (boolean)
  - `image` (file) or `url` (string)
- **Response**: Created asset

### Delete Asset (Admin)
- **URL**: `/api/assets/:id`
- **Method**: `DELETE`
- **Access**: **Admin Only**
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Success message
