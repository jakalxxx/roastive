import type { ReactNode } from 'react';
import { I18nProvider } from '@/i18n/I18nProvider';

export const dynamic = 'force-dynamic';

export default function LocaleLayout({ children, params }: { children: ReactNode; params: { locale: string } }) {
  const locale = ['ko','en','ja'].includes(params.locale) ? (params.locale as 'ko'|'en'|'ja') : 'ko';
  return (
    <I18nProvider locale={locale}>{children}</I18nProvider>
  );
}


