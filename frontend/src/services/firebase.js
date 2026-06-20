// Firebase client-side service initialization with local storage mock fallbacks
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Environment parameters
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const isConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey !== "undefined";

export let app, auth, db;
let useMock = !isConfigured;

if (isConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('[Firebase Client] Initialized Firebase successfully.');
  } catch (e) {
    console.warn('[Firebase Client] Failed to initialize real Firebase, using LocalStorage MOCK: ', e);
    useMock = true;
  }
} else {
  console.log('[Firebase Client] Config variables not found. Operating in mock local storage mode.');
  useMock = true;
}

// Local mock databases structures
const getMockData = () => {
  const d = localStorage.getItem('eco_drive_mock_db');
  if (d) return JSON.parse(d);
  
  // Set defaults
  const defaults = {
    users: {},
    marketplace: [
      { id: '1', name: "Logistics Co.", type: "BUY", credits: 100, price: 12.0 },
      { id: '2', name: "Factory A", type: "SELL", credits: 50, price: 10.0 },
      { id: '3', name: "GreenFleet India", type: "BUY", credits: 75, price: 11.5 },
      { id: '4', name: "CityBus Corp", type: "SELL", credits: 30, price: 10.5 }
    ],
    transactions: [],
    leaderboard: [
      { rank: 1, name: 'Arjun Mehta', ecoScore: 98, creditsEarned: 245.5 },
      { rank: 2, name: 'Priya Sharma', ecoScore: 94, creditsEarned: 198.2 },
      { rank: 3, name: 'Sanjay Nair', ecoScore: 91, creditsEarned: 154.0 },
      { rank: 4, name: 'Rohan Sen', ecoScore: 88, creditsEarned: 122.8 },
      { rank: 5, name: 'Ananya Goel', ecoScore: 85, creditsEarned: 95.4 }
    ]
  };
  localStorage.setItem('eco_drive_mock_db', JSON.stringify(defaults));
  return defaults;
};

const saveMockData = (data) => {
  localStorage.setItem('eco_drive_mock_db', JSON.stringify(data));
};

