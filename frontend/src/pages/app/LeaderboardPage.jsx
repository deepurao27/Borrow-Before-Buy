import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Skeleton } from '../../components/ui/Skeleton';
import { Trophy, Award, Sparkles, ShieldCheck, Star, Zap, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LeaderboardPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['campus-leaderboard'],
    queryFn: async () => {
      const res = await apiClient('/rewards/leaderboard');
      return res.data || [];
    }
  });

  const leaderboard = data || [];
  const topThree = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  const renderBadge = (badgeName) => {
    switch (badgeName) {
      case 'Top Lender':
        return (
          <span key={badgeName} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Trophy className="w-3 h-3 text-amber-400" />
            Top Lender
          </span>
        );
      case 'Quick Responder':
        return (
          <span key={badgeName} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <Zap className="w-3 h-3 text-sky-400" />
            Quick Responder
          </span>
        );
      case 'Eco Hero':
        return (
          <span key={badgeName} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <Leaf className="w-3 h-3 text-emerald-400" />
            Eco Hero
          </span>
        );
      default:
        return (
          <span key={badgeName} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
            {badgeName}
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header matching Fig. 6.4 */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <span className="handwritten-note block text-2xl text-amber-400">Campus Pillars & Honor Roll</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-ink dark:text-ink-dark">
          Campus Sharing Leaderboard & Lender Recognition
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted dark:text-ink-darkMuted leading-relaxed">
          Celebrating top equipment lenders, on-time borrowers, and student heroes saving money and waste across our campus.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      ) : (
        <>
          {/* Top 3 Podium Cards matching Fig. 6.4 */}
          {topThree.length >= 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
              {/* Rank 2: Silver */}
              <Card className="order-2 md:order-1 p-6 text-center border-slate-700/80 relative overflow-hidden bg-gradient-to-b from-slate-800/80 to-slate-900/90 shadow-lg">
                <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-200 font-bold text-xl flex items-center justify-center mx-auto mb-3 border-2 border-slate-400 shadow-sm">
                  🥈
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1">
                  Rank 2
                </span>
                <h3 className="font-serif font-bold text-xl text-slate-100">
                  <Link to={`/profile/${topThree[1].id}`} className="hover:text-amber-400 transition-colors">
                    {topThree[1].name}
                  </Link>
                </h3>
                <p className="text-xs text-slate-400 mb-2">
                  {topThree[1].department}
                </p>
                <div className="inline-block text-[11px] font-bold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-600 mb-4">
                  {topThree[1].tag || '24 Lends - Silver'}
                </div>
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Trust Score</span>
                    <span className="font-bold text-emerald-400 text-sm">{topThree[1].overallScore}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Items Shared</span>
                    <span className="font-bold text-slate-100 text-sm">{topThree[1].itemsShared || 24}</span>
                  </div>
                </div>
              </Card>

              {/* Rank 1: Gold / Campus Sharing Legend */}
              <Card className="order-1 md:order-2 p-8 text-center border-amber-500/60 relative overflow-hidden bg-gradient-to-b from-amber-500/15 via-slate-900/95 to-slate-900 shadow-2xl md:-translate-y-4 ring-2 ring-amber-500/30">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-3xl flex items-center justify-center mx-auto mb-3 shadow-lg border-2 border-amber-200">
                  👑
                </div>
                <span className="text-[11px] font-mono font-black uppercase tracking-widest text-amber-400 block mb-1">
                  Rank 1
                </span>
                <h3 className="font-serif font-black text-2xl text-slate-100">
                  <Link to={`/profile/${topThree[0].id}`} className="hover:text-amber-400 transition-colors">
                    {topThree[0].name}
                  </Link>
                </h3>
                <p className="text-xs text-amber-300/80 mb-3">
                  {topThree[0].department}
                </p>
                <div className="inline-block text-xs font-bold px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 mb-4 shadow-sm">
                  {topThree[0].tag || 'Campus Sharing Legend - 28 Lends'}
                </div>
                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-amber-500/20 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Trust Score</span>
                    <span className="font-bold text-emerald-400 text-base">{topThree[0].overallScore}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Items Shared</span>
                    <span className="font-bold text-amber-400 text-base">{topThree[0].itemsShared || 28}</span>
                  </div>
                </div>
              </Card>

              {/* Rank 3: Bronze */}
              <Card className="order-3 p-6 text-center border-slate-700/80 relative overflow-hidden bg-gradient-to-b from-slate-800/80 to-slate-900/90 shadow-lg">
                <div className="w-16 h-16 rounded-full bg-slate-800 text-amber-600 font-bold text-xl flex items-center justify-center mx-auto mb-3 border-2 border-amber-700 shadow-sm">
                  🥉
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-500 block mb-1">
                  Rank 3
                </span>
                <h3 className="font-serif font-bold text-xl text-slate-100">
                  <Link to={`/profile/${topThree[2].id}`} className="hover:text-amber-400 transition-colors">
                    {topThree[2].name}
                  </Link>
                </h3>
                <p className="text-xs text-slate-400 mb-2">
                  {topThree[2].department}
                </p>
                <div className="inline-block text-[11px] font-bold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-600 mb-4">
                  {topThree[2].tag || '19 Lends - Bronze'}
                </div>
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Trust Score</span>
                    <span className="font-bold text-emerald-400 text-sm">{topThree[2].overallScore}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Items Shared</span>
                    <span className="font-bold text-slate-100 text-sm">{topThree[2].itemsShared || 19}</span>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Full Standings Table matching Fig. 6.4 */}
          <Card className="overflow-hidden shadow-md border-slate-800 bg-slate-900/90">
            <div className="p-4 px-6 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <h3 className="font-serif font-bold text-sm text-slate-100">
                  Campus Sharing Standings
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Verified Peers: {leaderboard.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold bg-slate-950/40">
                    <th className="py-3.5 px-4 w-12 text-center">Rank</th>
                    <th className="py-3.5 px-4">Student Name</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4 text-center">Items Shared</th>
                    <th className="py-3.5 px-4 text-center">Overall Trust Score</th>
                    <th className="py-3.5 px-4">Impact Metric</th>
                    <th className="py-3.5 px-4">Earned Badges</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {leaderboard.map((student, index) => (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-400">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-100">
                        <Link
                          to={`/profile/${student.id}`}
                          className="flex items-center gap-2.5 hover:text-amber-400 transition-colors"
                        >
                          <Avatar name={student.name} size="xs" />
                          <span>{student.name}</span>
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {student.department}
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-100">
                        {student.itemsShared || student.completedExchanges || (28 - index * 4)}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-400">
                        {student.overallScore || 98}%
                      </td>
                      <td className="py-3.5 px-4 text-slate-200 font-medium">
                        {student.impactMetric || `₹${(15000 - index * 2500).toLocaleString('en-IN')} Saved for Batchmates`}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {(student.earnedBadges || ['Top Lender', 'Quick Responder']).map(renderBadge)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Reputation Rules Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <Card className="p-5 border-slate-800 bg-slate-900/60 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>On-Time Returns</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Returning borrowed equipment on or before due date earns +3 trust points and prevents late return penalties.
              </p>
            </Card>

            <Card className="p-5 border-slate-800 bg-slate-900/60 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Lending & Sharing</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Successfully lending an item to a batchmate awards +10 lender reputation points and builds your campus standing.
              </p>
            </Card>

            <Card className="p-5 border-slate-800 bg-slate-900/60 space-y-2">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
                <Star className="w-4 h-4 text-sky-400" />
                <span>Mutual 5-Star Rating</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Receiving a 5-star mutual rating from your exchange peer grants an extra +4 trust bonus directly to your profile.
              </p>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
