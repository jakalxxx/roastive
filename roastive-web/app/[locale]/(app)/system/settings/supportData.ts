export type SupportBoardType = 'faq' | 'qna'

export type SupportBoardPost = {
  id: number
  title: string
  author: string
  createdAt: string
}

export const SUPPORT_BOARD_DATA: Record<SupportBoardType, SupportBoardPost[]> = {
  faq: [
    { id: 1, title: '회원 가입 승인 절차는 어떻게 되나요?', author: '시스템 운영팀', createdAt: '2025-11-30T09:25:00+09:00' },
    { id: 2, title: '비밀번호 정책(길이/조합)을 알려주세요.', author: '시스템 운영팀', createdAt: '2025-11-28T13:10:00+09:00' },
  ],
  qna: [
    { id: 1, title: '로스터리 권한을 추가로 받을 수 있을까요?', author: '김로스', createdAt: '2025-12-02T15:42:00+09:00' },
  ],
}

export const SUPPORT_BOARD_COPY: Record<SupportBoardType, { title: string; description: string; button: string }> = {
  faq: {
    title: 'FAQ',
    description: '자주 묻는 질문을 등록하여 반복 문의를 줄이세요.',
    button: 'FAQ 등록',
  },
  qna: {
    title: 'Q&A',
    description: '실시간 문의에 답변하고 이력을 남겨보세요.',
    button: 'Q&A 등록',
  },
}
