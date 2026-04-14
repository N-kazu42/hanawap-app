import { useState, useEffect } from 'react'
import {
  collection, doc, onSnapshot, setDoc, deleteDoc,
  query, orderBy, addDoc, updateDoc, deleteField
} from 'firebase/firestore'
import { db } from '../firebase/config'

// ---- 空き状況 ----
export function useAvailability(yearMonth) {
  const [data, setData] = useState({})
  useEffect(() => {
    if (!yearMonth) return
    const ref = collection(db, 'availability', yearMonth, 'days')
    return onSnapshot(
      ref,
      snap => {
        const result = {}
        snap.forEach(d => { result[d.id] = d.data() })
        setData(result)
      },
      err => { console.error('useAvailability error:', err) }
    )
  }, [yearMonth])
  return data
}

export async function setAvailability(yearMonth, date, memberId, status) {
  const ref = doc(db, 'availability', yearMonth, 'days', date)
  await setDoc(ref, { [memberId]: status }, { merge: true })
}

// ---- 候補日 ----
export function useCandidates() {
  const [candidates, setCandidates] = useState([])
  useEffect(() => {
    const ref = query(collection(db, 'candidates'), orderBy('date'))
    return onSnapshot(
      ref,
      snap => { setCandidates(snap.docs.map(d => ({ id: d.id, ...d.data() }))) },
      err  => { console.error('useCandidates error:', err) }
    )
  }, [])
  return candidates
}

export async function addCandidate(data) {
  await addDoc(collection(db, 'candidates'), {
    ...data,
    votes: {},
    confirmed: false,
    createdAt: new Date().toISOString()
  })
}

export async function updateVote(candidateId, memberId, vote) {
  const ref = doc(db, 'candidates', candidateId)
  // null のときはフィールドを削除（null を保存すると集計がずれる）
  await updateDoc(ref, { [`votes.${memberId}`]: vote === null ? deleteField() : vote })
}

export async function confirmCandidate(candidateId) {
  const ref = doc(db, 'candidates', candidateId)
  await updateDoc(ref, { confirmed: true })
}

export async function deleteCandidate(candidateId) {
  await deleteDoc(doc(db, 'candidates', candidateId))
}

// ---- 確定イベント ----
export function useEvents() {
  const [events, setEvents] = useState([])
  useEffect(() => {
    const ref = query(collection(db, 'events'), orderBy('date'))
    return onSnapshot(ref, snap => {
      setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
  }, [])
  return events
}

export async function addEvent(data) {
  await addDoc(collection(db, 'events'), {
    ...data,
    createdAt: new Date().toISOString()
  })
}

export async function updateEvent(eventId, data) {
  await updateDoc(doc(db, 'events', eventId), data)
}

export async function deleteEvent(eventId) {
  await deleteDoc(doc(db, 'events', eventId))
}
