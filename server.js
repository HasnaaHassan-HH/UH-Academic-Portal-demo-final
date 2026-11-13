'use strict';

/**
 * Exam Office Records - web server.
 *
 * Serves the static front end from /public and a small JSON API under /api.
 * All data is stored in a SQLite file (data/exam-office.db) so it survives
 * page refreshes and server restarts.
 *
 * Start with:  npm start
 */

const path = require('path');
const express = require('express');
const { openDatabase } = require('./src/db');
const ref = require('./src/reference');
const studentRoutes = require('./src/routes/students');
const markRoutes = require('./src/routes/marks');

const PORT = process.env.PORT || 3000;
// Vercel's file system is read-only except /tmp, so the database lives there
// when running on Vercel. (It resets on cold starts - fine for a demo.)
const IS_VERCEL = Boolean(process.env.VERCEL);
const DB_FILE = process.env.DB_FILE ||
  (IS_VERCEL ? '/tmp/exam-office.db' : path.join(__dirname, 'data', 'exam-office.db'));

const db = openDatabase(DB_FILE);
const app = express();

app.disable('x-powered-by');

// Security headers. The Content-Security-Policy only allows scripts and
// styles from our own files, which also enforces "no inline scripts/styles".
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'; frame-ancestors 'none'");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'same-origin');
  next();
});

app.use(express.json({ limit: '20kb' }));

/* ---------- API ---------- */

const api = express.Router();

// Records change often, so the browser must never show a cached copy.
api.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

// Lists used to fill drop-downs, so options are defined once on the server.
api.get('/reference', (req, res) => {
  const assessments = db.prepare('SELECT id, module_code, title FROM assessments ORDER BY id').all();
  const modules = db.prepare('SELECT code, title FROM modules ORDER BY code').all()
    .map((module) => ({
      ...module,
      assessments: assessments.filter((item) => item.module_code === module.code)
    }));

  res.json({
    programmes: ref.PROGRAMMES,
    accessArrangements: ref.ACCESS_ARRANGEMENTS,
    absenceReasons: ref.ABSENCE_REASONS,
    passMark: ref.PASS_MARK,
    maxLateDays: ref.MAX_LATE_DAYS,
    modules
  });
});

// Figures for the dashboard.
api.get('/summary', (req, res) => {
  const students = db.prepare(`
    SELECT COUNT(*) AS total, COALESCE(SUM(status = 'active'), 0) AS active FROM students
  `).get();

  const marks = db.prepare(`
    SELECT COUNT(*) AS total,
           COALESCE(SUM(outcome = 'absent'), 0) AS absent,
           COALESCE(SUM(outcome = 'submitted' AND final_mark < @pass), 0) AS fails,
           ROUND(AVG(final_mark), 1) AS average
    FROM marks
  `).get({ pass: ref.PASS_MARK });

  const modules = db.prepare(`
    SELECT mo.code, mo.title, COUNT(m.id) AS recorded, ROUND(AVG(m.final_mark), 1) AS average
    FROM modules mo
    LEFT JOIN assessments a ON a.module_code = mo.code
    LEFT JOIN marks m ON m.assessment_id = a.id
    GROUP BY mo.code ORDER BY mo.code
  `).all();

  const recent = db.prepare(`
    SELECT m.id, m.outcome, m.final_mark, m.updated_at, s.first_name, s.last_name,
           s.student_no, a.module_code, a.title AS assessment_title
    FROM marks m
    JOIN students s ON s.id = m.student_id
    JOIN assessments a ON a.id = m.assessment_id
    ORDER BY m.updated_at DESC, m.id DESC LIMIT 5
  `).all();

  res.json({ students, marks, modules, recent });
});

api.use('/students', studentRoutes(db));
api.use('/marks', markRoutes(db));

// Any other /api address is a mistake: answer in JSON, not an HTML page.
api.use((req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

app.use('/api', api);

/* ---------- Front end ---------- */

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Last-resort error handler so a bug never leaks a stack trace to the user.
// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'The request was not valid JSON.' });
  }
  console.error(error);
  return res.status(500).json({ error: 'The server had a problem. Please try again.' });
});

// Vercel runs the exported app itself; only listen when started with `npm start`.
if (!IS_VERCEL) {
  app.listen(PORT, () => {
    console.log(`Exam Office Records is running on http://localhost:${PORT}`);
  });
}

module.exports = app;
