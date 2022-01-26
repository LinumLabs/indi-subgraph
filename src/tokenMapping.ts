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
import { Token, Approval, Whitelist } from "../generated/schema";
import { BigInt, log } from "@graphprotocol/graph-ts";

const GENESIS_ADDRESS = "0x0000000000000000000000000000000000000000";

export function handleApprovalForAll(event: ApprovalForAll): void {
  const address = event.params.account.toHex();
  const operator = event.params.operator.toHex();
  const id = `approvals/${address}/${operator}`;

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
  const address = event.transaction.from.toHex();
  const tokenId = event.params.tokenId.toString();
  const id = `tokens/${address}/${tokenId}`;

  let token = Token.load(id);

  if (token != null) {
    token.tokenId = event.params.tokenId;
    token.request = event.params.dbId;
    token.minter = event.transaction.from;
    token.transaction = event.transaction.hash;
    token.insertedAt = event.block.timestamp;
    token.updatedAt = event.block.timestamp;

    token.save();
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

  const fromTokenId = `tokens/${fromAddress}/${tokenId}`;

  let fromToken = Token.load(fromTokenId);

  if (fromToken == null) {
    fromToken = new Token(fromTokenId);
    fromToken.amount = BigInt.fromI32(0);
    fromToken.owner = event.params.from;
    fromToken.insertedAt = event.block.timestamp;
  }

  fromToken.amount = fromToken.amount.minus(event.params.value);
  fromToken.updatedAt = event.block.timestamp;

  if (event.params.from.toHex() != GENESIS_ADDRESS) fromToken.save();

  const toTokenId = `tokens/${toAddress}/${tokenId}`;

  let toToken = Token.load(toTokenId);

  if (toToken == null) {
    toToken = new Token(toTokenId);
    toToken.amount = BigInt.fromI32(0);
    toToken.owner = event.params.to;

    // Track out of ecosystem transfers.
    toToken.tokenId = fromToken.tokenId;
    toToken.request = fromToken.request;
    toToken.minter = fromToken.minter;
    toToken.transaction = fromToken.transaction;
    toToken.insertedAt = event.block.timestamp;
  }

  toToken.amount = toToken.amount.plus(event.params.value);
  toToken.updatedAt = event.block.timestamp;

  toToken.save();
}

export function handleURI(event: URI): void {}

export function handleWhitelistUpdated(event: WhitelistUpdated): void {
  const address = event.params.addressSet.toHex();
  const id = `whitelists/${address}`;

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
