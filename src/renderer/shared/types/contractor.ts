export type ContractorType = 'บุคคลธรรมดา' | 'นิติบุคคล';

export interface Contractor {
  id: number;
  type: ContractorType;
  name: string;
  taxId: string;
  addressBuilding?: string;
  addressRoomFloor?: string;
  addressVillage?: string;
  addressNo?: string;
  addressMoo?: string;
  addressSoi?: string;
  addressRoad?: string;
  addressSubDistrict?: string;
  addressDistrict?: string;
  addressProvince?: string;
  addressPostalCode?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContractorAdd {
  type: ContractorType;
  name: string;
  taxId: string;
  addressBuilding?: string;
  addressRoomFloor?: string;
  addressVillage?: string;
  addressNo?: string;
  addressMoo?: string;
  addressSoi?: string;
  addressRoad?: string;
  addressSubDistrict?: string;
  addressDistrict?: string;
  addressProvince?: string;
  addressPostalCode?: string;
  isArchived: boolean;
}

export interface ContractorUpdate extends ContractorAdd {
  id: number;
}
