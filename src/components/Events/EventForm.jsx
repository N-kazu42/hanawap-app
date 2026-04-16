import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { MEMBERS } from '../../firebase/config'
import { addEvent, updateEvent } from '../../hooks/useFirestore'
import { BRAND, BRAND_GRADIENT } from '../../utils/brand'

export default function EventForm({ onClose, editTarget, initialDate }) {
  const today = new Date().toISOString().slice(0, 10)
  const [date, setDate] = useState(initialDate || today)
  const [time, setTime] = useState('06:00')
  const [destination, setDestination] = useState('')
  const [meetingPlace, setMeetingPlace] = useState('')
  const [note, setNote] = useState('')
  const [gear, setGear] = useState('')
  const [selectedMembers, setSelectedMembers] = useState(MEMBERS.map(m => m.name))
  const [bringMeal, setBringMeal] = useState(false)
  const [needChainSpikes, setNeedChainSpikes] = useState(false)
  const [needGaiters, setNeedGaiters] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (editTarget) {
      setDate(editTarget.date || today)
      setTime(editTarget.time || '06:00')
      setDestination(editTarget.destination || '')
      setMeetingPlace(editTarget.meetingPlace || '')
      setNote(editTarget.note || '')
      setGear(editTarget.gear || '')
      setSelectedMembers(editTarget.members || MEMBERS.map(m => m.name))
      setBringMeal(editTarget.bringMeal || false)
      setNeedChainSpikes(editTarget.needChainSpikes || false)
      setNeedGaiters(editTarget.needGaiters || false)
    }
  }, [editTarget])

  function toggleMember(name) {
    setSelectedMembers(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!destination || !date) return
    setSaving(true)
    const data = { date, time, destination, meetingPlace, note, gear, members: selectedMembers, bringMeal, needChainSpikes, needGaiters }
    if (editTarget) {
      await updateEvent(editTarget.id, data)
    } else {
      await addEvent(data)
    }
    setSaving(false)
    onClose()
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 mb-4 border" style={{ borderColor: BRAND.orangeSoft }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-700">
          {editTarget ? '山行を編集' : '山行を登録'}
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">山名・行き先 *</label>
          <input
            type="text"
            value={destination}
            onChange={e => setDestination(e.target.value)}
            placeholder="例：北アルプス 涸沢"
            required
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                       focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': BRAND.orangeSoft }}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">日付 *</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                         focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': BRAND.orangeSoft }}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">集合時間</label>
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                         focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': BRAND.orangeSoft }}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">集合場所</label>
          <input
            type="text"
            value={meetingPlace}
            onChange={e => setMeetingPlace(e.target.value)}
            placeholder="例：松本駅 東口"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                       focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': BRAND.orangeSoft }}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">参加メンバー</label>
          <div className="flex gap-2">
            {MEMBERS.map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => toggleMember(m.name)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all
                            ${selectedMembers.includes(m.name) ? 'text-white' : 'bg-gray-100 text-gray-400'}`}
                style={selectedMembers.includes(m.name) ? { background: m.color } : {}}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">備考</label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="例：雨天中止。前日20時に判断。"
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                       focus:outline-none focus:ring-2 resize-none"
            style={{ '--tw-ring-color': BRAND.orangeSoft }}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">持ち物メモ</label>
          <textarea
            value={gear}
            onChange={e => setGear(e.target.value)}
            placeholder="例：レインウェア・アイゼン・ヘッドランプ"
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                       focus:outline-none focus:ring-2 resize-none"
            style={{ '--tw-ring-color': BRAND.orangeSoft }}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 block mb-2">装備・食事チェック</label>
          <div className="flex flex-col gap-2">
            {[
              { label: '🍱 食事持参が必要', value: bringMeal, setter: setBringMeal },
              { label: '⛓️ チェーンスパイクが必要', value: needChainSpikes, setter: setNeedChainSpikes },
              { label: '🦵 ゲーターが必要', value: needGaiters, setter: setNeedGaiters },
            ].map(({ label, value, setter }) => (
              <label key={label} className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={e => setter(e.target.checked)}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: BRAND.orange }}
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || !destination || !date}
          className="w-full font-bold py-3 rounded-xl text-white
                     active:scale-95 transition-transform disabled:opacity-50"
          style={{ background: BRAND_GRADIENT }}
        >
          {saving ? '保存中...' : editTarget ? '更新する' : '山行を登録'}
        </button>
      </form>
    </div>
  )
}
