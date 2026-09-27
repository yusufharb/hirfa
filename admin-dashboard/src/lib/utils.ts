import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import { arEG } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return format(new Date(date), "PPP", { locale: arEG })
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
  }).format(amount)
}

export function formatPhone(phone: string) {
  // simple format for Egyptian numbers
  return phone.replace(/(\d{4})(\d{3})(\d{4})/, "$1 $2 $3")
}

export function getStatusBadgeVariant(status: string) {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'success':
      return 'success'
    case 'pending':
    case 'in_progress':
      return 'warning'
    case 'cancelled':
    case 'failed':
      return 'error'
    default:
      return 'default'
  }
}
