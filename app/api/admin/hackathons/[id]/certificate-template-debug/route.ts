import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🚀 DEBUG: Certificate upload started')
    
    // Step 1: Get hackathon ID
    const { id: hackathonId } = await params
    console.log('✅ Step 1: Hackathon ID:', hackathonId)
    
    // Step 2: Check if we can import JWT
    try {
      const jwt = await import('jsonwebtoken')
      console.log('✅ Step 2: JWT imported successfully')
    } catch (error) {
      console.error('❌ Step 2: JWT import failed:', error)
      return NextResponse.json({ error: 'JWT import failed' }, { status: 500 })
    }
    
    // Step 3: Check if we can import Prisma
    try {
      const { prisma } = await import('@/lib/prisma')
      console.log('✅ Step 3: Prisma imported successfully')
    } catch (error) {
      console.error('❌ Step 3: Prisma import failed:', error)
      return NextResponse.json({ error: 'Prisma import failed' }, { status: 500 })
    }
    
    // Step 4: Check if we can import storage
    try {
      const { uploadFile } = await import('@/lib/storage')
      console.log('✅ Step 4: Storage imported successfully')
    } catch (error) {
      console.error('❌ Step 4: Storage import failed:', error)
      return NextResponse.json({ error: 'Storage import failed' }, { status: 500 })
    }
    
    // Step 5: Check auth header
    const authHeader = request.headers.get('authorization')
    console.log('✅ Step 5: Auth header:', authHeader ? 'Present' : 'Missing')
    
    if (!authHeader) {
      return NextResponse.json({ error: 'No auth header' }, { status: 401 })
    }
    
    // Step 6: Try to verify token
    try {
      const jwt = await import('jsonwebtoken')
      const token = authHeader.replace('Bearer ', '')
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as any
      console.log('✅ Step 6: Token verified, role:', payload.role)
      
      if (!payload || payload.role !== 'admin') {
        return NextResponse.json({ error: 'Not admin' }, { status: 401 })
      }
    } catch (error) {
      console.error('❌ Step 6: Token verification failed:', error)
      return NextResponse.json({ error: 'Token verification failed' }, { status: 401 })
    }
    
    // Step 7: Try to parse form data
    try {
      const formData = await request.formData()
      console.log('✅ Step 7: Form data parsed, keys:', Array.from(formData.keys()))
      
      const file = formData.get('certificateTemplate') as File
      if (!file) {
        return NextResponse.json({ error: 'No file in form data' }, { status: 400 })
      }
      
      console.log('✅ Step 7: File found:', {
        name: file.name,
        size: file.size,
        type: file.type
      })
      
    } catch (error) {
      console.error('❌ Step 7: Form data parsing failed:', error)
      return NextResponse.json({ error: 'Form data parsing failed' }, { status: 400 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'All steps completed successfully' 
    })
    
  } catch (error: any) {
    console.error('❌ DEBUG: Unexpected error:', error)
    return NextResponse.json({
      error: 'Debug failed: ' + (error.message || 'Unknown error'),
      stack: error.stack
    }, { status: 500 })
  }
}
