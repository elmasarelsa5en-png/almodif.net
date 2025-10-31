import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp,
  increment,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';

// ============================================
// TYPES & INTERFACES
// ============================================

export type MembershipTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
export type RewardType = 'discount' | 'free_night' | 'upgrade' | 'service' | 'points' | 'gift';
export type PointTransactionType = 'earned' | 'redeemed' | 'expired' | 'bonus' | 'adjustment';
export type RewardStatus = 'available' | 'redeemed' | 'expired' | 'pending';

/**
 * عضوية الولاء للنزيل
 */
export interface LoyaltyMembership {
  id?: string;
  guestId: string;
  guestName: string;
  guestEmail?: string;
  guestPhone: string;
  
  // معلومات العضوية
  membershipNumber: string; // LOY-YYYY-NNNNNN
  tier: MembershipTier;
  tierExpiryDate?: Date;
  
  // النقاط
  totalPoints: number; // إجمالي النقاط المكتسبة
  availablePoints: number; // النقاط المتاحة للاستخدام
  redeemedPoints: number; // النقاط المستخدمة
  expiredPoints: number; // النقاط المنتهية
  
  // الإحصائيات
  totalBookings: number; // عدد الحجوزات
  totalSpent: number; // إجمالي المبلغ المصروف
  totalNights: number; // عدد الليالي
  lastBookingDate?: Date;
  joinDate: Date;
  
  // الحالة
  isActive: boolean;
  isSuspended: boolean;
  suspensionReason?: string;
  
  // تواريخ
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  createdByName: string;
}

/**
 * معاملة نقاط الولاء
 */
export interface PointTransaction {
  id?: string;
  membershipId: string;
  guestId: string;
  guestName: string;
  
  // تفاصيل المعاملة
  type: PointTransactionType;
  points: number;
  balanceBefore: number;
  balanceAfter: number;
  
  // السبب والمرجع
  reason: string;
  description?: string;
  referenceType?: 'booking' | 'reward' | 'manual' | 'bonus' | 'expiry';
  referenceId?: string; // ID الحجز أو المكافأة
  
  // التاريخ
  transactionDate: Date;
  expiryDate?: Date; // للنقاط المكتسبة
  
  // من قام بالعملية
  performedBy?: string;
  performedByName?: string;
  
  createdAt: Date;
}

/**
 * المكافأة
 */
export interface LoyaltyReward {
  id?: string;
  
  // معلومات المكافأة
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  type: RewardType;
  
  // تكلفة النقاط
  pointsCost: number;
  
  // القيمة
  value?: number; // قيمة الخصم أو المكافأة (SAR)
  percentage?: number; // نسبة الخصم %
  
  // الشروط
  minTier: MembershipTier; // الحد الأدنى للدرجة
  minSpending?: number; // الحد الأدنى للإنفاق
  minNights?: number; // الحد الأدنى لعدد الليالي
  
  // الصلاحية
  validFrom: Date;
  validTo: Date;
  isActive: boolean;
  
  // العدد المتاح
  totalAvailable?: number; // العدد الكلي
  remainingAvailable?: number; // المتبقي
  
  // الصورة
  imageUrl?: string;
  
  // الشروط الإضافية
  termsAndConditions?: string;
  
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  createdByName: string;
}

/**
 * استرداد المكافأة
 */
export interface RewardRedemption {
  id?: string;
  
  // المكافأة والعضو
  rewardId: string;
  rewardTitle: string;
  membershipId: string;
  guestId: string;
  guestName: string;
  
  // تفاصيل الاسترداد
  pointsUsed: number;
  status: RewardStatus;
  
  // الصلاحية والاستخدام
  redemptionDate: Date;
  expiryDate: Date;
  usedDate?: Date;
  usedInBooking?: string; // ID الحجز
  
  // الكود
  redemptionCode: string; // كود فريد للمكافأة
  
  // ملاحظات
  notes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * إعدادات نظام الولاء
 */
export interface LoyaltySettings {
  // نسب كسب النقاط
  pointsPerSAR: number; // نقاط لكل ريال
  pointsPerNight: number; // نقاط لكل ليلة
  bonusPointsPerReview: number; // نقاط مكافأة للتقييم
  
