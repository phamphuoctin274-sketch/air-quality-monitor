import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, query, orderByChild, limitToLast } from 'firebase/database';

// Firebase configuration
let firebaseConfig = {
  apiKey: "AIzaSyDummyKey",
  authDomain: "forest-air-polution.firebaseapp.com",
  databaseURL: "https://forest-air-polution-default-rtdb.firebaseio.com",
  projectId: "forest-air-polution",
  storageBucket: "forest-air-polution.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};

// Initialize Firebase
let app = null;
let database = null;

const initializeFirebase = (customConfig = null) => {
  try {
    if (customConfig) {
      firebaseConfig = customConfig;
    }
    
    if (!app) {
      app = initializeApp(firebaseConfig);
      database = getDatabase(app);
    }
    return database;
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
  }
};

const getDatabase_Instance = () => {
  if (!database) {
    initializeFirebase();
  }
  return database;
};

// Get current data
export const getCurrentData = (callback) => {
  try {
    const db = getDatabase_Instance();
    const dataRef = ref(db, 'current');
    
    onValue(dataRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        callback({ success: true, data });
      } else {
        callback({ success: false, data: null });
      }
    }, (error) => {
      console.error('Error fetching current data:', error);
      callback({ success: false, error: error.message });
    });
  } catch (error) {
    console.error('Error:', error);
    callback({ success: false, error: error.message });
  }
};

// Get historical data
export const getHistoricalData = (startDate, endDate, callback) => {
  try {
    const db = getDatabase_Instance();
    const historyRef = ref(db, 'history');
    
    onValue(historyRef, (snapshot) => {
      const allData = snapshot.val();
      if (allData) {
        const filteredData = Object.entries(allData).filter(([key, value]) => {
          const timestamp = new Date(value.timestamp).getTime();
          const start = new Date(startDate).getTime();
          const end = new Date(endDate).getTime();
          return timestamp >= start && timestamp <= end;
        }).map(([key, value]) => ({ ...value, id: key }));
        
        callback({ success: true, data: filteredData });
      } else {
        callback({ success: false, data: [] });
      }
    }, (error) => {
      console.error('Error fetching historical data:', error);
      callback({ success: false, error: error.message });
    });
  } catch (error) {
    console.error('Error:', error);
    callback({ success: false, error: error.message });
  }
};

// Get data within time range
export const getDataWithinTimeRange = (hours, callback) => {
  try {
    const db = getDatabase_Instance();
    const historyRef = ref(db, 'history');
    const now = new Date();
    const startTime = new Date(now.getTime() - hours * 60 * 60 * 1000);
    
    onValue(historyRef, (snapshot) => {
      const allData = snapshot.val();
      if (allData) {
        const filteredData = Object.entries(allData)
          .filter(([key, value]) => {
            const timestamp = new Date(value.timestamp).getTime();
            return timestamp >= startTime.getTime();
          })
          .map(([key, value]) => ({ ...value, id: key }))
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        callback({ success: true, data: filteredData });
      } else {
        callback({ success: false, data: [] });
      }
    }, (error) => {
      console.error('Error:', error);
      callback({ success: false, error: error.message });
    });
  } catch (error) {
    console.error('Error:', error);
    callback({ success: false, error: error.message });
  }
};

// Test Firebase connection
export const testFirebaseConnection = async (config) => {
  try {
    const testApp = initializeApp(config, 'test');
    const testDb = getDatabase(testApp);
    const testRef = ref(testDb, '.info/connected');
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve({ success: false, message: 'Connection timeout' });
      }, 5000);

      onValue(testRef, (snapshot) => {
        clearTimeout(timeout);
        if (snapshot.val() === true) {
          resolve({ success: true, message: 'Firebase connected successfully' });
        } else {
          resolve({ success: false, message: 'Firebase not connected' });
        }
      }, (error) => {
        clearTimeout(timeout);
        resolve({ success: false, message: error.message });
      });
    });
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Update Firebase config
export const updateFirebaseConfig = (newConfig) => {
  firebaseConfig = { ...firebaseConfig, ...newConfig };
  app = null;
  database = null;
  initializeFirebase();
};

// Get Firebase config
export const getFirebaseConfig = () => {
  return firebaseConfig;
};

export default {
  initializeFirebase,
  getCurrentData,
  getHistoricalData,
  getDataWithinTimeRange,
  testFirebaseConnection,
  updateFirebaseConfig,
  getFirebaseConfig
};
