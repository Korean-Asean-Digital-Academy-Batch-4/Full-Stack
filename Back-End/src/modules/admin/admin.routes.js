const { Router } = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const upload = require('../../middleware/upload');
const { requireRole } = require('../../middleware/roleGuard');

const periods = require('./academicPeriods.controller');
const accounts = require('./accounts.controller');
const templates = require('./templates.controller');
const subjects = require('./subjects.controller');
const classes = require('./classes.controller');
const gradesAttendance = require('./gradesAttendance.controller');
const database = require('./database.controller');

const router = Router();
router.use(requireRole('admin'));

// Tahun ajaran & semester
router.get('/academic-years', asyncHandler(periods.listAcademicYears));
router.post('/academic-years', asyncHandler(periods.createAcademicYear));
router.patch('/academic-years/:id/activate', asyncHandler(periods.activateAcademicYear));
router.get('/semesters', asyncHandler(periods.listSemesters));
router.post('/semesters', asyncHandler(periods.createSemester));
router.patch('/semesters/:id/activate', asyncHandler(periods.activateSemester));

// Akun Guru
router.post('/teachers', asyncHandler(accounts.createTeacher));
router.post('/teachers/import', upload.single('file'), asyncHandler(accounts.importTeachers));
router.get('/teachers', asyncHandler(accounts.listTeachers));
router.patch('/teachers/:id/reset-password', asyncHandler(accounts.resetTeacherPassword));
router.delete('/teachers/:id', asyncHandler(accounts.deleteTeacher));

// Akun Siswa
router.post('/students', asyncHandler(accounts.createStudent));
router.post('/students/import', upload.single('file'), asyncHandler(accounts.importStudents));
router.get('/students', asyncHandler(accounts.listStudents));
router.patch('/students/:id/reset-password', asyncHandler(accounts.resetStudentPassword));
router.delete('/students/:id', asyncHandler(accounts.deleteStudent));

// Templat unduhan
router.get('/templates/teachers-csv', templates.teachersCsvTemplate);
router.get('/templates/students-csv', templates.studentsCsvTemplate);
router.get('/templates/class-students-xlsx', templates.classStudentsXlsxTemplate);

// Mata pelajaran
router.post('/subjects', asyncHandler(subjects.createSubject));
router.get('/subjects', asyncHandler(subjects.listSubjects));
router.patch('/subjects/:id', asyncHandler(subjects.updateSubject));
router.delete('/subjects/:id', asyncHandler(subjects.deleteSubject));

// Kelas
router.post('/classes', asyncHandler(classes.createClass));
router.get('/classes', asyncHandler(classes.listClasses));
router.post('/classes/:id/students/import', upload.single('file'), asyncHandler(classes.importClassStudents));
router.post('/classes/:id/subjects', asyncHandler(classes.addClassSubject));
router.patch('/classes/:id/homeroom-teacher', asyncHandler(classes.setHomeroomTeacher));
router.delete('/classes/:id/homeroom-teacher', asyncHandler(classes.clearHomeroomTeacher));
router.delete('/classes/:id/subjects/:subjectId', asyncHandler(classes.removeClassSubject));
router.delete('/classes/:id/students/:studentId', asyncHandler(classes.removeClassStudent));
router.get('/classes/:id', asyncHandler(classes.getClassDetail));
router.delete('/classes/:id', asyncHandler(classes.deleteClass));

// Nilai & presensi (akses penuh, dapat menembus rapor Final — §8.1)
router.put('/grades', asyncHandler(gradesAttendance.putGrades));
router.delete('/grades', asyncHandler(gradesAttendance.deleteGrades));
router.put('/attendance-sessions/:id/records', asyncHandler(gradesAttendance.putAttendanceRecords));
router.delete('/attendance-sessions/:id', asyncHandler(gradesAttendance.deleteAttendanceSession));

// Database operasional & dashboard (seluruhnya bersumber dari PostgreSQL/Supabase)
router.get('/dashboard', asyncHandler(database.getDashboard));
router.get('/assessment-components', asyncHandler(database.listAssessmentComponents));
router.put('/assessment-components', asyncHandler(database.updateAssessmentComponents));
router.get('/database/attendance', asyncHandler(database.listAttendance));
router.get('/database/grades', asyncHandler(database.listGrades));
router.get('/database/reports', asyncHandler(database.listReports));
router.get('/database/reports/:id/download', asyncHandler(database.downloadReport));
router.delete('/database/reports/:id', asyncHandler(database.deleteReport));
router.get('/system-status', asyncHandler(database.getSystemStatus));

module.exports = router;
