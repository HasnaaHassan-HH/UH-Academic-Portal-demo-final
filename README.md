# University of Hertfordshire UH Academic Portal

A university academic portal prototype with role-specific student and staff dashboards, module information, teacher and student directories, notices, attendance, exam schedules, grades, and the original exam-office student and marks management tools.

**Live site:** `https://YOUR-DOMAIN-HERE` (replace after deployment)

## Demo accounts (sign-in is simulated)

| Role          | Username  | Password    | Can do                               |
|---------------|-----------|-------------|--------------------------------------|
| Exams officer | `officer` | `exams2026` | Manage students, enter and edit marks |
| Module tutor  | `tutor`   | `marks2026` | Staff portal and academic records |
| Administrator | `admin` | `mars2026` | Staff portal and management overview |
| Student | `student` | `mars2026` | Student dashboard, attendance, exams and grades |

## Run it on your own computer

Needs [Node.js](https://nodejs.org) 22.13 or newer (it includes SQLite).

```
npm install
npm start
```

Then open <http://localhost:3000>. The database file `data/exam-office.db` is
created and filled with fictional demo data the first time the server starts.
Delete that file to reset the data.

## How it is organised

```
server.js              Web server: serves /public and the JSON API under /api
src/
  db.js                Opens SQLite, creates tables, seeds demo data
  reference.js         Allowed values (programmes, modules, pass mark...)
  validators.js        Server-side validation of students and marks
  routes/students.js   /api/students  (list, read, create, update, delete)
  routes/marks.js      /api/marks     (list, read, create, update, delete)
public/
  index.html           Sign in
  dashboard.html       UH Academic Portal role-aware dashboard
  students.html        Student records table (search, filter, sort, paging)
  student-form.html    Add / edit a student
  marks.html           Marks table (search, filter, sort, paging)
  mark-form.html       Enter / edit a mark
  404.html             Page not found
  css/styles.css       Original accessible styles
  css/mars.css          MARS portal dashboard styles
  js/portal.js          Role-aware portal views and demo features
  js/api.js            fetch() wrapper
  js/common.js         Session, status messages, dialog, formatting helpers
  js/forms.js          Shared validation feedback (error summary, field errors)
  js/list.js           Shared table behaviour (filter, sort, paging, states)
  js/*.js              One small script per page
deploy/                Example Nginx and systemd files (see DEPLOY.md)
docs/                  Manual test checklist
```

The new MARS pages use fictional demonstration data for notices, attendance, teacher and module directories, and exam schedules. These screens are a front-end prototype; the existing SQLite-backed student and marks APIs remain available in the original records pages. The simulated sign-in is not suitable for production or real student records.

The new MARS pages use fictional demonstration data for notices, attendance, teacher and module directories, and exam schedules. These screens are a front-end prototype; the existing SQLite-backed student and marks APIs remain available in the original records pages. The simulated sign-in is not suitable for production or real student records.

No frameworks or libraries are used in the browser: plain HTML, CSS and
JavaScript modules. The server uses one package, `express`, plus the SQLite module built into Node.js.

## Data persistence

All records are stored in a SQLite database on the server. The browser only
keeps the simulated sign-in (in `sessionStorage`); every student and mark is
read from and written to the database through the API, so data survives a
refresh, closing the browser and restarting the server.

## Accessibility summary

- Semantic landmarks, one `h1` per page, real tables, labels on every field.
- Fully keyboard operable, with a skip link and a two-colour focus ring.
- Live regions (`role="status"`, `role="alert"`) announce saving, saved,
  loading, result counts and errors.
- Forms show an error summary that receives focus, plus a message on each field.
- Colour is never the only signal: badges, errors and sort order use text and icons.
- Reflows to 320 CSS px wide (400% zoom) with no horizontal scrolling;
  tables become cards on small screens.

See the accessibility statement and evaluation report (PDF) for the evidence.
