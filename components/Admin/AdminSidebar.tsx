'use client'

import {
    Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator
} from "@/components/ui/sidebar";
import Link from "next/link";
import {ChevronUp, Home, LayoutDashboard, User} from "lucide-react";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {useAuth} from "@/providers/AuthProvider";
import {useMutation} from "@tanstack/react-query";
import {apiRequest} from "@/libs/apiRequest";
import toast from "react-hot-toast";
import {AxiosError} from "axios";
import {useRouter} from "next/navigation";

export default function AdminSidebar() {

    const {user, setUser, setToken} = useAuth()
    const router = useRouter()

    const {mutate, isPending} = useMutation({
        mutationFn: async () => {
            const response = await apiRequest.post("/auth/logout")
            return response.data
        },
        onSuccess: (data: { success: true, message: string }) => {
            if(data.success) {
                delete apiRequest.defaults.headers.common["Authorization"]
                router.push("/auth/login")
                setToken(null)
                setUser(null)
                toast.success(data.message)
            }
        },
        onError: (err: AxiosError<{ success: boolean; error: string }>) => {
            if(err.response && err.response.status === 401) {
                toast.error(err.response.data.error)
            }else {
                console.log(err.response?.data.error)
            }
        }
    })

    return (
        <Sidebar collapsible='icon'>
            {/*  SIDEBAR HEADER START  */}
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild className="hover:bg-zinc-200">
                            <Link href="/">
                                <Home/>
                                <span className="font-semibold">Home</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild className="hover:bg-zinc-200">
                            <Link href="/admin/dashboard">
                                <LayoutDashboard/>
                                <span className="font-semibold">Dashboard</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarSeparator  />
            {/*  SIDEBAR HEADER END  */}

            {/*  SIDEBAR CONTENT START  */}
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Users</SidebarGroupLabel>
                    <SidebarContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild className="hover:bg-zinc-200">
                                    <Link href="/admin/users">
                                        <User />
                                        <span className="font-semibold">Users</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarContent>
                </SidebarGroup>
            </SidebarContent>
            {/*  SIDEBAR CONTENT END  */}

            {/*  SIDEBAR FOOTER START  */}
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton className="hover:bg-zinc-200 cursor-pointer">
                                    <User />
                                    <span>{user?.username}</span>
                                    <ChevronUp className="ml-auto" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent side="top" align="end">
                                <DropdownMenuItem className="cursor-pointer hover:!bg-zinc-200">
                                    <Link prefetch={true} className="w-full h-full" href="/">Profile</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer hover:!bg-zinc-200" onSelect={(e) => e.preventDefault()}>
                                    <button onClick={() => mutate()} className="w-full h-full text-left cursor-pointer">
                                        {isPending ? "Loading..." : "Logout"}
                                    </button>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            {/*  SIDEBAR FOOTER END  */}
        </Sidebar>
    );
}

