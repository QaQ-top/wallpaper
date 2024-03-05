export interface CardProps {
  back: string;
  front: string;
  mask: string;
  foil: string;
  set: string;
  number: number;
  subtypes: string;
  supertype: string;
  rarity: string;
  /** 卡片发光颜色 */
  glow:
    | "water"
    | "fire"
    | "grass"
    | "lightning"
    | "psychic"
    | "fighting"
    | "darkness"
    | "metal"
    | "dragon"
    | "fairy";
}
