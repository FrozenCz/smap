import {LocationModel} from './location.model';

export interface AssetModel {
  id: number;
  name: string;
  found: boolean;
  locationOld: LocationModel;
  locationConfirmed: LocationModel | undefined;
}

export interface AssetModelDTO {
  id: number;
  name: string;
  Location: LocationModel
}
