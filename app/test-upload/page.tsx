'use client'

import { useState } from 'react'

export default function TestUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState('')

  const handleUpload = async () => {
    if (!file || !title) {
      alert('يرجى اختيار ملف وإدخال عنوان')
      return
    }

    setUploading(true)
    setResult('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', title)
      formData.append('description', description)

      const response = await fetch('/api/participant/upload-idea', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setResult(`✅ نجح الرفع: ${JSON.stringify(data, null, 2)}`)
        setFile(null)
        setTitle('')
        setDescription('')
      } else {
        setResult(`❌ فشل الرفع: ${JSON.stringify(data, null, 2)}`)
      }
    } catch (error) {
      setResult(`💥 خطأ: ${error instanceof Error ? error.message : 'حدث خطأ غير متوقع'}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">اختبار رفع الملفات</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">اختر ملف (PDF أو PowerPoint)</label>
            <input
              type="file"
              accept=".pdf,.ppt,.pptx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">عنوان الفكرة</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
              placeholder="أدخل عنوان الفكرة"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">وصف الفكرة (اختياري)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
              placeholder="أدخل وصف الفكرة"
              rows={3}
            />
          </div>

          <button
            onClick={handleUpload}
            disabled={uploading || !file || !title}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
          >
            {uploading ? 'جاري الرفع...' : 'رفع الملف'}
          </button>
        </div>

        {result && (
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h3 className="font-medium mb-2">النتيجة:</h3>
            <pre className="text-sm whitespace-pre-wrap">{result}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
