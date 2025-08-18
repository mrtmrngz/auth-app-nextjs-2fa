import VerifyOtpPageClient from "@/components/PageClients/auth/VerifyOtpPageClient";
import {Metadata} from "next";
import {Suspense} from "react";

export async function generateMetadata(): Promise<Metadata>{
    return {
        title: "Auth App | Verify Otp"
    }
}


export default function VerifyOtpPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyOtpPageClient />
        </Suspense>
    )
}

