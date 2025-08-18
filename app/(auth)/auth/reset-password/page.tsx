import ResetPasswordClient from "@/components/PageClients/auth/ResetPasswordClient";
import {Metadata} from "next";

export async function generateMetadata(): Promise<Metadata>{
    return {
        title: "Auth App | Reset Password"
    }
}

export default function ResetPasswordPage() {
    return <ResetPasswordClient />
}

