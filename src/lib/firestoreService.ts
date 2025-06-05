// src/lib/firestoreService.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, query, orderBy, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
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
    const now = new Date();
    const docRef = await addDoc(ticketsCollection, {
      ...ticketData,
      createdAt: now,
      updatedAt: now,
      suggestedTickets: ticketData.suggestedTickets || [],
    });
    return docRef.id;
  }

// --- Potencials funcions addicionals per a Tiquets (les hem afegit més tard si cal) ---

// Function to get a single ticket by ID
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
   const now = new Date();
   await updateDoc(ticketDoc, {
    ...updates,
    updatedAt: now,
   });
}


// Function to delete a ticket
export async function deleteTicketFromFirestore(ticketId: string): Promise<void> {
  const ticketDoc = doc(db, TICKETS_COLLECTION, ticketId);
  await deleteDoc(ticketDoc);
}


// --- Fi de les potencials funcions addicionals per a Tiquets ---


// --- Noves funcions per obtenir Localitzacions i Tipologies de Firestore ---

// Function to get all locations from Firestore
// Assumim que cada document a la col·lecció 'locations' té un camp 'name' (string)
export async function getLocationsFromFirestore(): Promise<string[]> {
  const locationsCollection = collection(db, LOCATIONS_COLLECTION);
  const querySnapshot = await getDocs(locationsCollection);
  const locations: string[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data && typeof data.name === 'string') {
      locations.push(data.name);
    }
  });
  return locations;
}

// Function to get all repair types from Firestore
// Assumim que cada document a la col·lecció 'repairTypes' té un camp 'name' (string)
export async function getRepairTypesFromFirestore(): Promise<string[]> {
  const repairTypesCollection = collection(db, REPAIR_TYPES_COLLECTION);
  const querySnapshot = await getDocs(repairTypesCollection);
  const repairTypes: string[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data && typeof data.name === 'string') {
      repairTypes.push(data.name);
    }
  });
  return repairTypes;
}

// --- Fi de les noves funcions ---
