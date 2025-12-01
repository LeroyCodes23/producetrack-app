import type { Producer, PUC, Inspection, Harvest, PackhouseBatch, Accreditation, Grade, JourneyBin, LocationTracking, PalletJourney } from '@/lib/types';
import producerInfo from './data/ProducerInfoJson.json';
import accreditationsData from './data/Accreditations.json';
import pucToVariety from './data/PUC2VarietyJ.json';
import fruitVarieties from './data/FruitVariety.json';
import gradesData from './data/Grading table.json';
import journeyBinData from './data/JourneyBin.json';
import locationTrackingData from './data/Location_Tracking.json';
import palletJourneyData from './data/Pallet_Journey.json';

const getVarietyName = (varietyCode: string): string => {
  for (const category in fruitVarieties) {
    const variety = (fruitVarieties as any)[category].find((v: any) => v.Variety === varietyCode);
    if (variety) {
      return variety.Description;
    }
  }
  return varietyCode; // Fallback to code if not found
};

export const commodities: Record<string, { Variety: string, Description: string }[]> = fruitVarieties;

export const producers: Producer[] = producerInfo.ProducerInfo.map((p: any, index: number) => ({
    id: p.producer_id || `prod-${index}`,
    name: p.producer_name,
    pucCount: p.puc_codes.length,
    location: p.area || 'Unknown', 
    puc_codes: p.puc_codes || [],
    globalgap_valid_till: p.globalgap_valid_till,
    siza_status: p.siza_status,
    siza_exp_date: p.siza_exp_date,
    environmental_type: p.environmental_type,
    environmental_exp_date: p.environmental_exp_date,
    albert_heijn_expiry: p.albert_heijn_expiry,
    tesco_expiry: p.tesco_expiry,
    leaf_expiry: p.leaf_expiry,
}));

export const accreditations: Accreditation[] = accreditationsData.accreditations;

const pucToProducerMap = new Map<string, { producerName: string, location: string }>();
producers.forEach(producer => {
    producer.puc_codes.forEach(pucCode => {
        pucToProducerMap.set(pucCode, { producerName: producer.name, location: producer.location });
    });
});

export const pucs: PUC[] = pucToVariety.PUCVariety.map((pv, index) => {
    const producerDetails = pucToProducerMap.get(pv.PUC) || { producerName: 'Unknown Producer', location: 'N/A' };
    return {
        id: (index + 1).toString(),
        code: pv.PUC,
        producer: producerDetails.producerName,
        variety: getVarietyName(pv.Variety),
        acreage: Math.floor(Math.random() * 100) + 10,
        location: producerDetails.location,
    };
})
.filter(puc => puc.producer !== 'Unknown Producer')
.filter((puc, index, self) => index === self.findIndex((t) => t.code === puc.code));


export const grades: Grade[] = gradesData;

export const journeyBins: JourneyBin[] = journeyBinData;

export const locationTracking: LocationTracking[] = locationTrackingData.data;

export const palletJourney: PalletJourney[] = palletJourneyData.Pallet_Journey;

export const inspections: Inspection[] = [
  { id: '1', pucCode: 'PUC-SF-001', date: '2024-06-15', inspector: 'John Doe', result: 'Pass', notes: 'Excellent crop health.' },
  { id: '2', pucCode: 'PUC-GVO-001', date: '2024-06-20', inspector: 'Jane Smith', result: 'Pass', notes: 'Minor pest presence, addressed.' },
  { id: '3', pucCode: 'PUC-CGE-001', date: '2024-06-22', inspector: 'John Doe', result: 'Fail', notes: 'High citrus greening detected.' },
  { id: '4', pucCode: 'PUC-AO-001', date: '2024-07-01', inspector: 'Emily White', result: 'Pass', notes: 'Ready for harvest.' },
];

export const harvests: Harvest[] = [
  { id: '1', pucCode: 'PUC-SF-001', crop: 'Cripps Pink Apples', quantity: 15, harvestDate: '2024-07-10', status: 'At Packhouse', progress: 66 },
  { id: '2', pucCode: 'PUC-GVO-001', crop: 'Organic Blueberries', quantity: 5, harvestDate: '2024-07-12', status: 'In Transit', progress: 33 },
  { id: '3', pucCode: 'PUC-CGE-002', crop: 'Eureka Lemons', quantity: 20, harvestDate: '2024-07-15', status: 'Harvesting', progress: 10 },
  { id: '4', pucCode: 'PUC-AO-001', crop: 'Golden Delicious', quantity: 18, harvestDate: '2024-07-05', status: 'Processed', progress: 100 },
];

export const packhouseBatches: PackhouseBatch[] = [
  { id: '1', pucCode: 'PUC-AO-001', binId: 'BIN-483', palletId: 'PAL-991', packoutYield: 92.5, defects: 3.1, gradeA: 70, gradeB: 22.5 },
  { id: '2', pucCode: 'PUC-SF-002', binId: 'BIN-501', palletId: 'PAL-992', packoutYield: 88.1, defects: 5.4, gradeA: 65, gradeB: 23.1 },
  { id: '3', pucCode: 'PUC-SF-001', binId: 'BIN-512', palletId: 'PAL-993', packoutYield: 95.2, defects: 1.9, gradeA: 80, gradeB: 15.2 },
];
