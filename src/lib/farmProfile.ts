export const FARM_PROFILE_STORAGE_KEY = 'smartAgriSense.farmProfile';
export const FARM_PROFILE_UPDATED_EVENT = 'smartAgriSense:farmProfileUpdated';

export interface FarmCrop {
  id: string;
  name: string;
  area: string;
  stage: string;
  health: string;
  planted: string;
  soilType?: string;
}

export interface FarmInventoryItem {
  item: string;
  quantity: string;
  status: string;
}

export interface FarmActivityRecord {
  id: number;
  type: string;
  crop: string;
  date: string;
  notes: string;
}

export interface FarmProfile {
  location: string;
  soilType: string;
  crops: FarmCrop[];
  inventory: FarmInventoryItem[];
  activities: FarmActivityRecord[];
}

function getRelativeDateStr(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export const DEFAULT_FARM_PROFILE: FarmProfile = {
  location: 'Nagpur',
  soilType: 'Loamy Soil',
  crops: [
    { id: 'crop-wheat', name: 'Wheat', area: '2.5 Acres', stage: 'Tillering', health: 'Good', planted: getRelativeDateStr(45), soilType: 'Loamy Soil' },
    { id: 'crop-mustard', name: 'Mustard', area: '1 Acre', stage: 'Flowering', health: 'Needs Water', planted: getRelativeDateStr(60), soilType: 'Black Soil' },
  ],
  inventory: [
    { item: 'Urea Fertilizer', quantity: '15 Bags', status: 'In Stock' },
    { item: 'Wheat Seeds (HD-2967)', quantity: '40 kg', status: 'Low Stock' },
    { item: 'Pesticide (Chlorpyriphos)', quantity: '2 Liters', status: 'In Stock' },
  ],
  activities: [],
};

function parseJson<T>(value: string | null): T | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function fallbackLocation() {
  if (typeof window === 'undefined') {
    return DEFAULT_FARM_PROFILE.location;
  }

  const settings = parseJson<{ location?: string }>(window.localStorage.getItem('appSettings'));
  return settings?.location?.trim() || window.localStorage.getItem('userLocation') || DEFAULT_FARM_PROFILE.location;
}

function sanitizeCrop(crop: Partial<FarmCrop>, index: number): FarmCrop | null {
  const name = crop.name?.trim();
  const area = crop.area?.trim();
  const stage = crop.stage?.trim();
  const health = crop.health?.trim();
  const planted = crop.planted?.trim();

  if (!name || !area || !stage || !health) {
    return null;
  }

  return {
    id: crop.id?.trim() || `crop-${index}-${name.toLowerCase().replace(/\s+/g, '-')}`,
    name,
    area,
    stage,
    health,
    planted: planted || getRelativeDateStr(7),
    soilType: crop.soilType?.trim() || undefined,
  };
}

function sanitizeInventoryItem(item: Partial<FarmInventoryItem>): FarmInventoryItem | null {
  const itemName = item.item?.trim();
  const quantity = item.quantity?.trim();
  const status = item.status?.trim();

  if (!itemName || !quantity || !status) {
    return null;
  }

  return {
    item: itemName,
    quantity,
    status,
  };
}

function sanitizeActivityRecord(record: Partial<FarmActivityRecord>): FarmActivityRecord | null {
  const type = record.type?.trim();
  const crop = record.crop?.trim();
  const date = record.date?.trim();

  if (!type || !crop || !date) {
    return null;
  }

  return {
    id: typeof record.id === 'number' ? record.id : Date.now(),
    type,
    crop,
    date,
    notes: record.notes?.trim() || '',
  };
}

export function loadFarmProfile(): FarmProfile {
  if (typeof window === 'undefined') {
    return DEFAULT_FARM_PROFILE;
  }

  const stored = parseJson<Partial<FarmProfile>>(window.localStorage.getItem(FARM_PROFILE_STORAGE_KEY));
  const crops = stored?.crops?.map(sanitizeCrop).filter((item): item is FarmCrop => item !== null) ?? [];
  const inventory =
    stored?.inventory?.map(sanitizeInventoryItem).filter((item): item is FarmInventoryItem => item !== null) ?? [];
  const activities =
    stored?.activities?.map(sanitizeActivityRecord).filter((item): item is FarmActivityRecord => item !== null) ?? [];

  return {
    location: stored?.location?.trim() || fallbackLocation(),
    soilType: stored?.soilType?.trim() || DEFAULT_FARM_PROFILE.soilType,
    crops: crops.length ? crops : DEFAULT_FARM_PROFILE.crops,
    inventory: inventory.length ? inventory : DEFAULT_FARM_PROFILE.inventory,
    activities,
  };
}

function emitFarmProfileUpdate() {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(FARM_PROFILE_UPDATED_EVENT));
}

