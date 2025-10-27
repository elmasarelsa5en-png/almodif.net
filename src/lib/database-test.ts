// Test Firebase connection and database operations
import { initializeDefaultData, RoomService, UserService } from './database';

export const testDatabaseConnection = async () => {
  try {
    console.log('Testing Firebase connection...');

    // Initialize default data
    await initializeDefaultData();

    // Test creating a sample room
    const sampleRoom = {
      number: '101',
      type: 'single',
      status: 'available',
      price: 500,
      description: 'غرفة فردية مريحة'
    };

    const createdRoom = await RoomService.createRoom(sampleRoom);
    console.log('Created room:', createdRoom);

    // Test getting all rooms
    const rooms = await RoomService.getAllRooms();
    console.log('All rooms:', rooms);

    // Test getting available rooms
    const availableRooms = await RoomService.getAvailableRooms();
    console.log('Available rooms:', availableRooms);

    console.log('Database connection test completed successfully!');
    return true;

  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
};