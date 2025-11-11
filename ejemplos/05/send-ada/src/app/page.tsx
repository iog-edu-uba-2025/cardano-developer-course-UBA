"use client";
import { useState } from "react";
import "@meshsdk/react/styles.css";

import { useWallet } from "@meshsdk/react";
import { sendAdaTransaction } from "./transactions/tx";
import { Card } from "./_components/Card";
import { CardHeader } from "./_components/CardHeader";
import { CardBody } from "./_components/CardBody";
import { Button } from "./_components/Button";
import { Input } from "./_components/Input";
import { Navbar } from "./_components/Navbar";
import { useToasts } from "./_components/Toast";

type SendFundsForm = {
    cantidad: number;
    beneficiario: string;
};

export default function SendAdaApplication() {
    const { push, Toasts } = useToasts();
    const [busy, setBusy] = useState(false);
    const { connected, wallet } = useWallet();

    async function sendAda(payload: SendFundsForm) {
        setBusy(true);
        if (!connected) {
            push("Debes conectar tu wallet primero", "");
            setBusy(false);
            return;
        }
        if (payload.cantidad < 1) return
        await sendAdaTransaction(wallet, payload.cantidad, payload.beneficiario);

        push("Fondos enviados");
        setBusy(false);
    }
    const [sendAdaForm, setSendAdaForm] = useState<SendFundsForm>({
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
                            title="Send Ada application"
                            subtitle="Completa los campos."
                        />
                        <CardBody>
                            <form
                                className="grid grid-cols-1 gap-5 md:grid-cols-2"
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    await sendAda(sendAdaForm);
                                }}
                            >
                                <Input
                                    label="¿Cuántas adas quieres enviar?"
                                    required
                                    value={sendAdaForm.cantidad}
                                    onChange={(e) =>
                                        setSendAdaForm({
                                            ...sendAdaForm,
                                            cantidad: Number(e.target.value),
                                        })
                                    }
                                />
                                <Input
                                    label="beneficiario"
                                    required
                                    value={sendAdaForm.beneficiario}
                                    onChange={(e) =>
                                        setSendAdaForm({
                                            ...sendAdaForm,
                                            beneficiario: e.target.value,
                                        })
                                    }
                                />
                                <div className="md:col-span-2 flex justify-end gap-3">
                                    <Button type="submit" kind="primary" disabled={busy}>
                                        Enviar Adas
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
