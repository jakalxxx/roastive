import { z } from 'zod'
import { isValidBizRegNo, isLikelyKoreanPhone } from './kr'

export const emailSchema = z.string().email({ message: '올바른 이메일 형식이 아닙니다.' })

export const phoneKrSchema = z
  .string()
  .min(7, '전화번호가 너무 짧습니다.')
  .max(20, '전화번호가 너무 깁니다.')
  .refine((v) => isLikelyKoreanPhone(v), { message: '올바른 전화번호 형식이 아닙니다.' })

export const bizRegNoSchema = z
  .string()
  .min(10, '사업자등록번호는 10자리입니다.')
  .refine((v) => isValidBizRegNo(v), { message: '유효하지 않은 사업자등록번호입니다.' })

// 공통 DTO 조합 예시
export const supplierBaseSchema = z.object({
  supplier_name: z.string().min(2).max(160),
  business_reg_no: bizRegNoSchema,
  email: emailSchema.optional().or(z.literal('').transform(() => undefined)),
  phone: phoneKrSchema.optional(),
  address: z.string().max(255).optional(),
})

export type SupplierBase = z.infer<typeof supplierBaseSchema>


