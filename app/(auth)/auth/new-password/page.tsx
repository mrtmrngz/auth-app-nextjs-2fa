import {Suspense} from "react";
import NewPasswordClient from "@/components/PageClients/auth/NewPasswordClient";

export default function NewPasswordPage() {
    return (
        <Suspense fallback={null}>
            <NewPasswordClient />
        </Suspense>
    );
}

