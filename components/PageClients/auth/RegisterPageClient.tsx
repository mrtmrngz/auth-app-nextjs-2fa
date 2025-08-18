'use client'
import AuthForm from "@/components/auth/AuthForm/AuthForm";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useMutation} from "@tanstack/react-query";
import {apiRequest} from "@/libs/apiRequest";
import {AxiosError} from "axios";
import toast from "react-hot-toast";
import {useRouter} from "next/navigation";

const registerSchema = z.object({
    username: z.string({message: "Username required"}).min(3, "Username must be minimum 3 character!"),
    email: z.email({message: "Email is required"}),
    password: z.string({message: "Password is required"}).min(6, "Password must be minimum 6 character"),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: "Password don't match"
})

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterPageClient() {

    const router = useRouter()

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            username: '',
            email: '',
            password: "",
            confirmPassword: ''
        }
    })

    const { mutate, isPending } = useMutation({
        mutationFn: async (data) => {
            const response = await apiRequest.post("/auth/register", data)

            return response.data
        },
        onSuccess: (data: { success: boolean; message: string; token: string; }) => {
            if(data.success) {
                toast.success(data.message)
                router.push(`/auth/verify-otp?token=${data.token}&otpType=mail-verify`)
            }
        },
        onError: (err: AxiosError<{ success: boolean; error: string; }>) => {
            if (err.response && err.response.status === 400) {
                toast.error(err.response.data.error)
            }
        }
    })

    const handleSubmit = (data: any) => {
        mutate(data)
    }

    return <AuthForm loading={isPending} formType="register" form={form} handleSubmit={handleSubmit}/>
}

