import {
  Token as TokenContract,
  ApprovalForAll,
  Mint,
  OwnershipTransferred,
  RedeemDetailsSet,
  RoyaltyDetailsSet,
  RoyaltyExemptionModified,
  TransferBatch,
  TransferSingle,
  URI,
  WhitelistUpdated,
} from "../generated/Token/Token";
import { Token, TokenBalance, Approval, Whitelist } from "../generated/schema";
import { BigInt, log } from "@graphprotocol/graph-ts";

const GENESIS_ADDRESS = "0x0000000000000000000000000000000000000000";

export function handleApprovalForAll(event: ApprovalForAll): void {
  const address = event.params.account.toHex();
  const operator = event.params.operator.toHex();
  const id = `${address}/${operator}`;

  let approval = Approval.load(id);

  if (approval == null) {
    approval = new Approval(id);
    approval.insertedAt = event.block.timestamp;
  }

  approval.approver = event.params.account;
  approval.operator = event.params.operator;
  approval.isApproved = event.params.approved;
  approval.updatedAt = event.block.timestamp;

  approval.save();
}

export function handleMint(event: Mint): void {
  const tokenId = event.params.tokenId.toString();

  let token = Token.load(tokenId);

  if (token != null) {
    token.categoryId = event.params.categoryId;
    token.uri = event.params.uri;
    token.minter = event.transaction.from;
    token.transaction = event.transaction.hash;
    token.insertedAt = event.block.timestamp;
    token.updatedAt = event.block.timestamp;

    token.save();
  }

  const address = event.transaction.from.toHex();
  const tokenBalanceId = `${address}/${tokenId}`;

  let tokenBalance = TokenBalance.load(tokenBalanceId);

  if (tokenBalance !== null) {
    tokenBalance.token = tokenId;
    tokenBalance.owner = event.transaction.from;
    tokenBalance.insertedAt = event.block.timestamp;
    tokenBalance.updatedAt = event.block.timestamp;

    tokenBalance.save();
  }
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handleRedeemDetailsSet(event: RedeemDetailsSet): void {}

export function handleRoyaltyDetailsSet(event: RoyaltyDetailsSet): void {}

export function handleRoyaltyExemptionModified(
  event: RoyaltyExemptionModified
): void {}

export function handleTransferBatch(event: TransferBatch): void {}

export function handleTransferSingle(event: TransferSingle): void {
  const fromAddress = event.params.from.toHex();
  const toAddress = event.params.to.toHex();
  const tokenId = event.params.id.toString();

  const fromTokenBalanceId = `${fromAddress}/${tokenId}`;

  let fromTokenBalance = TokenBalance.load(fromTokenBalanceId);

  if (fromTokenBalance == null) {
    fromTokenBalance = new TokenBalance(fromTokenBalanceId);
    fromTokenBalance.amount = BigInt.fromI32(0);
    fromTokenBalance.owner = event.params.from;
    fromTokenBalance.insertedAt = event.block.timestamp;
  }

  fromTokenBalance.amount = fromTokenBalance.amount.minus(event.params.value);
  fromTokenBalance.updatedAt = event.block.timestamp;

  if (event.params.from.toHex() != GENESIS_ADDRESS) fromTokenBalance.save();

  const toTokenBalanceId = `${toAddress}/${tokenId}`;

  let toTokenBalance = TokenBalance.load(toTokenBalanceId);

  if (toTokenBalance == null) {
    toTokenBalance = new TokenBalance(toTokenBalanceId);
    toTokenBalance.amount = BigInt.fromI32(0);
    toTokenBalance.owner = event.params.to;

    // Track out of ecosystem transfers.
    toTokenBalance.token = fromTokenBalance.token;
    toTokenBalance.insertedAt = event.block.timestamp;
  }

  toTokenBalance.amount = toTokenBalance.amount.plus(event.params.value);
  toTokenBalance.updatedAt = event.block.timestamp;

  toTokenBalance.save();
}

export function handleURI(event: URI): void {}

export function handleWhitelistUpdated(event: WhitelistUpdated): void {
  const id = event.params.addressSet.toHex();

  let whitelist = Whitelist.load(id);

  if (whitelist == null) {
    whitelist = new Whitelist(id);
    whitelist.insertedAt = event.block.timestamp;
  }

  whitelist.address = event.params.addressSet;
  whitelist.canMint = event.params.canMint;
  whitelist.updatedAt = event.block.timestamp;

  whitelist.save();
}
