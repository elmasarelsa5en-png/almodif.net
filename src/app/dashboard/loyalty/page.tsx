'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Award,
  Plus,
  Search,
  Users,
  Star,
  Gift,
  TrendingUp,
  Crown,
  Sparkles,
  Trophy,
  Target,
  Zap,
  Heart,
  Coins,
  Eye
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/auth-context';
import {
  getAllMemberships,
  getActiveRewards,
  getLoyaltyStats,
  createLoyaltyMembership,
  addPoints,
  type LoyaltyMembership,
  type LoyaltyReward,
  type LoyaltyStats,
  type MembershipTier,
  getTierLabel,
  getTierIcon,
  getTierColor,
  formatPoints,
  DEFAULT_LOYALTY_SETTINGS,
} from '@/lib/loyalty-system';

const TIER_CONFIG: Record<MembershipTier, { label: string; icon: string; color: string; gradient: string }> = {
  bronze: { 
    label: 'برونزي', 
    icon: '🥉', 
    color: '#CD7F32',
    gradient: 'from-amber-600/20 to-orange-600/20'
  },
  silver: { 
    label: 'فضي', 
    icon: '🥈', 
    color: '#C0C0C0',
    gradient: 'from-gray-400/20 to-gray-500/20'
  },
  gold: { 
    label: 'ذهبي', 
    icon: '🥇', 
    color: '#FFD700',
    gradient: 'from-yellow-400/20 to-amber-500/20'
  },
  platinum: { 
    label: 'بلاتيني', 
    icon: '💎', 
    color: '#E5E4E2',
    gradient: 'from-slate-300/20 to-gray-400/20'
  },
  diamond: { 
    label: 'ماسي', 
    icon: '💠', 
    color: '#B9F2FF',
    gradient: 'from-cyan-400/20 to-blue-400/20'
  },
};

