"use client"

import { useState } from 'react'

interface AlertOptions {
  title: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  confirmText?: string
}

interface ConfirmOptions {
  title: string
  message: string
  onConfirm: () => void
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}

export function useModal() {
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean
    options: AlertOptions
  }>({
    isOpen: false,
    options: { title: '', message: '' }
  })

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    options: ConfirmOptions
  }>({
    isOpen: false,
    options: { title: '', message: '', onConfirm: () => {} }
  })

  const showAlert = (options: AlertOptions) => {
    setAlertModal({
      isOpen: true,
      options
    })
  }

  const showConfirm = (options: ConfirmOptions) => {
    setConfirmModal({
      isOpen: true,
      options
    })
  }

  const closeAlert = () => {
    setAlertModal(prev => ({ ...prev, isOpen: false }))
  }

  const closeConfirm = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }))
  }

  // Convenience methods
  const showSuccess = (message: string, title = 'نجح العملية') => {
    showAlert({ title, message, type: 'success' })
  }

  const showError = (message: string, title = 'حدث خطأ') => {
    showAlert({ title, message, type: 'error' })
  }

  const showWarning = (message: string, title = 'تحذير') => {
    showAlert({ title, message, type: 'warning' })
  }

  const showInfo = (message: string, title = 'معلومات') => {
    showAlert({ title, message, type: 'info' })
  }

  return {
    // Alert modal
    alertModal,
    showAlert,
    closeAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    
    // Confirm modal
    confirmModal,
    showConfirm,
    closeConfirm
  }
}
