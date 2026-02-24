import { useEffect, useState } from 'react'
import {
  collection,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  limit,
  where,
  type Unsubscribe,
  type UpdateData,
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

const VITAMIN_D_LABEL = 'ויטמין D'

function isToday(d: Date): boolean {
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
}

export function useMedicineGivenToday(medicineLabel?: string): { given: boolean; time: Date | null } {
  const entries = useEntries({ max: 100 })
  const label = medicineLabel ?? VITAMIN_D_LABEL
  const medicineEntries = entries.filter((e) => e.type === 'medicine' && (e.amount === label || !e.amount))
  const todayEntry = medicineEntries.find((e) => isToday(e.timestamp))
  return {
    given: !!todayEntry,
    time: todayEntry?.timestamp ?? null,
  }
}

export interface TodaySummary {
  feeds: number
  naps: number
  totalSleepMinutes: number
}

export function useTodaySummary(): TodaySummary {
  const entries = useEntries({ max: 300 })
  const todayEntries = entries.filter((e) => isToday(e.timestamp))
  const feeds = todayEntries.filter((e) => e.type === 'food').length
  const sleepEntries = todayEntries
    .filter((e) => e.type === 'sleep_start' || e.type === 'sleep_end')
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  let naps = 0
  let totalSleepMinutes = 0
  for (let i = 0; i < sleepEntries.length - 1; i++) {
    if (sleepEntries[i].type === 'sleep_start' && sleepEntries[i + 1].type === 'sleep_end') {
      naps += 1
      totalSleepMinutes += Math.round(
        (sleepEntries[i + 1].timestamp.getTime() - sleepEntries[i].timestamp.getTime()) / 60000
      )
    }
  }
  return { feeds, naps, totalSleepMinutes }
}

export async function addEntry(type: EntryType, amount?: string, timestamp?: Date): Promise<void> {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error('Not authenticated')
  const data: Omit<EntryDoc, 'timestamp'> & { timestamp: Timestamp } = {
    type,
    userId: uid,
    timestamp: Timestamp.fromDate(timestamp ?? new Date()),
  }
  if (amount !== undefined && amount !== '') data.amount = amount
  await addDoc(collection(db, COLLECTION), data)
}

export async function deleteEntry(id: string): Promise<void> {
  if (!auth.currentUser) throw new Error('Not authenticated')
  await deleteDoc(doc(db, COLLECTION, id))
}

export async function updateEntry(
  id: string,
  data: { timestamp?: Date; amount?: string }
): Promise<void> {
  if (!auth.currentUser) throw new Error('Not authenticated')
  const ref = doc(db, COLLECTION, id)
  const updateData: UpdateData<EntryDoc> = {}
  if (data.timestamp !== undefined)
    updateData.timestamp = Timestamp.fromDate(data.timestamp)
  if (data.amount !== undefined) updateData.amount = data.amount
  await updateDoc(ref, updateData)
}
