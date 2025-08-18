import {ReactNode} from "react";
import {redirect} from "next/navigation";
import {cookies} from "next/headers";

export default async function PublicRoutesLayout({children}: { children: ReactNode }) {

    try {

        const token_response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/get-token`, {
            method: "GET",
            credentials: 'include',
            headers: {
                Cookie: (await cookies()).toString()
            }
        })

        if(!token_response.ok || token_response.status === 204) {
            return redirect("/auth/login")
        }
    }catch (err) {
        redirect("/auth/login")
    }

    return (
        <>
            {children}
        </>
    );
}

