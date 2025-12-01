import type { Inspection, Harvest, PUC, PalletJourney, JourneyBin, Producer, PackhouseBatch } from './types';

export const pucs: PUC[] = [
  { id: '1', code: 'NL1163', producer: 'Naranja Packers', variety: 'Valencia' },
  { id: '2', code: 'NL0205', producer: 'Oranjezicht', variety: 'Navel' },
  { id: '3', code: 'NL0109', producer: 'Citrus Growers', variety: 'Lemon' },
  { id: '4', code: 'Y1502', producer: 'Yield Farms', variety: 'Grapefruit' },
  { id: '5', code: 'NL1163', producer: 'Naranja Packers', variety: 'Mandarin' },
  { id: '6', code: 'NL0205', producer: 'Oranjezicht', variety: 'Cara Cara' },
  { id: '7', code: 'SF-001', producer: 'Sun Farming', variety: 'Navel' },
  { id: '8', code: 'CGE-001', producer: 'Citrus Grove Estates', variety: 'Valencia' },
  { id: '9', 'code': 'GVO-001', 'producer': 'Green Valley Orchards', 'variety': 'Lemon' },
  { id: '10', 'code': 'AO-001', 'producer': 'Apex Orchards', 'variety': 'Mandarin' }
];

export const producers: Producer[] = [
  { 
    id: 'P001', 
    name: 'Naranja Packers', 
    puc_codes: ['NL1163'], 
    pucCount: 1, 
    location: 'Western Cape',
    siza_status: 'Platinum',
    siza_exp_date: '2025-08-15',
    globalgap_valid_till: '2026-01-01',
    environmental_type: 'Nature\'s Choice',
    environmental_exp_date: '2025-12-31'
  },
  { 
    id: 'P002', 
    name: 'Oranjezicht', 
    puc_codes: ['NL0205'], 
    pucCount: 1, 
    location: 'Limpopo',
    siza_status: 'Gold',
    siza_exp_date: '2024-11-20',
    tesco_expiry: '2025-05-10'
  },
  { 
    id: 'P003', 
    name: 'Citrus Growers', 
    puc_codes: ['NL0109', 'CGE-001'], 
    pucCount: 2, 
    location: 'Eastern Cape',
    globalgap_valid_till: '2025-07-22'
  },
  { 
    id: 'P004', 
    name: 'Yield Farms', 
    puc_codes: ['Y1502'], 
    pucCount: 1, 
    location: 'Western Cape',
    siza_status: 'Silver',
    siza_exp_date: '2026-02-10',
    leaf_expiry: '2025-09-09'
  },
  { id: 'P005', name: 'Sun Farming', puc_codes: ['SF-001'], pucCount: 1, location: 'Western Cape' },
  { id: 'P006', name: 'Citrus Grove Estates', puc_codes: ['CGE-001'], pucCount: 1, location: 'Eastern Cape' },
  { id: 'P007', name: 'Green Valley Orchards', puc_codes: ['GVO-001'], pucCount: 1, location: 'Limpopo' },
  { id: 'P008', name: 'Apex Orchards', puc_codes: ['AO-001'], pucCount: 1, location: 'Western Cape', albert_heijn_expiry: '2025-03-14' },
];


export const inspections: Inspection[] = [
  { id: '1', pucCode: 'NL1163', date: '2024-07-15', inspector: 'J. Doe', result: 'Pass', notes: 'Crops look healthy, minor pest activity noted.' },
  { id: '2', pucCode: 'NL0205', date: '2024-07-14', inspector: 'S. Smith', result: 'Pass', notes: 'Good fruit development, irrigation schedule optimal.' },
  { id: '3', pucCode: 'NL0109', date: '2024-07-16', inspector: 'J. Doe', result: 'Fail', notes: 'Evidence of citrus black spot, treatment required.' },
  { id: '4', pucCode: 'Y1502', date: '2024-07-15', inspector: 'P. Jones', result: 'Pass', notes: 'Excellent condition, harvest can proceed as planned.' },
];

