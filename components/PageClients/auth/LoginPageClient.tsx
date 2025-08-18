'use client'
import AuthForm from "@/components/auth/AuthForm/AuthForm";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useState} from "react";
import {useMutation} from "@tanstack/react-query";
import {apiRequest} from "@/libs/apiRequest";
import {AxiosError} from "axios";
import toast from "react-hot-toast";
import {useRouter} from "next/navigation";
import {useAuth} from "@/providers/AuthProvider";

const loginSchema = z.object({
    email: z.email({ message: "Email is required" }),
    password: z.string({message: "Password is required"}).min(6, "Password must be minimum 6 character"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPageClient() {

    const [dummyLoading] = useState(true)
    const { setUser, setToken } = useAuth()
    const router = useRouter()

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: ''
        }
    })

    const {mutate, isPending} = useMutation({
        mutationFn: async (data: { username: string; email: string; password: string }) => {
            const response = await apiRequest.post("/auth/login", data)
            return response.data
        },
        onSuccess: async (data: { success: boolean; message: string; accessToken: string; token: string; }) => {
            if(data.success) {
                toast.success(data.message)
                if(data.token) {
                    router.push(`/auth/verify-otp?token=${data.token}&otpType=two-factor`)
                }else if(data.accessToken) {
                    setToken(data.accessToken)
                    try {
                        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/user-info`, {
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${data.accessToken}`
                            }
                        })

                        if(!response.ok) {
                            const errorData = await response.json()
                            toast.error(errorData.error || "Some error occurred")
                            return
                        }

                        const user_data = await response.json()
                        setUser(user_data)
                        router.push("/")
                    }catch (err: unknown) {
                        console.error("Fetch error:", err)
                        toast.error("Network error occurred")
                    }
                }
            }
        },
        onError: (err: AxiosError<{ success: false; error: string; }>) => {
            const allowedStatusCodes: number[] = [400, 404, 401, 403]

            if(err.response && allowedStatusCodes.includes(err.response.status)) {
                toast.error(err.response.data.error)
            }
        }
    })

    const handleSubmit = (data: any) => {
        mutate(data)
    }

    return <AuthForm formType="login" loading={isPending} form={form} handleSubmit={handleSubmit} />
}