export function saveFarmProfile(profile: FarmProfile): FarmProfile {
  if (typeof window === 'undefined') {
    return profile;
  }

  const nextProfile: FarmProfile = {
    location: profile.location.trim() || fallbackLocation(),
    soilType: profile.soilType.trim() || DEFAULT_FARM_PROFILE.soilType,
    crops: profile.crops.map(sanitizeCrop).filter((item): item is FarmCrop => item !== null),
    inventory: profile.inventory.map(sanitizeInventoryItem).filter((item): item is FarmInventoryItem => item !== null),
    activities: profile.activities.map(sanitizeActivityRecord).filter((item): item is FarmActivityRecord => item !== null),
  };

  window.localStorage.setItem(FARM_PROFILE_STORAGE_KEY, JSON.stringify(nextProfile));
  emitFarmProfileUpdate();
  return nextProfile;
}

export function getPrimaryCrop(profile: FarmProfile): FarmCrop | null {
  return profile.crops[0] ?? null;
}

export function parseAreaAcres(area: string): number {
  const match = area.match(/[\d.]+/);
  if (!match) {
    return 0;
  }

  const value = Number.parseFloat(match[0]);
  return Number.isFinite(value) ? value : 0;
}

export function computeFarmHealthScore(profile: FarmProfile): number {
  if (!profile.crops.length) {
    return 0;
  }

  const total = profile.crops.reduce((sum, crop) => {
    if (/excellent/i.test(crop.health)) return sum + 96;
    if (/good|healthy/i.test(crop.health)) return sum + 86;
    if (/water/i.test(crop.health)) return sum + 70;
    if (/fertilizer/i.test(crop.health)) return sum + 68;
    if (/pest/i.test(crop.health)) return sum + 54;
    return sum + 72;
  }, 0);

  return Math.round(total / profile.crops.length);
}

export function buildFarmActionItems(profile: FarmProfile): string[] {
  const items: string[] = [];
  const waterRisk = profile.crops.filter((crop) => /water/i.test(crop.health));
  const pestRisk = profile.crops.filter((crop) => /pest/i.test(crop.health));
  const lowStock = profile.inventory.filter((item) => /low|out/i.test(item.status));

  if (waterRisk.length) {
    items.push(`Prioritize irrigation for ${waterRisk.map((crop) => crop.name).join(', ')} today.`);
  }
  if (pestRisk.length) {
    items.push(`Scout ${pestRisk.map((crop) => crop.name).join(', ')} for pest spread before the next spray window.`);
  }
  if (lowStock.length) {
    items.push(`Restock ${lowStock.map((item) => item.item).join(', ')} before the next field operation.`);
  }
  if (!items.length) {
    items.push('Farm conditions look stable. Use today for preventive scouting and record updates.');
  }

  return items.slice(0, 3);
}

export function createMarketAlertsFromProfile(profile: FarmProfile) {
  return profile.crops.slice(0, 3).map((crop, index) => ({
    crop: crop.name,
    condition: index % 2 === 0 ? '>' as const : '<' as const,
    threshold: Math.max(100, Math.round(parseAreaAcres(crop.area) * 1000 + 1800)),
    enabled: index === 0,
  }));
}
