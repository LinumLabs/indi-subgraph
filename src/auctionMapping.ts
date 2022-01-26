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
  const address = event.transaction.from.toHex();
  const auctionId = event.params.auctionId.toString();
  const id = `auctions/${address}/${auctionId}`;

  let auction = Auction.load(id);

  if (auction != null) {
    auction.isCancelled = true;
    auction.updatedAt = event.block.timestamp;

    auction.save();
  }
}

export function handleBalanceUpdated(event: BalanceUpdated): void {
  const address = event.params.accountOf.toHex();
  const id = `auctionBalances/${address}`;

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
  const hash = event.transaction.hash.toHex();
  const id = `bids/${hash}`;

  let bid = new Bid(id);

  bid.auctionId = event.params.auctionId;
  bid.price = event.params.amount;
  bid.bidder = event.transaction.from;
  bid.transaction = event.transaction.hash;
  bid.insertedAt = event.block.timestamp;
  bid.updatedAt = event.block.timestamp;

  bid.save();
}

export function handleClaimNFT(event: ClaimNFT): void {
  const hash = event.transaction.hash.toHex();
  const id = `auctionClaims/${hash}`;

  let claim = new AuctionClaim(id);

  claim.auctionId = event.params.auctionId;
  claim.claimer = event.params.recipient;
  claim.transaction = event.transaction.hash;
  claim.insertedAt = event.block.timestamp;
  claim.updatedAt = event.block.timestamp;

  claim.save();
}

export function handleNewAuction(event: NewAuction): void {
  const address = event.transaction.from.toHex();
  const auctionId = event.params.newAuction.id.toString();
  const id = `auctions/${address}/${auctionId}`;

  let auction = new Auction(id);

  auction.tokenId = event.params.newAuction.tokenId;
  auction.auctionId = event.params.newAuction.id;
  auction.seller = event.transaction.from;
  auction.request = event.params.newAuction.dbId;
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
