'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { 
  Mail, 
  Send, 
  Save, 
  Eye, 
  Users, 
  RefreshCw,
  FileText,
  Sparkles,
  CheckCircle2,
  XCircle,
  Filter,
  Search
} from "lucide-react"

interface EmailTemplate {
  id: string
  templateKey: string
  nameAr: string
  nameEn: string
  subject: string
  bodyHtml: string
  bodyText?: string
  category: string
  variables?: Record<string, string>
  isActive: boolean
  isSystem: boolean
  description?: string
  lastEditedBy?: string
  createdAt: string
  updatedAt: string
}

interface EmailStats {
  totalSent: number
  deliveryRate: number
  openRate: number
  lastSent?: string
}

const TEMPLATE_CATEGORIES = [
  { value: 'participant', label: 'المشاركين', icon: '👥' },
  { value: 'judge', label: 'المحكمين', icon: '⚖️' },
  { value: 'supervisor', label: 'المشرفين', icon: '👨‍💼' },
  { value: 'team', label: 'الفرق', icon: '🏆' },
  { value: 'certificate', label: 'الشهادات', icon: '📜' },
  { value: 'general', label: 'عام', icon: '📧' }
]

// قوالب الإيميلات الافتراضية
const DEFAULT_TEMPLATES: Partial<EmailTemplate>[] = [
  {
    templateKey: 'registration_confirmation',
    nameAr: 'تأكيد التسجيل',
    nameEn: 'Registration Confirmation',
    category: 'participant',
    subject: 'تأكيد التسجيل في الهاكاثون - {{hackathonTitle}}',
    description: 'يُرسل عند تسجيل مشارك جديد في هاكاثون',
    bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
      <h2 style="color: #2563eb;">مرحباً {{participantName}}</h2>
      <p>تم تأكيد تسجيلك بنجاح في هاكاثون <strong>{{hackathonTitle}}</strong>.</p>
      <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3>تفاصيل التسجيل:</h3>
        <ul style="list-style: none; padding: 0;">
          <li>📧 البريد الإلكتروني: {{participantEmail}}</li>
          <li>📅 تاريخ التسجيل: {{registrationDate}}</li>
          <li>🎯 الدور المفضل: {{teamRole}}</li>
        </ul>
      </div>
      <p>سنقوم بإرسال المزيد من التفاصيل قريباً.</p>
      <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">مع أطيب التحيات،<br>فريق الهاكاثون</p>
    </div>`,
    variables: {
      'participantName': 'اسم المشارك',
      'participantEmail': 'البريد الإلكتروني',
      'hackathonTitle': 'عنوان الهاكاثون',
      'registrationDate': 'تاريخ التسجيل',
      'teamRole': 'الدور في الفريق'
    },
    isSystem: true,
    isActive: true
  },
  {
    templateKey: 'acceptance',
    nameAr: 'قبول المشاركة',
    nameEn: 'Application Acceptance',
    category: 'participant',
    subject: 'مبروك! تم قبولك في {{hackathonTitle}}',
    description: 'يُرسل عند قبول طلب مشارك',
    bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0;">🎉 مبروك!</h1>
      </div>
      <div style="padding: 30px; background: white;">
        <p style="font-size: 18px;">مرحباً {{participantName}},</p>
        <p>يسعدنا إبلاغك بأنه تم <strong style="color: #10b981;">قبولك للمشاركة</strong> في هاكاثون {{hackathonTitle}}!</p>
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-right: 4px solid #10b981;">
          <h3 style="margin-top: 0;">تفاصيل المشاركة:</h3>
          <ul style="list-style: none; padding: 0;">
            <li>👤 الاسم: {{participantName}}</li>
            <li>🎯 الدور: {{teamRole}}</li>
            <li>📅 تاريخ البداية: {{hackathonDate}}</li>
            <li>📍 الموقع: {{hackathonLocation}}</li>
          </ul>
        </div>
        <p>سنقوم بإرسال تفاصيل الفريق قريباً.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{platformUrl}}" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">دخول المنصة</a>
        </div>
      </div>
      <p style="color: #6b7280; font-size: 12px; text-align: center; padding: 20px;">مع أطيب التحيات،<br>فريق الهاكاثون</p>
    </div>`,
    variables: {
      'participantName': 'اسم المشارك',
      'hackathonTitle': 'عنوان الهاكاثون',
      'teamRole': 'الدور في الفريق',
      'hackathonDate': 'تاريخ الهاكاثون',
      'hackathonLocation': 'موقع الهاكاثون',
      'platformUrl': 'رابط المنصة'
    },
    isSystem: true,
    isActive: true
  },
  {
    templateKey: 'rejection',
    nameAr: 'رفض المشاركة',
    nameEn: 'Application Rejection',
    category: 'participant',
    subject: 'شكراً لاهتمامك بـ {{hackathonTitle}}',
    description: 'يُرسل عند رفض طلب مشارك',
    bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
      <h2 style="color: #2563eb;">مرحباً {{participantName}}</h2>
      <p>شكراً لك على اهتمامك بالمشاركة في هاكاثون {{hackathonTitle}}.</p>
      <p>للأسف، لم نتمكن من قبول طلبك هذه المرة نظراً لمحدودية الأماكن المتاحة والعدد الكبير من المتقدمين.</p>
      <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-right: 4px solid #f59e0b;">
        <p style="margin: 0;">💡 <strong>نشجعك على:</strong></p>
        <ul>
          <li>المشاركة في الفعاليات القادمة</li>
          <li>تطوير مهاراتك والتعلم المستمر</li>
          <li>متابعة حساباتنا للإعلان عن هاكاثونات جديدة</li>
        </ul>
      </div>
      <p>نتمنى لك التوفيق في مسيرتك.</p>
      <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">مع أطيب التحيات،<br>فريق الهاكاثون</p>
    </div>`,
    variables: {
      'participantName': 'اسم المشارك',
      'hackathonTitle': 'عنوان الهاكاثون'
    },
    isSystem: true,
    isActive: true
  },
  {
    templateKey: 'team_assignment',
    nameAr: 'تكوين الفريق',
    nameEn: 'Team Assignment',
    category: 'team',
    subject: 'تم تكوين فريقك في {{hackathonTitle}}',
    description: 'يُرسل عند تكوين الفرق وتوزيع المشاركين',
    bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
      <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0;">🏆 فريقك جاهز!</h1>
      </div>
      <div style="padding: 30px; background: white;">
        <p style="font-size: 18px;">مرحباً {{participantName}},</p>
        <p>تم تكوين فريقك بنجاح في هاكاثون <strong>{{hackathonTitle}}</strong>!</p>
        <div style="background: #faf5ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-right: 4px solid #8b5cf6;">
          <h3 style="margin-top: 0; color: #7c3aed;">معلومات الفريق:</h3>
          <ul style="list-style: none; padding: 0;">
            <li>👥 اسم الفريق: <strong>{{teamName}}</strong></li>
            <li>🔢 رقم الفريق: <strong>{{teamNumber}}</strong></li>
            <li>🎯 دورك: <strong>{{teamRole}}</strong></li>
          </ul>
        </div>
        <h3>أعضاء الفريق:</h3>
        <div style="background: #f9fafb; padding: 15px; border-radius: 8px;">
          {{teamMembers}}
        </div>
        <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>💡 نصيحة:</strong> تواصل مع أعضاء فريقك الآن وابدأوا التخطيط لمشروعكم!</p>
        </div>
      </div>
      <p style="color: #6b7280; font-size: 12px; text-align: center; padding: 20px;">مع أطيب التحيات،<br>فريق الهاكاثون</p>
    </div>`,
    variables: {
      'participantName': 'اسم المشارك',
      'hackathonTitle': 'عنوان الهاكاثون',
      'teamName': 'اسم الفريق',
      'teamNumber': 'رقم الفريق',
      'teamRole': 'الدور في الفريق',
      'teamMembers': 'قائمة أعضاء الفريق (HTML)'
    },
    isSystem: true,
    isActive: true
  },
  {
    templateKey: 'judge_invitation',
    nameAr: 'دعوة محكم',
    nameEn: 'Judge Invitation',
    category: 'judge',
    subject: 'دعوة للانضمام كمحكم - {{hackathonTitle}}',
    description: 'يُرسل لدعوة محكم جديد للانضمام',
    bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
      <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0;">⚖️ دعوة محكم</h1>
      </div>
      <div style="padding: 30px; background: white;">
        <p style="font-size: 18px;">عزيزي/عزيزتي {{judgeName}},</p>
        <p>يسعدنا دعوتك للانضمام كمحكم في هاكاثون <strong>{{hackathonTitle}}</strong>.</p>
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-right: 4px solid #dc2626;">
          <h3 style="margin-top: 0; color: #dc2626;">تفاصيل الدعوة:</h3>
          <ul style="list-style: none; padding: 0;">
            <li>📧 البريد الإلكتروني: {{judgeEmail}}</li>
            <li>🏆 الهاكاثون: {{hackathonTitle}}</li>
            <li>📅 تاريخ الفعالية: {{hackathonDate}}</li>
            <li>⏰ صلاحية الدعوة: {{expirationDate}}</li>
          </ul>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{invitationLink}}" style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">قبول الدعوة</a>
        </div>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #6b7280;">
            <strong>ملاحظة:</strong> هذه الدعوة صالحة لمدة محدودة. إذا لم تطلب هذه الدعوة، يرجى تجاهل هذا البريد.
          </p>
        </div>
      </div>
      <p style="color: #6b7280; font-size: 12px; text-align: center; padding: 20px;">مع أطيب التحيات،<br>فريق الهاكاثون</p>
    </div>`,
    variables: {
      'judgeName': 'اسم المحكم',
      'judgeEmail': 'البريد الإلكتروني',
      'hackathonTitle': 'عنوان الهاكاثون',
      'hackathonDate': 'تاريخ الهاكاثون',
      'expirationDate': 'تاريخ انتهاء الدعوة',
      'invitationLink': 'رابط قبول الدعوة'
    },
    isSystem: true,
    isActive: true
  },
  {
    templateKey: 'supervisor_invitation',
    nameAr: 'دعوة مشرف',
    nameEn: 'Supervisor Invitation',
    category: 'supervisor',
    subject: 'دعوة للانضمام كمشرف - نظام إدارة الهاكاثونات',
    description: 'يُرسل لدعوة مشرف جديد للانضمام',
    bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
      <div style="background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0;">👨‍💼 دعوة مشرف</h1>
      </div>
      <div style="padding: 30px; background: white;">
        <p style="font-size: 18px;">عزيزي/عزيزتي {{supervisorName}},</p>
        <p>يسعدنا دعوتك للانضمام كمشرف في نظام إدارة الهاكاثونات.</p>
        <div style="background: #ecfeff; padding: 20px; border-radius: 8px; margin: 20px 0; border-right: 4px solid #0891b2;">
          <h3 style="margin-top: 0; color: #0891b2;">تفاصيل الدعوة:</h3>
          <ul style="list-style: none; padding: 0;">
            <li>📧 البريد الإلكتروني: {{supervisorEmail}}</li>
            <li>🏢 القسم: {{department}}</li>
            <li>⏰ صلاحية الدعوة: {{expirationDate}}</li>
          </ul>
        </div>
        <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>صلاحيات المشرف:</strong></p>
          <ul>
            <li>إدارة المشاركين</li>
            <li>مراجعة الطلبات</li>
            <li>تكوين الفرق</li>
            <li>متابعة الإحصائيات</li>
          </ul>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{invitationLink}}" style="background: #0891b2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">قبول الدعوة</a>
        </div>
      </div>
      <p style="color: #6b7280; font-size: 12px; text-align: center; padding: 20px;">مع أطيب التحيات،<br>فريق المنصة</p>
    </div>`,
    variables: {
      'supervisorName': 'اسم المشرف',
      'supervisorEmail': 'البريد الإلكتروني',
      'department': 'القسم',
      'expirationDate': 'تاريخ انتهاء الدعوة',
      'invitationLink': 'رابط قبول الدعوة'
    },
    isSystem: true,
    isActive: true
  },
  {
    templateKey: 'certificate_judge',
    nameAr: 'شهادة محكم',
    nameEn: 'Judge Certificate',
    category: 'certificate',
    subject: 'شهادة التحكيم - {{hackathonTitle}}',
    description: 'يُرسل للمحكم مع رابط تحميل الشهادة',
    bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
      <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0;">📜 شهادة التحكيم</h1>
      </div>
      <div style="padding: 30px; background: white;">
        <p style="font-size: 18px;">عزيزي/عزيزتي {{judgeName}},</p>
        <p>شكراً لمشاركتك كمحكم في هاكاثون <strong>{{hackathonTitle}}</strong>.</p>
        <p>يسعدنا إبلاغك بأن <strong style="color: #f59e0b;">شهادة التحكيم</strong> جاهزة للتحميل.</p>
        <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-right: 4px solid #f59e0b;">
          <h3 style="margin-top: 0; color: #d97706;">تفاصيل الشهادة:</h3>
          <ul style="list-style: none; padding: 0;">
            <li>👤 الاسم: {{judgeName}}</li>
            <li>🏆 الهاكاثون: {{hackathonTitle}}</li>
            <li>📅 التاريخ: {{issueDate}}</li>
          </ul>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{certificateUrl}}" style="background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">📥 تحميل الشهادة</a>
        </div>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #6b7280;">
            يمكنك تحميل الشهادة من الرابط أعلاه أو من خلال لوحة التحكم الخاصة بك.
          </p>
        </div>
      </div>
      <p style="color: #6b7280; font-size: 12px; text-align: center; padding: 20px;">مع أطيب التحيات،<br>فريق الهاكاثون</p>
    </div>`,
    variables: {
      'judgeName': 'اسم المحكم',
      'hackathonTitle': 'عنوان الهاكاثون',
      'issueDate': 'تاريخ الإصدار',
      'certificateUrl': 'رابط تحميل الشهادة'
    },
    isSystem: true,
    isActive: true
  },
  {
    templateKey: 'certificate_supervisor',
    nameAr: 'شهادة مشرف',
    nameEn: 'Supervisor Certificate',
    category: 'certificate',
    subject: 'شهادة الإشراف - {{hackathonTitle}}',
    description: 'يُرسل للمشرف مع رابط تحميل الشهادة',
    bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0;">📜 شهادة الإشراف</h1>
      </div>
      <div style="padding: 30px; background: white;">
        <p style="font-size: 18px;">عزيزي/عزيزتي {{supervisorName}},</p>
        <p>شكراً لإشرافك على هاكاثون <strong>{{hackathonTitle}}</strong>.</p>
        <p>يسعدنا إبلاغك بأن <strong style="color: #10b981;">شهادة الإشراف</strong> جاهزة للتحميل.</p>
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-right: 4px solid #10b981;">
          <h3 style="margin-top: 0; color: #059669;">تفاصيل الشهادة:</h3>
          <ul style="list-style: none; padding: 0;">
            <li>👤 الاسم: {{supervisorName}}</li>
            <li>🏆 الهاكاثون: {{hackathonTitle}}</li>
            <li>📅 التاريخ: {{issueDate}}</li>
          </ul>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{certificateUrl}}" style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">📥 تحميل الشهادة</a>
        </div>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #6b7280;">
            يمكنك تحميل الشهادة من الرابط أعلاه أو من خلال لوحة التحكم الخاصة بك.
          </p>
        </div>
      </div>
      <p style="color: #6b7280; font-size: 12px; text-align: center; padding: 20px;">مع أطيب التحيات،<br>فريق الهاكاثون</p>
    </div>`,
    variables: {
      'supervisorName': 'اسم المشرف',
      'hackathonTitle': 'عنوان الهاكاثون',
      'issueDate': 'تاريخ الإصدار',
      'certificateUrl': 'رابط تحميل الشهادة'
    },
    isSystem: true,
    isActive: true
  },
  {
    templateKey: 'welcome_user',
    nameAr: 'ترحيب بمستخدم جديد',
    nameEn: 'Welcome New User',
    category: 'general',
    subject: 'مرحباً بك في منصة الهاكاثونات',
    description: 'يُرسل عند تسجيل مستخدم جديد في المنصة',
    bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
      <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0;">🎉 مرحباً بك!</h1>
      </div>
      <div style="padding: 30px; background: white;">
        <p style="font-size: 18px;">مرحباً {{userName}},</p>
        <p>أهلاً وسهلاً بك في <strong>منصة إدارة الهاكاثونات</strong>!</p>
        <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-right: 4px solid #2563eb;">
          <h3 style="margin-top: 0; color: #1d4ed8;">معلومات حسابك:</h3>
          <ul style="list-style: none; padding: 0;">
            <li>👤 الاسم: {{userName}}</li>
            <li>📧 البريد: {{userEmail}}</li>
            <li>📅 تاريخ التسجيل: {{registrationDate}}</li>
          </ul>
        </div>
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>💡 خطواتك القادمة:</strong></p>
          <ul>
            <li>تصفح الهاكاثونات المتاحة</li>
            <li>أكمل ملفك الشخصي</li>
            <li>سجل في هاكاثون يناسب اهتماماتك</li>
          </ul>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{platformUrl}}" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">استكشف المنصة</a>
        </div>
      </div>
      <p style="color: #6b7280; font-size: 12px; text-align: center; padding: 20px;">مع أطيب التحيات،<br>فريق المنصة</p>
    </div>`,
    variables: {
      'userName': 'اسم المستخدم',
      'userEmail': 'البريد الإلكتروني',
      'registrationDate': 'تاريخ التسجيل',
      'platformUrl': 'رابط المنصة'
    },
    isSystem: true,
    isActive: true
  }
]

export default function EmailManagementPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [activeTab, setActiveTab] = useState('all')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [previewMode, setPreviewMode] = useState(false)

  // Custom email state
  const [customEmail, setCustomEmail] = useState({
    subject: '',
    body: '',
    recipients: 'all', // all, hackathon, judges, supervisors
    hackathonId: '',
    filters: {}
  })

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/email-templates')
      
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
      } else {
        // إذا لم توجد قوالب، تحميل القوالب الافتراضية
        console.log('Loading default templates...')
        await initializeDefaultTemplates()
      }
    } catch (error) {
      console.error('Error loading templates:', error)
      toast({
        title: "خطأ",
        description: "فشل تحميل قوالب الإيميلات",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const initializeDefaultTemplates = async () => {
    try {
      const response = await fetch('/api/admin/email-templates/initialize', {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
        toast({
          title: "تم التهيئة",
          description: "تم تحميل القوالب الافتراضية بنجاح"
        })
      }
    } catch (error) {
      console.error('Error initializing templates:', error)
    }
  }

  const saveTemplate = async (template: EmailTemplate) => {
    try {
      setSaving(true)
      const response = await fetch('/api/admin/email-templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template)
      })

      if (response.ok) {
        toast({
          title: "✅ تم الحفظ",
          description: "تم حفظ القالب بنجاح"
        })
        await loadTemplates()
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل حفظ القالب",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const sendTestEmail = async (template: EmailTemplate) => {
    try {
      const response = await fetch('/api/admin/email-templates/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateKey: template.templateKey,
          testEmail: 'admin@example.com' // يمكن تخصيصه
        })
      })

      if (response.ok) {
        toast({
          title: "✅ تم الإرسال",
          description: "تم إرسال إيميل تجريبي بنجاح"
        })
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل إرسال الإيميل التجريبي",
        variant: "destructive"
      })
    }
  }

  const sendCustomEmail = async () => {
    try {
      if (!customEmail.subject || !customEmail.body) {
        toast({
          title: "تنبيه",
          description: "يرجى ملء العنوان والمحتوى",
          variant: "destructive"
        })
        return
      }

      const response = await fetch('/api/admin/email-templates/send-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customEmail)
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "✅ تم الإرسال",
          description: `تم إرسال الإيميل إلى ${data.sentCount} مستلم`
        })
        
        // Reset form
        setCustomEmail({
          subject: '',
          body: '',
          recipients: 'all',
          hackathonId: '',
          filters: {}
        })
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل إرسال الإيميل المخصص",
        variant: "destructive"
      })
    }
  }

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         t.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         t.templateKey.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (activeTab === 'all') return matchesSearch
    return matchesSearch && t.category === activeTab
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>جاري تحميل قوالب الإيميلات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Mail className="w-8 h-8" />
          إدارة الإيميلات
        </h1>
        <p className="text-muted-foreground">
          إدارة شاملة لكل قوالب الإيميلات التلقائية وإرسال إيميلات مخصصة
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="all">
            الكل ({templates.length})
          </TabsTrigger>
          {TEMPLATE_CATEGORIES.map(cat => (
            <TabsTrigger key={cat.value} value={cat.value}>
              {cat.icon} {cat.label}
            </TabsTrigger>
          ))}
          <TabsTrigger value="custom">
            <Sparkles className="w-4 h-4 ml-1" />
            إيميل مخصص
          </TabsTrigger>
        </TabsList>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="ابحث في القوالب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
          <Button onClick={() => initializeDefaultTemplates()} variant="outline">
            <RefreshCw className="w-4 h-4 ml-2" />
            إعادة تحميل القوالب
          </Button>
        </div>

        {/* Templates List */}
        {activeTab !== 'custom' && (
          <TabsContent value={activeTab} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => (
                <Card 
                  key={template.id} 
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {template.nameAr}
                          {template.isSystem && (
                            <Badge variant="secondary" className="text-xs">
                              أساسي
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {template.nameEn}
                        </CardDescription>
                      </div>
                      {template.isActive ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {template.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{template.category}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {template.templateKey}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Template Editor */}
            {selectedTemplate && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>تحرير القالب: {selectedTemplate.nameAr}</span>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setPreviewMode(!previewMode)}
                      >
                        <Eye className="w-4 h-4 ml-2" />
                        {previewMode ? 'تحرير' : 'معاينة'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => sendTestEmail(selectedTemplate)}
                      >
                        <Send className="w-4 h-4 ml-2" />
                        إرسال تجريبي
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => saveTemplate(selectedTemplate)}
                        disabled={saving}
                      >
                        <Save className="w-4 h-4 ml-2" />
                        حفظ
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!previewMode ? (
                    <>
                      <div>
                        <Label>عنوان الإيميل</Label>
                        <Input
                          value={selectedTemplate.subject}
                          onChange={(e) => setSelectedTemplate({
                            ...selectedTemplate,
                            subject: e.target.value
                          })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>محتوى HTML</Label>
                        <Textarea
                          value={selectedTemplate.bodyHtml}
                          onChange={(e) => setSelectedTemplate({
                            ...selectedTemplate,
                            bodyHtml: e.target.value
                          })}
                          rows={20}
                          className="mt-1 font-mono text-sm"
                        />
                      </div>
                      {selectedTemplate.variables && (
                        <div>
                          <Label>المتغيرات المتاحة</Label>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {Object.entries(selectedTemplate.variables).map(([key, desc]) => (
                              <div key={key} className="text-sm p-2 bg-muted rounded">
                                <code className="text-primary">{`{{${key}}}`}</code>
                                <p className="text-xs text-muted-foreground mt-1">{desc}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="border rounded p-4 bg-white">
                      <div className="mb-4 pb-4 border-b">
                        <p className="text-sm text-muted-foreground">الموضوع:</p>
                        <p className="font-semibold">{selectedTemplate.subject}</p>
                      </div>
                      <div 
                        dangerouslySetInnerHTML={{ __html: selectedTemplate.bodyHtml }}
                        style={{ maxWidth: '600px', margin: '0 auto' }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}

        {/* Custom Email Tab */}
        <TabsContent value="custom">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                إرسال إيميل مخصص
              </CardTitle>
              <CardDescription>
                أرسل إيميلات مخصصة لمجموعات مختلفة من المستخدمين
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>المستلمون</Label>
                <Select 
                  value={customEmail.recipients} 
                  onValueChange={(value) => setCustomEmail({...customEmail, recipients: value})}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        جميع المستخدمين
                      </div>
                    </SelectItem>
                    <SelectItem value="participants">
                      <div className="flex items-center gap-2">
                        👥 المشاركين
                      </div>
                    </SelectItem>
                    <SelectItem value="judges">
                      <div className="flex items-center gap-2">
                        ⚖️ المحكمين
                      </div>
                    </SelectItem>
                    <SelectItem value="supervisors">
                      <div className="flex items-center gap-2">
                        👨‍💼 المشرفين
                      </div>
                    </SelectItem>
                    <SelectItem value="hackathon">
                      <div className="flex items-center gap-2">
                        🏆 هاكاثون محدد
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {customEmail.recipients === 'hackathon' && (
                <div>
                  <Label>اختر الهاكاثون</Label>
                  <Input
                    placeholder="معرف الهاكاثون"
                    value={customEmail.hackathonId}
                    onChange={(e) => setCustomEmail({...customEmail, hackathonId: e.target.value})}
                    className="mt-1"
                  />
                </div>
              )}

              <div>
                <Label>الموضوع</Label>
                <Input
                  placeholder="عنوان الإيميل"
                  value={customEmail.subject}
                  onChange={(e) => setCustomEmail({...customEmail, subject: e.target.value})}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>المحتوى</Label>
                <Textarea
                  placeholder="اكتب محتوى الإيميل هنا..."
                  value={customEmail.body}
                  onChange={(e) => setCustomEmail({...customEmail, body: e.target.value})}
                  rows={15}
                  className="mt-1"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
                  <Eye className="w-4 h-4 ml-2" />
                  معاينة
                </Button>
                <Button onClick={sendCustomEmail}>
                  <Send className="w-4 h-4 ml-2" />
                  إرسال الآن
                </Button>
              </div>

              {previewMode && customEmail.body && (
                <div className="mt-6 border rounded p-4 bg-white">
                  <div className="mb-4 pb-4 border-b">
                    <p className="text-sm text-muted-foreground">الموضوع:</p>
                    <p className="font-semibold">{customEmail.subject}</p>
                  </div>
                  <div className="whitespace-pre-wrap">{customEmail.body}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
