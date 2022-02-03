import {
  Auction as AuctionContract,
  AuctionCancelled,
  BalanceUpdated,
  BidPlaced,
  ClaimNFT,
  NewAuction,
  OwnershipTransferred,
} from "../generated/Auction/Auction";
import {
  Auction,
  Bid,
  AuctionClaim,
  AuctionBalance,
} from "../generated/schema";

export function handleAuctionCancelled(event: AuctionCancelled): void {
  const id = event.params.auctionId.toString();

  let auction = Auction.load(id);

  if (auction != null) {
    auction.isCancelled = true;
    auction.updatedAt = event.block.timestamp;

    auction.save();
  }
}

export function handleBalanceUpdated(event: BalanceUpdated): void {
  const id = event.params.accountOf.toHex();

  let balance = AuctionBalance.load(id);

  if (balance == null) {
    balance = new AuctionBalance(id);
    balance.insertedAt = event.block.timestamp;
  }

  balance.owner = event.params.accountOf;
  balance.value = event.params.newBalance;
  balance.updatedAt = event.block.timestamp;

  balance.save();
}

export function handleBidPlaced(event: BidPlaced): void {
  const id = event.transaction.hash.toHex();

  let bid = new Bid(id);

  bid.auction = event.params.auctionId.toString();
  bid.price = event.params.amount;
  bid.bidder = event.transaction.from;
  bid.transaction = event.transaction.hash;
  bid.insertedAt = event.block.timestamp;
  bid.updatedAt = event.block.timestamp;

  bid.save();
}

export function handleClaimNFT(event: ClaimNFT): void {
  const id = event.transaction.hash.toHex();

  let claim = new AuctionClaim(id);

  claim.auction = event.params.auctionId.toString();
  claim.claimer = event.params.recipient;
  claim.transaction = event.transaction.hash;
  claim.insertedAt = event.block.timestamp;
  claim.updatedAt = event.block.timestamp;

  claim.save();
}

export function handleNewAuction(event: NewAuction): void {
  const auctionId = event.params.newAuction.id.toString();

  let auction = new Auction(auctionId);

  auction.token = event.params.newAuction.nftId.toString();
  auction.seller = event.transaction.from;
  auction.price = event.params.newAuction.reservePrice;
  auction.startTime = event.params.newAuction.startTime;
  auction.endTime = event.params.newAuction.endTime;
  auction.isCancelled = false;
  auction.transaction = event.transaction.hash;
  auction.insertedAt = event.block.timestamp;
  auction.updatedAt = event.block.timestamp;

  auction.save();
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}
