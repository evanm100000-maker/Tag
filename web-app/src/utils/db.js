import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, child, remove, update } from "firebase/database";
import { encryptText, decryptText, hashPassword, verifyPassword } from "./crypto";

const firebaseConfig = {
  apiKey: "AIzaSyBu8Zjk-ed-HNm8_trZbIJcNz_i1eKP4vU",
  authDomain: "tagscanner-f9c49.firebaseapp.com",
  projectId: "tagscanner-f9c49",
  storageBucket: "tagscanner-f9c49.firebasestorage.app",
  messagingSenderId: "836114316053",
  appId: "1:836114316053:web:6387403de12a3c49fd871c",
  measurementId: "G-HGYGDMLY70",
  databaseURL: "https://tagscanner-f9c49-default-rtdb.europe-west1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ==========================================
// TICKET / TAG FUNCTIONS
// ==========================================

export const getAllTags = async () => {
  try {
    const snapshot = await get(ref(db, "tags"));
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.values(data);
    }
    return [];
  } catch (err) {
    console.error('Error reading tags', err);
    return [];
  }
};

export const saveTag = async (tag) => {
  try {
    await set(ref(db, "tags/" + tag.code), tag);
    return { success: true };
  } catch (err) {
    console.error('Error saving tag', err);
    return { success: false, error: err.message };
  }
};

export const removeTag = async (code) => {
  try {
    await remove(ref(db, "tags/" + code));
    return true;
  } catch (err) {
    console.error('Error removing tag', err);
    return false;
  }
};

export const disableTag = async (code, disabled) => {
  try {
    await update(ref(db, "tags/" + code), { disabled });
    return true;
  } catch (err) {
    console.error('Error disabling tag', err);
    return false;
  }
};

export const validateEntry = async (code) => {
  try {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, `tags/${code}`));

    if (!snapshot.exists()) {
      return { valid: false, reason: 'Not on system' };
    }

    const tag = snapshot.val();
    
    const tagInfo = {
      name: tag.name || 'Unknown',
      validFrom: tag.validFrom || null,
      validUntil: tag.validUntil || null
    };

    if (tag.disabled) {
      return { valid: false, reason: 'Disabled', ...tagInfo };
    }

    const now = new Date();
    
    if (tag.validFrom) {
      const from = new Date(tag.validFrom);
      if (now < from) {
        return { valid: false, reason: 'Not Valid Yet', ...tagInfo };
      }
    }
    
    if (tag.validUntil) {
      const until = new Date(tag.validUntil);
      if (now > until) {
        return { valid: false, reason: 'Expired', ...tagInfo };
      }
    }

    // Update scan count
    const todayStr = now.toISOString().split('T')[0];
    let newCount = 1;
    
    if (tag.lastScannedDate === todayStr) {
      newCount = (tag.scanCountToday || 0) + 1;
    }

    await update(ref(db, `tags/${code}`), {
      lastScannedDate: todayStr,
      scanCountToday: newCount
    });

    return { 
      valid: true, 
      scanCountToday: newCount,
      ...tagInfo
    };
  } catch (error) {
    console.error('Error validating', error);
    return { valid: false, reason: error.message ? `DB Error: ${error.message}` : 'Database Error' };
  }
};

// ==========================================
// USER AUTHENTICATION & MANAGEMENT FUNCTIONS
// ==========================================

/**
 * Fetch and decrypt all users
 */
export const getAllUsers = async () => {
  try {
    const snapshot = await get(ref(db, "users"));
    if (!snapshot.exists()) return [];
    
    const data = snapshot.val();
    return Object.keys(data).map(key => {
      const u = data[key];
      return {
        id: key,
        name: decryptText(u.name),
        otp: u.otp ? decryptText(u.otp) : null,
        isActivated: u.isActivated || false,
        hasPasscode: !!u.passcode
      };
    });
  } catch (err) {
    console.error("Error loading users:", err);
    return [];
  }
};

/**
 * Add a new user with an OTP (One-Time Passcode)
 */
export const addUser = async (username) => {
  try {
    const cleanUsername = username.trim();
    if (!cleanUsername) return { success: false, error: "Username is empty" };

    // Generate random 6 character uppercase OTP
    const otp = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const users = await getAllUsers();
    const exists = users.some(u => u.name.toLowerCase() === cleanUsername.toLowerCase());
    if (exists) {
      return { success: false, error: "User already exists on system" };
    }

    const userId = "user_" + Date.now();
    const newUser = {
      name: encryptText(cleanUsername),
      otp: encryptText(otp),
      password: "",
      passcode: "",
      isActivated: false
    };

    await set(ref(db, "users/" + userId), newUser);
    return { success: true, otp };
  } catch (err) {
    console.error("Error adding user:", err);
    return { success: false, error: err.message };
  }
};

/**
 * First-time login / activation using OTP
 */
