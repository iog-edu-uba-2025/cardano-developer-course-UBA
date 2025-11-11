"use client";
import {
    applyCborEncoding,
    deserializeAddress,
    deserializeDatum,
    IWallet,
    mConStr0,
    MeshTxBuilder,
    PlutusScript,
    serializePlutusScript,
} from "@meshsdk/core";

import { initializeBlockchainProvider } from "../_api/utils";

const scriptCode =
    "58b601010029800aba2aba1aab9faab9eaab9dab9a48888896600264646644b30013370e900118031baa00189919912cc004cdc3a400060126ea800626466446600400400244b30010018a508acc004cdc79bae300f0010038a518998010011808000a01640386eb0c034c038c038c038c038c038c038c038c038c02cdd518068041bae300c300a3754003164020601400260146016002600e6ea80062c8028c01c004c01cc020004c01c004c00cdd5003c52689b2b20021";

export async function blockFundsTransaction(
    wallet: IWallet,
    cantidad: number,
    beneficiario: string,
): Promise<string> {
    const changeAddress = await wallet.getChangeAddress();
    console.log("changeAddress: ", changeAddress)

    const { pubKeyHash: beneficiarioPKH } = deserializeAddress(beneficiario);
    const { pubKeyHash: walletPKH } = deserializeAddress(changeAddress);
    console.log("beneficiarioPKH: ", beneficiarioPKH)
    console.log("walletPKH: ", walletPKH)

    const script: PlutusScript = {
        code: applyCborEncoding(scriptCode),
        version: "V3",
    };
    const scriptAddress = serializePlutusScript(script);
    const utxos = wallet.getUtxos();

    const provider = initializeBlockchainProvider();
    const txBuilder = new MeshTxBuilder({
        fetcher: provider,
    });
    const unsignedTx = await txBuilder
        .changeAddress(changeAddress)
        .txOut(scriptAddress.address, [
            { unit: "", quantity: (cantidad * 1000000).toString() },
        ])
        .txOutInlineDatumValue(beneficiarioPKH)
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

    const script: PlutusScript = {
        code: applyCborEncoding(scriptCode),
        version: "V3",
    };
    const scriptAddress = serializePlutusScript(script);

    const changeAddress = await wallet.getChangeAddress();

    const changePKH = deserializeAddress(changeAddress).pubKeyHash;
    const scriptUtxo = (
        await provider.fetchAddressUTxOs(scriptAddress.address)
    ).filter((utxo) => {
        const utxoDatum = utxo.output.plutusData;
        if (utxoDatum == undefined) return false;
        const deserialized = deserializeDatum(utxoDatum);
        return deserialized.bytes == changePKH;
    });
    if (scriptUtxo.length === 0) {
        return "No hay UTxOs listos para ti en este momento";
    }
    const utxos = await wallet.getUtxos();

    const collateral = await wallet.getCollateral();
    if (collateral.length === 0) {
        return "No hay collateral UTxOs en la billetera";
    }
    const unsignedTx = await txBuilder
        .setNetwork("preprod")

        .spendingPlutusScriptV3()
        .txIn(
            scriptUtxo[0].input.txHash,
            scriptUtxo[0].input.outputIndex,
            scriptUtxo[0].output.amount,
            scriptUtxo[0].output.address,
        )
        .txInInlineDatumPresent()
        .txInRedeemerValue(mConStr0([]))
        .txInScript(script.code)
        .selectUtxosFrom(utxos)
        .changeAddress(changeAddress)
        .txInCollateral(
            collateral[0].input.txHash,
            collateral[0].input.outputIndex,
            collateral[0].output.amount,
            collateral[0].output.address,
        )
        .requiredSignerHash(changePKH)
        .complete();

    const signedTx = await wallet.signTx(unsignedTx, true);
    const txHash = await wallet.submitTx(signedTx);

    return "transacción enviada " + txHash;
}
