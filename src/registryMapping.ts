import {
  ContractStatusChanged,
  CurrencyStatusChanged,
  FeeVariablesChanged,
  OwnershipTransferred,
  SystemWalletUpdated,
} from "../generated/Registry/Registry";

export function handleContractStatusChanged(
  event: ContractStatusChanged
): void {}

export function handleCurrencyStatusChanged(
  event: CurrencyStatusChanged
): void {}

export function handleFeeVariablesChanged(event: FeeVariablesChanged): void {}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handleSystemWalletUpdated(event: SystemWalletUpdated): void {}
