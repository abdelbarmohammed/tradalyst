"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { AlertCircle, Users, TrendingUp, GitMerge, BarChart2 } from "lucide-react";
import { get } from "@/lib/api";
import type { AdminStats } from "@/types";

function StatCard({
  label, value, sub, icon: Icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted">{label}</p>
        <Icon size={14} className="text-muted flex-shrink-0 mt-[2px]" />
      </div>
      <p className="font-mono text-[30px] font-bold text-primary tabular-nums leading-none">{value}</p>
      {sub && <p className="font-mono text-[10px] text-muted mt-2">{sub}</p>}
    </div>
  );
}

function DistributionBar({
  label, a, aLabel, b, bLabel, total,
}: {
  label: string;
  a: number; aLabel: string;
  b: number; bLabel: string;
  total: number;
}) {
  const aPct = total > 0 ? (a / total) * 100 : 0;
  return (
    <div>
      <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted mb-2">{label}</p>
      <div className="flex h-1 overflow-hidden gap-px mb-2 bg-white/[0.06]">
        <div style={{ width: `${aPct}%` }} className="bg-green/70 transition-all duration-500" />
      </div>
      <div className="flex justify-between">
        <span className="font-mono text-[10px] text-secondary">
          {aLabel}: <span className="text-primary">{a}</span>
        </span>
        <span className="font-mono text-[10px] text-secondary">
          {bLabel}: <span className="text-primary">{b}</span>
        </span>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const t = useTranslations("adminHome");
  const tM = useTranslations("adminMentorships");

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    get<AdminStats>("/api/admin/stats/")
      .then(setStats)
      .catch((err) => setError(err instanceof Error ? err.message : t("errorLoad")))
      .finally(() => setLoading(false));
  }, [t]);

  return (
    <div className="max-w-[1100px] mx-auto space-y-6">
      <div>
        <h1 className="font-sans text-[22px] font-bold text-primary leading-tight">{t("title")}</h1>
        <p className="font-mono text-[11px] text-muted mt-[3px]">{t("subtitle")}</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 border border-loss/30 bg-loss/[0.06]">
          <AlertCircle size={15} className="text-loss flex-shrink-0" />
          <p className="font-sans text-[13px] text-loss">{error}</p>
        </div>
      )}

      {/* ── Stat cards ── */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-sm" />)}
        </div>
      ) : stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Link href="/admin/users" className="hover:opacity-90 transition-opacity">
            <StatCard
              label={t("totalUsers")}
              value={stats.users.total}
              sub={`+${stats.users.new_this_week} ${t("newThisWeek")}`}
              icon={Users}
            />
          </Link>
          <StatCard
            label={t("totalTrades")}
            value={stats.trades.total}
            sub={`${stats.trades.this_week} ${t("thisWeek")}`}
            icon={TrendingUp}
          />
          <StatCard
            label={t("planPro")}
            value={stats.users.pro}
            sub={`${stats.users.total > 0 ? Math.round((stats.users.pro / stats.users.total) * 100) : 0}% ${t("conversionRate")}`}
            icon={BarChart2}
          />
          <Link href="/admin/mentorships" className="hover:opacity-90 transition-opacity">
            <StatCard
              label={tM("title")}
              value={stats.mentorships.active}
              sub={`${stats.mentorships.pending_requests} ${tM("tabPending").toLowerCase()}`}
              icon={GitMerge}
            />
          </Link>
        </div>
      )}

      {/* ── Chart row ── */}
      {!loading && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="card p-5 lg:col-span-2">
            <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted mb-4">
              {t("signupsChartTitle")}
            </p>
            <ResponsiveContainer width="100%" height={130}>
              <AreaChart
                data={stats.signups_last_30_days}
                margin={{ top: 4, right: 4, left: -28, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="signup-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2fac66" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#2fac66" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 9, fontFamily: "IBM Plex Mono", fill: "var(--text-muted)" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: string) => v.slice(5)}
                  interval={6}
                />
                <Tooltip
                  contentStyle={{
                    background: "#303030",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 0,
                    fontSize: 11,
                    fontFamily: "IBM Plex Mono",
                  }}
                  labelStyle={{ color: "rgba(255,255,255,0.5)" }}
                  itemStyle={{ color: "#2fac66" }}
                  cursor={{ stroke: "rgba(255,255,255,0.1)" }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#2fac66"
                  strokeWidth={1.5}
                  fill="url(#signup-grad)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-5 space-y-6">
            <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted">
              {t("distributionTitle")}
            </p>
            <DistributionBar
              label={t("byRole")}
              a={stats.users.traders}
              aLabel={t("traders")}
              b={stats.users.mentors}
              bLabel={t("mentors")}
              total={stats.users.total}
            />
            <DistributionBar
              label={t("byPlan")}
              a={stats.users.pro}
              aLabel={t("pro")}
              b={stats.users.free}
              bLabel={t("free")}
              total={stats.users.total}
            />
          </div>
        </div>
      )}

      {/* ── Top traders + Activity ── */}
      {!loading && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="card lg:col-span-2">
            <div className="px-5 py-4 border-b border-white/[0.06]">
              <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted">
                {t("topTradersTitle")}
              </p>
            </div>
            {stats.top_traders.length === 0 ? (
              <p className="p-10 text-center font-sans text-[13px] text-secondary">{t("noUsers")}</p>
            ) : (
              <div className="hidden lg:block">
                <div className="grid grid-cols-[28px_1fr_64px_72px_56px_90px] gap-3 px-5 py-2 border-b border-white/[0.04]">
                  {[t("colRank"), t("colName"), t("colTrades"), t("colWinRate"), t("colPlan"), t("colLastActive")].map((h) => (
                    <span key={h} className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted">{h}</span>
                  ))}
                </div>
                {stats.top_traders.map((trader, i) => (
                  <div
                    key={trader.id}
                    className="grid grid-cols-[28px_1fr_64px_72px_56px_90px] gap-3 px-5 py-3 border-b border-white/[0.04] items-center last:border-0"
                  >
                    <span className="font-mono text-[11px] text-muted tabular-nums">{i + 1}</span>
                    <div className="min-w-0">
                      <p className="font-sans text-[12px] font-medium text-primary truncate">
                        {trader.display_name}
                      </p>
                      <p className="font-mono text-[10px] text-muted truncate">{trader.email}</p>
                    </div>
                    <span className="font-mono text-[11px] text-secondary tabular-nums">{trader.trade_count}</span>
                    <span className={`font-mono text-[11px] tabular-nums ${trader.win_rate >= 50 ? "text-profit" : "text-loss"}`}>
                      {trader.win_rate}%
                    </span>
                    <span className={`font-mono text-[9px] uppercase px-1.5 py-[2px] w-fit ${
                      trader.plan === "pro"
                        ? "text-green/80 border border-green/25"
                        : "text-muted border border-white/[0.08]"
                    }`}>
                      {trader.plan}
                    </span>
                    <span className="font-mono text-[10px] text-muted">{trader.last_active ?? "—"}</span>
                  </div>
                ))}
              </div>
            )}
            {/* Mobile top traders */}
            <div className="lg:hidden divide-y divide-white/[0.04]">
              {stats.top_traders.map((trader, i) => (
                <div key={trader.id} className="px-5 py-3 flex items-center gap-3">
                  <span className="font-mono text-[11px] text-muted w-5 tabular-nums">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-[12px] font-medium text-primary truncate">{trader.display_name}</p>
                    <p className="font-mono text-[10px] text-muted">{trader.trade_count} ops · {trader.win_rate}% win</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="px-5 py-4 border-b border-white/[0.06]">
              <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted">
                {t("activityTitle")}
              </p>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {stats.recent_activity.length === 0 ? (
                <p className="p-5 font-sans text-[13px] text-secondary">{t("noUsers")}</p>
              ) : stats.recent_activity.map((item, i) => (
                <div key={i} className="px-5 py-3">
                  <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted mb-[2px]">
                    {item.type === "registration" ? t("activityNewUser") : t("activityAssignment")}
                  </p>
                  <p className="font-sans text-[12px] text-primary">
                    {item.type === "registration"
                      ? item.display_name
                      : `${item.mentor_name} → ${item.trader_name}`}
                  </p>
                  <p className="font-mono text-[9px] text-muted mt-[2px]">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Quick links ── */}
      {!loading && (
        <div className="flex gap-4">
          <Link href="/admin/users" className="font-mono text-[11px] text-green hover:underline">
            {t("viewAll")}
          </Link>
          <span className="font-mono text-[11px] text-muted">·</span>
          <Link href="/admin/mentorships" className="font-mono text-[11px] text-green hover:underline">
            {tM("title")} →
          </Link>
        </div>
      )}
    </div>
  );
}
