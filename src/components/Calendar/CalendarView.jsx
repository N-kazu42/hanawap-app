import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MEMBERS } from '../../firebase/config'
import { useAvailability, useEvents, useCandidates } from '../../hooks/useFirestore'
import { formatDateInfo, getHolidaysOfMonth } from '../../utils/holidays'
import DayCell from './DayCell'

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

export default function CalendarView() {
  const today = new Date()
  const [year, setYear]   = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)

  const yearMonth    = `${year}-${String(month).padStart(2, '0')}`
  const availability = useAvailability(yearMonth)
  const events       = useEvents()
  const candidates   = useCandidates()
  const holidays     = getHolidaysOfMonth(yearMonth)

  const [selectedDay, setSelectedDay] = useState(null)

  const monthEvents     = events.filter(e => e.date?.startsWith(yearMonth))
  const monthCandidates = candidates.filter(c => c.date?.startsWith(yearMonth))

  // 候補日を日付→候補データのマップに
  const candidateMap = {}
  monthCandidates.forEach(c => { candidateMap[c.date] = c })

  function prevMonth() { if (month === 1) { setYear(y => y-1); setMonth(12) } else setMonth(m => m-1) }
  function nextMonth() { if (month === 12) { setYear(y => y+1); setMonth(1) } else setMonth(m => m+1) }

  const firstDay    = new Date(year, month-1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const selectedDateStr = selectedDay ? `${yearMonth}-${String(selectedDay).padStart(2, '0')}` : null
  const selectedAvail   = selectedDateStr ? (availability[selectedDateStr] || {}) : {}
  const selectedEvent   = selectedDateStr ? monthEvents.find(e => e.date === selectedDateStr) : null
  const selectedCand    = selectedDateStr ? candidateMap[selectedDateStr] : null
  const selectedInfo    = selectedDateStr ? formatDateInfo(selectedDateStr) : null

  return (
    <div className="px-3 pb-24">
      {/* 月ナビ */}
      <div className="flex items-center justify-between py-4">
        <button onClick={prevMonth}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow text-gray-600 active:bg-gray-100">
          <ChevronLeft size={20} />
        </button>
        <span className="text-lg font-bold text-gray-800">{year}年{month}月</span>
        <button onClick={nextMonth}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow text-gray-600 active:bg-gray-100">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* 凡例 */}
      <div className="flex gap-3 mb-3 px-1 flex-wrap text-xs text-gray-500">
        {MEMBERS.map(m => (
          <div key={m.id} className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: m.color }} />
            {m.name}
          </div>
        ))}
        <div className="flex items-center gap-1">
          <span className="font-bold text-green-500">◎</span>全員OK候補
        </div>
        <div className="flex items-center gap-1">
          <span className="font-bold text-yellow-500">？</span>投票中
        </div>
        <div className="flex items-center gap-1">🏔️ 確定山行</div>
      </div>

      {/* カレンダー */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-100">
          {WEEKDAYS.map((w, i) => (
            <div key={w}
              className={`text-center text-xs font-semibold py-2
                ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-500'}`}>
              {w}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} className="aspect-square" />
            const dateStr      = `${yearMonth}-${String(day).padStart(2, '0')}`
            const avail        = availability[dateStr] || {}
            const isEvent      = monthEvents.some(e => e.date === dateStr)
            const candidate    = candidateMap[dateStr]
            const isCandidate  = !!candidate
            const candidateAllOk = isCandidate && MEMBERS.every(m => candidate.votes?.[m.id] === '○')
            const isToday      = day === today.getDate() && month === today.getMonth()+1 && year === today.getFullYear()
            const dow          = (firstDay + day - 1) % 7
            const holidayName  = holidays[dateStr] ?? null
            return (
              <DayCell
                key={day}
                day={day}
                avail={avail}
                isEvent={isEvent}
                isCandidate={isCandidate}
                candidateAllOk={candidateAllOk}
                isToday={isToday}
                isSun={dow === 0}
                isSat={dow === 6}
                isHoliday={holidayName !== null}
                holidayName={holidayName}
                isSelected={selectedDay === day}
                onClick={() => setSelectedDay(selectedDay === day ? null : day)}
              />
            )
          })}
        </div>
      </div>

      {/* 選択日詳細 */}
      {selectedDay && selectedInfo && (
        <div className="mt-3 bg-white rounded-2xl shadow-sm p-4">
          {/* 日付ヘッダー */}
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-sm font-bold
              ${selectedInfo.isRed ? 'text-red-500' : selectedInfo.isSat ? 'text-blue-500' : 'text-gray-700'}`}>
              {month}月{selectedDay}日({['日','月','火','水','木','金','土'][selectedInfo.dow]})
            </span>
            {selectedInfo.holidayName && (
              <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">
                {selectedInfo.holidayName}
              </span>
            )}
          </div>

          {/* 確定イベント */}
          {selectedEvent && (
            <div className="mb-3 p-3 rounded-xl"
              style={{ background: 'linear-gradient(135deg,#ECFDF5,#D1FAE5)' }}>
              <div className="text-xs font-bold text-green-700 mb-1">🏔️ 確定山行</div>
              <div className="text-sm font-bold text-green-900">{selectedEvent.destination}</div>
              <div className="text-xs text-green-700 mt-1">
                📍 {selectedEvent.meetingPlace}
                {selectedEvent.time && <span>　⏰ {selectedEvent.time}</span>}
              </div>
            </div>
          )}

          {/* 候補日の投票状況 */}
          {selectedCand && (
            <div className="mb-3 p-3 rounded-xl bg-yellow-50 border border-yellow-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-yellow-700">📅 候補日（投票中）</span>
                {selectedCand.note && (
                  <span className="text-xs text-yellow-600">📝 {selectedCand.note}</span>
                )}
              </div>
              <div className="flex gap-3">
                {MEMBERS.map(m => {
                  const v = selectedCand.votes?.[m.id]
                  const vStyle = v === '○' ? 'bg-green-100 text-green-700'
                               : v === '△' ? 'bg-yellow-100 text-yellow-700'
                               : v === '×' ? 'bg-red-100 text-red-600'
                               : 'bg-gray-100 text-gray-400'
                  return (
                    <div key={m.id} className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ background: m.color }}>
                        {m.name[0]}
                      </div>
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${vStyle}`}>
                        {v || '–'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 空き状況 */}
          <div className="space-y-2">
            {MEMBERS.map(m => {
              const status = selectedAvail[m.id]
              return (
                <div key={m.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: m.color }}>
                      {m.name[0]}
                    </div>
                    <span className="text-sm text-gray-700">{m.name}</span>
                  </div>
                  <StatusBadge status={status} />
                </div>
              )
            })}
          </div>

          {!Object.keys(selectedAvail).length && !selectedEvent && !selectedCand && (
            <p className="text-xs text-gray-400 text-center mt-2">まだ入力がありません</p>
          )}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }) {
  if (!status) return <span className="text-xs text-gray-300">未入力</span>
  const map = {
    '○': { label: '○ OK',  cls: 'bg-green-100 text-green-700' },
    '△': { label: '△ 未定', cls: 'bg-yellow-100 text-yellow-700' },
    '×': { label: '× NG',  cls: 'bg-red-100 text-red-600' },
  }
  const s = map[status] || { label: status, cls: 'bg-gray-100 text-gray-500' }
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>
}
