import { useState } from 'react'
import { X, Plus, Trash2, CalendarRange, CalendarDays } from 'lucide-react'
import { addCandidate } from '../../hooks/useFirestore'
import { formatDateInfo } from '../../utils/holidays'

function formatLabel(dateStr) {
  if (!dateStr) return { text: '', color: 'text-gray-700' }
  const { label, isRed, isSat } = formatDateInfo(dateStr)
  const color = isRed ? 'text-red-500' : isSat ? 'text-blue-500' : 'text-gray-700'
  return { text: label, color }
}

// Date を "YYYY-MM-DD" 文字列に変換（ローカル時間基準）
function toDateStr(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// 開始〜終了日の間の全日付を生成
function generateDateRange(from, to) {
  if (!from || !to || from > to) return []
  const dates = []
  const cur = new Date(from + 'T00:00:00')
  const end = new Date(to   + 'T00:00:00')
  while (cur <= end) {
    dates.push(toDateStr(cur))
    cur.setDate(cur.getDate() + 1)
  }
  return dates
}

const today = toDateStr(new Date())

export default function CandidateForm({ onClose }) {
  const [mode, setMode] = useState('single') // 'single' | 'range'

  // 個別入力モード
  const [entries, setEntries] = useState([{ date: today, note: '' }])

  // 連休モード
  const [rangeFrom, setRangeFrom] = useState(today)
  const [rangeTo,   setRangeTo]   = useState(today)
  const [rangeNote, setRangeNote] = useState('')

  const [saving, setSaving] = useState(false)

  // 連休モードのプレビュー日付
  const previewDates = generateDateRange(rangeFrom, rangeTo)

  // 個別モード：操作
  function addEntry()                        { setEntries(p => [...p, { date: today, note: '' }]) }
  function removeEntry(idx)                  { setEntries(p => p.filter((_, i) => i !== idx)) }
  function updateEntry(idx, field, value)    { setEntries(p => p.map((e, i) => i === idx ? { ...e, [field]: value } : e)) }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    if (mode === 'single') {
      const valid = entries.filter(en => en.date)
      await Promise.all(valid.map(en => addCandidate({ date: en.date, note: en.note })))
    } else {
      await Promise.all(previewDates.map(d => addCandidate({ date: d, note: rangeNote })))
    }
    setSaving(false)
    onClose()
  }

  const submitCount = mode === 'single' ? entries.filter(e => e.date).length : previewDates.length
  const canSubmit   = submitCount > 0

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-700">候補日を追加</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={18} />
        </button>
      </div>

      {/* モード切替 */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
        <button
          type="button"
          onClick={() => setMode('single')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all
                      ${mode === 'single' ? 'bg-white text-gray-800 shadow' : 'text-gray-400'}`}
        >
          <CalendarDays size={14} />
          個別に追加
        </button>
        <button
          type="button"
          onClick={() => setMode('range')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all
                      ${mode === 'range' ? 'bg-white text-orange-600 shadow' : 'text-gray-400'}`}
        >
          <CalendarRange size={14} />
          連休でまとめて
        </button>
      </div>

      <form onSubmit={handleSubmit}>

        {/* ── 個別入力モード ── */}
        {mode === 'single' && (
          <>
            <div className="space-y-2 mb-3">
              {entries.map((en, idx) => {
                const fmt = formatLabel(en.date)
                return (
                  <div key={idx} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-gray-300 w-4">{idx + 1}</span>
                      {en.date && <span className={`text-xs font-bold ${fmt.color}`}>{fmt.text}</span>}
                      {entries.length > 1 && (
                        <button type="button" onClick={() => removeEntry(idx)}
                          className="ml-auto text-gray-300 hover:text-red-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <input
                      type="date"
                      value={en.date}
                      onChange={e => updateEntry(idx, 'date', e.target.value)}
                      required
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs mb-2
                                 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
                    />
                    <input
                      type="text"
                      value={en.note}
                      onChange={e => updateEntry(idx, 'note', e.target.value)}
                      placeholder="備考（任意）"
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs
                                 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
                    />
                  </div>
                )
              })}
            </div>
            <button
              type="button"
              onClick={addEntry}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-bold
                         text-orange-500 border-2 border-dashed border-orange-200 rounded-xl py-2.5 mb-3
                         hover:bg-orange-50 active:scale-95 transition-all"
            >
              <Plus size={14} />
              日付を追加
            </button>
          </>
        )}

        {/* ── 連休まとめモード ── */}
        {mode === 'range' && (
          <>
            <div className="bg-orange-50 rounded-xl p-3 mb-3">
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="text-xs text-gray-500 font-medium block mb-1">開始日</label>
                  <input
                    type="date"
                    value={rangeFrom}
                    onChange={e => setRangeFrom(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs
                               focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium block mb-1">終了日</label>
                  <input
                    type="date"
                    value={rangeTo}
                    min={rangeFrom}
                    onChange={e => setRangeTo(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs
                               focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
                  />
                </div>
              </div>
              <input
                type="text"
                value={rangeNote}
                onChange={e => setRangeNote(e.target.value)}
                placeholder="備考（全日程共通・任意）"
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs
                           focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
              />
            </div>

            {/* プレビュー */}
            {previewDates.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-bold text-gray-400 mb-1.5">
                  追加される日程（{previewDates.length}日間）
                </p>
                <div className="bg-gray-50 rounded-xl px-3 py-2 flex flex-wrap gap-x-3 gap-y-1">
                  {previewDates.map(d => {
                    const { text, color } = formatLabel(d)
                    return (
                      <span key={d} className={`text-xs font-bold ${color}`}>{text}</span>
                    )
                  })}
                </div>
              </div>
            )}

            {rangeFrom > rangeTo && (
              <p className="text-xs text-red-400 mb-3">終了日は開始日以降を選んでください</p>
            )}
          </>
        )}

        <button
          type="submit"
          disabled={saving || !canSubmit}
          className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl
                     active:scale-95 transition-transform disabled:opacity-50 text-sm"
        >
          {saving ? '追加中...' : `${submitCount}日分の候補日を追加`}
        </button>
      </form>
    </div>
  )
}
