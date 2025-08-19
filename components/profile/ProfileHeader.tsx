'use client'

import {useAuth} from "@/providers/AuthProvider";
import Image from "next/image";
import {Button} from "@/components/ui/button";
import {useMutation} from "@tanstack/react-query";
import {AxiosError} from "axios";
import {apiRequest} from "@/libs/apiRequest";
import toast from "react-hot-toast";
import {useRouter} from "next/navigation";
import {Loader2Icon} from "lucide-react";
import React from "react";

export default function ProfileHeader() {

    const { user } = useAuth()
    const router = useRouter()

    const avatar = user?.avatar?.url
        ? user.avatar.url
        : "https://res.cloudinary.com/mertmarangoz/image/upload/v1755548317/user-icon_nethan.jpg";

    const {mutate, isPending} = useMutation({
        mutationFn: async () => {
            const response = await apiRequest.post("/auth/logout")
            return response.data
        },
        onSuccess: (data: { success: true, message: string }) => {
            if(data.success) {
                delete apiRequest.defaults.headers.common["Authorization"]
                router.push("/auth/login")
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
        <header className="md:h-[100px] p-5 md:p-0 bg-container-color-2">
            <div className="container mx-auto h-full px-[5%]">
                <div className="header-wrapper flex items-center gap-3 md:gap-0 justify-between h-full flex-col md:flex-row">
                    {/* USER AVATAR */}

                    <div className="header-avatar h-[65px] w-[65px] relative rounded-full overflow-hidden border-3 border-text-color shadow-xs shadow-white">
                        <Image
                            src={avatar}
                            alt={user?.username || "username"}
                            width={"65"}
                            height="65"
                            priority
                            className="h-full w-full object-cover"
                        />
                    </div>

                    {/* USER USERNAME */}
                    <div className="flex flex-col gap-3 items-center">
                        <span className="text-zinc-400">Welcome</span>
                        <strong className="text-xl text-text-color font-bold">{user?.username}</strong>
                    </div>

                    <div className="flex gap-3 items-center flex-col sm:flex-row">
                        <Button disabled={isPending} onClick={() => mutate()} variant="destructive" size="lg" className="transform hover:-translate-y-[2px]">
                            Logout
                            {isPending && (
                                <Loader2Icon className="animate-spin" />
                            )}
                        </Button>
                        {user && user.role === "ADMIN" && (
                            <Button onClick={() => router.push("/admin/dashboard")} variant="auth" size="lg" className="transform hover:-translate-y-[2px] !w-max text-white">
                                Admin Panel
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

