import {AssetModel} from './asset.model';
import {LocationModel} from '~/app/model/location.model';

export interface StockTakingDTO {
  uuid: string;
  name: string;
  items: AssetModeStockTakingDTO[]
}

export interface StockTaking {
  uuid: string;
  name: string;
  items: AssetModel[];
}

export interface AssetModeStockTakingDTO {
  id: number;
  name: string;
  location: LocationModel;
  serialNumber: string;
  foundAt: string | null;
}