export const harvests: Harvest[] = [
  { id: '1', pucCode: 'NL1163', harvestDate: '2024-07-20', quantity: 15.5, status: 'At Packhouse', progress: 60 },
  { id: '2', pucCode: 'NL0205', harvestDate: '2024-07-19', quantity: 22.0, status: 'Processed', progress: 100 },
  { id: '3', pucCode: 'NL0109', harvestDate: '2024-07-21', quantity: 8.2, status: 'In Transit', progress: 25 },
  { id: '4', pucCode: 'Y1502', harvestDate: '2024-07-18', quantity: 12.8, status: 'Processed', progress: 100 },
  { id: '5', pucCode: 'SF-001', harvestDate: '2024-07-22', quantity: 18.0, status: 'At Packhouse', progress: 50 },
  { id: '6', pucCode: 'CGE-001', harvestDate: '2024-07-23', quantity: 14.3, status: 'In Transit', progress: 30 },
  { id: '7', pucCode: 'GVO-001', harvestDate: '2024-07-24', quantity: 11.9, status: 'Awaiting Inspection', progress: 10 },
];

export const packhouseBatches: PackhouseBatch[] = [
  { id: '1', pucCode: 'NL1163', binId: 'BIN-A001', palletId: 'PAL-X01', packoutYield: 92.5, defects: 3.1 },
  { id: '2', pucCode: 'NL0205', binId: 'BIN-B002', palletId: 'PAL-Y02', packoutYield: 88.1, defects: 5.4 },
  { id: '3', pucCode: 'Y1502', binId: 'BIN-C003', palletId: 'PAL-Z03', packoutYield: 95.2, defects: 1.8 },
  { id: '4', pucCode: 'SF-001', binId: 'BIN-D004', palletId: 'PAL-W04', packoutYield: 91.3, defects: 4.2 },
];

export const journeyBins: JourneyBin[] = [
  { PUC: 'NL1163', PACKHOUSE: 'Paarl', Cultivar: 'Citrus', Variety: 'Valencia', Bins: 102, BinsKG: 25500 },
  { PUC: 'NL0205', PACKHOUSE: 'Stellenbosch', Cultivar: 'Citrus', Variety: 'Navel', Bins: 150, BinsKG: 37500 },
  { PUC: 'SF-001', PACKHOUSE: 'Paarl', Cultivar: 'Citrus', Variety: 'Navel Late', Bins: 80, BinsKG: 20000 },
  { PUC: 'CGE-001', PACKHOUSE: 'Stellenbosch', Cultivar: 'Citrus', Variety: 'Valencia', Bins: 120, BinsKG: 30000 },
  { PUC: 'NL0109', PACKHOUSE: 'Citrusdal', Cultivar: 'Citrus', Variety: 'Lemon', Bins: 200, BinsKG: 50000 },
];

export const palletJourney: PalletJourney[] = [
  { Pallet_ID: 'PAL-X01', PUC: 'NL1163', Grade: 'A', TargetMarket: 'EU', 'Run No': 'RUN001' },
  { Pallet_ID: 'PAL-Y02', PUC: 'NL0205', Grade: 'B', TargetMarket: 'US', 'Run No': 'RUN002' },
  { Pallet_ID: 'PAL-Z03', PUC: 'Y1502', Grade: 'A', TargetMarket: 'UK', 'Run No': 'RUN003' },
  { Pallet_ID: 'PAL-W04', PUC: 'SF-001', Grade: 'A', TargetMarket: 'EU', 'Run No': 'RUN004' },
];

export const commodities = {
    "Citrus": [
        {"Description":"Lemon"},
        {"Description":"Grapefruit"},
        {"Description":"Valencia"},
        {"Description":"Navel"},
        {"Description":"Mandarin"},
        {"Description":"Cara Cara"},
        {"Description":"Navel Late"}
    ],
    "Pome Fruit": [
        {"Description":"Apples"},
        {"Description":"Pears"}
    ],
    "Stone Fruit": [
        {"Description":"Peaches"},
        {"Description":"Nectarines"},
        {"Description":"Plums"}
    ]
}
