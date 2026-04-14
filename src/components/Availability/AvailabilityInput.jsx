import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MEMBERS } from '../../firebase/config'
import { useAvailability, setAvailability } from '../../hooks/useFirestore'
import { getHolidaysOfMonth } from '../../utils/holidays'

const WEEKDAYS    = ['日', '月', '火', '水', '木', '金', '土']
const STATUS_CYCLE = ['', '○', '△', '×']

export default function AvailabilityInput() {
  const today = new Date()
  const [year, setYear]           = useState(today.getFullYear())
  const [month, setMonth]         = useState(today.getMonth() + 1)
  const [selectedMember, setSelectedMember] = useState(MEMBERS[0].id)
  const [saving, setSaving]       = useState(null)

  const yearMonth    = `${year}-${String(month).padStart(2, '0')}`
  const availability = useAvailability(yearMonth)
  const holidays     = getHolidaysOfMonth(yearMonth)

  function prevMonth() { if (month === 1) { setYear(y => y-1); setMonth(12) } else setMonth(m => m-1) }
  function nextMonth() { if (month === 12) { setYear(y => y+1); setMonth(1) } else setMonth(m => m+1) }

  const firstDay    = new Date(year, month-1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  async function handleToggle(day) {
    const dateStr = `${yearMonth}-${String(day).padStart(2, '0')}`
    const current = availability[dateStr]?.[selectedMember] || ''
    const idx     = STATUS_CYCLE.indexOf(current)
    const next    = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
    setSaving(dateStr)
    await setAvailability(yearMonth, dateStr, selectedMember, next || null)
    setSaving(null)
  }

  const member = MEMBERS.find(m => m.id === selectedMember)

  return (
    <div className="px-3 pb-24">
      {/* メンバー選択 */}
      <div className="py-4">
        <p className="text-xs text-gray-500 mb-2 font-medium">誰の予定を入力？</p>
        <div className="flex gap-2">
          {MEMBERS.map(m => (
            <button key={m.id} onClick={() => setSelectedMember(m.id)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all
                          ${selectedMember === m.id ? 'text-white shadow-md scale-105' : 'bg-white text-gray-400 shadow-sm'}`}
              style={selectedMember === m.id ? { background: m.color } : {}}>
              {m.name}
            </button>
          ))}
        </div>
      </div>

      {/* 月ナビ */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow text-gray-600">
          <ChevronLeft size={20} />
        </button>
        <span className="text-lg font-bold text-gray-800">{year}年{month}月</span>
        <button onClick={nextMonth}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow text-gray-600">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* 操作説明 */}
      <div className="flex gap-3 mb-3 px-1 flex-wrap">
        {[['○', 'text-green-500', 'OK'], ['△', 'text-yellow-500', '未定'], ['×', 'text-red-400', 'NG']].map(([s, cls, label]) => (
          <div key={s} className="flex items-center gap-0.5 text-xs text-gray-500">
            <span className={`font-bold ${cls}`}>{s}</span>
            <span>{label}</span>
          </div>
        ))}
        <span className="text-xs text-gray-400">← タップで切替</span>
        <div className="flex items-center gap-1 text-xs text-red-400">
          <span className="font-bold">赤</span>= 祝日
        </div>
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
            if (!day) return <div key={`e-${idx}`} className="aspect-square" />
            const dateStr     = `${yearMonth}-${String(day).padStart(2, '0')}`
            const status      = availability[dateStr]?.[selectedMember] || ''
            const dow         = (firstDay + day - 1) % 7
            const isLoading   = saving === dateStr
            const isToday     = day === today.getDate() && month === today.getMonth()+1 && year === today.getFullYear()
            const holidayName = holidays[dateStr] ?? null
            const isHoliday   = holidayName !== null
            const isSun       = dow === 0
            const isSat       = dow === 6
            const isRed       = isSun || isHoliday

            const statusStyle = {
              '○': { bg: member.bg,    text: member.color, label: '○' },
              '△': { bg: '#FEF9C3',    text: '#CA8A04',    label: '△' },
              '×': { bg: '#FEE2E2',    text: '#DC2626',    label: '×' },
              '':  { bg: isHoliday ? '#FFF5F5' : 'transparent', text: '#D1D5DB', label: '' },
            }[status]

            return (
              <button
                key={day}
                onClick={() => handleToggle(day)}
                disabled={isLoading}
                className={`aspect-square flex flex-col items-center justify-center border-b border-r border-gray-50
                            transition-all active:scale-90 ${isLoading ? 'opacity-50' : ''}`}
                style={{ background: statusStyle.bg }}
              >
                <span className={`text-xs font-semibold leading-none
                  ${isToday ? 'underline underline-offset-2' : ''}
                  ${status ? statusStyle.text : isRed ? 'text-red-400' : isSat ? 'text-blue-400' : 'text-gray-700'}`}>
                  {day}
                </span>
                {/* 祝日名（極小） */}
                {isHoliday && !status && (
                  <span className="text-red-300 leading-none mt-0.5"
                    style={{ fontSize: '6px', maxWidth: '95%', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {holidayName}
                  </span>
                )}
                {status && (
                  <span className="text-xs font-bold leading-none mt-0.5" style={{ color: statusStyle.text }}>
                    {statusStyle.label}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 月集計 */}
      <div className="mt-4 bg-white rounded-2xl shadow-sm p-4">
        <p className="text-xs font-bold text-gray-500 mb-2">{member.name}さんの{month}月の集計</p>
        <div className="flex gap-4">
          {['○', '△', '×'].map(s => {
            const count = Object.values(availability).filter(d => d[selectedMember] === s).length
            const colors = { '○': 'text-green-600', '△': 'text-yellow-600', '×': 'text-red-500' }
            return (
              <div key={s} className="text-center">
                <div className={`text-xl font-bold ${colors[s]}`}>{count}</div>
                <div className="text-xs text-gray-400">{s}</div>
              </div>
            )
          })}
          <div className="text-center">
            <div className="text-xl font-bold text-gray-300">
              {daysInMonth - Object.values(availability).filter(d => d[selectedMember]).length}
            </div>
            <div className="text-xs text-gray-400">未入力</div>
          </div>
        </div>
      </div>
    </div>
  )
}
