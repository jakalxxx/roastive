"use client";
import { createContext, useContext, ReactNode } from 'react';

type Locale = 'ko' | 'en' | 'ja';

type Dict = Record<string, string>;

const ko: Dict = {
  'auth.login.title': '로그인',
  'auth.signup.title': '회원가입',
  'auth.email': '이메일',
  'auth.password': '비밀번호',
  'auth.confirm': '비밀번호 확인',
  'auth.remember': '기억하기',
  'auth.signin': '로그인',
  'auth.signup': '회원가입',
  'auth.displayName': '이름',
  'auth.acceptTerms': '약관에 동의합니다',
  'auth.hasAccount': '이미 계정이 있으신가요?',
  'auth.signinLink': '로그인',
  'auth.orContinueWith': '또는 다음으로 계속',
  'auth.notMember': '아직 회원이 아니신가요?',
  'auth.freeTrial': '14일 무료 체험 시작',
  'auth.forgot': '비밀번호를 잊으셨나요?',
};

const en: Dict = {
  'auth.login.title': 'Sign in to your account',
  'auth.signup.title': 'Create your account',
  'auth.email': 'Email address',
  'auth.password': 'Password',
  'auth.confirm': 'Confirm password',
  'auth.remember': 'Remember me',
  'auth.signin': 'Sign in',
  'auth.signup': 'Sign up',
  'auth.displayName': 'Display Name',
  'auth.acceptTerms': 'I agree to the terms and conditions',
  'auth.hasAccount': 'Already have an account?',
  'auth.signinLink': 'Sign in',
  'auth.orContinueWith': 'Or continue with',
  'auth.notMember': 'Not a member?',
  'auth.freeTrial': 'Start a 14 day free trial',
  'auth.forgot': 'Forgot password?',
};

const ja: Dict = {
  'auth.login.title': 'アカウントにサインイン',
  'auth.signup.title': 'アカウントを作成',
  'auth.email': 'メールアドレス',
  'auth.password': 'パスワード',
  'auth.confirm': 'パスワード確認',
  'auth.remember': '保存する',
  'auth.signin': 'サインイン',
  'auth.signup': 'サインアップ',
  'auth.displayName': '表示名',
  'auth.acceptTerms': '利用規約に同意します',
  'auth.hasAccount': 'すでにアカウントをお持ちですか？',
  'auth.signinLink': 'サインイン',
  'auth.orContinueWith': 'または次で続行',
  'auth.notMember': 'まだメンバーではありませんか？',
  'auth.freeTrial': '14日間の無料トライアルを開始',
  'auth.forgot': 'パスワードをお忘れですか？',
};

const dicts: Record<Locale, Dict> = { ko, en, ja };

const I18nContext = createContext<{ t: (k: string) => string; locale: Locale }>({ t: (k) => k, locale: 'ko' });

export function I18nProvider({ children, locale = 'ko' as Locale }: { children: ReactNode; locale?: Locale }) {
  const dict = dicts[locale] ?? dicts.ko;
  const t = (k: string) => dict[k] ?? k;
  return <I18nContext.Provider value={{ t, locale }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}


