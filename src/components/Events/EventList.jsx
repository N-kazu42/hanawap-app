import { useState } from 'react'
import { Plus, MapPin, Clock, Users, Trash2, ChevronDown, ChevronUp, Pencil } from 'lucide-react'
import { useEvents, deleteEvent } from '../../hooks/useFirestore'
import EventForm from './EventForm'
import AppIcon from '../brand/AppIcon'
import { BRAND, BRAND_GRADIENT } from '../../utils/brand'

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
          <h2 className="text-base font-bold text-gray-800">山行予定</h2>
          <p className="text-xs text-gray-400">登録した予定を一覧で確認できます</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 text-white text-sm font-bold px-3 py-2 rounded-xl shadow-md active:scale-95 transition-transform"
          style={{ background: BRAND.orange }}
        >
          <Plus size={16} />
          追加
        </button>
      </div>

      {showForm && (
        <EventForm onClose={handleCloseForm} editTarget={editTarget} />
      )}

      {upcoming.length === 0 && !showForm && (
        <div className="text-center py-10 text-gray-400">
          <AppIcon className="w-16 h-16 rounded-3xl shadow-lg mx-auto mb-3 opacity-80" />
          <p className="text-sm">予定されている山行はありません</p>
          <p className="text-xs mt-1">「追加」から次の山行予定を登録できます</p>
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

      {past.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-bold text-gray-400 mb-2">過去の山行</p>
          <div className="space-y-2">
            {past.map(event => (
              <div key={event.id} className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-400">{event.destination}</p>
                  <p className="text-xs text-gray-300">{formatDate(event.date)}</p>
                </div>
                <button onClick={() => handleDelete(event.id)} className="text-gray-200 hover:text-red-300 transition-colors">
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
      <div className="px-4 py-3" style={{ background: BRAND_GRADIENT }}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <AppIcon className="w-7 h-7 rounded-xl shadow-md" />
              <h3 className="text-white font-bold text-base">{event.destination}</h3>
            </div>
            <p className="text-xs" style={{ color: BRAND.orangeSoft }}>{formatDate(event.date)}</p>
          </div>
          {daysLeft > 0 && (
            <div className="text-right">
              <div className="text-white font-bold text-xl leading-none">{daysLeft}</div>
              <div className="text-xs" style={{ color: BRAND.orangeSoft }}>日後</div>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 py-3 space-y-2">
        {event.time && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock size={14} className="shrink-0" style={{ color: BRAND.orange }} />
            <span>集合 {event.time}</span>
          </div>
        )}
        {event.meetingPlace && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin size={14} className="shrink-0" style={{ color: BRAND.orange }} />
            <span>{event.meetingPlace}</span>
          </div>
        )}
        {event.members && event.members.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users size={14} className="shrink-0" style={{ color: BRAND.orange }} />
            <span>{event.members.join('・')}</span>
          </div>
        )}
      </div>

      {(event.bringMeal || event.needChainSpikes || event.needGaiters) && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {event.bringMeal && (
            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-medium px-2 py-1 rounded-full border border-amber-200">
              食事持参
            </span>
          )}
          {event.needChainSpikes && (
            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded-full border border-blue-200">
              チェーンスパイク
            </span>
          )}
          {event.needGaiters && (
            <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-medium px-2 py-1 rounded-full border border-green-200">
              ゲイター
            </span>
          )}
        </div>
      )}

      {(event.note || event.gear) && (
        <>
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center gap-1 py-2 text-xs text-gray-400 border-t border-gray-50 hover:bg-gray-50 transition-colors"
          >
            {expanded ? <><ChevronUp size={14} />閉じる</> : <><ChevronDown size={14} />詳細を見る</>}
          </button>

          {expanded && (
            <div className="px-4 pb-3 border-t border-gray-50 space-y-2 pt-3">
              {event.note && (
                <div>
                  <p className="text-xs font-bold text-gray-400 mb-1">メモ</p>
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

      <div className="flex gap-2 px-4 pb-3 border-t border-gray-50 pt-3">
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-1.5 text-sm font-bold border py-2 rounded-xl active:scale-95 transition-transform"
          style={{ color: BRAND.orange, borderColor: BRAND.orangeSoft }}
        >
          <Pencil size={14} />
          編集
        </button>
        <button
          onClick={onDelete}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 text-gray-400 active:bg-red-50 active:text-red-400 transition-colors"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}
