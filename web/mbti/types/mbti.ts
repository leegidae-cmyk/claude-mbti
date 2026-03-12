export type MbtiCode = 'INTJ' | 'INTP' | 'ENTJ' | 'ENTP' |
  'INFJ' | 'INFP' | 'ENFJ' | 'ENFP' |
  'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ' |
  'ISTP' | 'ISFP' | 'ESTP' | 'ESFP';

export type Axis = 'EI' | 'SN' | 'TF' | 'JP';
export type Dimension = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';

export interface Option {
  text: string;
  icon: string;
  dimension: Dimension;
}

export interface Question {
  id: number;
  text: string;
  axis: Axis;
  optionA: Option;
  optionB: Option;
}

export interface Celebrity {
  name: string;
  role: string;
}

export interface MbtiColor {
  primary: string;
  secondary: string;
  gradient: string;
}

export interface MbtiTypeData {
  code: MbtiCode;
  nickname: string;
  tagline: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  careers: string[];
  compatibleTypes: MbtiCode[];
  challengingTypes: MbtiCode[];
  color: MbtiColor;
  celebrities: Celebrity[];
  group: '분석가' | '외교관' | '관리자' | '탐험가';
}

export interface MbtiResult {
  type: MbtiCode;
  scores: {
    E: number; I: number;
    S: number; N: number;
    T: number; F: number;
    J: number; P: number;
  };
  percentages: {
    E: number; S: number; T: number; J: number;
  };
}

export interface TestProgress {
  answers: Record<number, 'A' | 'B'>;
  currentQuestion: number;
  startedAt: string;
}
