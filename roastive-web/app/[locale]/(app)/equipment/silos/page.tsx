import { EquipmentCards, type EquipmentCardItem } from '@/components/EquipmentCards'
import { PageHeading } from '@/components/PageHeading'
import { PlusIcon } from '@heroicons/react/24/outline'

const siloUnits: EquipmentCardItem[] = [
  {
    id: 'silo-01',
    name: '원두 사일로 #1',
    code: 'SLO-101',
    description: '싱글오리진 입고를 위한 10톤 규모 온습도 제어 사일로.',
    area: '원료동 · 1열',
    initials: 'S1',
    avatarClassName: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200',
    status: { label: '적재 82%', tone: 'success' },
    attributes: [
      { label: '총 용량', value: '10,000 kg' },
      { label: '현재 원두', value: '에티오피아 구지' },
      { label: '충전율', value: '82%' },
      { label: '온도 / 습도', value: '18℃ / 48%' },
      { label: '최근 세척', value: '2025-09-18' },
      { label: '밸브 상태', value: '정상' },
    ],
  },
  {
    id: 'silo-02',
    name: '블렌드 사일로 #3',
    code: 'SLO-203',
    description: '블렌드용 반자동 투입 라인. 다음 주 생산 예약이 잡혀 있습니다.',
    area: '원료동 · 3열',
    initials: 'S3',
    avatarClassName: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-200',
    status: { label: '충전 준비', tone: 'brand' },
    attributes: [
      { label: '총 용량', value: '6,500 kg' },
      { label: '현재 원두', value: '비어 있음' },
      { label: '충전율', value: '12%' },
      { label: '온도 / 습도', value: '17℃ / 45%' },
      { label: '최근 세척', value: '2025-11-07' },
      { label: '밸브 상태', value: '안전 잠금' },
    ],
  },
  {
    id: 'silo-03',
    name: '디카페인 사일로',
    code: 'SLO-305',
    description: '디카페인 원두 전용. 장기간 보관으로 센서 알림이 발생했습니다.',
    area: '원료동 · 5열',
    initials: 'DC',
    avatarClassName: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200',
    status: { label: '센서 점검', tone: 'warning' },
    attributes: [
      { label: '총 용량', value: '4,200 kg' },
      { label: '현재 원두', value: '콜롬비아 디카페인' },
      { label: '충전율', value: '64%' },
      { label: '온도 / 습도', value: '19℃ / 55%' },
      { label: '최근 세척', value: '2025-06-22' },
      { label: '밸브 상태', value: '센서 오류' },
    ],
  },
]

export default function SiloManagementPage({ params }: { params: { locale: string } }) {
  const dashboardHref = `/${params.locale}/dashboard`

  return (
    <div className="space-y-8">
      <PageHeading
        title="사일로 관리"
        description="입고 품목, 충전율, 환경 센서를 동시에 확인해 예측 보관을 실행하세요."
        meta={<p className="text-sm text-gray-500 dark:text-gray-400">총 {siloUnits.length}기 운영</p>}
        actions={
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:border-gray-300 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-white/10 dark:text-gray-200 dark:hover:border-white/30 dark:hover:text-white dark:focus-visible:outline-white/40"
          >
            <span className="sr-only">사일로 추가</span>
            <PlusIcon aria-hidden="true" className="size-5" />
          </button>
        }
        breadcrumbs={[
          { name: '홈', href: dashboardHref },
          { name: '기기 관리' },
          { name: '사일로 관리' },
        ]}
      />
      <section className="px-4 pb-12 sm:px-6 lg:px-8">
        <EquipmentCards items={siloUnits} emptyMessage="등록된 사일로가 없습니다." />
      </section>
    </div>
  )
}
