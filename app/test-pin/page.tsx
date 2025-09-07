'use client'

import { useState, useEffect } from 'react'

export default function TestPin() {
  const [hackathons, setHackathons] = useState([])
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState('')

  useEffect(() => {
    fetchHackathons()
  }, [])

  const fetchHackathons = async () => {
    try {
      const response = await fetch('/api/admin/hackathons')
      if (response.ok) {
        const data = await response.json()
        setHackathons(data.hackathons || [])
      }
    } catch (error) {
      console.error('Error fetching hackathons:', error)
    } finally {
      setLoading(false)
    }
  }

  const togglePin = async (hackathonId: string, currentPinStatus: boolean) => {
    const newPinStatus = !currentPinStatus
    setResult(`جاري ${newPinStatus ? 'تثبيت' : 'إلغاء تثبيت'} الهاكاثون...`)

    try {
      const response = await fetch(`/api/admin/hackathons/${hackathonId}/pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: newPinStatus })
      })

      if (response.ok) {
        const data = await response.json()
        setResult(`✅ ${data.message}`)
        fetchHackathons() // Refresh the list
      } else {
        const error = await response.json()
        setResult(`❌ فشل: ${error.error}`)
      }
    } catch (error) {
      setResult(`💥 خطأ: ${error.message}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">جاري التحميل...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">اختبار تثبيت/إلغاء تثبيت الهاكاثونات</h1>
        
        {result && (
          <div className="mb-6 p-4 bg-blue-50 rounded-md">
            <h3 className="font-medium mb-2">النتيجة:</h3>
            <p className="text-sm">{result}</p>
          </div>
        )}

        <div className="space-y-4">
          {hackathons.map((hackathon: any) => (
            <div key={hackathon.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">{hackathon.title}</h3>
                  <p className="text-gray-600">{hackathon.description}</p>
                  <p className="text-sm mt-2">
                    <span className="font-medium">الحالة: </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      hackathon.isPinned 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {hackathon.isPinned ? 'مثبت في الرئيسية' : 'غير مثبت'}
                    </span>
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => togglePin(hackathon.id, hackathon.isPinned)}
                    className={`px-4 py-2 rounded-md font-medium ${
                      hackathon.isPinned
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-yellow-500 text-white hover:bg-yellow-600'
                    }`}
                  >
                    {hackathon.isPinned ? '📍 إلغاء التثبيت' : '📌 تثبيت'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-md">
          <h3 className="font-medium mb-2">ملاحظات:</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• يمكن تثبيت هاكاثون واحد فقط في نفس الوقت</li>
            <li>• عند تثبيت هاكاثون جديد، سيتم إلغاء تثبيت الهاكاثون السابق تلقائياً</li>
            <li>• الهاكاثون المثبت يظهر في الصفحة الرئيسية</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
