// مزامنة البيانات مع Firebase لضمان توفرها عبر جميع الأجهزة والمتصفحات
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { Room } from './rooms-data';

const ROOMS_COLLECTION = 'hotel_rooms';
const SETTINGS_DOC = 'hotel_settings';

/**
 * حفظ الغرف في Firebase (مع الحفاظ على البيانات الموجودة)
 */
export const saveRoomsToFirebase = async (rooms: Room[]): Promise<void> => {
  try {
    // إضافة أو تحديث الغرف (بدون حذف القديمة)
    const addPromises = rooms.map(room => 
      setDoc(doc(db, ROOMS_COLLECTION, room.id), {
        ...room,
        lastUpdated: Timestamp.now()
      }, { merge: true }) // merge: true للحفاظ على البيانات الموجودة
    );
    
    await Promise.all(addPromises);
    
    // حفظ نسخة احتياطية في localStorage أيضاً
    localStorage.setItem('hotel_rooms_data', JSON.stringify(rooms));
    
    console.log(`✅ تم حفظ/تحديث ${rooms.length} غرفة في Firebase`);
  } catch (error) {
    console.error('❌ خطأ في حفظ الغرف في Firebase:', error);
    throw error;
  }
};

/**
 * جلب الغرف من Firebase
 */
export const getRoomsFromFirebase = async (): Promise<Room[]> => {
  try {
    const roomsRef = collection(db, ROOMS_COLLECTION);
    const roomsSnapshot = await getDocs(query(roomsRef, orderBy('number')));
    
    if (roomsSnapshot.empty) {
      console.log('⚠️ لا توجد غرف في Firebase، جاري التحقق من localStorage...');
      
      // محاولة جلب من localStorage كنسخة احتياطية
      const localData = localStorage.getItem('hotel_rooms_data');
      if (localData) {
        const rooms = JSON.parse(localData);
        console.log(`📦 تم جلب ${rooms.length} غرفة من localStorage`);
        
        // رفع البيانات من localStorage إلى Firebase
        await saveRoomsToFirebase(rooms);
        return rooms;
      }
      
      return [];
    }
    
    const rooms: Room[] = roomsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id
      } as Room;
    });
    
    // حفظ نسخة في localStorage للوصول السريع
    localStorage.setItem('hotel_rooms_data', JSON.stringify(rooms));
    
    console.log(`✅ تم جلب ${rooms.length} غرفة من Firebase`);
    return rooms;
  } catch (error) {
    console.error('❌ خطأ في جلب الغرف من Firebase:', error);
    
    // في حالة الخطأ، نستخدم localStorage
    const localData = localStorage.getItem('hotel_rooms_data');
    if (localData) {
      return JSON.parse(localData);
    }
    
    return [];
  }
};

/**
 * حفظ غرفة واحدة في Firebase
 */
export const saveRoomToFirebase = async (room: Room): Promise<void> => {
  try {
    await setDoc(doc(db, ROOMS_COLLECTION, room.id), {
      ...room,
      lastUpdated: Timestamp.now()
    });
    
    console.log(`✅ تم حفظ الغرفة ${room.number} في Firebase`);
  } catch (error) {
    console.error('❌ خطأ في حفظ الغرفة في Firebase:', error);
    throw error;
  }
};

/**
 * حذف غرفة من Firebase
 */
export const deleteRoomFromFirebase = async (roomId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, ROOMS_COLLECTION, roomId));
    console.log(`✅ تم حذف الغرفة من Firebase`);
  } catch (error) {
    console.error('❌ خطأ في حذف الغرفة من Firebase:', error);
    throw error;
  }
};

/**
 * الاستماع للتحديثات الفورية على الغرف
 */
export const subscribeToRooms = (
  onUpdate: (rooms: Room[]) => void,
  onError?: (error: Error) => void
) => {
  const roomsRef = collection(db, ROOMS_COLLECTION);
  
  return onSnapshot(
    query(roomsRef, orderBy('number')),
    (snapshot) => {
      const rooms: Room[] = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as Room));
      
      // تحديث localStorage أيضاً
      localStorage.setItem('hotel_rooms_data', JSON.stringify(rooms));
      
      onUpdate(rooms);
      console.log(`🔄 تحديث فوري: ${rooms.length} غرفة`);
    },
    (error) => {
      console.error('❌ خطأ في الاستماع للتحديثات:', error);
      if (onError) onError(error);
    }
  );
};

/**
 * حفظ إعدادات النظام في Firebase
 */
export const saveSettingsToFirebase = async (settings: any): Promise<void> => {
  try {
    await setDoc(doc(db, 'settings', SETTINGS_DOC), {
      ...settings,
      lastUpdated: Timestamp.now()
    });
    
    console.log('✅ تم حفظ الإعدادات في Firebase');
  } catch (error) {
    console.error('❌ خطأ في حفظ الإعدادات:', error);
    throw error;
  }
};

/**
 * جلب إعدادات النظام من Firebase
 */
export const getSettingsFromFirebase = async (): Promise<any> => {
  try {
    const settingsDoc = await getDoc(doc(db, 'settings', SETTINGS_DOC));
    
    if (settingsDoc.exists()) {
      return settingsDoc.data();
    }
    
    return null;
  } catch (error) {
    console.error('❌ خطأ في جلب الإعدادات:', error);
    return null;
  }
};

/**
 * مزامنة localStorage مع Firebase
 * يتم استدعاؤها عند تسجيل الدخول
 */
export const syncLocalDataToFirebase = async (): Promise<void> => {
  try {
    console.log('🔄 بدء مزامنة البيانات...');
    
    // جلب البيانات من localStorage
    const localRooms = localStorage.getItem('hotel_rooms_data');
    
    if (localRooms) {
      const rooms = JSON.parse(localRooms);
      
      // التحقق من وجود بيانات في Firebase
      const firebaseRooms = await getRoomsFromFirebase();
      
      if (firebaseRooms.length === 0 && rooms.length > 0) {
        // رفع البيانات من localStorage إلى Firebase
        await saveRoomsToFirebase(rooms);
        console.log(`✅ تم رفع ${rooms.length} غرفة من localStorage إلى Firebase`);
      } else if (firebaseRooms.length > 0) {
        // Firebase له الأولوية
        localStorage.setItem('hotel_rooms_data', JSON.stringify(firebaseRooms));
        console.log(`✅ تم تحديث localStorage من Firebase (${firebaseRooms.length} غرفة)`);
      }
    } else {
      // لا توجد بيانات محلية، جلب من Firebase
      const firebaseRooms = await getRoomsFromFirebase();
      if (firebaseRooms.length > 0) {
        localStorage.setItem('hotel_rooms_data', JSON.stringify(firebaseRooms));
        console.log(`✅ تم جلب ${firebaseRooms.length} غرفة من Firebase`);
      }
    }
    
    console.log('✅ اكتملت المزامنة بنجاح');
  } catch (error) {
    console.error('❌ خطأ في المزامنة:', error);
  }
};
