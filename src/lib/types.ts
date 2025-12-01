export interface Inspection {
    id: string;
    pucCode: string;
    date: string;
    inspector: string;
    result: 'Pass' | 'Fail';
    notes: string;
}

export interface Harvest {
    id: string;
    pucCode: string;
    harvestDate: string;
    quantity: number; // in tons
    status: 'Awaiting Inspection' | 'In Transit' | 'At Packhouse' | 'Processed';
    progress: number;
}

export interface PackhouseBatch {
    id: string;
    pucCode: string;
    binId: string;
    palletId: string;
    packoutYield: number;
    defects: number;
}

export interface PUC {
    id: string;
    code: string;
    producer: string;
    variety: string;
}

export interface JourneyBin {
  PUC: string;
  PACKHOUSE: string;
  Cultivar: string;
  Variety: string;
  Bins: number;
  BinsKG: number;
}

export interface PalletJourney {
  Pallet_ID: string;
  PUC: string;
  Grade: string;
  TargetMarket: string;
  'Run No': string;
}

export interface Producer {
  id: string;
  name: string;
  puc_codes: string[];
  pucCount: number;
  location?: string;
  siza_status?: 'Platinum' | 'Gold' | 'Silver' | 'N/A' | string;
  siza_exp_date?: string;
  globalgap_valid_till?: string;
  environmental_type?: string;
  environmental_exp_date?: string;
  albert_heijn_expiry?: string;
  tesco_expiry?: string;
  leaf_expiry?: string;
}
