import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator'
import { isValidBizRegNo, isLikelyKoreanPhone } from './kr'

export function IsBizRegNo(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsBizRegNo',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return typeof value === 'string' && isValidBizRegNo(value)
        },
        defaultMessage(_args: ValidationArguments) {
          return '유효하지 않은 사업자등록번호입니다.'
        },
      },
    })
  }
}

export function IsKoreanPhone(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsKoreanPhone',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return typeof value === 'string' && isLikelyKoreanPhone(value)
        },
        defaultMessage() {
          return '올바른 전화번호 형식이 아닙니다.'
        },
      },
    })
  }
}


