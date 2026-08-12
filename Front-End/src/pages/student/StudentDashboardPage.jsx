import { ArrowRight, CircleAlert, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AiInsightCard from "../../components/student/AiInsightCard";
import AttendanceCard from "../../components/student/AttendanceCard";
import SubjectScoreCard from "../../components/student/SubjectScoreCard";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import { getStudentAiInsight, getStudentDashboard } from "../../services/studentService";
import { getStoredUser } from "../../stores/authStore";

export default function StudentDashboardPage() {
  const user = getStoredUser();
  const navigate = useNavigate();
  const [pageState, setPageState] = useState("loading");
  const [dashboardData, setDashboardData] = useState(null);
  const [aiStatus, setAiStatus] = useState("idle");
  const [aiInsight, setAiInsight] = useState(null);

  const loadDashboard = async () => {
    setPageState("loading");
    try {
      const result = await getStudentDashboard();
      setDashboardData(result);
      setPageState("loaded");
    } catch {
      setDashboardData(null);
      setPageState("error");
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleAnalyze = async () => {
    if (aiStatus === "loading") return;

    setAiStatus("loading");
    try {
      const result = await getStudentAiInsight();
      setAiInsight(result);
      setAiStatus("success");
    } catch {
      setAiInsight(null);
      setAiStatus("error");
    }
  };

  if (pageState === "loading") {
    return <section role="status" className="flex min-h-[calc(100vh-4rem)] items-center justify-center"><Spinner className="h-8 w-8 text-[#2F67ED]" /><span className="sr-only">Memuat dashboard siswa...</span></section>;
  }

  if (pageState === "error") {
    return (
      <section role="alert" className="mx-auto mt-20 max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-soft">
        <CircleAlert aria-hidden="true" className="mx-auto h-10 w-10 text-red-500" />
        <h1 className="mt-4 text-xl font-bold">Dashboard gagal dimuat</h1>
        <p className="mt-2 text-sm text-[#64748B]">Silakan coba muat ulang data dashboard.</p>
        <Button onClick={loadDashboard} className="mt-6"><RefreshCw aria-hidden="true" className="h-4 w-4" /> Coba Lagi</Button>
      </section>
    );
  }

  return (
    <div className="px-4 py-8 sm:px-7 lg:px-6 xl:px-10">
      <div className="mx-auto max-w-[1100px]">
        <header>
          <h1 className="text-[26px] font-bold tracking-[-0.035em] text-[#20232D]">Halo, {user.name}! <span role="img" aria-label="melambaikan tangan">👋</span></h1>
          <p className="mt-1 text-sm text-[#545968]">Mari kita tingkatkan prestasimu minggu ini.</p>
        </header>

        <section aria-label="Ringkasan siswa" className="mt-8 grid items-start gap-4 lg:grid-cols-[minmax(240px,0.75fr)_minmax(0,1.55fr)]">
          <AttendanceCard percentage={dashboardData.attendancePercentage} />
          <AiInsightCard
            status={aiStatus}
            insight={aiInsight}
            studentName={user.name}
            onAnalyze={handleAnalyze}
            onStartLearning={() => navigate("/student/grades")}
          />
        </section>

        <section className="mt-20">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-[#20232D]">Rincian Nilai</h2>
            <Link to="/student/grades" className="inline-flex items-center gap-1 text-sm font-semibold text-[#0756D9] hover:underline">
              Lihat Detail <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {dashboardData.subjects.map((subject) => <SubjectScoreCard key={subject.id} subject={subject} />)}
          </div>
        </section>
      </div>
    </div>
  );
}
