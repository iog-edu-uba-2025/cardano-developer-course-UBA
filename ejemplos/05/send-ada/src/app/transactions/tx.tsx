"use client";
import { IWallet, MeshTxBuilder } from "@meshsdk/core";

import { initializeBlockchainProvider } from "../_api/utils";

export async function sendAdaTransaction(
  wallet: IWallet,
  cantidad: number,
  beneficiario: string,
): Promise<string> {
  const changeAddress = await wallet.getChangeAddress();
  const utxos = wallet.getUtxos();

  const provider = initializeBlockchainProvider();
  const txBuilder = new MeshTxBuilder({
    fetcher: provider,
  });
  const unsignedTx = await txBuilder
    .changeAddress(changeAddress)
    .txOut(beneficiario, [
      { unit: "", quantity: (cantidad * 1000000).toString() },
    ])
    .selectUtxosFrom(await utxos)
    .complete();
  const signedTx = await wallet.signTx(unsignedTx);
  const txHash = await wallet.submitTx(signedTx);
  return txHash;
}
