import { redirect } from 'next/navigation'

export default function SystemSettingsIndex({ params }: { params: { locale: string } }) {
  const locale = params?.locale && ['ko', 'en', 'ja'].includes(params.locale) ? params.locale : 'ko'
  redirect(`/${locale}/system/settings/faq`)
}
