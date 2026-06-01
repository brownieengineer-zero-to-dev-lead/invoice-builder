export interface Employee {
  id: number;
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
  baseSalary: number;
  isArchived: boolean;
  businessId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeAdd {
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
  baseSalary: number;
  isArchived: boolean;
  businessId?: number;
}

export interface EmployeeUpdate extends EmployeeAdd {
  id: number;
}
