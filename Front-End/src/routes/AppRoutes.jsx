import { Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import SuperAdminLayout from "../components/layout/SuperAdminLayout";
import DashboardPage from "../pages/DashboardPage";
import ForbiddenPage from "../pages/ForbiddenPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import LoginPage from "../pages/LoginPage";
import LandingPage from "../pages/LandingPage";
import NotFoundPage from "../pages/NotFoundPage";
import TeacherAccountPage from "../pages/teacher/TeacherAccountPage";
import TeacherAttendancePage from "../pages/teacher/TeacherAttendancePage";
import ChangePasswordPage from "../pages/teacher/ChangePasswordPage";
import TeacherDashboardPage from "../pages/teacher/TeacherDashboardPage";
import TeacherGradesPage from "../pages/teacher/TeacherGradesPage";
import TeacherHomeroomReportsPage from "../pages/teacher/TeacherHomeroomReportsPage";
import TeacherReportsPage from "../pages/teacher/TeacherReportsPage";
import TeacherStudentReportPage from "../pages/teacher/TeacherStudentReportPage";
import TeacherSubjectGradesPage from "../pages/teacher/TeacherSubjectGradesPage";
import StudentDashboardPage from "../pages/student/StudentDashboardPage";
import StudentAttendancePage from "../pages/student/StudentAttendancePage";
import StudentGradesPage from "../pages/student/StudentGradesPage";
import StudentReportPage from "../pages/student/StudentReportPage";
import StudentSettingsPage from "../pages/student/StudentSettingsPage";
import SuperAdminDashboardPage from "../pages/superadmin/SuperAdminDashboardPage";
import ClassAssignmentPage from "../pages/superadmin/ClassAssignmentPage";
import SuperAdminPlaceholderPage from "../pages/superadmin/SuperAdminPlaceholderPage";
import SuperAdminStudentAccountsPage from "../pages/superadmin/SuperAdminStudentAccountsPage";
import SuperAdminTeacherAccountsPage from "../pages/superadmin/SuperAdminTeacherAccountsPage";
import MainFormulaPage from "../pages/superadmin/MainFormulaPage";
import TeacherDirectoryPage from "../pages/superadmin/TeacherDirectoryPage";
import StudentDirectoryPage from "../pages/superadmin/StudentDirectoryPage";
import StudentAttendanceDatabasePage from "../pages/superadmin/StudentAttendanceDatabasePage";
import SubjectDatabasePage from "../pages/superadmin/SubjectDatabasePage";
import GradeDatabasePage from "../pages/superadmin/GradeDatabasePage";
import ReportDatabasePage from "../pages/superadmin/ReportDatabasePage";
import SystemSettingsPage from "../pages/superadmin/SystemSettingsPage";
import { superAdminPages } from "../data/superAdminData";
import HomeroomRoute from "./HomeroomRoute";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/403" element={<ForbiddenPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route element={<RoleRoute allowedRoles={["admin"]} />}>
          <Route element={<SuperAdminLayout />}>
            <Route path="/superadmin/dashboard" element={<SuperAdminDashboardPage />} />
            <Route path="/superadmin/accounts/teachers" element={<SuperAdminTeacherAccountsPage />} />
            <Route path="/superadmin/accounts/students" element={<SuperAdminStudentAccountsPage />} />
            <Route path="/superadmin/assignments/class-x" element={<ClassAssignmentPage gradeLevel="X" />} />
            <Route path="/superadmin/assignments/class-xi" element={<ClassAssignmentPage gradeLevel="XI" />} />
            <Route path="/superadmin/assignments/class-xii" element={<ClassAssignmentPage gradeLevel="XII" />} />
            <Route path="/superadmin/formulas/main" element={<MainFormulaPage />} />
            <Route path="/superadmin/database/teachers" element={<TeacherDirectoryPage />} />
            <Route path="/superadmin/database/students" element={<StudentDirectoryPage />} />
            <Route path="/superadmin/database/attendance" element={<StudentAttendanceDatabasePage />} />
            <Route path="/superadmin/database/subjects" element={<SubjectDatabasePage />} />
            <Route path="/superadmin/database/grades" element={<GradeDatabasePage />} />
            <Route path="/superadmin/database/reports" element={<ReportDatabasePage />} />
            <Route path="/superadmin/system-settings" element={<SystemSettingsPage />} />
            {Object.entries(superAdminPages)
              .filter(([path]) => ![
                "/superadmin/dashboard",
                "/superadmin/accounts/teachers",
                "/superadmin/accounts/students",
                "/superadmin/assignments/class-x",
                "/superadmin/assignments/class-xi",
                "/superadmin/assignments/class-xii",
                "/superadmin/formulas/main",
                "/superadmin/database/teachers",
                "/superadmin/database/students",
                "/superadmin/database/attendance",
                "/superadmin/database/subjects",
                "/superadmin/database/grades",
                "/superadmin/database/reports",
                "/superadmin/system-settings",
              ].includes(path))
              .map(([path, title]) => (
                <Route key={path} path={path} element={<SuperAdminPlaceholderPage title={title} />} />
              ))}
          </Route>
        </Route>
        <Route path="/admin/dashboard" element={<Navigate to="/superadmin/dashboard" replace />} />
        <Route element={<RoleRoute allowedRoles={["teacher"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/teacher/dashboard" element={<TeacherDashboardPage />} />
            <Route path="/teacher/attendance" element={<TeacherAttendancePage />} />
            <Route path="/teacher/grades" element={<TeacherGradesPage />} />
            <Route element={<HomeroomRoute />}>
              <Route path="/teacher/subject-grades" element={<TeacherSubjectGradesPage />} />
              <Route path="/teacher/reports" element={<TeacherReportsPage />} />
              <Route path="/teacher/reports/:studentId" element={<TeacherStudentReportPage />} />
              <Route path="/teacher/homeroom/reports" element={<TeacherHomeroomReportsPage />} />
              <Route path="/teacher/homeroom/reports/:studentId" element={<TeacherHomeroomReportsPage />} />
            </Route>
            <Route path="/teacher/account" element={<TeacherAccountPage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
          </Route>
        </Route>
        <Route element={<RoleRoute allowedRoles={["student"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/student/dashboard" element={<StudentDashboardPage />} />
            <Route path="/student/grades" element={<StudentGradesPage />} />
            <Route path="/student/attendance" element={<StudentAttendancePage />} />
            <Route path="/student/report" element={<StudentReportPage />} />
            <Route path="/student/settings" element={<StudentSettingsPage />} />
            <Route path="/student/ai-insight" element={<Navigate to="/student/dashboard" replace />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
