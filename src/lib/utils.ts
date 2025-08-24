import { format } from 'date-fns'


export const dayKey = (d = new Date()) => format(d, 'yyyy-MM-dd')
export const ymd = (d = new Date()) => ({
year: parseInt(format(d, 'yyyy')),
month: parseInt(format(d, 'MM')),
day: parseInt(format(d, 'dd')),
})


export function downloadCsv(filename: string, rows: (string|number)[][]) {
const csv = rows.map(r => r.map(c => {
const s = String(c ?? '')
return /[",\n]/.test(s) ? '"' + s.replaceAll('"','""') + '"' : s
}).join(',')).join('\n')
const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
const url = URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url; a.download = filename; a.click()
URL.revokeObjectURL(url)
}