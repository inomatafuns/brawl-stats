// Brawl Stars API型定義

export interface Player {
  tag: string;
  name: string;
  nameColor: string;
  icon: {
    id: number;
  };
  trophies: number;
  highestTrophies: number;
  expLevel: number;
  expPoints: number;
  isQualifiedFromChampionshipChallenge: boolean;
  '3vs3Victories': number;
  soloVictories: number;
  duoVictories: number;
  bestRoboRumbleTime: number;
  bestTimeAsBigBrawler: number;
  club?: {
    tag: string;
    name: string;
  };
  brawlers: Brawler[];
}

export interface Brawler {
  id: number;
  name: string;
  power: number;
  rank: number;
  trophies: number;
  highestTrophies: number;
  gears: Gear[];
  starPowers: StarPower[];
  gadgets: Gadget[];
}

export interface Gear {
  id: number;
  name: string;
  level: number;
}

export interface StarPower {
  id: number;
  name: string;
}

export interface Gadget {
  id: number;
  name: string;
}

export interface BattleLog {
  items: Battle[];
}

export interface Battle {
  battleTime: string;
  event: {
    id: number;
    mode: string;
    map: string;
  };
  battle: {
    mode: string;
    type: string;
    result?: string;
    rank?: number;
    duration?: number;
    trophyChange?: number;
    starPlayer?: {
      tag: string;
      name: string;
    };
    teams?: BattlePlayer[][];
    players?: BattlePlayer[];
  };
}

export interface BattlePlayer {
  tag: string;
  name: string;
  brawler: {
    id: number;
    name: string;
    power: number;
    trophies: number;
  };
}