// Expose Auth and Firestore actions
export const firebaseService = {
  isMock: useMock,

  // Login handler
  login: async (email, password) => {
    if (useMock) {
      const data = getMockData();
      const user = data.users[email];
      if (user && user.password === password) {
        localStorage.setItem('eco_drive_current_user', email);
        return { uid: email, email, ...user.profile };
      }
      throw new Error('Invalid email or password.');
    } else {
      // Real Firebase login
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    }
  },

  register: async (email, password, profileData) => {
    if (useMock) {
      const data = getMockData();
      if (data.users[email]) {
        throw new Error('User already exists.');
      }
      data.users[email] = {
        password,
        profile: {
          uid: email,
          email,
          createdAt: new Date().toISOString(),
          credits: 100.0,
          name: profileData.name || 'Driver',
          vehicleName: profileData.vehicleName || 'Model X',
          fuelType: profileData.fuelType || 'Petrol',
          regNumber: profileData.regNumber || 'MH-12-XX-0000',
          role: profileData.role || 'driver',
          ...profileData
        },
        trips: [],
        wallet: { credits: 100.0 }
      };
      saveMockData(data);
      console.log('[Mock DB] Registered user successfully:', email, data.users[email].profile);
      return { uid: email, email, ...data.users[email].profile };
    } else {
      // Real Firebase signup
      const { createUserWithEmailAndPassword, signOut } = await import('firebase/auth');
      const { doc, setDoc } = await import('firebase/firestore');
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const defaultProfile = {
        name: profileData.name || email.split('@')[0],
        email,
        role: profileData.role || 'driver',
        vehicleName: profileData.vehicleName || 'EcoCar',
        fuelType: profileData.fuelType || 'Petrol',
        regNumber: profileData.regNumber || 'REG-000',
        createdAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'users', user.uid), defaultProfile);
      // Sign out immediately so user must log in manually
      await signOut(auth);
      console.log('[Firebase] Registered user successfully:', email, defaultProfile);
      return { uid: user.uid, email, ...defaultProfile };
    }
  },

  // Logout handler
  logout: async () => {
    if (useMock) {
      localStorage.removeItem('eco_drive_current_user');
      return true;
    } else {
      const { signOut } = await import('firebase/auth');
      await signOut(auth);
      return true;
    }
  },

  // Fetch user profile
  getProfile: async (userId) => {
    if (useMock) {
      const data = getMockData();
      const user = data.users[userId];
      return user ? user.profile : null;
    } else {
      const { doc, getDoc } = await import('firebase/firestore');
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() : null;
    }
  },

  // Update user profile
  updateProfile: async (userId, profileData) => {
    if (useMock) {
      const data = getMockData();
      if (data.users[userId]) {
        data.users[userId].profile = {
          ...data.users[userId].profile,
          ...profileData
        };
        saveMockData(data);
        return data.users[userId].profile;
      }
      throw new Error('User not found.');
    } else {
      const { doc, updateDoc } = await import('firebase/firestore');
      const docRef = doc(db, 'users', userId);
      await updateDoc(docRef, profileData);
      return profileData;
    }
  },

  // Save marketplace trade listing
  addMarketListing: async (listing) => {
    const listingId = Math.random().toString(36).substring(7);
    const newListing = { id: listingId, ...listing };
    
    if (useMock) {
      const data = getMockData();
      data.marketplace.push(newListing);
      saveMockData(data);
      return newListing;
    } else {
      const { collection, addDoc } = await import('firebase/firestore');
      await addDoc(collection(db, 'marketplace'), newListing);
      return newListing;
    }
  },

  // Load marketplace active listings
  getMarketListings: async () => {
    if (useMock) {
      return getMockData().marketplace;
    } else {
      const { collection, getDocs } = await import('firebase/firestore');
      const snap = await getDocs(collection(db, 'marketplace'));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  },

  // Purchase Listing handler
  buyCredits: async (buyerId, listingId, qty) => {
    if (useMock) {
      const data = getMockData();
      const listingIdx = data.marketplace.findIndex(l => l.id === listingId);
      if (listingIdx === -1) throw new Error('Listing not found');
      
      const listing = data.marketplace[listingIdx];
      if (listing.credits < qty) throw new Error('Insufficient credits in listing');
      
      // Update quantities
      data.marketplace[listingIdx].credits -= qty;
      const totalCost = qty * listing.price;
      
      // Update buyer profile credits
      if (data.users[buyerId]) {
        data.users[buyerId].profile.credits = (data.users[buyerId].profile.credits || 0) + qty;
      }
      
      // Add transaction history
      const transaction = {
        date: new Date().toISOString(),
        from: listing.name,
        to: buyerId,
        credits: qty,
        amount: totalCost,
        type: 'BUY'
      };
      data.transactions.push(transaction);
      
      // Remove listing if fully bought
      if (data.marketplace[listingIdx].credits <= 0) {
        data.marketplace.splice(listingIdx, 1);
      }
      
      saveMockData(data);
      return transaction;
    } else {
      const { doc, getDoc, updateDoc, collection, addDoc } = await import('firebase/firestore');
      const listRef = doc(db, 'marketplace', listingId);
      const snap = await getDoc(listRef);
      if (!snap.exists()) throw new Error('Listing not found');
      
      const listing = snap.data();
      if (listing.credits < qty) throw new Error('Insufficient credits');
      
      const totalCost = qty * listing.price;
      
      // Update Listing
      const nextCredits = listing.credits - qty;
      if (nextCredits <= 0) {
        const { deleteDoc } = await import('firebase/firestore');
        await deleteDoc(listRef);
      } else {
        await updateDoc(listRef, { credits: nextCredits });
      }
      
      // Log transaction
      const transaction = {
        date: new Date().toISOString(),
        from: listing.name,
        to: buyerId,
        credits: qty,
        amount: totalCost,
        type: 'BUY'
      };
      await addDoc(collection(db, 'transactions'), transaction);
      return transaction;
    }
  },

  // Save Transaction
  logTransaction: async (userId, tx) => {
    if (useMock) {
      const data = getMockData();
      data.transactions.push(tx);
      saveMockData(data);
    } else {
      const { collection, addDoc } = await import('firebase/firestore');
      await addDoc(collection(db, 'transactions'), tx);
    }
  },

  // Fetch transaction history
  getTransactions: async (userId) => {
    if (useMock) {
      const data = getMockData();
      return data.transactions.filter(t => t.to === userId || t.from === userId || t.from === 'System' || t.to === 'System');
    } else {
      const { collection, getDocs, query, where } = await import('firebase/firestore');
      const q = query(collection(db, 'transactions'), where('to', '==', userId));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data());
    }
  },

  // Weekly leaderboard
  getLeaderboard: async () => {
    if (useMock) {
      return getMockData().leaderboard;
    } else {
      try {
        const { collection, getDocs, query, orderBy, limit } = await import('firebase/firestore');
        const q = query(collection(db, 'leaderboard'), orderBy('ecoScore', 'desc'), limit(10));
        const snap = await getDocs(q);
        if (!snap.empty) {
          return snap.docs.map((d, index) => ({ rank: index + 1, ...d.data() }));
        }
      } catch (e) {
        console.warn('[Firebase] Failed to query leaderboard, falling back: ', e);
      }
      // Mock leaderboard fallback
      return [
        { rank: 1, name: 'Arjun Mehta', ecoScore: 98, creditsEarned: 245.5 },
        { rank: 2, name: 'Priya Sharma', ecoScore: 94, creditsEarned: 198.2 },
        { rank: 3, name: 'Sanjay Nair', ecoScore: 91, creditsEarned: 154.0 },
        { rank: 4, name: 'Rohan Sen', ecoScore: 88, creditsEarned: 122.8 },
        { rank: 5, name: 'Ananya Goel', ecoScore: 85, creditsEarned: 95.4 }
      ];
    }
  }
};
