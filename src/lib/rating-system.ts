// نظام التقييمات الشامل
import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, orderBy, updateDoc, doc } from 'firebase/firestore';

export interface Rating {
  id?: string;
  type: 'service' | 'food' | 'room' | 'employee';
  targetId: string; // ID الطلب أو الصنف أو الموظف
  targetName: string; // اسم الطلب/الصنف/الموظف
  roomNumber?: string;
  guestName?: string;
  guestPhone?: string;
  rating: 1 | 2 | 3 | 4 | 5; // النجوم
  speed?: 1 | 2 | 3 | 4 | 5; // تقييم السرعة (للطلبات)
  quality?: 1 | 2 | 3 | 4 | 5; // تقييم الجودة
  cleanliness?: 1 | 2 | 3 | 4 | 5; // تقييم النظافة (للشقق)
  taste?: 1 | 2 | 3 | 4 | 5; // تقييم الطعم (للطعام)
  presentation?: 1 | 2 | 3 | 4 | 5; // تقييم العرض (للطعام)
  comment?: string;
  images?: string[]; // صور اختيارية
  employeeId?: string;
  employeeName?: string;
  createdAt: string;
  createdBy?: string;
  response?: {
    text: string;
    respondedBy: string;
    respondedAt: string;
  };
}

export interface RatingSummary {
  totalRatings: number;
  averageRating: number;
  averageSpeed?: number;
  averageQuality?: number;
  averageCleanliness?: number;
  averageTaste?: number;
  averagePresentation?: number;
  ratings: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  recentRatings: Rating[];
}

// إضافة تقييم جديد
export async function addRating(rating: Omit<Rating, 'id' | 'createdAt'>): Promise<string | null> {
  try {
    const newRating: Omit<Rating, 'id'> = {
      ...rating,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'ratings'), newRating);
    console.log('✅ تم إضافة التقييم:', docRef.id);
    
    // تحديث متوسط التقييم في الطلب أو الصنف
    await updateTargetRating(rating.targetId, rating.type);
    
    return docRef.id;
  } catch (error) {
    console.error('❌ خطأ في إضافة التقييم:', error);
    return null;
  }
}

// جلب تقييمات عنصر معين
export async function getRatingsByTarget(targetId: string): Promise<Rating[]> {
  try {
    const ratingsRef = collection(db, 'ratings');
    const q = query(
      ratingsRef,
      where('targetId', '==', targetId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Rating));
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return [];
  }
}

// جلب تقييمات حسب النوع
export async function getRatingsByType(type: Rating['type']): Promise<Rating[]> {
  try {
    const ratingsRef = collection(db, 'ratings');
    const q = query(
      ratingsRef,
      where('type', '==', type),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Rating));
  } catch (error) {
    console.error('Error fetching ratings by type:', error);
    return [];
  }
}

// جلب تقييمات موظف معين
export async function getEmployeeRatings(employeeId: string): Promise<Rating[]> {
  try {
    const ratingsRef = collection(db, 'ratings');
    const q = query(
      ratingsRef,
      where('employeeId', '==', employeeId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Rating));
  } catch (error) {
    console.error('Error fetching employee ratings:', error);
    return [];
  }
}

// حساب ملخص التقييمات
export async function getRatingSummary(targetId: string): Promise<RatingSummary> {
  const ratings = await getRatingsByTarget(targetId);
  
  if (ratings.length === 0) {
    return {
      totalRatings: 0,
      averageRating: 0,
      ratings: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      recentRatings: []
    };
  }

  const totalRatings = ratings.length;
  const sumRating = ratings.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = sumRating / totalRatings;

  // حساب المتوسطات الإضافية
  const ratingsWithSpeed = ratings.filter(r => r.speed);
  const averageSpeed = ratingsWithSpeed.length > 0
    ? ratingsWithSpeed.reduce((sum, r) => sum + (r.speed || 0), 0) / ratingsWithSpeed.length
    : undefined;

  const ratingsWithQuality = ratings.filter(r => r.quality);
  const averageQuality = ratingsWithQuality.length > 0
    ? ratingsWithQuality.reduce((sum, r) => sum + (r.quality || 0), 0) / ratingsWithQuality.length
    : undefined;

  const ratingsWithCleanliness = ratings.filter(r => r.cleanliness);
  const averageCleanliness = ratingsWithCleanliness.length > 0
    ? ratingsWithCleanliness.reduce((sum, r) => sum + (r.cleanliness || 0), 0) / ratingsWithCleanliness.length
    : undefined;

  const ratingsWithTaste = ratings.filter(r => r.taste);
  const averageTaste = ratingsWithTaste.length > 0
    ? ratingsWithTaste.reduce((sum, r) => sum + (r.taste || 0), 0) / ratingsWithTaste.length
    : undefined;

  const ratingsWithPresentation = ratings.filter(r => r.presentation);
  const averagePresentation = ratingsWithPresentation.length > 0
    ? ratingsWithPresentation.reduce((sum, r) => sum + (r.presentation || 0), 0) / ratingsWithPresentation.length
    : undefined;

  // توزيع التقييمات
  const distribution = {
    5: ratings.filter(r => r.rating === 5).length,
    4: ratings.filter(r => r.rating === 4).length,
    3: ratings.filter(r => r.rating === 3).length,
    2: ratings.filter(r => r.rating === 2).length,
    1: ratings.filter(r => r.rating === 1).length,
  };

  return {
    totalRatings,
    averageRating: Math.round(averageRating * 10) / 10,
    averageSpeed,
    averageQuality,
    averageCleanliness,
    averageTaste,
    averagePresentation,
    ratings: distribution,
    recentRatings: ratings.slice(0, 10)
  };
}

