'use client'

import { useState } from 'react'

export default function TestCertificate() {
  const [name, setName] = useState('أحمد محمد')
  const [hackathon, setHackathon] = useState('هاكاثون الابتكار التقني')
  const [team, setTeam] = useState('الفريق الأول')
  const [rank, setRank] = useState(1)
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState('')

  const generateCertificate = async () => {
    setGenerating(true)
    setResult('')

    try {
      const response = await fetch('/api/test-certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantName: name,
          hackathonTitle: hackathon,
          teamName: team,
          rank: rank,
          isWinner: rank <= 3
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `certificate-${name.replace(/\s+/g, '-')}.png`
        link.click()
        setResult('✅ تم إنشاء الشهادة وتحميلها بنجاح!')
      } else {
        const error = await response.json()
        setResult(`❌ فشل في إنشاء الشهادة: ${error.error}`)
      }
    } catch (error) {
      setResult(`💥 خطأ: ${error.message}`)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">اختبار إنشاء الشهادات</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">اسم المشارك</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
              placeholder="أدخل اسم المشارك"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">اسم الهاكاثون</label>
            <input
              type="text"
              value={hackathon}
              onChange={(e) => setHackathon(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
              placeholder="أدخل اسم الهاكاثون"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">اسم الفريق</label>
            <input
              type="text"
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
              placeholder="أدخل اسم الفريق"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">المركز</label>
            <select
              value={rank}
              onChange={(e) => setRank(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-md p-2"
            >
              <option value={1}>المركز الأول</option>
              <option value={2}>المركز الثاني</option>
              <option value={3}>المركز الثالث</option>
              <option value={4}>مشاركة عادية</option>
            </select>
          </div>

          <button
            onClick={generateCertificate}
            disabled={generating || !name}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
          >
            {generating ? 'جاري إنشاء الشهادة...' : 'إنشاء وتحميل الشهادة'}
          </button>
        </div>

        {result && (
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h3 className="font-medium mb-2">النتيجة:</h3>
            <p className="text-sm">{result}</p>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <h3 className="font-medium mb-2 text-blue-800">ملاحظة:</h3>
          <p className="text-sm text-blue-700">
            هذه الصفحة لاختبار إنشاء الشهادات فقط. الشهادة ستُحمل كملف PNG.
          </p>
        </div>
      </div>
    </div>
  )
}
