// 공통 Form 검증 유틸리티

// 1) 사업자등록번호 (KR) 000-00-00000 형식 허용, 하이픈 유무 허용
export function isValidBizRegNo(input: string | null | undefined): boolean {
  const s = String(input || '').replace(/\D+/g, '');
  if (s.length !== 10) return false;
  // 간단 체크섬(국세청 공식 알고리즘): 가중치 적용 후 1의 자리 비교
  const w = [1,3,7,1,3,7,1,3,5];
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(s[i]) * w[i];
  sum += Math.floor((Number(s[8]) * 5) / 10);
  const check = (10 - (sum % 10)) % 10;
  return check === Number(s[9]);
}

// 2) 일반 전화번호 (지역번호 포함) 예: 02-123-4567, 031-1234-5678 등
export function isValidTelephone(input: string | null | undefined): boolean {
  const s = String(input || '').replace(/\D+/g, '');
  // 지역번호 2~3자리 + 국번호 3~4자리 + 가입자번호 4자리
  return /^(0\d{1,2})(\d{3,4})(\d{4})$/.test(s);
}

// 3) 휴대전화번호 예: 010-1234-5678, 011-123-4567 등
export function isValidMobile(input: string | null | undefined): boolean {
  const s = String(input || '').replace(/\D+/g, '');
  return /^(01[016789])(\d{3,4})(\d{4})$/.test(s);
}

// 4) 주소: 간단히 우편번호(숫자 5자리)와 기본 주소 라인 존재 확인
export function isValidAddress(addr: { postal_code?: string; address_line1?: string } | null | undefined): boolean {
  const postal = String(addr?.postal_code || '').trim();
  const line1 = String(addr?.address_line1 || '').trim();
  const postalOk = /^\d{5}$/.test(postal);
  return !!(postalOk && line1);
}

// 포맷터 (선택)
export function formatBizRegNo(v: string): string {
  const s = (v || '').replace(/\D+/g, '').slice(0, 10);
  if (s.length <= 3) return s;
  if (s.length <= 5) return `${s.slice(0, 3)}-${s.slice(3)}`;
  return `${s.slice(0, 3)}-${s.slice(3, 5)}-${s.slice(5)}`;
}


