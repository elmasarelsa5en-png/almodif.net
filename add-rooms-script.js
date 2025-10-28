// Script لإضافة الغرف مباشرة
const rooms = [
  // الدور الأول
  { number: '101', type: 'تبقى غرف', floor: 1 },
  { number: '102', type: 'غرفة', floor: 1 },
  { number: '103', type: 'غرفتين بدون صالة', floor: 1 },
  
  // الدور الثاني
  { number: '201', type: 'غرفة وصالة', floor: 2 },
  { number: '202', type: 'VIP', floor: 2 },
  { number: '203', type: 'VIP', floor: 2 },
  { number: '204', type: 'غرفة وصالة', floor: 2 },
  { number: '205', type: 'غرفتين وصالة', floor: 2 },
  { number: '206', type: 'غرفتين كبيرة 3 أسرة', floor: 2 },
  { number: '207', type: 'غرفة وصالة كبيرة 3 أسرة', floor: 2 },
  { number: '208', type: 'غرفة', floor: 2 },
  
  // الدور الثالث
  { number: '301', type: 'غرفة وصالة', floor: 3 },
  { number: '302', type: 'VIP', floor: 3 },
  { number: '303', type: 'VIP', floor: 3 },
  { number: '304', type: 'غرفة وصالة', floor: 3 },
  { number: '305', type: 'غرفة وصالة 2 أسرة', floor: 3 },
  { number: '306', type: 'غرفتين كبيرة 3 أسرة', floor: 3 },
  { number: '307', type: 'غرفة وصالة كبيرة 2 أسرة', floor: 3 },
  { number: '308', type: 'غرفة', floor: 3 },
  
  // الدور الرابع
  { number: '401', type: 'غرفة وصالة', floor: 4 },
  { number: '402', type: 'VIP', floor: 4 },
  { number: '403', type: 'VIP', floor: 4 },
  { number: '404', type: 'غرفة وصالة', floor: 4 },
  { number: '405', type: 'غرفة وصالة 2 أسرة', floor: 4 },
  { number: '406', type: 'غرفتين كبيرة 3 أسرة', floor: 4 },
  { number: '407', type: 'غرفة وصالة كبيرة 2 أسرة', floor: 4 },
  { number: '408', type: 'غرفة', floor: 4 },
  
  // الدور الخامس
  { number: '501', type: 'غرفة وصالة', floor: 5 },
  { number: '502', type: 'VIP', floor: 5 },
  { number: '503', type: 'VIP', floor: 5 },
  { number: '504', type: 'غرفة وصالة', floor: 5 },
  { number: '505', type: 'غرفة وصالة 2 أسرة', floor: 5 },
  { number: '506', type: 'غرفتين كبيرة 3 أسرة', floor: 5 },
  { number: '507', type: 'غرفة وصالة كبيرة 2 أسرة', floor: 5 },
  { number: '508', type: 'غرفة', floor: 5 }
];

// تحويل لـ JSON للنسخ
const roomsJSON = rooms.map((room, index) => ({
  id: `room_${Date.now()}_${index}`,
  number: room.number,
  type: room.type,
  floor: room.floor,
  status: 'Available',
  balance: 0,
  events: [{
    id: Date.now().toString(),
    type: 'status_change',
    description: 'تم إنشاء الغرفة',
    timestamp: new Date().toISOString(),
    user: 'System',
    newValue: 'Available'
  }],
  lastUpdated: new Date().toISOString()
}));

console.log('عدد الغرف:', rooms.length);
console.log('\n📋 قائمة الغرف:\n');
rooms.forEach(room => {
  console.log(`غرفة ${room.number} - ${room.type} - الدور ${room.floor}`);
});

console.log('\n\n💾 JSON للنسخ:\n');
console.log(JSON.stringify(roomsJSON, null, 2));

// حفظ في localStorage
if (typeof localStorage !== 'undefined') {
  const existingRooms = JSON.parse(localStorage.getItem('hotel_rooms_data') || '[]');
  const allRooms = [...existingRooms, ...roomsJSON];
  localStorage.setItem('hotel_rooms_data', JSON.stringify(allRooms));
  console.log('\n✅ تم الحفظ في localStorage');
}
