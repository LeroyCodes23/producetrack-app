export type Producer = {
  id: string;
  name: string;
  pucCount: number;
  location: string;
  puc_codes: string[];
  globalgap_valid_till?: string;
  siza_status?: string;
  siza_exp_date?: string;
  environmental_type?: string;
  environmental_exp_date?: string;
  albert_heijn_expiry?: string;
  tesco_expiry?: string;
  leaf_expiry?: string;
};

export type PUC = {
  id: string;
  code: string;
  producer: string;
  variety: string;
  acreage: number;
  location: string;
};

export type Inspection = {
  id: string;
  pucCode: string;
  date: string;
  inspector: string;
  result: 'Pass' | 'Fail';
  notes: string;
};

export type Harvest = {
  id: string;
  pucCode: string;
  crop: string;
  quantity: number;
  harvestDate: string;
  status: 'Harvesting' | 'In Transit' | 'At Packhouse' | 'Processed';
  progress: number;
};

export type PackhouseBatch = {
  id: string;
  pucCode: string;
  binId: string;
  palletId: string;
  packoutYield: number;
  defects: number;
  gradeA: number;
  gradeB: number;
};

export type Accreditation = {
  id: string;
  name: string;
  category: string;
  short_description: string;
  details: string;
  region: string;
  prerequisites: string[];
  notes: string | null;
};

export type Grade = {
    GradeGroup: string;
    GradeCode: string | number;
    Description: string;
}

export type JourneyBin = {
    PUC: string;
    RunDate: string;
    RunPackhouse: string;
    PACKHOUSE: string;
    Cultivar: string;
    Variety: string;
    Bins: number;
    BinsKG: number;
}

export type LocationTracking = {
    Location_Group: string;
    Location: string;
    Group_Sort: number;
    Location_Sort: number;
}

export type PalletJourney = {
    Pallet_ID: number;
    "Run No": number;
    Grade: string;
    TargetMarket: string;
    PUC: string;
}
