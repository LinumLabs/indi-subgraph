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
import { BigInt, ipfs, json } from "@graphprotocol/graph-ts";

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
    let result = ipfs.cat(event.params.uri);

    if (!result) {
      return;
    } else {
      const metadata = json.fromBytes(result);
      const metadataObj = metadata.toObject();

      const name = metadataObj.get("name");
      const description = metadataObj.get("description");
      const image = metadataObj.get("image");

      if (!name || !description || !image) return;

      token.name = name.toString();
      token.description = description.toString();
      token.image = image.toString().includes("ipfs://")
        ? image.toString().replace("ipfs://", "https://ipfs.io/ipfs/")
        : image.toString();
    }

    token.uri = event.params.uri;
    token.minter = event.transaction.from;
    token.transaction = event.transaction.hash;
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

  if (event.params.from.toHex() == GENESIS_ADDRESS) {
    let token = new Token(tokenId);

    token.amount = event.params.value;
    token.insertedAt = event.block.timestamp;
    token.updatedAt = event.block.timestamp;
    token.save();
  }

  const fromTokenBalanceId = `${fromAddress}/${tokenId}`;

  let fromTokenBalance = TokenBalance.load(fromTokenBalanceId);

  if (fromTokenBalance == null) {
    fromTokenBalance = new TokenBalance(fromTokenBalanceId);
    fromTokenBalance.amount = BigInt.fromI32(0);
    fromTokenBalance.owner = event.params.from;
    fromTokenBalance.insertedAt = event.block.timestamp;
    fromTokenBalance.token = tokenId;
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
    toTokenBalance.insertedAt = event.block.timestamp;
    toTokenBalance.token = tokenId;
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
