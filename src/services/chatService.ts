import { db } from '../config/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  addDoc,
  updateDoc,
  doc,
  setDoc,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';

/**
 * Firestore schema (minimal):
 *  - conversations (collection)
 *      id: string (generated)
 *      participants: string[]  // Google user ids
 *      updatedAt: Timestamp
 *      lastMessage?: {
 *          text?: string;
 *          type: 'text' | 'image' | 'video' | 'location';
 *          sender: string;
 *          createdAt: Timestamp;
 *      }
 *  - conversations/{conversationId}/messages (sub-collection)
 *      id: string
 *      sender: string
 *      type: 'text' | 'image' | 'video' | 'location'
 *      text?: string
 *      media?: { url: string; thumbnail?: string; }
 *      createdAt: Timestamp
 */

import type { QuerySnapshot, DocumentData } from 'firebase/firestore';

export const listenConversations = (
  userId: string,
  onUpdate: (snapshot: QuerySnapshot<DocumentData>) => void
) => {
  const convRef = collection(db, 'conversations');
  const q = query(
    convRef,
    where('participants', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );
  return onSnapshot(q, onUpdate);
};

export const listenMessages = (
  conversationId: string,
  onUpdate: (snapshot: QuerySnapshot<DocumentData>) => void
) => {
  const msgsRef = collection(db, 'conversations', conversationId, 'messages');
  const q = query(msgsRef, orderBy('createdAt', 'asc'));
  return onSnapshot(q, onUpdate);
};

const ensureConversation = async (
  userA: string,
  userB: string
): Promise<string> => {
  // Deterministic id by sorting ids (for 1-to-1 chat). For groups you'd use server generated id.
  const sorted = [userA, userB].sort();
  const convId = `${sorted[0]}_${sorted[1]}`;
  const convDoc = doc(db, 'conversations', convId);
  const snap = await getDoc(convDoc);
  if (!snap.exists()) {
    await setDoc(convDoc, {
      participants: sorted,
      updatedAt: serverTimestamp(),
    });
  }
  return convId;
};

export const sendTextMessage = async (
  senderId: string,
  receiverId: string,
  text: string
) => {
  if (!text.trim()) return;
  const convId = await ensureConversation(senderId, receiverId);
  const msgsRef = collection(db, 'conversations', convId, 'messages');
  const now = serverTimestamp();
  await addDoc(msgsRef, {
    sender: senderId,
    type: 'text',
    text,
    createdAt: now,
  });
  await updateDoc(doc(db, 'conversations', convId), {
    lastMessage: {
      text,
      type: 'text',
      sender: senderId,
      createdAt: now,
    },
    updatedAt: now,
  });
};