  // صلاحية النقاط
  pointsExpiryMonths: number; // عدد الأشهر قبل انتهاء النقاط
  
  // شروط الترقية للدرجات
  tierRequirements: {
    bronze: { minPoints: number; minSpending: number; minNights: number };
    silver: { minPoints: number; minSpending: number; minNights: number };
    gold: { minPoints: number; minSpending: number; minNights: number };
    platinum: { minPoints: number; minSpending: number; minNights: number };
    diamond: { minPoints: number; minSpending: number; minNights: number };
  };
  
  // مزايا الدرجات
  tierBenefits: {
    bronze: { pointsMultiplier: number; discountPercentage: number };
    silver: { pointsMultiplier: number; discountPercentage: number };
    gold: { pointsMultiplier: number; discountPercentage: number };
    platinum: { pointsMultiplier: number; discountPercentage: number };
    diamond: { pointsMultiplier: number; discountPercentage: number };
  };
}

/**
 * إحصائيات نظام الولاء
 */
export interface LoyaltyStats {
  // الأعضاء
  totalMembers: number;
  activeMembers: number;
  membersByTier: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
    diamond: number;
  };
  
  // النقاط
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  totalPointsExpired: number;
  totalPointsAvailable: number;
  
  // المكافآت
  totalRewards: number;
  activeRewards: number;
  totalRedemptions: number;
  redemptionsByStatus: {
    available: number;
    redeemed: number;
    expired: number;
  };
  
  // المالية
  totalValueRedeemed: number; // قيمة المكافآت المستردة
  averagePointsPerMember: number;
  averageSpendingPerMember: number;
}

// ============================================
// DEFAULT SETTINGS
// ============================================

export const DEFAULT_LOYALTY_SETTINGS: LoyaltySettings = {
  pointsPerSAR: 1, // نقطة واحدة لكل ريال
  pointsPerNight: 10, // 10 نقاط لكل ليلة
  bonusPointsPerReview: 50, // 50 نقطة مكافأة للتقييم
  pointsExpiryMonths: 12, // النقاط تنتهي بعد سنة
  
  tierRequirements: {
    bronze: { minPoints: 0, minSpending: 0, minNights: 0 },
    silver: { minPoints: 1000, minSpending: 5000, minNights: 5 },
    gold: { minPoints: 3000, minSpending: 15000, minNights: 15 },
    platinum: { minPoints: 7000, minSpending: 35000, minNights: 35 },
    diamond: { minPoints: 15000, minSpending: 75000, minNights: 75 },
  },
  
  tierBenefits: {
    bronze: { pointsMultiplier: 1, discountPercentage: 0 },
    silver: { pointsMultiplier: 1.2, discountPercentage: 5 },
    gold: { pointsMultiplier: 1.5, discountPercentage: 10 },
    platinum: { pointsMultiplier: 2, discountPercentage: 15 },
    diamond: { pointsMultiplier: 3, discountPercentage: 20 },
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * توليد رقم عضوية فريد
 */
export async function generateMembershipNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const membershipsRef = collection(db, 'loyalty_memberships');
  const q = query(
    membershipsRef,
    where('membershipNumber', '>=', `LOY-${year}-000000`),
    where('membershipNumber', '<=', `LOY-${year}-999999`),
    orderBy('membershipNumber', 'desc')
  );
  
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    return `LOY-${year}-000001`;
  }
  
  const lastNumber = snapshot.docs[0].data().membershipNumber;
  const lastSeq = parseInt(lastNumber.split('-')[2]);
  const newSeq = (lastSeq + 1).toString().padStart(6, '0');
  
  return `LOY-${year}-${newSeq}`;
}

/**
 * توليد كود استرداد فريد
 */
export function generateRedemptionCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * حساب الدرجة المناسبة بناءً على الإحصائيات
 */
