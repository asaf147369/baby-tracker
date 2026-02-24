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

export function useEntries(options?: { max?: number; type?: EntryType | EntryType[] }) {
  const [entries, setEntries] = useState<Entry[]>([])

  useEffect(() => {
    const typeFilter = options?.type
    const q = query(
      collection(db, COLLECTION),
      orderBy('timestamp', 'desc'),
      ...(typeFilter === undefined ? [] : Array.isArray(typeFilter) ? [where('type', 'in', typeFilter)] : [where('type', '==', typeFilter)]),
      ...(options?.max ? [limit(options.max)] : [])
    )
    const unsub: Unsubscribe = onSnapshot(q, (snap) => {
      const list = snap.docs.map((doc) => docToEntry(doc.id, doc.data() as EntryDoc))
      setEntries(list)
    })
    return () => unsub()
  }, [options?.max, options?.type === undefined ? undefined : Array.isArray(options.type) ? options.type.join(',') : options.type])

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

export interface SleepSummary {
  isSleepingNow: boolean
  sleepStart: Date | null
  lastNapEnd: Date | null
  lastNapStart: Date | null
  lastNapDurationMinutes: number | null
}

export function useSleepSummary(): SleepSummary {
  const entries = useEntries({ max: 200 })
  const sleepEntries = entries.filter((e) => e.type === 'sleep_start' || e.type === 'sleep_end')
  const newest = sleepEntries[0]
  const isSleepingNow = newest?.type === 'sleep_start'
  const sleepStart = isSleepingNow ? newest.timestamp : null

  let lastNapEnd: Date | null = null
  let lastNapStart: Date | null = null
  for (const e of sleepEntries) {
    if (e.type === 'sleep_end' && !lastNapEnd) lastNapEnd = e.timestamp
    if (e.type === 'sleep_start' && lastNapEnd && e.timestamp < lastNapEnd && !lastNapStart) {
      lastNapStart = e.timestamp
      break
    }
  }
  const lastNapDurationMinutes =
    lastNapStart && lastNapEnd
      ? Math.round((lastNapEnd.getTime() - lastNapStart.getTime()) / 60000)
      : null

  return { isSleepingNow, sleepStart, lastNapEnd, lastNapStart, lastNapDurationMinutes }
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
