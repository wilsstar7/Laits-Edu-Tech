import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { RoleGuard } from '@/components/auth/RoleGuard'
import { DashboardSkeleton } from '@/components/dashboard/LoadingSkeleton'

// Public & Auth Pages (Code-split)
const LandingPage = lazy(() => import('@/pages/LandingPage').then((m) => ({ default: m.LandingPage })))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })))
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })))
const AuthCallbackPage = lazy(() => import('@/pages/auth/AuthCallbackPage').then((m) => ({ default: m.AuthCallbackPage })))
const UnauthorizedPage = lazy(() => import('@/pages/UnauthorizedPage').then((m) => ({ default: m.UnauthorizedPage })))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))
const HealthCheckPage = lazy(() => import('@/pages/HealthCheckPage').then((m) => ({ default: m.HealthCheckPage })))

// Student Pages (Code-split)
const StudentDashboardPage = lazy(() => import('@/pages/student/StudentDashboardPage').then((m) => ({ default: m.StudentDashboardPage })))
const StudentCoursesPage = lazy(() => import('@/pages/student/StudentCoursesPage').then((m) => ({ default: m.StudentCoursesPage })))
const CourseDetailPage = lazy(() => import('@/pages/student/CourseDetailPage').then((m) => ({ default: m.CourseDetailPage })))
const LessonPlayerPage = lazy(() => import('@/pages/student/LessonPlayerPage').then((m) => ({ default: m.LessonPlayerPage })))
const StudentGoalsPage = lazy(() => import('@/pages/student/StudentGoalsPage').then((m) => ({ default: m.StudentGoalsPage })))
const StudentAchievementsPage = lazy(() => import('@/pages/student/StudentAchievementsPage').then((m) => ({ default: m.StudentAchievementsPage })))
const StudentSettingsPage = lazy(() => import('@/pages/student/StudentSettingsPage').then((m) => ({ default: m.StudentSettingsPage })))
const AssessmentIntroPage = lazy(() => import('@/pages/student/AssessmentIntroPage').then((m) => ({ default: m.AssessmentIntroPage })))
const AssessmentQuestionPage = lazy(() => import('@/pages/student/AssessmentQuestionPage').then((m) => ({ default: m.AssessmentQuestionPage })))
const PersonalityResultPage = lazy(() => import('@/pages/student/PersonalityResultPage').then((m) => ({ default: m.PersonalityResultPage })))
const ReportHistoryPage = lazy(() => import('@/pages/student/ReportHistoryPage').then((m) => ({ default: m.ReportHistoryPage })))
const ReportPreviewPage = lazy(() => import('@/pages/student/ReportPreviewPage').then((m) => ({ default: m.ReportPreviewPage })))
const PersonalizedLearningPage = lazy(() => import('@/pages/student/PersonalizedLearningPage').then((m) => ({ default: m.PersonalizedLearningPage })))
const LearningPathDetailPage = lazy(() => import('@/pages/student/LearningPathDetailPage').then((m) => ({ default: m.LearningPathDetailPage })))
const TutorDiscoveryPage = lazy(() => import('@/pages/student/TutorDiscoveryPage').then((m) => ({ default: m.TutorDiscoveryPage })))
const TutorProfilePage = lazy(() => import('@/pages/student/TutorProfilePage').then((m) => ({ default: m.TutorProfilePage })))
const StudentSchedulePage = lazy(() => import('@/pages/student/StudentSchedulePage').then((m) => ({ default: m.StudentSchedulePage })))
const StudentProgressPage = lazy(() => import('@/pages/student/StudentProgressPage').then((m) => ({ default: m.StudentProgressPage })))
const StudentPaymentsPage = lazy(() => import('@/pages/student/StudentPaymentsPage').then((m) => ({ default: m.StudentPaymentsPage })))
const PaymentDetailPage = lazy(() => import('@/pages/student/PaymentDetailPage').then((m) => ({ default: m.PaymentDetailPage })))
const StudentSessionsPage = lazy(() => import('@/pages/student/StudentSessionsPage').then((m) => ({ default: m.StudentSessionsPage })))
const NotificationsPage = lazy(() => import('@/pages/student/NotificationsPage').then((m) => ({ default: m.NotificationsPage })))
const StudentMessagesPage = lazy(() => import('@/pages/student/StudentMessagesPage').then((m) => ({ default: m.StudentMessagesPage })))
const PlaceholderPage = lazy(() => import('@/pages/student/PlaceholderPage').then((m) => ({ default: m.PlaceholderPage })))
const CertificateVerifyPage = lazy(() => import('@/pages/CertificateVerifyPage').then((m) => ({ default: m.CertificateVerifyPage })))