export function calculateTier(
  totalPoints: number, 
  totalSpent: number, 
  totalNights: number,
  settings: LoyaltySettings = DEFAULT_LOYALTY_SETTINGS
): MembershipTier {
  const { tierRequirements } = settings;
  
  if (
    totalPoints >= tierRequirements.diamond.minPoints &&
    totalSpent >= tierRequirements.diamond.minSpending &&
    totalNights >= tierRequirements.diamond.minNights
  ) {
    return 'diamond';
  }
  
  if (
    totalPoints >= tierRequirements.platinum.minPoints &&
    totalSpent >= tierRequirements.platinum.minSpending &&
    totalNights >= tierRequirements.platinum.minNights
  ) {
    return 'platinum';
  }
  
  if (
    totalPoints >= tierRequirements.gold.minPoints &&
    totalSpent >= tierRequirements.gold.minSpending &&
    totalNights >= tierRequirements.gold.minNights
  ) {
    return 'gold';
  }
  
  if (
    totalPoints >= tierRequirements.silver.minPoints &&
    totalSpent >= tierRequirements.silver.minSpending &&
    totalNights >= tierRequirements.silver.minNights
  ) {
    return 'silver';
  }
  
  return 'bronze';
}

/**
 * الحصول على اسم الدرجة
 */
export function getTierLabel(tier: MembershipTier): string {
  const labels: Record<MembershipTier, string> = {
    bronze: 'برونزي',
    silver: 'فضي',
    gold: 'ذهبي',
    platinum: 'بلاتيني',
    diamond: 'ماسي',
  };
  return labels[tier];
}

/**
 * الحصول على لون الدرجة
 */
export function getTierColor(tier: MembershipTier): string {
  const colors: Record<MembershipTier, string> = {
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
    platinum: '#E5E4E2',
    diamond: '#B9F2FF',
  };
  return colors[tier];
}

/**
 * الحصول على أيقونة الدرجة
 */
export function getTierIcon(tier: MembershipTier): string {
  const icons: Record<MembershipTier, string> = {
    bronze: '🥉',
    silver: '🥈',
    gold: '🥇',
    platinum: '💎',
    diamond: '💠',
  };
  return icons[tier];
}

// ============================================
// MEMBERSHIP FUNCTIONS
// ============================================

/**
 * إنشاء عضوية ولاء جديدة
 */
export async function createLoyaltyMembership(
  data: Omit<LoyaltyMembership, 'id' | 'membershipNumber' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const membershipNumber = await generateMembershipNumber();
  
  const membership: Omit<LoyaltyMembership, 'id'> = {
    ...data,
    membershipNumber,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  const docRef = await addDoc(collection(db, 'loyalty_memberships'), {
    ...membership,
    createdAt: Timestamp.fromDate(membership.createdAt),
    updatedAt: Timestamp.fromDate(membership.updatedAt),
    joinDate: Timestamp.fromDate(membership.joinDate),
    lastBookingDate: membership.lastBookingDate ? Timestamp.fromDate(membership.lastBookingDate) : null,
    tierExpiryDate: membership.tierExpiryDate ? Timestamp.fromDate(membership.tierExpiryDate) : null,
  });
  
  return docRef.id;
}

/**
 * تحديث عضوية الولاء
 */
export async function updateLoyaltyMembership(
  id: string,
  updates: Partial<LoyaltyMembership>
): Promise<void> {
  const docRef = doc(db, 'loyalty_memberships', id);
  const updateData: any = {
    ...updates,
    updatedAt: Timestamp.now(),
  };
  
  // تحويل التواريخ
  if (updates.lastBookingDate) {
    updateData.lastBookingDate = Timestamp.fromDate(updates.lastBookingDate);
  }
  if (updates.tierExpiryDate) {
    updateData.tierExpiryDate = Timestamp.fromDate(updates.tierExpiryDate);
  }
  
  await updateDoc(docRef, updateData);
}

/**
 * الحصول على عضوية بواسطة ID النزيل
 */
export async function getMembershipByGuestId(guestId: string): Promise<LoyaltyMembership | null> {
  const q = query(
    collection(db, 'loyalty_memberships'),
    where('guestId', '==', guestId)
  );
  
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) return null;
  
  const doc = snapshot.docs[0];
  const data = doc.data();
  
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate(),
    joinDate: data.joinDate?.toDate(),
    lastBookingDate: data.lastBookingDate?.toDate(),
    tierExpiryDate: data.tierExpiryDate?.toDate(),
  } as LoyaltyMembership;
}

/**
 * إضافة نقاط للعضو
 */
