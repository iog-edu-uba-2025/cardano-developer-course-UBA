"use client";
import { useState } from "react";
import "@meshsdk/react/styles.css";

import { useWallet } from "@meshsdk/react";
import {
    blockFundsTransaction,
    unlockFundsTransaction,
} from "./transactions/tx";
import { Card } from "./_components/Card";
import { CardHeader } from "./_components/CardHeader";
import { CardBody } from "./_components/CardBody";
import { Button } from "./_components/Button";
import { Input } from "./_components/Input";
import { Navbar } from "./_components/Navbar";
import { useToasts } from "./_components/Toast";

type BlockFundsForm = {
    cantidad: number;
    beneficiario: string;
};

export default function SpendingApplication() {
    const { push, Toasts } = useToasts();
    const [busy, setBusy] = useState(false);
    const { connected, wallet } = useWallet();

    async function blockFunds(payload: BlockFundsForm) {
        setBusy(true);
        if (!connected) {
            push("Debes conectar tu wallet primero", "");
            setBusy(false);
            return;
        }
        if (
            payload.cantidad < 1
        ) {
            push("Debes La cantidad de ADA no puede ser menos de 1", "");
            setBusy(false);
            return;
        }

        const scriptTxHash = await blockFundsTransaction(
            wallet,
            payload.cantidad,
            payload.beneficiario,
        );

        push("Fondos enviados", `${scriptTxHash} listo para ser desbloqueado.`);
        setBusy(false);
    }

    async function unlockFunds() {
        setBusy(true);
        if (!connected) {
            push("Debes conectar tu wallet primero", "");
            setBusy(false);
            return;
        }

        const message = await unlockFundsTransaction(wallet);
        push(message);
        setBusy(false);
    }

    const [blockForm, setBlockForm] = useState<BlockFundsForm>({
        cantidad: 0,
        beneficiario: "",
    });

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100">
            <Navbar />

            <div className="mx-auto max-w-7xl px-6">
                <div className="my-6 grid gap-6">
                    <Card>
                        <CardHeader
                            title="Spending application"
                            subtitle="Completa los campos."
                        />
                        <CardBody>
                            <form
                                className="grid grid-cols-1 gap-5 md:grid-cols-2"
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    await blockFunds(blockForm);
                                }}
                            >
                                <Input
                                    label="¿Cuántas adas quieres encerrar?"
                                    required
                                    value={blockForm.cantidad}
                                    onChange={(e) =>
                                        setBlockForm({
                                            ...blockForm,
                                            cantidad: Number(e.target.value),
                                        })
                                    }
                                />
                                <Input
                                    label="beneficiario"
                                    required
                                    value={blockForm.beneficiario}
                                    onChange={(e) =>
                                        setBlockForm({
                                            ...blockForm,
                                            beneficiario: e.target.value,
                                        })
                                    }
                                />
                                <div className="md:col-span-2 flex justify-end gap-3">
                                    <Button type="submit" kind="primary" disabled={busy}>
                                        Enviar fondos al script
                                    </Button>
                                </div>
                                <div className="md:col-span-2 flex justify-end gap-3">
                                    <Button
                                        kind="primary"
                                        disabled={busy}
                                        onClick={async () => {
                                            await unlockFunds();
                                        }}
                                    >
                                        Desbloquear fondos
                                    </Button>
                                </div>
                            </form>
                        </CardBody>
                    </Card>
                </div>
            </div>

            <Toasts />
        </div>
    );
}
