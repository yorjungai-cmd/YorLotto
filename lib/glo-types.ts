export interface GloNumberEntry {
  round?: number;
  value: string;
}

export interface GloPrizeEntry {
  price?: string;
  number: GloNumberEntry[];
}

export interface GloData {
  first?: GloPrizeEntry;
  last2?: GloPrizeEntry;
  last3f?: GloPrizeEntry;
  last3b?: GloPrizeEntry;
}

export interface GloLotteryResult {
  date: string;
  prizes: {
    first?: string[];
    twoDigit?: string[];
    threeDigitPrefix?: string[];
    threeDigitSuffix?: string[];
  };
}

export interface GloStatEntry {
  number: string;
  count: number;
}

export interface GloStatResult {
  "lottery-stat-suffix2": GloStatEntry[];
  "lottery-stat-suffix3": GloStatEntry[];
  "lottery-stat-prefix3": GloStatEntry[];
}

export interface DigitCount {
  digit: string;
  count: number;
}

export interface LottoStats {
  twoDigit: DigitCount[];
  threeDigitSuffix: DigitCount[];
  threeDigitPrefix: DigitCount[];
  periodsAnalyzed: number;
  dateRange: { from: string; to: string };
}
