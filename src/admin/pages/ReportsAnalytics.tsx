import { BarChart as BarChartIcon } from "@/src/lib/icons";

export function ReportsAnalytics() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Reports & Analytics</h2>
          <p className="text-slate-500">View performance metrics and app usage</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
        <BarChartIcon className="w-16 h-16 text-emerald-200 mb-4" />
        <h3 className="text-xl font-bold text-slate-800 mb-2">Analytics Dashboard Syncing</h3>
        <p className="text-slate-500 max-w-md">
          Detailed analytics and charting tools are being provisioned. Once complete, you will see daily active users, session lengths, and top featured videos here.
        </p>
      </div>
    </div>
  );
}