export async function addPoints(
  membershipId: string,
  points: number,
  reason: string,
  description?: string,
  referenceType?: string,
  referenceId?: string,
  performedBy?: string,
  performedByName?: string
): Promise<void> {
  const membershipRef = doc(db, 'loyalty_memberships', membershipId);
  const membershipSnap = await getDoc(membershipRef);
  
  if (!membershipSnap.exists()) {
    throw new Error('Membership not found');
  }
  
  const membership = membershipSnap.data() as LoyaltyMembership;
  const balanceBefore = membership.availablePoints;
  const balanceAfter = balanceBefore + points;
  
  // حساب تاريخ الانتهاء (سنة من الآن)
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + DEFAULT_LOYALTY_SETTINGS.pointsExpiryMonths);
  
  // تحديث العضوية
  await updateDoc(membershipRef, {
    totalPoints: increment(points),
    availablePoints: increment(points),
    updatedAt: Timestamp.now(),
  });
  
  // إضافة معاملة
  const transaction: Omit<PointTransaction, 'id'> = {
    membershipId,
    guestId: membership.guestId,
    guestName: membership.guestName,
    type: 'earned',
    points,
    balanceBefore,
    balanceAfter,
    reason,
    description,
    referenceType: referenceType as any,
    referenceId,
    transactionDate: new Date(),
    expiryDate,
    performedBy,
    performedByName,
    createdAt: new Date(),
  };
  
  await addDoc(collection(db, 'point_transactions'), {
    ...transaction,
    transactionDate: Timestamp.fromDate(transaction.transactionDate),
    expiryDate: Timestamp.fromDate(expiryDate),
    createdAt: Timestamp.now(),
  });
}

/**
 * خصم نقاط من العضو
 */
export async function deductPoints(
  membershipId: string,
  points: number,
  reason: string,
  description?: string,
  referenceType?: string,
  referenceId?: string,
  performedBy?: string,
  performedByName?: string
): Promise<void> {
  const membershipRef = doc(db, 'loyalty_memberships', membershipId);
  const membershipSnap = await getDoc(membershipRef);
  
  if (!membershipSnap.exists()) {
    throw new Error('Membership not found');
  }
  
  const membership = membershipSnap.data() as LoyaltyMembership;
  const balanceBefore = membership.availablePoints;
  
  if (balanceBefore < points) {
    throw new Error('Insufficient points');
  }
  
  const balanceAfter = balanceBefore - points;
  
  // تحديث العضوية
  await updateDoc(membershipRef, {
    availablePoints: increment(-points),
    redeemedPoints: increment(points),
    updatedAt: Timestamp.now(),
  });
  
  // إضافة معاملة
  const transaction: Omit<PointTransaction, 'id'> = {
    membershipId,
    guestId: membership.guestId,
    guestName: membership.guestName,
    type: 'redeemed',
    points: -points,
    balanceBefore,
    balanceAfter,
    reason,
    description,
    referenceType: referenceType as any,
    referenceId,
    transactionDate: new Date(),
    performedBy,
    performedByName,
    createdAt: new Date(),
  };
  
  await addDoc(collection(db, 'point_transactions'), {
    ...transaction,
    transactionDate: Timestamp.fromDate(transaction.transactionDate),
    createdAt: Timestamp.now(),
  });
}

/**
 * معالجة حجز جديد (إضافة نقاط)
 */
export async function processBookingPoints(
  guestId: string,
  bookingId: string,
  amount: number,
  nights: number,
  performedBy: string,
  performedByName: string
): Promise<void> {
  const membership = await getMembershipByGuestId(guestId);
  
  if (!membership || !membership.isActive) return;
  
  // حساب النقاط
  const tierMultiplier = DEFAULT_LOYALTY_SETTINGS.tierBenefits[membership.tier].pointsMultiplier;
  const pointsFromAmount = Math.floor(amount * DEFAULT_LOYALTY_SETTINGS.pointsPerSAR * tierMultiplier);
  const pointsFromNights = nights * DEFAULT_LOYALTY_SETTINGS.pointsPerNight;
  const totalPoints = pointsFromAmount + pointsFromNights;
  
  // إضافة النقاط
  await addPoints(
    membership.id!,
    totalPoints,
    'نقاط الحجز',
    `حجز بقيمة ${amount} ريال لمدة ${nights} ليلة`,
    'booking',
    bookingId,
    performedBy,
    performedByName
  );
  
  // تحديث إحصائيات العضوية
  const newTotalSpent = membership.totalSpent + amount;
  const newTotalNights = membership.totalNights + nights;
  const newTotalBookings = membership.totalBookings + 1;
  const newTotalPoints = membership.totalPoints + totalPoints;
  
  // حساب الدرجة الجديدة
  const newTier = calculateTier(newTotalPoints, newTotalSpent, newTotalNights);
  
  await updateLoyaltyMembership(membership.id!, {
    totalSpent: newTotalSpent,
    totalNights: newTotalNights,
    totalBookings: newTotalBookings,
    lastBookingDate: new Date(),
    tier: newTier,
  });
}