// Tutor Pages (Code-split)
const TutorDashboardPage = lazy(() => import('@/pages/tutor/TutorDashboardPage').then((m) => ({ default: m.TutorDashboardPage })))
const TutorAvailabilityPage = lazy(() => import('@/pages/tutor/TutorAvailabilityPage').then((m) => ({ default: m.TutorAvailabilityPage })))
const TutorSessionsPage = lazy(() => import('@/pages/tutor/TutorSessionsPage').then((m) => ({ default: m.TutorSessionsPage })))

// Admin Pages (Code-split)
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })))
const AdminCoursesPage = lazy(() => import('@/pages/admin/AdminCoursesPage').then((m) => ({ default: m.AdminCoursesPage })))
const AdminAnnouncementsPage = lazy(() => import('@/pages/admin/AdminAnnouncementsPage').then((m) => ({ default: m.AdminAnnouncementsPage })))
const AdminPaymentsPage = lazy(() => import('@/pages/admin/AdminPaymentsPage').then((m) => ({ default: m.AdminPaymentsPage })))
const AdminReviewsPage = lazy(() => import('@/pages/admin/AdminReviewsPage').then((m) => ({ default: m.AdminReviewsPage })))
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })))
const AdminSubjectsPage = lazy(() => import('@/pages/admin/AdminSubjectsPage').then((m) => ({ default: m.AdminSubjectsPage })))

function RouteLoader() {
  return (
    <div className="min-h-screen bg-[#F4F5FB] p-8 max-w-7xl mx-auto">
      <DashboardSkeleton />
    </div>
  )
}

export function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/certificate/:certificateNumber" element={<CertificateVerifyPage />} />
        <Route path="/health" element={<HealthCheckPage />} />

        {/* Student Protected Routes (Protected & Role-Guarded) */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['student']}>
                <StudentDashboardPage />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/courses"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['student']}>
                <StudentCoursesPage />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/courses/:courseId"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['student']}>
                <CourseDetailPage />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/courses/:courseId/lessons/:lessonId"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['student']}>
                <LessonPlayerPage />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/goals"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['student']}>
                <StudentGoalsPage />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/achievements"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['student']}>
                <StudentAchievementsPage />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/settings"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['student', 'tutor', 'admin', 'super_admin']}>
                <StudentSettingsPage />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/assessment"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['student']}>
                <AssessmentIntroPage />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/assessment/:id"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['student']}>
                <AssessmentQuestionPage />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/personality"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['student']}>
                <PersonalityResultPage />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/personality/:resultId"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['student']}>
                <PersonalityResultPage />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/learning"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['student']}>
                <PersonalizedLearningPage />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/learning-paths/:slug"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['student']}>
                <LearningPathDetailPage />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/tutors"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['student']}>
                <TutorDiscoveryPage />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/tutors/:tutorId"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['student']}>
                <TutorProfilePage />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/schedule"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['student']}>
                <StudentSchedulePage />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/progress"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['student']}>
                <StudentProgressPage />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/payments"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['student']}>
                <StudentPaymentsPage />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/payments/:paymentId"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['student']}>
                <PaymentDetailPage />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/sessions"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['student']}>
                <StudentSessionsPage />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/reports"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['student']}>
                <ReportHistoryPage />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/reports/:reportId"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['student']}>
                <ReportPreviewPage />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/notifications"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['student']}>
                <NotificationsPage />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/messages"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['student']}>
                <StudentMessagesPage />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/help"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['student', 'tutor', 'admin', 'super_admin']}>
                <PlaceholderPage featureKey="help" />
              </RoleGuard>
            </ProtectedRoute>
          }
        />

        {/* Tutor Protected Routes */}
        <Route
          path="/tutor/dashboard"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['tutor']}>
                <TutorDashboardPage />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/availability"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['tutor']}>
                <TutorAvailabilityPage />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/sessions"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['tutor']}>
                <TutorSessionsPage />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/schedule"
          element={<Navigate to="/tutor/dashboard" replace />}
        />
        <Route
          path="/tutor/students"
          element={<Navigate to="/tutor/dashboard" replace />}
        />
        <Route
          path="/tutor/earnings"
          element={<Navigate to="/tutor/dashboard" replace />}
        />

        {/* Admin Protected Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['admin', 'super_admin']}>
                <AdminDashboardPage />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['admin', 'super_admin']}>
                <AdminCoursesPage />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/announcements"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['admin', 'super_admin']}>
                <AdminAnnouncementsPage />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['super_admin']}>
                <AdminPaymentsPage />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reviews"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['admin', 'super_admin']}>
                <AdminReviewsPage />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['admin', 'super_admin']}>
                <AdminUsersPage />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/subjects"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['admin', 'super_admin']}>
                <AdminSubjectsPage />
              </RoleGuard>
            </ProtectedRoute>
          }
        />

        {/* Fallback 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