export default function LoyaltyProgramPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<LoyaltyMembership[]>([]);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [stats, setStats] = useState<LoyaltyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'members' | 'rewards' | 'stats'>('members');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [membersData, rewardsData, statsData] = await Promise.all([
        getAllMemberships(),
        getActiveRewards(),
        getLoyaltyStats()
      ]);
      setMembers(membersData);
      setRewards(rewardsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading loyalty data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.membershipNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.guestPhone.includes(searchTerm);
    const matchesTier = filterTier === 'all' || member.tier === filterTier;
    return matchesSearch && matchesTier && member.isActive;
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-pink-900 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <Award className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">🎖️ برنامج الولاء والمكافآت</h1>
              <p className="text-purple-200">نظام شامل لإدارة ولاء النزلاء ومكافآتهم</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setActiveTab('members')}
            className={`flex-1 ${activeTab === 'members' 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
              : 'bg-white/10 hover:bg-white/20'}`}
          >
            <Users className="w-4 h-4 ml-2" />
            الأعضاء
          </Button>
          <Button
            onClick={() => setActiveTab('rewards')}
            className={`flex-1 ${activeTab === 'rewards' 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
              : 'bg-white/10 hover:bg-white/20'}`}
          >
            <Gift className="w-4 h-4 ml-2" />
            المكافآت
          </Button>
          <Button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 ${activeTab === 'stats' 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
              : 'bg-white/10 hover:bg-white/20'}`}
          >
            <TrendingUp className="w-4 h-4 ml-2" />
            الإحصائيات
          </Button>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70">إجمالي الأعضاء</p>
                    <p className="text-3xl font-bold text-white">{stats.totalMembers}</p>
                    <p className="text-xs text-white/60">نشط: {stats.activeMembers}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70">النقاط المتاحة</p>
                    <p className="text-2xl font-bold text-white">{formatPoints(stats.totalPointsAvailable)}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <Coins className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70">النقاط المكتسبة</p>
                    <p className="text-2xl font-bold text-white">{formatPoints(stats.totalPointsIssued)}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70">النقاط المستردة</p>
                    <p className="text-2xl font-bold text-white">{formatPoints(stats.totalPointsRedeemed)}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <Gift className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70">المكافآت النشطة</p>
                    <p className="text-3xl font-bold text-white">{stats.activeRewards}</p>
                    <p className="text-xs text-white/60">من {stats.totalRewards}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <>
            {/* Filters */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                    <Search className="w-5 h-5 text-white" />
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="بحث عن عضو..."
                      className="bg-white/10 border-white/30 text-white placeholder:text-white/50"
                    />
                  </div>

                  <select
                    value={filterTier}
                    onChange={(e) => setFilterTier(e.target.value)}
                    className="bg-white/10 border-white/30 text-white rounded-lg px-3 py-2"
                  >
                    <option value="all">جميع الدرجات</option>
                    <option value="bronze">🥉 برونزي</option>
                    <option value="silver">🥈 فضي</option>
                    <option value="gold">🥇 ذهبي</option>
                    <option value="platinum">💎 بلاتيني</option>
                    <option value="diamond">💠 ماسي</option>
                  </select>

                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <Plus className="w-4 h-4 ml-2" />
                    عضو جديد
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tier Distribution */}
            {stats && (
              <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Crown className="w-6 h-6" />
                    توزيع الأعضاء حسب الدرجات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-4">
                    {Object.entries(stats.membersByTier).map(([tier, count]) => {
                      const config = TIER_CONFIG[tier as MembershipTier];
                      return (
                        <div key={tier} className={`bg-gradient-to-br ${config.gradient} rounded-xl p-4 text-center border border-white/10`}>
                          <div className="text-4xl mb-2">{config.icon}</div>
                          <div className="text-white font-bold text-lg">{count}</div>
                          <div className="text-white/80 text-sm">{config.label}</div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Members List */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  قائمة الأعضاء ({filteredMembers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-white">جاري التحميل...</div>
                ) : filteredMembers.length === 0 ? (
                  <div className="text-center py-8 text-white/70">لا توجد أعضاء</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMembers.map((member) => {
                      const tierConfig = TIER_CONFIG[member.tier];
                      const tierBenefits = DEFAULT_LOYALTY_SETTINGS.tierBenefits[member.tier];
                      
                      return (
                        <div
                          key={member.id}
                          className={`bg-gradient-to-br ${tierConfig.gradient} rounded-xl p-5 border border-white/10 hover:border-white/30 transition-all`}
                        >
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="text-4xl">{tierConfig.icon}</div>
                              <div>
                                <h3 className="text-white font-bold text-lg">{member.guestName}</h3>
                                <p className="text-white/70 text-sm">{member.membershipNumber}</p>
                              </div>
                            </div>
                            <Badge className={`${tierConfig.gradient} border-white/20`}>
                              {tierConfig.label}
                            </Badge>
                          </div>

                          {/* Points */}
                          <div className="bg-black/20 rounded-lg p-3 mb-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white/80 text-sm">النقاط المتاحة</span>
                              <Sparkles className="w-4 h-4 text-yellow-400" />
                            </div>
                            <div className="text-white font-bold text-2xl">
                              {formatPoints(member.availablePoints)}
                            </div>
                            <div className="text-white/60 text-xs mt-1">
                              إجمالي مكتسب: {formatPoints(member.totalPoints)}
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="grid grid-cols-3 gap-2 mb-3">
                            <div className="bg-black/20 rounded-lg p-2 text-center">
                              <div className="text-white font-bold">{member.totalBookings}</div>
                              <div className="text-white/70 text-xs">حجز</div>
                            </div>
                            <div className="bg-black/20 rounded-lg p-2 text-center">
                              <div className="text-white font-bold">{member.totalNights}</div>
                              <div className="text-white/70 text-xs">ليلة</div>
                            </div>
                            <div className="bg-black/20 rounded-lg p-2 text-center">
                              <div className="text-white font-bold">{member.totalSpent.toLocaleString('ar-SA')}</div>
                              <div className="text-white/70 text-xs">ريال</div>
                            </div>
                          </div>

                          {/* Benefits */}
                          <div className="flex items-center justify-between text-xs text-white/70">
                            <span>✨ مضاعف النقاط: {tierBenefits.pointsMultiplier}x</span>
                            <span>🎁 خصم: {tierBenefits.discountPercentage}%</span>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 mt-4">
                            <Button size="sm" variant="outline" className="flex-1 border-white/30 text-white hover:bg-white/10">
                              <Eye className="w-4 h-4 ml-1" />
                              عرض
                            </Button>
                            <Button size="sm" className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700">
                              <Plus className="w-4 h-4 ml-1" />
                              نقاط
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Rewards Tab */}
        {activeTab === 'rewards' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">🎁 المكافآت المتاحة</h2>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Plus className="w-4 h-4 ml-2" />
                مكافأة جديدة
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map((reward) => {
                const tierConfig = TIER_CONFIG[reward.minTier];
                
                return (
                  <Card key={reward.id} className="bg-white/10 backdrop-blur-md border-white/20 overflow-hidden hover:border-white/40 transition-all">
                    <div className="h-40 bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-6xl">
                      {reward.type === 'discount' && '🎫'}
                      {reward.type === 'free_night' && '🏨'}
                      {reward.type === 'upgrade' && '⬆️'}
                      {reward.type === 'service' && '🛎️'}
                      {reward.type === 'points' && '⭐'}
                      {reward.type === 'gift' && '🎁'}
                    </div>
                    
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-white font-bold text-lg">{reward.title}</h3>
                        <Badge className="bg-yellow-500/20 text-yellow-300">
                          {formatPoints(reward.pointsCost)}
                        </Badge>
                      </div>

                      <p className="text-white/70 text-sm mb-4 line-clamp-2">{reward.description}</p>

                      <div className="space-y-2 mb-4">
                        {reward.value && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-white/70">القيمة</span>
                            <span className="text-white font-bold">{reward.value} ريال</span>
                          </div>
                        )}
                        
                        {reward.percentage && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-white/70">نسبة الخصم</span>
                            <span className="text-white font-bold">{reward.percentage}%</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/70">الحد الأدنى</span>
                          <Badge className={`${tierConfig.gradient}`}>
                            {tierConfig.icon} {tierConfig.label}
                          </Badge>
                        </div>

                        {reward.remainingAvailable !== undefined && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-white/70">متبقي</span>
                            <span className="text-white font-bold">{reward.remainingAvailable} / {reward.totalAvailable}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 border-white/30 text-white hover:bg-white/10">
                          تعديل
                        </Button>
                        <Button size="sm" className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600">
                          تفعيل
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && stats && (
          <div className="space-y-6">
            {/* Points Overview */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Coins className="w-6 h-6" />
                  إحصائيات النقاط
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-400/30">
                    <div className="text-green-300 text-sm mb-2">النقاط المكتسبة</div>
                    <div className="text-white font-bold text-2xl">{formatPoints(stats.totalPointsIssued)}</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-4 border border-blue-400/30">
                    <div className="text-blue-300 text-sm mb-2">النقاط المستردة</div>
                    <div className="text-white font-bold text-2xl">{formatPoints(stats.totalPointsRedeemed)}</div>
                  </div>
                  <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-xl p-4 border border-red-400/30">
                    <div className="text-red-300 text-sm mb-2">النقاط المنتهية</div>
                    <div className="text-white font-bold text-2xl">{formatPoints(stats.totalPointsExpired)}</div>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-xl p-4 border border-yellow-400/30">
                    <div className="text-yellow-300 text-sm mb-2">النقاط المتاحة</div>
                    <div className="text-white font-bold text-2xl">{formatPoints(stats.totalPointsAvailable)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Averages */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-6 h-6" />
                  المتوسطات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-400/30">
                    <div className="text-purple-300 text-sm mb-2">متوسط النقاط لكل عضو</div>
                    <div className="text-white font-bold text-2xl">{formatPoints(Math.round(stats.averagePointsPerMember))}</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-400/30">
                    <div className="text-green-300 text-sm mb-2">متوسط الإنفاق لكل عضو</div>
                    <div className="text-white font-bold text-2xl">{Math.round(stats.averageSpendingPerMember).toLocaleString('ar-SA')} ريال</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Redemptions */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Gift className="w-6 h-6" />
                  إحصائيات الاسترداد
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-4 border border-blue-400/30">
                    <div className="text-blue-300 text-sm mb-2">متاحة</div>
                    <div className="text-white font-bold text-2xl">{stats.redemptionsByStatus.available}</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-400/30">
                    <div className="text-green-300 text-sm mb-2">مستردة</div>
                    <div className="text-white font-bold text-2xl">{stats.redemptionsByStatus.redeemed}</div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-500/20 to-slate-500/20 rounded-xl p-4 border border-gray-400/30">
                    <div className="text-gray-300 text-sm mb-2">منتهية</div>
                    <div className="text-white font-bold text-2xl">{stats.redemptionsByStatus.expired}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
