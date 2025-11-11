"use client";
import {
    applyCborEncoding,
    applyParamsToScript,
    deserializeAddress,
    IWallet,
    mConStr0,
    MeshTxBuilder,
    PlutusScript,
    resolveSlotNo,
    serializePlutusScript,
} from "@meshsdk/core";

import { initializeBlockchainProvider } from "../_api/utils";

const parameterizedVestingCode =
    "58fb010100229800aba2aba1aab9faab9eaab9dab9a48888896600264653001300700198039804000cc01c0092225980099b8748008c01cdd500144c8cc89660026466446600400400244b30010018a508acc004cdc79bae30100010038a518998010011808800a018403c6eb0c038c03cc03cc03cc03cc03cc03cc03cc03cc030dd50029bae300d300b37540211325980099b8748008c02cdd5000c4cdc49bad300e300f300c37540226eb4c038c030dd5000c5282014300d300b3754601a60166ea8c034c038c038c038c038c038c038c038c02cdd500245282012300b001300b300c0013008375400516401830070013003375400f149a26cac8009";

export async function blockFundsTransaction(
    wallet: IWallet,
    cantidad: number,
    beneficiario: string,
    deadline: number,
    setVestingAddress: React.Dispatch<React.SetStateAction<string>>,
): Promise<string> {
    const changeAddress = await wallet.getChangeAddress();

    const collateral = await wallet.getCollateral();
    const ownerUtxo = (await wallet.getUtxos()).filter(
        (utxo) => !collateral.includes(utxo),
    )[0];

    const beneficiarioPKH = deserializeAddress(beneficiario);

    const vestingScript: PlutusScript = {
        code: applyParamsToScript(parameterizedVestingCode, [
            mConStr0([beneficiarioPKH.pubKeyHash, deadline]),
        ]),
        version: "V3",
    };
    const vestingAddress = serializePlutusScript(vestingScript);
    const utxos = wallet.getUtxos();

    const provider = initializeBlockchainProvider();
    const txBuilder = new MeshTxBuilder({
        fetcher: provider,
    });
    const unsignedTx = await txBuilder
        .changeAddress(changeAddress)
        .txOut(vestingAddress.address, [
            { unit: "", quantity: (cantidad * 1000000).toString() },
        ])
        .txOutInlineDatumValue(mConStr0([]))
        .selectUtxosFrom(await utxos)
        .txInCollateral(collateral[0].input.txHash, collateral[0].input.outputIndex)
        .txIn(ownerUtxo.input.txHash, ownerUtxo.input.outputIndex)
        .complete();
    setVestingAddress(vestingAddress.address);
    const signedTx = await wallet.signTx(unsignedTx);
    const txHash = await wallet.submitTx(signedTx);
    return txHash;
}

export async function unlockFundsTransaction(
    wallet: IWallet,
    vestingAddress: string,
    deadline: number,
) {
    const provider = initializeBlockchainProvider();
    const txBuilder = new MeshTxBuilder({
        fetcher: provider,
    });

    const changeAddress = await wallet.getChangeAddress();

    const changePKH = deserializeAddress(changeAddress).pubKeyHash;
    const slot = resolveSlotNo("preprod", Date.now() - 15000);
    const vestingUtxo = await provider.fetchAddressUTxOs(vestingAddress);
    if (vestingUtxo.length === 0) {
        return;
    }

    const vestingScript: PlutusScript = {
        code: applyParamsToScript(applyCborEncoding(parameterizedVestingCode), [
            mConStr0([changePKH, deadline]),
        ]),
        version: "V3",
    };
    const utxos = await wallet.getUtxos();

    const collateral = await wallet.getCollateral();
    const unsignedTx = await txBuilder
        .setNetwork("preprod")

        .spendingPlutusScriptV3()
        .txIn(
            vestingUtxo[0].input.txHash,
            vestingUtxo[0].input.outputIndex,
            vestingUtxo[0].output.amount,
            vestingUtxo[0].output.address,
        )
        .txInInlineDatumPresent()
        .txInRedeemerValue(mConStr0([]))
        .txInScript(vestingScript.code)
        .selectUtxosFrom(utxos)
        .changeAddress(changeAddress)
        .txInCollateral(
            collateral[0].input.txHash,
            collateral[0].input.outputIndex,
            collateral[0].output.amount,
            collateral[0].output.address,
        )
        .requiredSignerHash(changePKH)
        .invalidBefore(Number(slot))
        .complete();

    const signedTx = await wallet.signTx(unsignedTx, true);
    const txHash = await wallet.submitTx(signedTx);

    return txHash;
}
