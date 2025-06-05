// src/lib/firestoreService.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, query, orderBy, doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
// Assume firebaseConfig is defined here or in a similar file - YOU NEED TO CREATE THIS FILE
import { firebaseConfig } from './firebaseConfig';
import { Ticket } from './types'; // Import the Ticket type

// Optional: Initialize Firebase if not already initialized
// This assumes you have a firebaseConfig object with your project's configuration
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Get a Firestore instance
const db = getFirestore(app);

const TICKETS_COLLECTION = 'tickets'; // Define the name of the Firestore collection for tickets
// Noves constants per a les col·leccions de localitzacions i tipologies
const LOCATIONS_COLLECTION = 'locations';
const REPAIR_TYPES_COLLECTION = 'repairTypes';

// Tipus per a Localitzacions i Tipologies amb ID de Firestore
interface FirestoreItem {
  id: string;
  name: string;
}

// Function to get all tickets from Firestore
export async function getTicketsFromFirestore(): Promise<Ticket[]> {
  const ticketsCollection = collection(db, TICKETS_COLLECTION);
  // Optional: Order tickets, e.g., by creation date
  const q = query(ticketsCollection, orderBy('createdAt', 'desc'));

  const querySnapshot = await getDocs(q);
  const tickets: Ticket[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    // Map Firestore data to Ticket interface
    // Need to handle potential undefined fields and Date objects (Firestore Timestamps)
    const ticket: Ticket = {
      id: doc.id,
      description: data.description,
      location: data.location,
      repairType: data.repairType,
      status: data.status,
      importance: data.importance,
      createdAt: data.createdAt ? new Date(data.createdAt.toDate()) : new Date(),
      updatedAt: data.updatedAt ? new Date(data.updatedAt.toDate()) : new Date(),
      suggestedTickets: data.suggestedTickets || [],
    };
    tickets.push(ticket);
  });
  return tickets;
}

// Function to add a new ticket to Firestore
// Pass the ticket data, Firestore will generate the ID
export async function addTicketToFirestore(ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedat'>): Promise<string> {
    const ticketsCollection = collection(db, TICKETS_COLLECTION);
    const docRef = await addDoc(ticketsCollection, {
      ...ticketData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      suggestedTickets: ticketData.suggestedTickets || [],
    });
    return docRef.id;
  }

// Function to get a single ticket by ID (descomentada per si cal)
/*
export async function getTicketByIdFromFirestore(ticketId: string): Promise<Ticket | null> {
  const ticketDoc = doc(db, TICKETS_COLLECTION, ticketId);
  const docSnap = await getDoc(ticketDoc);

  if (docSnap.exists()) {
    const data = docSnap.data();
     const ticket: Ticket = {
      id: docSnap.id,
      description: data.description,
      location: data.location,
      repairType: data.repairType,
      status: data.status,
      importance: data.importance,
      createdAt: data.createdAt ? new Date(data.createdAt.toDate()) : new Date(),
      updatedAt: data.updatedAt ? new Date(data.updatedAt.toDate()) : new Date(),
      suggestedTickets: data.suggestedTickets || [],
    };
    return ticket;
  } else {
    return null;
  }
}
*/

// Function to update a ticket
export async function updateTicketInFirestore(ticketId: string, updates: Partial<Omit<Ticket, 'id' | 'createdAt'>>): Promise<void> {
  const ticketDoc = doc(db, TICKETS_COLLECTION, ticketId);
   await updateDoc(ticketDoc, {
    ...updates,
    updatedAt: serverTimestamp(),
   });
}


// Function to delete a ticket
export async function deleteTicketFromFirestore(ticketId: string): Promise<void> {
  const ticketDoc = doc(db, TICKETS_COLLECTION, ticketId);
  await deleteDoc(ticketDoc);
}


// --- Funcions per a Localitzacions (CRUD) ---

// Function to get all locations from Firestore (retorna ID i nom)
export async function getLocationsFromFirestore(): Promise<FirestoreItem[]> {
  const locationsCollection = collection(db, LOCATIONS_COLLECTION);
  const querySnapshot = await getDocs(locationsCollection);
  const locations: FirestoreItem[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data && typeof data.name === 'string') {
      locations.push({ id: doc.id, name: data.name });
    }
  });
   // Optional: ordenar per nom
   locations.sort((a, b) => a.name.localeCompare(b.name));
  return locations;
}

// Function to add a new location to Firestore
export async function addLocationToFirestore(name: string): Promise<string> {
    const locationsCollection = collection(db, LOCATIONS_COLLECTION);
    const docRef = await addDoc(locationsCollection, { name });
    return docRef.id;
}

// Function to update a location in Firestore
export async function updateLocationInFirestore(id: string, newName: string): Promise<void> {
    const locationDoc = doc(db, LOCATIONS_COLLECTION, id);
    await updateDoc(locationDoc, { name: newName });
}

// Function to delete a location from Firestore
export async function deleteLocationFromFirestore(id: string): Promise<void> {
    const locationDoc = doc(db, LOCATIONS_COLLECTION, id);
    await deleteDoc(locationDoc);
}


// --- Funcions per a Tipologies de Reparació (CRUD) ---

// Function to get all repair types from Firestore (retorna ID i nom)
export async function getRepairTypesFromFirestore(): Promise<FirestoreItem[]> {
  const repairTypesCollection = collection(db, REPAIR_TYPES_COLLECTION);
  const querySnapshot = await getDocs(repairTypesCollection);
  const repairTypes: FirestoreItem[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data && typeof data.name === 'string') {
      repairTypes.push({ id: doc.id, name: data.name });
    }
  });
   // Optional: ordenar per nom
   repairTypes.sort((a, b) => a.name.localeCompare(b.name));
  return repairTypes;
}

// Function to add a new repair type to Firestore
export async function addRepairTypeToFirestore(name: string): Promise<string> {
    const repairTypesCollection = collection(db, REPAIR_TYPES_COLLECTION);
    const docRef = await addDoc(repairTypesCollection, { name });
    return docRef.id;
}

// Function to update a repair type in Firestore
export async function updateRepairTypeInFirestore(id: string, newName: string): Promise<void> {
    const repairTypeDoc = doc(db, REPAIR_TYPES_COLLECTION, id);
    await updateDoc(repairTypeDoc, { name: newName });
}

// Function to delete a repair type from Firestore
export async function deleteRepairTypeFromFirestore(id: string): Promise<void> {
    const repairTypeDoc = doc(db, REPAIR_TYPES_COLLECTION, id);
    await deleteDoc(repairTypeDoc);
}
