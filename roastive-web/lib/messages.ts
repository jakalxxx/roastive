export const MESSAGE = {
  save: {
    success: '성공적으로 저장되었습니다.',
    failure: '저장 실패하였습니다.',
  },
  update: {
    success: '성공적으로 수정되었습니다.',
    failure: '수정 실패하였습니다.',
  },
  delete: {
    single: {
      success: '성공적으로 삭제되었습니다.',
      failure: '삭제 실패하였습니다.',
    },
    multiple: {
      success: (count: number) => `${count}건이 성공적으로 삭제되었습니다.`,
      failure: '삭제 실패하였습니다.',
    },
  },
} as const

export type MessageMap = typeof MESSAGE


