import { useGameStore } from '@/store/gameStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Lock, Star, Award, Crown } from 'lucide-react';
import { achievements, getAchievementRarityColor } from '@/data/achievements';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

export function AchievementsView() {
  const { company } = useGameStore();

  if (!company) return null;

  // Use persisted unlocked achievements from company state
  const unlockedAchievements = useMemo(() => {
    return new Set(company.unlockedAchievements);
  }, [company.unlockedAchievements]);

  const totalAchievements = achievements.length;
  const unlockedCount = unlockedAchievements.size;
  const progressPercent = (unlockedCount / totalAchievements) * 100;

  const rarityOrder = ['legendary', 'epic', 'rare', 'common'] as const;

  const groupedAchievements = useMemo(() => {
    const grouped: Record<string, typeof achievements> = {};

    rarityOrder.forEach((rarity) => {
      grouped[rarity] = achievements.filter((a) => a.rarity === rarity);
    });

    return grouped;
  }, []);

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return <Crown className="w-5 h-5" />;
      case 'epic':
        return <Star className="w-5 h-5" />;
      case 'rare':
        return <Award className="w-5 h-5" />;
      default:
        return <Trophy className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Achievements</h1>
        <p className="text-zinc-400 mt-1">
          {unlockedCount} of {totalAchievements} unlocked
        </p>
      </div>

      {/* Progress */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-zinc-400">Overall Progress</span>
            <span className="text-white font-semibold">{progressPercent.toFixed(0)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </CardContent>
      </Card>

      {/* Achievement Groups */}
      <div className="space-y-6">
        {rarityOrder.map((rarity) => {
          const group = groupedAchievements[rarity];
          const groupUnlocked = group.filter((a) => unlockedAchievements.has(a.id)).length;

          return (
            <div key={rarity}>
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${getAchievementRarityColor(rarity)}20` }}
                >
                  <div style={{ color: getAchievementRarityColor(rarity) }}>
                    {getRarityIcon(rarity)}
                  </div>
                </div>
                <h2
                  className="text-xl font-semibold capitalize"
                  style={{ color: getAchievementRarityColor(rarity) }}
                >
                  {rarity}
                </h2>
                <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                  {groupUnlocked}/{group.length}
                </Badge>
              </div>

              <div className="grid gap-3">
                {group.map((achievement) => {
                  const isUnlocked = unlockedAchievements.has(achievement.id);

                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card
                        className={`border-zinc-800 transition-all ${
                          isUnlocked ? 'bg-zinc-900/80' : 'bg-zinc-900/30 opacity-60'
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div
                              className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                isUnlocked ? '' : 'bg-zinc-800'
                              }`}
                              style={{
                                backgroundColor: isUnlocked
                                  ? `${getAchievementRarityColor(rarity)}30`
                                  : undefined,
                              }}
                            >
                              {isUnlocked ? (
                                <Trophy
                                  className="w-6 h-6"
                                  style={{ color: getAchievementRarityColor(rarity) }}
                                />
                              ) : (
                                <Lock className="w-5 h-5 text-zinc-600" />
                              )}
                            </div>

                            <div className="flex-1">
                              <h3
                                className={`font-semibold ${isUnlocked ? 'text-white' : 'text-zinc-500'}`}
                              >
                                {achievement.name}
                              </h3>
                              <p
                                className={`text-sm mt-1 ${isUnlocked ? 'text-zinc-400' : 'text-zinc-600'}`}
                              >
                                {achievement.description}
                              </p>
                            </div>

                            {isUnlocked && (
                              <Badge
                                variant="outline"
                                style={{
                                  borderColor: getAchievementRarityColor(rarity),
                                  color: getAchievementRarityColor(rarity),
                                }}
                              >
                                Unlocked
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
