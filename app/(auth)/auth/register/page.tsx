import RegisterPageClient from "@/components/PageClients/auth/RegisterPageClient";
import {Metadata} from "next";

export async function generateMetadata(): Promise<Metadata>{
    return {
        title: "Auth App | Register"
    }
}


export default function RegisterPage() {
    return <RegisterPageClient />
}

