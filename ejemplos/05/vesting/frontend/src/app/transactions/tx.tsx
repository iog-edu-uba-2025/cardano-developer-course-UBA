"use client";
import {
    applyCborEncoding,
    deserializeAddress,
    deserializeDatum,
    IWallet,
    mConStr0,
    MeshTxBuilder,
    PlutusScript,
    resolveSlotNo,
    serializePlutusScript,
} from "@meshsdk/core";

import { initializeBlockchainProvider } from "../_api/utils";

const parameterizedVestingCode =
    "59011401010029800aba2aba1aab9faab9eaab9dab9a48888896600264653001300700198039804000cc01c0092225980099b8748008c01cdd500144c8cc896600266e1d2000300a37540031325980099199119801001000912cc00400629422b30013371e6eb8c04400400e2946266004004602400280690101bac300f30103010301030103010301030103010300d375400c6eb8c038c030dd5000c4c96600266e1d2002300c37540031337126eb4c03cc040c034dd50011bad300f300d375400314a08058c038c030dd5180718061baa300e300f300f300f300f300f300f300f300c375400b14a08050c034c02cdd5000c5900918058009805980600098041baa0028b200c180380098019baa0078a4d13656400401";

const vestingScript: PlutusScript = {
    code: applyCborEncoding(parameterizedVestingCode),
    version: "V3",
};

export async function blockFundsTransaction(
    wallet: IWallet,
    cantidad: number,
    beneficiario: string,
    deadline: number,
): Promise<string> {
    const changeAddress = await wallet.getChangeAddress();

    const beneficiarioPKH = deserializeAddress(beneficiario);

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
        .txOutInlineDatumValue(mConStr0([beneficiarioPKH.pubKeyHash, deadline]))
        .selectUtxosFrom(await utxos)
        .complete();
    const signedTx = await wallet.signTx(unsignedTx);
    const txHash = await wallet.submitTx(signedTx);
    return txHash;
}

export async function unlockFundsTransaction(wallet: IWallet) {
    const provider = initializeBlockchainProvider();
    const txBuilder = new MeshTxBuilder({
        fetcher: provider,
    });

    const vestingAddress = serializePlutusScript(vestingScript);

    const changeAddress = await wallet.getChangeAddress();

    const changePKH = deserializeAddress(changeAddress).pubKeyHash;
    const slot = resolveSlotNo("preprod", Date.now() - 15000);
    const vestingUtxo = (
        await provider.fetchAddressUTxOs(vestingAddress.address)
    ).filter((utxo) => {
        const utxoDatum = utxo.output.plutusData;
        if (utxoDatum == undefined) return false;
        const deserialized = deserializeDatum(utxoDatum);
        return deserialized.fields[0].bytes == changePKH;
    });
    if (vestingUtxo.length === 0) {
        return "No hay UTxOs listos para ti en este momento";
    }
    const utxos = await wallet.getUtxos();

    const collateral = await wallet.getCollateral();
    if (collateral.length === 0) {
        return "La wallet no tiene collateral UTxOs";
    }
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

    return "transacción enviada " + txHash;
}
