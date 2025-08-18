import LoginPageClient from "@/components/PageClients/auth/LoginPageClient";
import {Metadata} from "next";


export async function generateMetadata(): Promise<Metadata>{
    return {
        title: "Auth App | Login"
    }
}


export default function LoginPage() {
    return <LoginPageClient />
}

