'use client'
import AuthContainerHeader from "@/components/ui/AuthContainerHeader";
import {z} from "zod";
import {FormProvider, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import AuthButton from "@/components/ui/AuthButton";
import {useEffect, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {Separator} from "@/components/ui/separator";
import Link from "next/link";
import {useMutation} from "@tanstack/react-query";
import {AxiosError} from "axios";
import {apiRequest} from "@/libs/apiRequest";
import toast from "react-hot-toast";
import {useAuth} from "@/providers/AuthProvider";

const newPasswordSchema = z.object({
    password: z.string({message: "Password is required"}).min(6, "Password must be minimum 6 character"),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: "Passwords must be match!"
})

type NewPasswordFormValues = z.infer<typeof newPasswordSchema>

export default function NewPasswordClient() {

    const [token, setToken] = useState<string | null>(null)
    const {user} = useAuth()
    const searchParams = useSearchParams()
    const tokenQuery = searchParams.get('token')
    const router = useRouter()

    const form = useForm<NewPasswordFormValues>({
        resolver: zodResolver(newPasswordSchema),
        defaultValues: {
            password: '',
            confirmPassword: ''
        }
    })

    const {mutate, isPending} = useMutation({
        mutationFn: async (data: { password: string; token: string }) => {
            const res = await apiRequest.post("/auth/reset-password-apply", data)
            return res.data
        },
        onSuccess: (data: { success: boolean; message: string }) => {
            if(data.success) {
                toast.success(data.message)
                if(user) {
                    return router.push("/")
                }else {
                    return router.push("/auth/login")
                }
            }
        },
        onError: (err: AxiosError<{ success: boolean; error: string }>) => {
            const allowedCodes = [400, 404, 401]
            if(err.response && allowedCodes.includes(err.response.status) && !err.response.data.success) {
                toast.error(err.response.data.error)
            }
        }
    })

    const handleSubmit = (data: any) => {
        if(!token || !tokenQuery) return
        const newData = {
            password: data.password,
            token
        }

        mutate(newData)
    }

    useEffect(() => {
        if(!tokenQuery) return router.push(user ? "/" : "/auth/login")

        setToken(tokenQuery)
    }, [token, tokenQuery, router, setToken, user])

    return (
        <AuthContainerHeader headerTitle={"Enter your new password."} headerDesc="Please enter your old password and make sure it is not the same as the old one!">
            <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-6">
                    <FormField name={"password" as string} render={({field}) => (
                        <FormItem>
                            <FormLabel style={{fontWeight: "900"}} className="text-zinc-400 text-xs tracking-wide">New Password*</FormLabel>
                            <FormControl>
                                <Input className="text-white" type="password" placeholder="Enter your new password" {...field} />
                            </FormControl>
                            <FormMessage className="text-xs font-semibold"/>
                        </FormItem>
                    )} />
                    <FormField name={"confirmPassword" as string} render={({field}) => (
                        <FormItem>
                            <FormLabel style={{fontWeight: "900"}} className="text-zinc-400 text-xs tracking-wide">Confirm Password*</FormLabel>
                            <FormControl>
                                <Input className="text-white" type="password" placeholder="Confirm your new password" {...field} />
                            </FormControl>
                            <FormMessage className="text-xs font-semibold"/>
                        </FormItem>
                    )} />

                    <AuthButton loading={isPending} disabled={isPending} className="!mt-[unset]">Send password reset link</AuthButton>
                </form>
            </FormProvider>

            {user ? (
                (
                    <div className="flex flex-col gap-5 items-center">
                        <Separator className="bg-gray-500"/>
                        <p className="flex gap-2 text-[13px] justify-center">
                            <span className="font-semibold text-zinc-400">Don&apos;t want to reset your password?</span>
                            <Link className="cursor-pointer text-text-color font-bold" href={"/"}>Go back profile</Link>

                        </p>
                    </div>
                )
            ) : (
                (
                    <div className="flex flex-col gap-5 items-center">
                        <Separator className="bg-gray-500"/>
                        <p className="flex gap-2 text-[13px] justify-center">
                            <span className="font-semibold text-zinc-400">Don&apos;t want to reset your password?</span>
                            <Link className="cursor-pointer text-text-color font-bold" href={"/auth/login"}>Login</Link>

                        </p>
                    </div>
                )
            )}
        </AuthContainerHeader>
    );
}

