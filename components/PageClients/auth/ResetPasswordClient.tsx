'use client'
import AuthContainerHeader from "@/components/ui/AuthContainerHeader";
import {z} from "zod";
import {FormProvider, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import AuthButton from "@/components/ui/AuthButton";
import {Separator} from "@/components/ui/separator";
import Link from "next/link";
import {useState} from "react";
import {useMutation} from "@tanstack/react-query";
import {apiRequest} from "@/libs/apiRequest";
import {AxiosError} from "axios";
import toast from "react-hot-toast";
import {useRouter} from "next/navigation";
import {useAuth} from "@/providers/AuthProvider";

const resetPasswordSchema = z.object({
    email: z.email({message: "Email is required"})
})

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordClient() {

    const { user } = useAuth()
    const  router = useRouter()

    const form = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            email: ""
        }
    })

    const { mutate, isPending } = useMutation({
        mutationFn: async (data: { email: string }) => {
            const response = await apiRequest.post("/auth/reset-password-mail", data)
            return response.data
        },
        onSuccess: (data: { message: string; success: boolean }) => {
            if(data.success) {
                router.push("/auth/email-sent-success")
            }
        },
        onError: (err: AxiosError) => {
            console.log(err.response?.data)
        }
    })

    const handleSubmit = (data: any) => {
        mutate(data)
    }

    return (
        <AuthContainerHeader headerTitle="Reset Password"
                             headerDesc="Enter your email address and we'll send you a password reset link.">
            <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-6">
                    <FormField name={'email' as string} render={({field}) => (
                        <FormItem>
                            <FormLabel style={{fontWeight: "900"}}
                                       className="text-zinc-400 text-xs tracking-wide">Email*</FormLabel>
                            <FormControl>
                                <Input className="text-white" type="email"
                                       placeholder="Enter your verified mail adress!" {...field} />
                            </FormControl>
                            <FormMessage className="text-xs font-semibold"/>
                        </FormItem>
                    )}/>

                    <div className="form-alert p-4 bg-[#F0F9FF] rounded-lg text-[#0369a1] border border-[#bae6fd]">
                        <p className="text-[13px]">Enter your registered email address. We will send you a password reset link.</p>
                    </div>

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

