import type { Timestamp } from 'firebase/firestore'

export type EntryType = 'food' | 'poop' | 'pee' | 'sleep_start' | 'sleep_end'

export type PoopAmount = 'small' | 'medium' | 'large'

export interface Entry {
  id: string
  type: EntryType
  amount?: string
  timestamp: Date
  userId: string
}

export interface EntryDoc {
  type: EntryType
  amount?: string
  timestamp: Timestamp
  userId: string
}
