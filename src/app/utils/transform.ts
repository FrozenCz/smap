import {AssetModeStockTakingDTO, StockTaking, StockTakingDTO} from '../model/stock-taking.model';
import {AssetModel} from '../model/asset.model';

export abstract class Transform {
  private constructor() {
  }

  public static stockTakingDTO(stockTaking: StockTakingDTO): StockTaking {
    return {
      name: stockTaking.name,
      uuid: stockTaking.uuid,
      items: stockTaking.items.map(item => this.stockTakingItemDTO(item))
    }
  }

  private static stockTakingItemDTO(item: AssetModeStockTakingDTO): AssetModel {
    return {
      ...item,
      foundAt: item.foundAt ? new Date(item.foundAt) : null,
      locationConfirmed: item.foundAt ? item.location: null,
      locationOld: item.location,
      found: !!item.foundAt
    }
  }

}
