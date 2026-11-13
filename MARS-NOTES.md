# UH Academic Portal prototype notes

This update adds a UH Academic Portal-branded, responsive role-aware portal shell and demonstration views for dashboard, teachers, students, modules, notices, attendance, exam schedule, exam grades, marks, messages and profile.

## Demo sign-ins
- Administrator: `admin` / `mars2026`
- Teacher/module tutor: `tutor` / `marks2026`
- Student: `student` / `mars2026`
- Original exams officer account: `officer` / `exams2026`

## Important prototype limitations
- The sign-in is simulated in browser JavaScript and is not secure authentication.
- The new teacher, module, notice, attendance and exam views use illustrative front-end data. They are not connected to persistent database tables yet.
- The existing SQLite-backed student and marks management pages and APIs are retained.
- The UH monogram in the sidebar is a temporary text placeholder, not the official University of Hertfordshire logo. Obtain the approved logo file and permission/brand guidance from the University's Brand Toolkit before using the official mark in a published project.

## Run
Use Node.js 22.13 or newer:

```sh
npm install
npm start
```

Open `http://localhost:3000`.