// ============================================
// REWARD FUNCTIONS
// ============================================

/**
 * إنشاء مكافأة جديدة
 */
export async function createReward(
  data: Omit<LoyaltyReward, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const reward: Omit<LoyaltyReward, 'id'> = {
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  const docRef = await addDoc(collection(db, 'loyalty_rewards'), {
    ...reward,
    validFrom: Timestamp.fromDate(reward.validFrom),
    validTo: Timestamp.fromDate(reward.validTo),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  
  return docRef.id;
}

/**
 * استرداد مكافأة
 */
export async function redeemReward(
  rewardId: string,
  membershipId: string,
  performedBy: string,
  performedByName: string
): Promise<string> {
  // الحصول على المكافأة
  const rewardDoc = await getDoc(doc(db, 'loyalty_rewards', rewardId));
  if (!rewardDoc.exists()) {
    throw new Error('Reward not found');
  }
  
  const reward = rewardDoc.data() as LoyaltyReward;
  
  // الحصول على العضوية
  const membershipDoc = await getDoc(doc(db, 'loyalty_memberships', membershipId));
  if (!membershipDoc.exists()) {
    throw new Error('Membership not found');
  }
  
  const membership = membershipDoc.data() as LoyaltyMembership;
  
  // التحقق من النقاط
  if (membership.availablePoints < reward.pointsCost) {
    throw new Error('Insufficient points');
  }
  
  // التحقق من الدرجة
  const tierOrder: MembershipTier[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
  const memberTierIndex = tierOrder.indexOf(membership.tier);
  const minTierIndex = tierOrder.indexOf(reward.minTier);
  
  if (memberTierIndex < minTierIndex) {
    throw new Error('Insufficient tier level');
  }
  
  // التحقق من التوفر
  if (reward.remainingAvailable !== undefined && reward.remainingAvailable <= 0) {
    throw new Error('Reward not available');
  }
  
  // خصم النقاط
  await deductPoints(
    membershipId,
    reward.pointsCost,
    `استرداد مكافأة: ${reward.title}`,
    undefined,
    'reward',
    rewardId,
    performedBy,
    performedByName
  );
  
  // تحديث المكافأة
  if (reward.remainingAvailable !== undefined) {
    await updateDoc(doc(db, 'loyalty_rewards', rewardId), {
      remainingAvailable: increment(-1),
    });
  }
  
  // إنشاء سجل الاسترداد
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + 3); // صالحة لمدة 3 شهور
  
  const redemption: Omit<RewardRedemption, 'id'> = {
    rewardId,
    rewardTitle: reward.title,
    membershipId,
    guestId: membership.guestId,
    guestName: membership.guestName,
    pointsUsed: reward.pointsCost,
    status: 'available',
    redemptionDate: new Date(),
    expiryDate,
    redemptionCode: generateRedemptionCode(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  const redemptionRef = await addDoc(collection(db, 'reward_redemptions'), {
    ...redemption,
    redemptionDate: Timestamp.fromDate(redemption.redemptionDate),
    expiryDate: Timestamp.fromDate(expiryDate),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  
  return redemptionRef.id;
}

/**
 * الحصول على جميع المكافآت النشطة
 */
export async function getActiveRewards(): Promise<LoyaltyReward[]> {
  const now = new Date();
  const q = query(
    collection(db, 'loyalty_rewards'),
    where('isActive', '==', true),
    where('validTo', '>=', Timestamp.fromDate(now)),
    orderBy('validTo', 'asc'),
    orderBy('pointsCost', 'asc')
  );
  
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      validFrom: data.validFrom?.toDate(),
      validTo: data.validTo?.toDate(),
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as LoyaltyReward;
  });
}

/**
 * الحصول على جميع الأعضاء
 */
export async function getAllMemberships(): Promise<LoyaltyMembership[]> {
  const snapshot = await getDocs(
    query(collection(db, 'loyalty_memberships'), orderBy('createdAt', 'desc'))
  );
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
      joinDate: data.joinDate?.toDate(),
      lastBookingDate: data.lastBookingDate?.toDate(),
      tierExpiryDate: data.tierExpiryDate?.toDate(),
    } as LoyaltyMembership;
  });
}

/**
 * الحصول على معاملات النقاط لعضو
 */
export async function getMemberTransactions(membershipId: string): Promise<PointTransaction[]> {
  const q = query(
    collection(db, 'point_transactions'),
    where('membershipId', '==', membershipId),
    orderBy('transactionDate', 'desc')
  );
  
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      transactionDate: data.transactionDate?.toDate(),
      expiryDate: data.expiryDate?.toDate(),
      createdAt: data.createdAt?.toDate(),
    } as PointTransaction;
  });
}

