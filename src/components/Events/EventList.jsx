import { useState } from 'react'
import { Plus, MapPin, Clock, Users, Trash2, ChevronDown, ChevronUp, Pencil } from 'lucide-react'
import { useEvents, deleteEvent } from '../../hooks/useFirestore'
import EventForm from './EventForm'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  const days = ['日', '月', '火', '水', '木', '金', '土']
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日(${days[d.getDay()]})`
}

function isPast(dateStr) {
  if (!dateStr) return false
  return new Date(dateStr + 'T23:59:59') < new Date()
}

export default function EventList() {
  const events = useEvents()
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  const upcoming = events.filter(e => !isPast(e.date))
  const past = events.filter(e => isPast(e.date))

  async function handleDelete(id) {
    if (!window.confirm('このイベントを削除しますか？')) return
    await deleteEvent(id)
  }

  function handleEdit(event) {
    setEditTarget(event)
    setShowForm(true)
  }

  function handleCloseForm() {
    setShowForm(false)
    setEditTarget(null)
  }

  return (
    <div className="px-3 pb-24">
      <div className="py-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-800">確定山行</h2>
          <p className="text-xs text-gray-400">決まった山行のスケジュール</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 bg-orange-500 text-white text-sm font-bold
                     px-3 py-2 rounded-xl shadow-md active:scale-95 transition-transform"
        >
          <Plus size={16} />
          登録
        </button>
      </div>

      {showForm && (
        <EventForm onClose={handleCloseForm} editTarget={editTarget} />
      )}

      {/* 予定・直近 */}
      {upcoming.length === 0 && !showForm && (
        <div className="text-center py-10 text-gray-400">
          <div className="text-5xl mb-3">🏔️</div>
          <p className="text-sm">確定した山行がありません</p>
          <p className="text-xs mt-1">「登録」ボタンで山行を追加しましょう</p>
        </div>
      )}

      <div className="space-y-3">
        {upcoming.map(event => (
          <EventCard
            key={event.id}
            event={event}
            expanded={expandedId === event.id}
            onToggle={() => setExpandedId(expandedId === event.id ? null : event.id)}
            onEdit={() => handleEdit(event)}
            onDelete={() => handleDelete(event.id)}
          />
        ))}
      </div>

      {/* 過去の山行 */}
      {past.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-bold text-gray-400 mb-2">過去の山行</p>
          <div className="space-y-2">
            {past.map(event => (
              <div key={event.id}
                className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-400">{event.destination}</p>
                  <p className="text-xs text-gray-300">{formatDate(event.date)}</p>
                </div>
                <button onClick={() => handleDelete(event.id)}
                  className="text-gray-200 hover:text-red-300 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function EventCard({ event, expanded, onToggle, onEdit, onDelete }) {
  const daysLeft = Math.ceil((new Date(event.date + 'T00:00:00') - new Date()) / (1000 * 60 * 60 * 24))

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* グラデーションヘッダー */}
      <div
        className="px-4 py-3"
        style={{ background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 60%, #40916C 100%)' }}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🏔️</span>
              <h3 className="text-white font-bold text-base">{event.destination}</h3>
            </div>
            <p className="text-green-200 text-xs">{formatDate(event.date)}</p>
          </div>
          {daysLeft > 0 && (
            <div className="text-right">
              <div className="text-white font-bold text-xl leading-none">{daysLeft}</div>
              <div className="text-green-300 text-xs">日後</div>
            </div>
          )}
        </div>
      </div>

      {/* 基本情報 */}
      <div className="px-4 py-3 space-y-2">
        {event.time && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock size={14} className="text-orange-400 shrink-0" />
            <span>集合 {event.time}</span>
          </div>
        )}
        {event.meetingPlace && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin size={14} className="text-orange-400 shrink-0" />
            <span>{event.meetingPlace}</span>
          </div>
        )}
        {event.members && event.members.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users size={14} className="text-orange-400 shrink-0" />
            <span>{event.members.join('・')}</span>
          </div>
        )}
      </div>

      {/* 詳細展開 */}
      {(event.note || event.gear) && (
        <>
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center gap-1 py-2 text-xs text-gray-400
                       border-t border-gray-50 hover:bg-gray-50 transition-colors"
          >
            {expanded ? <><ChevronUp size={14} />閉じる</> : <><ChevronDown size={14} />詳細を見る</>}
          </button>

          {expanded && (
            <div className="px-4 pb-3 border-t border-gray-50 space-y-2 pt-3">
              {event.note && (
                <div>
                  <p className="text-xs font-bold text-gray-400 mb-1">備考</p>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{event.note}</p>
                </div>
              )}
              {event.gear && (
                <div>
                  <p className="text-xs font-bold text-gray-400 mb-1">持ち物</p>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{event.gear}</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* アクション */}
      <div className="flex gap-2 px-4 pb-3 border-t border-gray-50 pt-3">
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-1.5 text-sm font-bold
                     text-orange-500 border border-orange-200 py-2 rounded-xl
                     active:scale-95 transition-transform"
        >
          <Pencil size={14} />
          編集
        </button>
        <button
          onClick={onDelete}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 text-gray-400
                     active:bg-red-50 active:text-red-400 transition-colors"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}