export const activateUser = async (name, otp, password, passcode) => {
  try {
    const cleanName = name.trim();
    const cleanOtp = otp.trim().toUpperCase();
    
    const snapshot = await get(ref(db, "users"));
    if (!snapshot.exists()) return { success: false, error: "No users on system" };

    const data = snapshot.val();
    let matchingUserId = null;

    for (const key of Object.keys(data)) {
      const u = data[key];
      const decryptedName = decryptText(u.name);
      if (decryptedName.toLowerCase() === cleanName.toLowerCase()) {
        const decryptedOtp = u.otp ? decryptText(u.otp) : null;
        if (decryptedOtp === cleanOtp) {
          matchingUserId = key;
          break;
        }
      }
    }

    if (!matchingUserId) {
      return { success: false, error: "Invalid username or 1-time passcode" };
    }

    // Update with secure hashed password & passcode, and mark as activated
    await update(ref(db, "users/" + matchingUserId), {
      password: hashPassword(password),
      passcode: hashPassword(passcode),
      isActivated: true,
      otp: null // Clear OTP as it is used
    });

    return { success: true };
  } catch (err) {
    console.error("Error activating user:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Standard Login with username and password
 */
export const loginUser = async (username, password) => {
  try {
    const cleanUsername = username.trim();
    const snapshot = await get(ref(db, "users"));
    if (!snapshot.exists()) return { success: false, error: "Incorrect username or password" };

    const data = snapshot.val();
    for (const key of Object.keys(data)) {
      const u = data[key];
      const decryptedName = decryptText(u.name);
      if (decryptedName.toLowerCase() === cleanUsername.toLowerCase()) {
        if (!u.isActivated) {
          return { success: false, error: "Account not activated. Please use the Sign In tab with your 1-time passcode." };
        }
        
        const isPasswordValid = verifyPassword(password, u.password);
        if (isPasswordValid) {
          return { 
            success: true, 
            user: {
              id: key,
              name: decryptedName,
              isActivated: true,
              hasPasscode: !!u.passcode
            } 
          };
        }
      }
    }
    return { success: false, error: "Incorrect username or password" };
  } catch (err) {
    console.error("Login error:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Update user passcode (PIN)
 */
export const updateUserPasscode = async (userId, newPasscode) => {
  try {
    await update(ref(db, "users/" + userId), {
      passcode: hashPassword(newPasscode)
    });
    return { success: true };
  } catch (err) {
    console.error("Error updating passcode:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Seed the default active user Evan Marsay with password Michelle11. and passcode 1234
 */
export const seedDefaultUser = async () => {
  try {
    const defaultUsername = "Evan Marsay";
    const defaultPassword = "Michelle11.";
    const defaultPasscode = "1234";

    const snapshot = await get(ref(db, "users"));
    let exists = false;

    if (snapshot.exists()) {
      const data = snapshot.val();
      for (const key of Object.keys(data)) {
        const decryptedName = decryptText(data[key].name);
        if (decryptedName.toLowerCase() === defaultUsername.toLowerCase()) {
          exists = true;
          break;
        }
      }
    }

    if (!exists) {
      const userId = "user_default";
      const defaultUserObj = {
        name: encryptText(defaultUsername),
        password: hashPassword(defaultPassword),
        passcode: hashPassword(defaultPasscode),
        isActivated: true,
        otp: null
      };
      await set(ref(db, "users/" + userId), defaultUserObj);
      console.log("Default user seeded successfully.");
    }
  } catch (err) {
    console.error("Failed to seed default user:", err);
  }
};

// ==========================================
// TICKET BOOKING FUNCTIONS
// ==========================================

/**
 * Create a new pending ticket booking
 */
export const addBooking = async (bookingData) => {
  try {
    const bookingId = "booking_" + Date.now();
    const cleanBooking = {
      id: bookingId,
      name: bookingData.name.trim(),
      phone: bookingData.phone.trim(),
      email: bookingData.email.trim(),
      startDate: bookingData.startDate,
      endDate: bookingData.endDate,
      status: "pending", // pending, accepted, rejected
      createdAt: new Date().toISOString()
    };

    await set(ref(db, "bookings/" + bookingId), cleanBooking);
    return { success: true };
  } catch (err) {
    console.error("Error adding booking:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Load all ticket bookings
 */
export const getAllBookings = async () => {
  try {
    const snapshot = await get(ref(db, "bookings"));
    if (!snapshot.exists()) return [];
    const data = snapshot.val();
    return Object.values(data);
  } catch (err) {
    console.error("Error reading bookings:", err);
    return [];
  }
};

/**
 * Approve a ticket booking: mark accepted and save barcode/QR to tags
 */
export const approveBooking = async (bookingId, ticketCode) => {
  try {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, `bookings/${bookingId}`));
    if (!snapshot.exists()) {
      return { success: false, error: "Booking not found" };
    }

    const booking = snapshot.val();
    
    // 1. Add as a valid tag/barcode
    const saveTagResult = await saveTag({
      code: ticketCode.trim().toUpperCase(),
      name: booking.name,
      type: "barcode",
      disabled: false,
      validFrom: booking.startDate ? new Date(booking.startDate).toISOString() : null,
      validUntil: booking.endDate ? new Date(booking.endDate + "T23:59:59").toISOString() : null,
      scanCountToday: 0
    });

    if (!saveTagResult.success) {
      return { success: false, error: saveTagResult.error };
    }

    // 2. Update booking status
    await update(ref(db, `bookings/${bookingId}`), {
      status: "accepted",
      ticketCode: ticketCode.trim().toUpperCase()
    });

    return { success: true };
  } catch (err) {
    console.error("Error approving booking:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Reject a booking request
 */
export const rejectBooking = async (bookingId) => {
  try {
    await update(ref(db, `bookings/${bookingId}`), {
      status: "rejected"
    });
    return { success: true };
  } catch (err) {
    console.error("Error rejecting booking:", err);
    return { success: false, error: err.message };
  }
};
