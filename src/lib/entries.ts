import { useEffect, useState } from 'react'
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  limit,
  where,
  type Unsubscribe,
} from 'firebase/firestore'
import { db, auth } from './firebase'
import type { Entry, EntryType, EntryDoc } from '../types/entry'

const COLLECTION = 'entries'

function docToEntry(id: string, d: EntryDoc): Entry {
  return {
    id,
    type: d.type,
    amount: d.amount,
    timestamp: d.timestamp?.toDate?.() ?? new Date(),
    userId: d.userId,
  }
}

export function useEntries(options?: { max?: number; type?: EntryType }) {
  const [entries, setEntries] = useState<Entry[]>([])

  useEffect(() => {
    const q = query(
      collection(db, COLLECTION),
      orderBy('timestamp', 'desc'),
      ...(options?.type ? [where('type', '==', options.type)] : []),
      ...(options?.max ? [limit(options.max)] : [])
    )
    const unsub: Unsubscribe = onSnapshot(q, (snap) => {
      const list = snap.docs.map((doc) => docToEntry(doc.id, doc.data() as EntryDoc))
      setEntries(list)
    })
    return () => unsub()
  }, [options?.max, options?.type])

  return entries
}

export function useLastByType() {
  const entries = useEntries({ max: 100 })
  const last = { food: null as Date | null, poop: null as Date | null, pee: null as Date | null }
  for (const e of entries) {
    if (e.type === 'food' && !last.food) last.food = e.timestamp
    if (e.type === 'poop' && !last.poop) last.poop = e.timestamp
    if (e.type === 'pee' && !last.pee) last.pee = e.timestamp
    if (last.food && last.poop && last.pee) break
  }
  return last
}

export async function addEntry(type: EntryType, amount?: string, timestamp?: Date): Promise<void> {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error('Not authenticated')
  const doc: Omit<EntryDoc, 'timestamp'> & { timestamp: Timestamp } = {
    type,
    userId: uid,
    timestamp: Timestamp.fromDate(timestamp ?? new Date()),
  }
  if (amount !== undefined && amount !== '') doc.amount = amount
  await addDoc(collection(db, COLLECTION), doc)
}
