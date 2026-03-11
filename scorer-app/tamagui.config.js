const { createTamagui, createTokens } = require('tamagui')

const tokens = createTokens({
  color: {
    white: '#FFFFFF',
    black: '#020617',
    primary: '#005EB8',
    primarySoft: '#E0F2FE',
    danger: '#DC2626',
    slate50: '#F8FAFC',
    slate100: '#F1F5F9',
    slate300: '#CBD5E1',
    slate500: '#64748B',
    slate700: '#334155',
  },
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  space: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
  },
  size: {
    1: 32,
    2: 40,
    3: 48,
    4: 56,
  },
})

const config = createTamagui({
  tokens,
  themes: {
    light: {
      bg: tokens.color.slate100,
      bgCard: tokens.color.white,
      text: tokens.color.slate700,
      textMuted: tokens.color.slate500,
      primary: tokens.color.primary,
      primarySoft: tokens.color.primarySoft,
      danger: tokens.color.danger,
    },
    dark: {
      bg: '#020617',
      bgCard: '#020617',
      text: '#E2E8F0',
      textMuted: '#94A3B8',
      primary: tokens.color.primary,
      primarySoft: '#0F172A',
      danger: tokens.color.danger,
    },
  },
  fonts: {
    body: {
      family: 'System',
      size: {
        1: 12,
        2: 14,
        3: 16,
        4: 20,
      },
      lineHeight: {
        1: 16,
        2: 20,
        3: 22,
        4: 26,
      },
      weight: {
        1: '400',
        2: '500',
        3: '600',
        4: '700',
      },
    },
  },
})

module.exports = config

