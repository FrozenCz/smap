import {LocationModel} from './location.model';

export interface AssetModel {
  id: number;
  name: string;
  found: boolean;
  foundAt: Date | null;
  locationOld: LocationModel;
  locationConfirmed: LocationModel | undefined;
}

export interface AssetModelDTO {
  id: number;
  name: string;
  location: LocationModel;
  serialNumber: string;
}

