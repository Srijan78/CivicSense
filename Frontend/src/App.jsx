import React, { useEffect, useMemo, useState } from 'react';
import Header from './components/Header';
import ReportForm from './components/ReportForm';
import ReportList from './components/ReportList';
import Leaderboard from './components/Leaderboard';
import { User as UserIcon } from 'lucide-react';
import MunicipalDashboard from './components/MunicipalDashboard';
import { useAuth } from './components/AuthContext';

// Heuristic scoring as graceful fallback when backend is unavailable
function prioritizeAndScore(report) {
  const d = (report.description || '').toLowerCase();
  const isHighRisk = /flood|bridge|collapse|electri|fire|gas|sinkhole/.test(d);
  const looksFake = /prank|lol|fake|just testing/.test(d);
  const status = looksFake ? 'Rejected' : isHighRisk ? 'Validated' : 'In Review';
  const pointsAwarded = looksFake ? -25 : isHighRisk ? 20 : 10;
  return { ...report, status, pointsAwarded };
}

export default function App() {
  const [activeTab, setActiveTab] = useState('report');
  const [reports, setReports] = useState([]);
  const { user, loading } = useAuth();

  const backend = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '') || '';

  useEffect(() => {
    refreshReports();
  }, []);

  async function refreshReports() {
    if (!backend) return;
    try {
      const res = await fetch(`${backend}/reports`);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) setReports(data);
    } catch {
      // offline or backend not ready
    }
  }

  async function addReport(newReport) {
  if (!backend) {
    const local = prioritizeAndScore({
      id: crypto.randomUUID(),
      ...newReport,
      status: "Submitted",
    });
    setReports((prev) => [local, ...prev]);
    setActiveTab("feed");
    return;
  }

  try {
    const headers = { "Content-Type": "application/json" };
    if (user?.token) headers["Authorization"] = `Bearer ${user.token}`;

    const res = await fetch(`${backend}/reports`, {
      method: "POST",
      headers,
      body: JSON.stringify(newReport),
    });

    if (!res.ok) {
      console.error("Report submission failed:", res.status, await res.text());
      throw new Error("Unauthorized or server error");
    }

    const data = await res.json();
    setReports((prev) => [data, ...prev]);
    setActiveTab("feed");
  } catch (err) {
    console.error("Error submitting report:", err.message);
    const local = prioritizeAndScore({
      id: crypto.randomUUID(),
      ...newReport,
      status: "Submitted (offline)",
    });
    setReports((prev) => [local, ...prev]);
    setActiveTab("feed");
  }
}

  const leaderboard = useMemo(() => {
    const map = new Map();
    for (const r of reports) {
      const key = r.name || 'Citizen';
      const prev = map.get(key) || { name: key, points: 0, reports: 0 };
      map.set(key, { name: key, points: prev.points + (r.pointsAwarded || 0), reports: prev.reports + 1 });
    }
    return Array.from(map.values());
  }, [reports]);

  function navigate(tab) {
    setActiveTab(tab);
}
  async function updateReportStatus(id, newStatus) {
  try {
    const res = await fetch(`${backend}/reports/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!res.ok) throw new Error(`Failed to update status: ${res.statusText}`);

    // Update in frontend state immediately
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  } catch (err) {
    console.error('Error updating report status:', err);
  }
}

async function deleteReport(id) {
  try {
    const res = await fetch(`${backend}/reports/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Failed to delete report: ${res.statusText}`);

    // Remove from local state
    setReports((prev) => prev.filter((r) => r.id !== id));
  } catch (err) {
    console.error('Error deleting report:', err);
  }
}


   return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <Header activeTab={activeTab} onChange={navigate} />

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* ---------------- Report Tab ---------------- */}
        {activeTab === 'report' && (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-700 grid place-items-center">
                  <UserIcon />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Report issues around your city</h2>
                  {!user && (
                    <p className="text-sm text-gray-500">
                      You can view all reports below. Please sign in to submit your own.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Show Report Form only if user is logged in */}
            {user && <ReportForm onSubmit={addReport} />}

            {/* Always show reports + leaderboard */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
              <div className="lg:col-span-2">
                <ReportList reports={reports} />
              </div>
              <Leaderboard scores={leaderboard} />
            </section>
          </>
        )}

        {/* ---------------- Feed Tab ---------------- */}
        {activeTab === 'feed' && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <ReportList reports={reports} />
            </div>
            <Leaderboard scores={leaderboard} />
          </section>
        )}

        {/* ---------------- Leaderboard Tab ---------------- */}
        {activeTab === 'leaderboard' && <Leaderboard scores={leaderboard} />}

        {/* ---------------- Municipal Dashboard Tab ---------------- */}
        {activeTab === 'municipal' && (
          <>
            {user?.role === 'municipal' ? (
              <MunicipalDashboard
                reports={reports}
                onStatusChange={updateReportStatus}
                onRemove={deleteReport}
                onCleanup={refreshReports}
              />
            ) : (
              <div className="flex justify-center items-center h-64 text-lg font-semibold text-red-600">
                ❌ Access Denied — Only Municipal Officials can access this page.
              </div>
            )}
          </>
        )}
      </main>

      <footer className="py-8 text-center text-xs text-gray-500">
        Civic Sense
      </footer>
    </div>
  );
}