"use client";
import {
  applyCborEncoding,
  applyParamsToScript,
  IWallet,
  mConStr0,
  MeshTxBuilder,
  PlutusScript,
  resolveScriptHash,
  stringToHex,
} from "@meshsdk/core";

import { initializeBlockchainProvider } from "../_api/utils";
const nftCode =
  "5901120101002229800aba2aba1aab9faab9eaab9dab9a9bae002488888896600264646644b30013370e900018039baa00189991192cc004c038006264b300132330010013758601e00844b30010018a508acc004cdd7980818071baa30100010148a518998010011808800a018403d15980099b8748008dd69806000c4cdc79bae300b0010098a50402914a08050c0340062c8060c8c8cc004004dd598071807980798079807801912cc00400600713233225980099b910080028acc004cdc78040014400600c807226600a00a60260088070dd718068009bab300e001300f0014038297adef6c60375c601460106ea8004c020dd51805002459006180400098041804800980400098021baa0088a4d1365640081";

export async function mintNFTTransaction(
  wallet: IWallet,
  tokenName: string,
): Promise<string> {
  const changeAddress = await wallet.getChangeAddress();

  const collateral = await wallet.getCollateral();
  const ownerUtxo = (await wallet.getUtxos()).filter(
    (utxo) => !collateral.includes(utxo),
  )[0];
  const codeWithParams = applyParamsToScript(
    applyCborEncoding(nftCode),

    [
      mConStr0([ownerUtxo.input.txHash, ownerUtxo.input.outputIndex]),
      tokenName,
    ],
  );
  const mintingPolicy = resolveScriptHash(codeWithParams, "V3");

  const utxos = wallet.getUtxos();

  const tokenNameHex = stringToHex(tokenName);

  const nftScript: PlutusScript = {
    code: codeWithParams,
    version: "V3",
  };

  const provider = initializeBlockchainProvider();
  const txBuilder = new MeshTxBuilder({
    fetcher: provider,
  });
  const unsignedTx = await txBuilder
    .changeAddress(changeAddress)
    .selectUtxosFrom(await utxos)
    .mintPlutusScriptV3()
    .mint("1", mintingPolicy, tokenNameHex)
    .mintRedeemerValue(mConStr0([]))
    .mintingScript(nftScript.code)
    .txInCollateral(collateral[0].input.txHash, collateral[0].input.outputIndex)
    .txIn(ownerUtxo.input.txHash, ownerUtxo.input.outputIndex)
    .complete();
  const signedTx = await wallet.signTx(unsignedTx);
  const txHash = await wallet.submitTx(signedTx);
  return txHash;
}
