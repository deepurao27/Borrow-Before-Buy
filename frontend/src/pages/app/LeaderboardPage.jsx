import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { PaperTag } from '../../components/ui/PaperTag';
import { Skeleton } from '../../components/ui/Skeleton';
import { Trophy, Award, Sparkles, ShieldCheck, Star, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LeaderboardPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['campus-leaderboard'],
    queryFn: async () => {
      const res = await apiClient('/rewards/leaderboard');
      return res.data?.leaderboard || [];
    }
  });

  const leaderboard = data || [];
  const topThree = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  const getTierColor = (tier) => {
    switch (tier) {
      case 'Campus Pillar':
        return 'bg-terracotta/15 text-terracotta border-terracotta/40';
      case 'Reliable Peer':
        return 'bg-sage/15 text-sage border-sage/40';
      default:
        return 'bg-marigold/15 text-marigold-dark border-marigold/40';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="handwritten-note block text-2xl text-terracotta">Campus Pillars</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-ink dark:text-ink-dark">
          Campus Trust & Reliability Leaderboard
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted dark:text-ink-darkMuted leading-relaxed">
          Celebrating the most reliable lenders, on-time borrowers, and helpful peers on your campus noticeboard.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      ) : (
        <>
          {/* Top 3 Podium Cards */}
          {topThree.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
              {/* 2nd Place */}
              {topThree[1] && (
                <Card className="order-2 md:order-1 p-6 text-center border-paper-sand dark:border-paper-sandDark relative overflow-hidden bg-gradient-to-b from-paper-card to-paper-sand/20 dark:from-paper-cardDark dark:to-paper-sandDark/10 shadow-sm">
                  <div className="absolute top-3 left-3 text-xs font-mono font-bold text-ink-muted">#2</div>
                  <div className="w-16 h-16 rounded-full bg-paper-sand dark:bg-paper-sandDark text-ink dark:text-ink-dark font-bold text-xl flex items-center justify-center mx-auto mb-3 border-2 border-slate-300">
                    🥈
                  </div>
                  <h3 className="font-serif font-bold text-lg text-ink dark:text-ink-dark">
                    <Link to={`/profile/${topThree[1].id}`} className="hover:text-terracotta transition-colors">
                      {topThree[1].name}
                    </Link>
                  </h3>
                  <p className="text-xs text-ink-muted dark:text-ink-darkMuted mb-2">
                    {topThree[1].department} • Year {topThree[1].year}
                  </p>
                  <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getTierColor(topThree[1].tier)} mb-4`}>
                    {topThree[1].tier}
                  </span>
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-paper-sand dark:border-paper-sandDark text-xs">
                    <div>
                      <span className="text-[10px] text-ink-muted block">Trust Score</span>
                      <span className="font-bold text-sage">{topThree[1].averageTrust}/100</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-ink-muted block">Exchanges</span>
                      <span className="font-bold text-ink dark:text-ink-dark">{topThree[1].completedExchanges}</span>
                    </div>
                  </div>
                </Card>
              )}

              {/* 1st Place (Center Podium) */}
              {topThree[0] && (
                <Card className="order-1 md:order-2 p-8 text-center border-marigold/60 relative overflow-hidden bg-gradient-to-b from-marigold/10 via-paper-card to-marigold/5 dark:from-marigold/15 dark:to-paper-cardDark shadow-paperHover md:-translate-y-4">
                  <div className="tape-strip" />
                  <div className="w-20 h-20 rounded-full bg-marigold text-ink font-bold text-3xl flex items-center justify-center mx-auto mb-3 shadow-md border-2 border-white dark:border-paper-cardDark">
                    👑
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-terracotta block mb-1">
                    #1 Campus Star
                  </span>
                  <h3 className="font-serif font-black text-2xl text-ink dark:text-ink-dark">
                    <Link to={`/profile/${topThree[0].id}`} className="hover:text-terracotta transition-colors">
                      {topThree[0].name}
                    </Link>
                  </h3>
                  <p className="text-xs text-ink-muted dark:text-ink-darkMuted mb-3">
                    {topThree[0].department} • Year {topThree[0].year}
                  </p>
                  <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full border ${getTierColor(topThree[0].tier)} mb-5 shadow-xs`}>
                    {topThree[0].tier}
                  </span>
                  <div className="grid grid-cols-3 gap-2 pt-4 border-t border-marigold/30 text-xs">
                    <div>
                      <span className="text-[10px] text-ink-muted block">Trust</span>
                      <span className="font-bold text-sage text-sm">{topThree[0].averageTrust}/100</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-ink-muted block">Exchanges</span>
                      <span className="font-bold text-ink dark:text-ink-dark text-sm">{topThree[0].completedExchanges}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-ink-muted block">Points</span>
                      <span className="font-bold text-terracotta text-sm">{topThree[0].rewardPoints}</span>
                    </div>
                  </div>
                </Card>
              )}

              {/* 3rd Place */}
              {topThree[2] && (
                <Card className="order-3 p-6 text-center border-paper-sand dark:border-paper-sandDark relative overflow-hidden bg-gradient-to-b from-paper-card to-paper-sand/20 dark:from-paper-cardDark dark:to-paper-sandDark/10 shadow-sm">
                  <div className="absolute top-3 left-3 text-xs font-mono font-bold text-ink-muted">#3</div>
                  <div className="w-16 h-16 rounded-full bg-paper-sand dark:bg-paper-sandDark text-ink dark:text-ink-dark font-bold text-xl flex items-center justify-center mx-auto mb-3 border-2 border-amber-700">
                    🥉
                  </div>
                  <h3 className="font-serif font-bold text-lg text-ink dark:text-ink-dark">
                    <Link to={`/profile/${topThree[2].id}`} className="hover:text-terracotta transition-colors">
                      {topThree[2].name}
                    </Link>
                  </h3>
                  <p className="text-xs text-ink-muted dark:text-ink-darkMuted mb-2">
                    {topThree[2].department} • Year {topThree[2].year}
                  </p>
                  <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getTierColor(topThree[2].tier)} mb-4`}>
                    {topThree[2].tier}
                  </span>
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-paper-sand dark:border-paper-sandDark text-xs">
                    <div>
                      <span className="text-[10px] text-ink-muted block">Trust Score</span>
                      <span className="font-bold text-sage">{topThree[2].averageTrust}/100</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-ink-muted block">Exchanges</span>
                      <span className="font-bold text-ink dark:text-ink-dark">{topThree[2].completedExchanges}</span>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Full Table */}
          <Card className="overflow-hidden shadow-sm">
            <div className="p-4 px-6 bg-paper-sand/40 dark:bg-paper-sandDark/30 border-b border-paper-sand dark:border-paper-sandDark flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-marigold" />
                <h3 className="font-serif font-bold text-sm text-ink dark:text-ink-dark">
                  Campus Standings
                </h3>
              </div>
              <span className="text-xs text-ink-muted dark:text-ink-darkMuted font-mono">
                Total Peers: {leaderboard.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-paper-sand dark:border-paper-sandDark text-ink-muted dark:text-ink-darkMuted uppercase tracking-wider font-semibold bg-paper-sand/20 dark:bg-paper-sandDark/10">
                    <th className="py-3 px-4 w-12 text-center">Rank</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4 text-center">Reputation Tier</th>
                    <th className="py-3 px-4 text-center">Trust Rating</th>
                    <th className="py-3 px-4 text-center">Completed Exchanges</th>
                    <th className="py-3 px-4 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-paper-sand/50 dark:divide-paper-sandDark/50">
                  {leaderboard.map((student, index) => (
                    <tr
                      key={student.id}
                      className="hover:bg-paper-sand/20 dark:hover:bg-paper-sandDark/20 transition-colors"
                    >
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-ink-muted">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-ink dark:text-ink-dark">
                        <Link
                          to={`/profile/${student.id}`}
                          className="flex items-center gap-2.5 hover:text-terracotta transition-colors"
                        >
                          <Avatar name={student.name} size="xs" />
                          <span>{student.name}</span>
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-ink-muted dark:text-ink-darkMuted">
                        {student.department} (Yr {student.year})
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getTierColor(student.tier)}`}>
                          {student.tier}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-sage">
                        {student.averageTrust} / 100
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-ink dark:text-ink-dark">
                        {student.completedExchanges}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-terracotta">
                        {student.rewardPoints} pts
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Reputation Rules Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <Card className="p-5 border-paper-sand space-y-2">
              <div className="flex items-center gap-2 text-sage font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>On-Time Returns</span>
              </div>
              <p className="text-xs text-ink-muted dark:text-ink-darkMuted leading-relaxed">
                Returning borrowed equipment on or before due date earns +5 trust points and prevents late return penalties.
              </p>
            </Card>

            <Card className="p-5 border-paper-sand space-y-2">
              <div className="flex items-center gap-2 text-terracotta font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Lending & Sharing</span>
              </div>
              <p className="text-xs text-ink-muted dark:text-ink-darkMuted leading-relaxed">
                Successfully lending an item to a batchmate awards +10 lender reputation points and builds your campus standing.
              </p>
            </Card>

            <Card className="p-5 border-paper-sand space-y-2">
              <div className="flex items-center gap-2 text-marigold font-bold text-xs uppercase tracking-wider">
                <Star className="w-4 h-4 text-marigold" />
                <span>5-Star Bonus</span>
              </div>
              <p className="text-xs text-ink-muted dark:text-ink-darkMuted leading-relaxed">
                Receiving a 5-star mutual rating from your exchange peer grants an extra +3 trust bonus directly to your profile.
              </p>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
