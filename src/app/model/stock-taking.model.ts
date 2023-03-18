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
  items: AssetModelStockTakingItem[];
}

export interface AssetModeStockTakingDTO {
  uuid: string;
  assetId: number;
  assetName: string;
  location: LocationModel;
  serialNumber: string;
  foundAt: string | null;
}

export interface AssetModelStockTakingItem {
  id: number;
  name: string;
  found: boolean;
  foundAt: Date | null;
  locationOld: LocationModel;
  locationConfirmed: LocationModel | undefined;
  uuid: string;
}

export interface StockTakingDTOPatch {
  stockTakings: PatchStockTakingDTO[];
}

export class PatchStockTakingDTO {
  uuid: string;
  items: PatchStockTakingItemDTO[];
}


export class PatchStockTakingItemDTO {
  uuid: string;
  foundAt: Date | null
  locationUuid: string | null;
}