// تحديث متوسط التقييم في الطلب أو الصنف
async function updateTargetRating(targetId: string, type: Rating['type']) {
  try {
    const summary = await getRatingSummary(targetId);
    
    let collectionName = '';
    switch (type) {
      case 'service':
        collectionName = 'requests';
        break;
      case 'food':
        collectionName = 'menu_items';
        break;
      case 'room':
        collectionName = 'rooms';
        break;
      case 'employee':
        collectionName = 'employees';
        break;
    }

    if (collectionName) {
      const targetRef = doc(db, collectionName, targetId);
      await updateDoc(targetRef, {
        averageRating: summary.averageRating,
        totalRatings: summary.totalRatings,
        lastRatingUpdate: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error updating target rating:', error);
  }
}

// إضافة رد على تقييم
export async function respondToRating(
  ratingId: string,
  responseText: string,
  respondedBy: string
): Promise<boolean> {
  try {
    const ratingRef = doc(db, 'ratings', ratingId);
    await updateDoc(ratingRef, {
      response: {
        text: responseText,
        respondedBy,
        respondedAt: new Date().toISOString()
      }
    });
    console.log('✅ تم إضافة الرد على التقييم');
    return true;
  } catch (error) {
    console.error('❌ خطأ في إضافة الرد:', error);
    return false;
  }
}

// جلب أفضل العناصر (الأعلى تقييماً)
export async function getTopRatedItems(type: Rating['type'], limit: number = 10): Promise<any[]> {
  try {
    const ratings = await getRatingsByType(type);
    
    // تجميع حسب targetId
    const grouped = ratings.reduce((acc, rating) => {
      if (!acc[rating.targetId]) {
        acc[rating.targetId] = {
          targetId: rating.targetId,
          targetName: rating.targetName,
          ratings: []
        };
      }
      acc[rating.targetId].ratings.push(rating);
      return acc;
    }, {} as Record<string, any>);

    // حساب المتوسط لكل عنصر
    const items = Object.values(grouped).map((item: any) => {
      const avgRating = item.ratings.reduce((sum: number, r: Rating) => sum + r.rating, 0) / item.ratings.length;
      return {
        ...item,
        averageRating: Math.round(avgRating * 10) / 10,
        totalRatings: item.ratings.length
      };
    });

    // ترتيب تنازلياً
    return items
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting top rated items:', error);
    return [];
  }
}

// إحصائيات عامة للتقييمات
export async function getRatingsStats() {
  try {
    const allRatings = await getDocs(collection(db, 'ratings'));
    const ratings = allRatings.docs.map(doc => doc.data() as Rating);

    const serviceRatings = ratings.filter(r => r.type === 'service');
    const foodRatings = ratings.filter(r => r.type === 'food');
    const roomRatings = ratings.filter(r => r.type === 'room');
    const employeeRatings = ratings.filter(r => r.type === 'employee');

    const calculateAvg = (arr: Rating[]) => 
      arr.length > 0 ? arr.reduce((sum, r) => sum + r.rating, 0) / arr.length : 0;

    return {
      total: ratings.length,
      service: {
        count: serviceRatings.length,
        average: calculateAvg(serviceRatings)
      },
      food: {
        count: foodRatings.length,
        average: calculateAvg(foodRatings)
      },
      room: {
        count: roomRatings.length,
        average: calculateAvg(roomRatings)
      },
      employee: {
        count: employeeRatings.length,
        average: calculateAvg(employeeRatings)
      },
      overallAverage: calculateAvg(ratings)
    };
  } catch (error) {
    console.error('Error getting ratings stats:', error);
    return null;
  }
}
