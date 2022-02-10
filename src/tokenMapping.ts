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
import {
  BigInt,
  ipfs,
  json,
  Bytes,
  JSONValue,
  TypedMap,
} from "@graphprotocol/graph-ts";

const GENESIS_ADDRESS = "0x0000000000000000000000000000000000000000";

const getMetadata = (uri: string): Bytes => {
  let result = ipfs.cat(uri.replace("ipfs://", ""));
  while (!result) result = ipfs.cat(uri.replace("ipfs://", ""));
  return result as Bytes;
};

const getMetadataValue = (
  metadataObj: TypedMap<string, JSONValue>,
  key: string
): string | null =>
  metadataObj.get(key) ? (metadataObj.get(key) as JSONValue).toString() : null;

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
    let result = getMetadata(event.params.uri);

    const metadata = json.fromBytes(result);
    const metadataObj = metadata.toObject();

    const name = getMetadataValue(metadataObj, "name");
    const description = getMetadataValue(metadataObj, "description");
    const image = getMetadataValue(metadataObj, "image");
    const collection = getMetadataValue(metadataObj, "collection");
    const category = getMetadataValue(metadataObj, "category");
    const minterName = getMetadataValue(metadataObj, "minterName");
    const minterAvatarUri = getMetadataValue(metadataObj, "minterAvatarUri");

    token.name = name;
    token.description = description;
    token.image =
      image && image.includes("ipfs://")
        ? image.replace("ipfs://", "https://ipfs.io/ipfs/")
        : image;
    token.collection = collection;
    token.category = category;
    token.minterName = minterName;
    token.minterAvatarUri = minterAvatarUri;

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
