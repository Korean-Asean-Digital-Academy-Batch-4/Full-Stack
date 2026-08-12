import { useEffect, useState } from "react";
import DashboardGreeting from "../../components/dashboard/DashboardGreeting";
import InsightCard from "../../components/dashboard/InsightCard";
import { getTeacherClasses } from "../../services/teacherService";

export default function TeacherDashboardPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getTeacherClasses().then(setAssignments).catch(() => setAssignments([])).finally(() => setLoading(false)); }, []);
  return (
    <div className="px-4 py-8 sm:px-7 sm:py-10 lg:px-10">
      <div className="mx-auto max-w-[880px]">
        <DashboardGreeting />
        <InsightCard assignments={assignments} loading={loading} />
      </div>
    </div>
  );
}
