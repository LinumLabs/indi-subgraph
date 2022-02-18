import {
  Sale as SaleContract,
  BalanceUpdated,
  NFTsReclaimed,
  NewSale,
  OwnershipTransferred,
  Purchase as PurchaseEvent,
  SaleCancelled,
} from "../generated/Sale/Sale";
import { Sale, Purchase, SaleClaim, SaleBalance } from "../generated/schema";

export function handleBalanceUpdated(event: BalanceUpdated): void {
  const id = event.params.accountOf.toHex();

  let balance = SaleBalance.load(id);

  if (balance == null) {
    balance = new SaleBalance(id);
    balance.insertedAt = event.block.timestamp;
  }

  balance.owner = event.params.accountOf;
  balance.value = event.params.newBalance;
  balance.updatedAt = event.block.timestamp;

  balance.save();
}

export function handleNFTsReclaimed(event: NFTsReclaimed): void {
  const id = event.transaction.hash.toHex();

  let claim = new SaleClaim(id);

  claim.sale = event.params.id.toString();
  claim.claimer = event.params.owner;
  claim.amount = event.params.amount;
  claim.transaction = event.transaction.hash;
  claim.insertedAt = event.block.timestamp;
  claim.updatedAt = event.block.timestamp;

  claim.save();
}

export function handleNewSale(event: NewSale): void {
  const id = event.params.newSale.id.toString();

  let sale = new Sale(id);

  sale.token = event.params.newSale.nftId.toString();
  sale.seller = event.transaction.from;
  sale.price = event.params.newSale.price;
  sale.amount = event.params.newSale.amount;
  sale.startTime = event.params.newSale.startTime;
  sale.endTime = event.params.newSale.endTime;
  sale.isCancelled = false;
  sale.transaction = event.transaction.hash;
  sale.insertedAt = event.block.timestamp;
  sale.updatedAt = event.block.timestamp;

  sale.save();
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handlePurchase(event: PurchaseEvent): void {
  const id = event.transaction.hash.toHex();

  const saleId = event.params.saleId.toString();
  let sale = Sale.load(saleId);

  if (sale != null) {
    let purchase = new Purchase(id);

    purchase.sale = saleId;
    purchase.buyer = event.params.recipient;
    purchase.seller = sale.seller;
    purchase.amount = event.params.quantity;
    purchase.transaction = event.transaction.hash;
    purchase.insertedAt = event.block.timestamp;
    purchase.updatedAt = event.block.timestamp;

    purchase.save();
  }
}

export function handleSaleCancelled(event: SaleCancelled): void {
  const id = event.params.saleId.toString();

  let sale = Sale.load(id);

  if (sale != null) {
    sale.isCancelled = true;
    sale.updatedAt = event.block.timestamp;

    sale.save();
  }
}