/**
 * الحصول على إحصائيات نظام الولاء
 */
export async function getLoyaltyStats(): Promise<LoyaltyStats> {
  const [membershipsSnap, transactionsSnap, rewardsSnap, redemptionsSnap] = await Promise.all([
    getDocs(collection(db, 'loyalty_memberships')),
    getDocs(collection(db, 'point_transactions')),
    getDocs(collection(db, 'loyalty_rewards')),
    getDocs(collection(db, 'reward_redemptions')),
  ]);
  
  const memberships = membershipsSnap.docs.map(doc => doc.data() as LoyaltyMembership);
  const transactions = transactionsSnap.docs.map(doc => doc.data() as PointTransaction);
  const rewards = rewardsSnap.docs.map(doc => doc.data() as LoyaltyReward);
  const redemptions = redemptionsSnap.docs.map(doc => doc.data() as RewardRedemption);
  
  const totalMembers = memberships.length;
  const activeMembers = memberships.filter(m => m.isActive).length;
  
  const membersByTier = {
    bronze: memberships.filter(m => m.tier === 'bronze').length,
    silver: memberships.filter(m => m.tier === 'silver').length,
    gold: memberships.filter(m => m.tier === 'gold').length,
    platinum: memberships.filter(m => m.tier === 'platinum').length,
    diamond: memberships.filter(m => m.tier === 'diamond').length,
  };
  
  const totalPointsIssued = transactions
    .filter(t => t.type === 'earned')
    .reduce((sum, t) => sum + t.points, 0);
  
  const totalPointsRedeemed = Math.abs(transactions
    .filter(t => t.type === 'redeemed')
    .reduce((sum, t) => sum + t.points, 0));
  
  const totalPointsExpired = Math.abs(transactions
    .filter(t => t.type === 'expired')
    .reduce((sum, t) => sum + t.points, 0));
  
  const totalPointsAvailable = memberships.reduce((sum, m) => sum + m.availablePoints, 0);
  
  const redemptionsByStatus = {
    available: redemptions.filter(r => r.status === 'available').length,
    redeemed: redemptions.filter(r => r.status === 'redeemed').length,
    expired: redemptions.filter(r => r.status === 'expired').length,
  };
  
  const totalSpending = memberships.reduce((sum, m) => sum + m.totalSpent, 0);
  
  return {
    totalMembers,
    activeMembers,
    membersByTier,
    totalPointsIssued,
    totalPointsRedeemed,
    totalPointsExpired,
    totalPointsAvailable,
    totalRewards: rewards.length,
    activeRewards: rewards.filter(r => r.isActive).length,
    totalRedemptions: redemptions.length,
    redemptionsByStatus,
    totalValueRedeemed: redemptions.reduce((sum, r) => sum + r.pointsUsed, 0),
    averagePointsPerMember: totalMembers > 0 ? totalPointsAvailable / totalMembers : 0,
    averageSpendingPerMember: totalMembers > 0 ? totalSpending / totalMembers : 0,
  };
}

/**
 * تنسيق النقاط
 */
export function formatPoints(points: number): string {
  return points.toLocaleString('ar-SA') + ' نقطة';
}
