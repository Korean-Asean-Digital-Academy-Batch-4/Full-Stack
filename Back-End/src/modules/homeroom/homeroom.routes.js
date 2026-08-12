const { Router } = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const { requireRole } = require('../../middleware/roleGuard');
const ctrl = require('./homeroom.controller');

const router = Router();
router.use(requireRole('teacher', 'admin')); // otorisasi per-kelas dicek di controller (isHomeroomOf)

router.get('/classes/:classId/overview', asyncHandler(ctrl.getClassOverview));
router.get('/classes/:classId/completeness', asyncHandler(ctrl.getClassCompletenessHandler));
router.get('/classes/:classId/subjects/:subjectId/grades', asyncHandler(ctrl.getSubjectGrades));
router.get('/report-cards/:studentId', asyncHandler(ctrl.getReportCard));
router.post('/classes/:classId/report-cards/:studentId/generate', asyncHandler(ctrl.generateStudentReport));
router.post('/classes/:classId/report-cards/generate-all', asyncHandler(ctrl.generateAllReports));
router.patch('/report-cards/:studentId/note', asyncHandler(ctrl.updateReportCardNote));
router.post('/report-cards/:studentId/note-draft', asyncHandler(ctrl.generateReportCardNoteDraft));
router.post('/report-cards/:studentId/finalize', asyncHandler(ctrl.finalizeStudentReport));
router.post('/classes/:classId/finalize', asyncHandler(ctrl.finalizeClass));
router.post('/classes/:classId/distribute', asyncHandler(ctrl.distributeClass));
router.get('/report-cards/:studentId/download', asyncHandler(ctrl.downloadReportCard));

module.exports = router;
