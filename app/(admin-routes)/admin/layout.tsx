import {ReactNode} from "react";
import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import {Metadata} from "next";
import {SidebarProvider} from "@/components/ui/sidebar";

export const metadata: Metadata = {
    title: "Auth App | Admin Panel"
}

export default async function Layout({children}: {children: ReactNode}) {

    try {

        const tokenRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/get-token`, {
            method: "GET",
            credentials: 'include',
            headers: {
                Cookie: (await cookies()).toString()
            }
        })

        if(!tokenRes.ok || tokenRes.status === 204) {
            return redirect("/auth/login")
        }

        const token_data = await tokenRes.json()

        if(!token_data.accessToken || !token_data.success) {
            return redirect("/auth/login")
        }

        const adminRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/has-access`, {
            method: "GET",
            credentials: 'include',
            headers: {
                "Authorization": `Bearer ${token_data.accessToken}`
            }
        })

        if(!adminRes.ok || adminRes.status === 401 || adminRes.status === 403) {
            return redirect("/")
        }

        if(adminRes.status === 204) {
            return redirect("/auth/login")
        }

        const admin_res_data = await adminRes.json()

        if(!admin_res_data.success || !admin_res_data.hasAccess) {
            return redirect("/")
        }

    }catch {
        return redirect("/")
    }

    return (
        <SidebarProvider>
            <div className="h-screen p-3 bg-red-600 text-white text-5xl font-bold">SIDEBAR HERE</div>
            <main className="w-full">
                <div className="h-[100] w-full bg-container-color-2">SIDEBAR HEADER HERE</div>
                <section className="pl-[3%] bg-blue-600">
                    {children}
                </section>
            </main>
        </SidebarProvider>
    );
}

