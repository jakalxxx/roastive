// 한국 전용 유틸: 사업자등록번호(BRN), 전화번호 포맷/검증
export function normalizeDigits(input: string): string {
  return (input || '').replace(/\D+/g, '');
}

/**
 * 사업자등록번호 10자리 체크섬 검증
 * 가중치: [1,3,7,1,3,7,1,3,5] + (9번째*5의 10의 자리) 누적
 * 검증값 = (10 - (sum % 10)) % 10
 */
export function isValidBizRegNo(brn: string): boolean {
  const s = normalizeDigits(brn);
  if (s.length !== 10) return false;
  const d = s.split('').map(Number);
  if (d.length !== 10) return false;
  const w = [1, 3, 7, 1, 3, 7, 1, 3, 5] as const;
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    const digit = d[i];
    const weight = w[i];
    if (digit === undefined || weight === undefined) return false;
    sum += digit * weight;
  }
  const digit8 = d[8];
  const digit9 = d[9];
  if (digit8 === undefined || digit9 === undefined) return false;
  sum += Math.floor((digit8 * 5) / 10);
  const check = (10 - (sum % 10)) % 10;
  return check === digit9;
}

/** KR 전화번호 정규검증(간단형) */
export function isLikelyKoreanPhone(num: string): boolean {
  const s = normalizeDigits(num);
  // 010-xxxx-xxxx (11자리), 02-xxx-xxxx(9~10), 기타 0xx-xxx(x)-xxxx(10~11)
  if (s.startsWith('010') && s.length === 11) return true;
  if (s.startsWith('02') && (s.length === 9 || s.length === 10)) return true;
  if (/^0\d{9,10}$/.test(s)) return true;
  return false;
}

/** KR 전화번호 포맷터: 010/02/기타 지역번호 처리 */
export function formatKoreanPhone(num: string): string {
  const s = normalizeDigits(num);
  if (s.startsWith('010') && s.length === 11) {
    return `${s.slice(0, 3)}-${s.slice(3, 7)}-${s.slice(7)}`;
  }
  if (s.startsWith('02')) {
    if (s.length === 9) return `${s.slice(0, 2)}-${s.slice(2, 5)}-${s.slice(5)}`;
    if (s.length === 10) return `${s.slice(0, 2)}-${s.slice(2, 6)}-${s.slice(6)}`;
  }
  // 기타: 0xx-xxxx-xxxx 또는 0xx-xxx-xxxx
  if (/^0\d{10}$/.test(s)) {
    return `${s.slice(0, 3)}-${s.slice(3, 7)}-${s.slice(7)}`;
  }
  if (/^0\d{9}$/.test(s)) {
    return `${s.slice(0, 3)}-${s.slice(3, 6)}-${s.slice(6)}`;
  }
  return num; // 형식 불명확하면 원본 반환
}

/** E.164(+82) 포맷(간단) */
export function toE164KR(num: string): string | null {
  const s = normalizeDigits(num);
  if (!isLikelyKoreanPhone(s)) return null;
  // 국내 앞자리 0 제거하고 +82 붙임
  return `+82${s.startsWith('0') ? s.slice(1) : s}`;
}


