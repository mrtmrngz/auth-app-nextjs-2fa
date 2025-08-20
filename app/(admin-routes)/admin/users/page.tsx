'use client'
import Image from "next/image";
import {cn} from "@/lib/utils";
import {useRouter} from "next/navigation";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {apiRequest} from "@/libs/apiRequest";
import {useAuth} from "@/providers/AuthProvider";
import toast from "react-hot-toast";
import {AxiosError} from "axios";


export default function AdminUsersPage() {

    const queryClient = useQueryClient()

    const router = useRouter()

    const {isAuthCheckComplete, authLoading} = useAuth()

    const {data, isPending} = useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            const res = await apiRequest.get("/admin/user-list", {
                withCredentials: true
            })

            return  res.data
        }
    })

    const {mutate: banMutate, isPending: banPending} = useMutation({
        mutationFn: async (data: {user_id: any; reason: string; expire: string}) => {
            const res = await apiRequest.patch("/admin/ban-user", data)
            return res.data
        },
        onSuccess:(data: { success: boolean; message: string }) => {
            if(data.success) {
                toast.success(data.message)
                queryClient.invalidateQueries({queryKey: ['users']})
            }
        },
        onError:(err: AxiosError<{ success: boolean; error: string }>) => {
            if(err.response) {
                toast.error(err.response.data?.error)

            }else {
                console.log(err)
            }
        }
    })

    const {mutate: unBanMutate, isPending: unBanPending} = useMutation({
        mutationFn: async (data: {user_id: any;}) => {
            const res = await apiRequest.patch("/admin/unban-user", data)
            return res.data
        },
        onSuccess:(data: { success: boolean; message: string }) => {
            if(data.success) {
                toast.success(data.message)
                queryClient.invalidateQueries({queryKey: ['users']})
            }
        },
        onError:(err: AxiosError<{ success: boolean; error: string }>) => {
            if(err.response) {
                toast.error(err.response.data?.error)

            }else {
                console.log(err)
            }
        }
    })

    const {mutate: deleteUserMutate, isPending: deleteUserPendign} = useMutation({
        mutationFn: async (userId: any) => {
            const res = await apiRequest.delete(`/admin/delete-user/${userId}`)
            return res.data
        },
        onSuccess:(data: { success: boolean; message: string }) => {
            if(data.success) {
                toast.success(data.message)
                queryClient.invalidateQueries({queryKey: ['users']})
            }
        },
        onError:(err: AxiosError<{ success: boolean; error: string }>) => {
            if(err.response) {
                toast.error(err.response.data?.error)

            }else {
                console.log(err)
            }
        }
    })


    if(isPending || !isAuthCheckComplete || authLoading) return <h1>Loading...</h1>

    return (
        <div className="w-full h-max overflow-auto">
            <table className="users-table min-w-[1000px] w-full">
                <thead>
                <tr>
                    <th style={{width: "150px"}}>ID</th>
                    <th style={{width: "100px"}}>Avatar</th>
                    <th style={{width: "250px"}}>Username</th>
                    <th style={{width: "150px"}}>Email</th>
                    <th style={{width: "10%"}}>Verify Status</th>
                    <th style={{width: "10%"}}>2FA Status</th>
                    <th style={{width: "10%"}}>Ban Status</th>
                    <th style={{width: "650px"}}>Actions</th>
                </tr>
                </thead>

                <tbody>
                {data?.users?.map((user: any) => (
                    <tr key={user?._id}>
                        <td>{user?._id}</td>
                        <td className="flex items-center justify-center">
                            <div className="relative overflow-hidden w-[70px] h-[70px] rounded-full">
                                <Image src={user?.avatar?.url || "https://res.cloudinary.com/mertmarangoz/image/upload/v1755548317/user-icon_nethan.jpg"} alt="avatar" width={70} height={70} className="w-full h-full object-cover" />
                            </div>
                        </td>
                        <td>
                            <strong>{user?.username}</strong>
                        </td>
                        <td>
                            <strong>{user?.email}</strong>
                        </td>
                        <td className="text-center">
                            <span className={cn("font-semibold", {
                                "text-green-400":user?.isVerified,
                                "text-red-600": !user?.isVerified,
                            })}>{user?.isVerified ? "Verified" : "Unverified"}</span>
                        </td>
                        <td className="text-center">
                            <span className={cn("font-semibold", {
                                "text-green-400":user?.isTwoFactorEnabled,
                                "text-red-700": !user?.isTwoFactorEnabled,
                            })}>{user?.isTwoFactorEnabled ? "Enable" : "Disable"}</span>
                        </td>
                        <td className="text-center">
                            <span className={cn("font-semibold", {
                                "text-green-400":!user?.ban_status?.is_banned,
                                "text-red-700": user?.ban_status?.is_banned,
                            })}>{user?.ban_status?.is_banned ? "Banned" : "Unbanned"}</span>
                        </td>
                        <td className="text-center">
                            <div className="flex items-center gap-3 w-full justify-center">
                                <button onClick={() => {
                                    if(!user?.ban_status?.is_banned){
                                        banMutate({user_id: user?._id, expire: "1D", reason: 'test'})
                                    }else if(user?.ban_status?.is_banned){
                                        unBanMutate({user_id: user?._id})
                                    }
                                }} disabled={banPending || unBanPending} className="text-red-900 text-sm cursor-pointer">{!user?.ban_status?.is_banned ? "Ban User" : "Unban User"}</button>
                                <button onClick={() => router.push(`/admin/users/update/${user?._id}`)} className="text-container-color-2 text-sm cursor-pointer">Update User</button>
                                <button onClick={() => deleteUserMutate(user?._id)} disabled={deleteUserPendign} className="text-container-color-1 text-sm cursor-pointer">Delete User</button>
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

