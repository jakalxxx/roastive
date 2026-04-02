import { EquipmentCards, type EquipmentCardItem } from '@/components/EquipmentCards'
import { PageHeading } from '@/components/PageHeading'

const warehouseSites: EquipmentCardItem[] = [
  {
    id: 'wh-01',
    name: '안성 자동화 창고',
    code: 'WH-A01',
    description: '완제품 출고 전용 스마트 창고. ASRS와 자동 피킹 라인을 갖추고 있습니다.',
    area: '용량 2,400m² · 상온',
    initials: 'AN',
    avatarClassName: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-200',
    status: { label: '가동 중', tone: 'success' },
    attributes: [
      { label: '보관 품목', value: '완제품 · 패키지' },
      { label: 'PALET 수량', value: '1,280 EA' },
      { label: '온도 / 습도', value: '20℃ / 45%' },
      { label: '자동화 수준', value: 'ASRS + AGV' },
      { label: '담당자', value: '최윤서' },
      { label: '최근 점검', value: '2025-11-02' },
    ],
  },
  {
    id: 'wh-02',
    name: '김포 저온 창고',
    code: 'WH-C02',
    description: '생두/민감 원자재를 위한 저온 보관. 야간 공조 시스템 적용.',
    area: '용량 1,100m² · 저온',
    initials: 'GP',
    avatarClassName: 'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-200',
    status: { label: '야간 모드', tone: 'brand' },
    attributes: [
      { label: '보관 품목', value: '생두 · 부자재' },
      { label: 'PALET 수량', value: '640 EA' },
      { label: '온도 / 습도', value: '14℃ / 55%' },
      { label: '자동화 수준', value: '컨베이어' },
      { label: '담당자', value: '박승현' },
      { label: '최근 점검', value: '2025-10-28' },
    ],
  },
  {
    id: 'wh-03',
    name: '부산 3PL 창고',
    code: 'WH-B03',
    description: '3자 물류 위탁 창고. 재고 정확도 모니터링이 필요합니다.',
    area: '용량 1,800m² · 상온',
    initials: 'BS',
    avatarClassName: 'bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-200',
    status: { label: '재고 실사중', tone: 'warning' },
    attributes: [
      { label: '보관 품목', value: 'OEM 상품' },
      { label: 'PALET 수량', value: '920 EA' },
      { label: '온도 / 습도', value: '21℃ / 52%' },
      { label: '자동화 수준', value: '수동' },
      { label: '담당자', value: '위탁사' },
      { label: '최근 점검', value: '2025-07-19' },
    ],
  },
]

export default function WarehouseManagementPage({ params }: { params: { locale: string } }) {
  const dashboardHref = `/${params.locale}/dashboard`

  return (
    <div className="space-y-8">
      <PageHeading
        title="창고 관리"
        description="창고별 보관 품목과 환경 데이터를 확인해 재고 정확도를 높이세요."
        meta={<p className="text-sm text-gray-500 dark:text-gray-400">총 {warehouseSites.length}곳</p>}
        breadcrumbs={[
          { name: '홈', href: dashboardHref },
          { name: '기기 관리' },
          { name: '창고 관리' },
        ]}
      />
      <section className="px-4 pb-12 sm:px-6 lg:px-8">
        <EquipmentCards items={warehouseSites} emptyMessage="등록된 창고가 없습니다." />
      </section>
    </div>
  )
}
