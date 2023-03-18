import {
  AssetModelStockTakingItem,
  AssetModeStockTakingDTO,
  StockTaking,
  StockTakingDTO
} from '../model/stock-taking.model';

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

  private static stockTakingItemDTO(item: AssetModeStockTakingDTO): AssetModelStockTakingItem {
    return {
      name: item.assetName,
      uuid: item.uuid,
      id: item.assetId,
      foundAt: item.foundAt ? new Date(item.foundAt) : null,
      locationConfirmed: item.foundAt ? item.location: undefined,
      locationOld: item.location,
      found: !!item.foundAt
    }
  }

}
