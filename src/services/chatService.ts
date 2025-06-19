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
  getDoc,
  getDocs,
  writeBatch,
  QueryDocumentSnapshot,
  DocumentData
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

import type { QuerySnapshot } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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

export const sendMediaMessage = async (
  senderId: string,
  receiverId: string,
  file: File,
  type: 'image' | 'video' | 'audio',
  replyTo?: string
) => {
  const convId = await ensureConversation(senderId, receiverId);
  const storage = getStorage();
  const filePath = `messages/${convId}/${Date.now()}_${file.name}`;
  const fileRef = ref(storage, filePath);
  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);

  const msgsRef = collection(db, 'conversations', convId, 'messages');
  const now = serverTimestamp();
  
  const messageData: any = {
    sender: senderId,
    type,
    media: { url },
    createdAt: now,
    seen: false,
  };
  if (replyTo) messageData.replyTo = replyTo;

  await addDoc(msgsRef, messageData);

  await updateDoc(doc(db, 'conversations', convId), {
    lastMessage: {
      type,
      sender: senderId,
      text: type === 'image' ? '📷 Photo' : type === 'video' ? '🎥 Video' : '🎤 Audio',
      createdAt: now,
      seen: false,
    },
    updatedAt: now,
  });
};

export const markMessagesSeen = async (
  conversationId: string,
  userId: string
) => {
  const msgsRef = collection(db, 'conversations', conversationId, 'messages');
  const q = query(msgsRef, where('sender', '!=', userId), where('seen', '==', false));
  const snap = await getDocs(q);
  if (snap.empty) return;

  const batch = writeBatch(db);
  snap.docs.forEach((docSnap: QueryDocumentSnapshot<DocumentData>) => {
    batch.update(docSnap.ref, { seen: true });
  });

  await batch.commit();

  // Also update the lastMessage in the conversation
  const convDoc = doc(db, 'conversations', conversationId);
  const convSnap = await getDoc(convDoc);
  if (convSnap.exists()) {
    const convData = convSnap.data();
    if (convData.lastMessage && convData.lastMessage.sender !== userId) {
      await updateDoc(convDoc, {
        'lastMessage.seen': true
      });
    }
  }
};

export const sendTextMessage = async (
  senderId: string,
  receiverId: string,
  text: string,
  replyTo?: string
) => {
  if (!text.trim()) return;
  const convId = await ensureConversation(senderId, receiverId);
  const msgsRef = collection(db, 'conversations', convId, 'messages');
  const now = serverTimestamp();
  
  const messageData: any = {
    sender: senderId,
    type: 'text',
    text,
    createdAt: now,
    seen: false,
  };
  if (replyTo) messageData.replyTo = replyTo;

  await addDoc(msgsRef, messageData);

  await updateDoc(doc(db, 'conversations', convId), {
    lastMessage: {
      text,
      type: 'text',
      sender: senderId,
      createdAt: now,
      seen: false,
    },
    updatedAt: now,
  });
};
