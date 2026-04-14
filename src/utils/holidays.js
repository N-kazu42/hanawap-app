import { getHolidaysOf } from 'japanese-holidays'

// 年ごとにキャッシュ
const cache = {}

function loadYear(year) {
  if (cache[year]) return cache[year]
  const map = {}
  getHolidaysOf(year).forEach(({ month, date, name }) => {
    const key = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`
    map[key] = name
  })
  cache[year] = map
  return map
}

/**
 * 日付文字列 "YYYY-MM-DD" の祝日名を返す。祝日でなければ null。
 */
export function getHolidayName(dateStr) {
  if (!dateStr) return null
  const year = parseInt(dateStr.slice(0, 4))
  const map = loadYear(year)
  return map[dateStr] ?? null
}

/**
 * 日付文字列が祝日かどうか
 */
export function isHoliday(dateStr) {
  return getHolidayName(dateStr) !== null
}

/**
 * "YYYY-MM" の月について {dateStr: holidayName} のマップを返す
 */
export function getHolidaysOfMonth(yearMonth) {
  const year = parseInt(yearMonth.slice(0, 4))
  const map = loadYear(year)
  const result = {}
  Object.entries(map).forEach(([k, v]) => {
    if (k.startsWith(yearMonth)) result[k] = v
  })
  return result
}

/**
 * 日付文字列から曜日・祝日情報をまとめて返すヘルパー
 * @returns { label, holidayName, isSun, isSat, isHoliday, isRed }
 */
export function formatDateInfo(dateStr) {
  if (!dateStr) return {}
  const d = new Date(dateStr + 'T00:00:00')
  const days = ['日', '月', '火', '水', '木', '金', '土']
  const dow = d.getDay()
  const holidayName = getHolidayName(dateStr)
  const isSun = dow === 0
  const isSat = dow === 6
  const isHol = holidayName !== null
  const isRed = isSun || isHol
  const dowLabel = days[dow] + (isHol ? '祝' : '')
  const label = `${d.getMonth() + 1}/${d.getDate()}(${dowLabel})`
  return { label, holidayName, isSun, isSat, isHoliday: isHol, isRed, dow }
}
