'use client'

import {InputOTPGroup, InputOTPSlot} from "@/components/ui/input-otp";
import {OTPInput} from "input-otp";
import {z} from "zod";
import {FormProvider, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Separator} from "@/components/ui/separator";
import {useRouter, useSearchParams} from "next/navigation";
import {useEffect, useState} from "react";
import AuthButton from "@/components/ui/AuthButton";
import {useMutation} from "@tanstack/react-query";
import {apiRequest} from "@/libs/apiRequest";
import {AxiosError} from "axios";
import toast from "react-hot-toast";
import {OtpCodes} from "@/const/OtpCodes";
import AuthContainerHeader from "@/components/ui/AuthContainerHeader";
import {useAuth} from "@/providers/AuthProvider";

const otpSchema = z.object({
    code: z.string().min(6, {
        message: "Your otp code must be 6 characters."
    })
})

type OtpFormValues = z.infer<typeof otpSchema>

enum OtpTypeEnum {
    VERIFY_ACCOUNT= "VERIFY_ACCOUNT",
    TWO_FACTOR="TWO_FACTOR",
    USERNAME_CHANGE="USERNAME_CHANGE",
    EMAIL_CHANGE="EMAIL_CHANGE"
}

const otpQueryTypes = ["mail-verify", "two-factor", "email-change", "username-change"]

export default function VerifyOtpPageClient() {

    const searchParams = useSearchParams()
    const otpTypeQuery = searchParams.get('otpType')
    const tokenQuery = searchParams.get('token')
    const [token, setToken] = useState<string | null>(null)
    const [otpType, setOtpType] = useState<OtpTypeEnum | null>(null)
    const router = useRouter()
    const { setUser, setToken: setAuthToken } = useAuth()

    const form = useForm<OtpFormValues>({
        resolver: zodResolver(otpSchema),
        defaultValues: {
            code: ""
        }
    })

    const {mutate: verify_mutate, isPending: verify_pending} = useMutation({
        mutationFn: async (data: { otp: string; token: string; otpType: string }) => {
            const response = await apiRequest.post("/auth/verify-otp", data)
            return response.data
        },
        onSuccess: async (data: { success: boolean; message: string, code?:string; accessToken?:string;}) => {
            if(data.success) {
                toast.success(data.message)

                if(data.code === OtpCodes.LOGIN_SUCCESS && data.accessToken) {
                    setAuthToken(data.accessToken)
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

                if(data.code) {
                    switch (data.code) {
                        case OtpCodes.EMAIL_VERIFIED:
                            router.push("/auth/login")
                            break;
                        case OtpCodes.TWO_FACTOR_ENABLED:
                        case OtpCodes.LOGIN_SUCCESS:
                            router.push("/")
                            break;
                    }
                }
            }
        },
        onError: (err: AxiosError<{ success: boolean; error: string, code?:string}>) => {

            const allowedStatusCode: number[] = [400, 401, 404, 403, 410, 423]

            if(err.response && allowedStatusCode.includes(err.response.status)) {
                if(err.response.data.code) {
                    toast.error(err.response.data.error)
                    switch (err.response.data.code) {
                        case OtpCodes.ACCOUNT_DELETED:
                            router.push("/auth/register")
                            break;
                    }
                }else {
                    toast.error(err.response.data.error)
                }
            }
        }
    })

    const { mutate: resend_mutate, isPending: resend_pending } = useMutation({
        mutationFn: async (data: { token: string; otpType: string; }) => {
            const res = await apiRequest.post("/auth/resend-otp", data)
            return res.data
        },
        onSuccess: (data: { success: boolean; message: string; token: string; code?:string; }) => {
            if(data.success) {
                toast.success(data.message)
                router.push(`/auth/verify-otp?token=${data.token}&otpType=${otpTypeQuery}`)
            }
        },
        onError: (err: AxiosError<{ status: boolean; error: string; code?:string }>) => {
            const allowedStatusCodes = [400, 404, 403, 401]
            if(err.response && allowedStatusCodes.includes(err.response.status)) {
                toast.error(err.response.data.error)
                if(err.response.status === 404) return router.push("/auth/register")
                if(err.response.status === 423) return router.push("/")
            }
        }
    })

    const handleSubmit = (data: any) => {
        if (!token || !otpType) return;

        const sendData = {
            otp: data.code,
            token,
            otpType
        }
        verify_mutate(sendData)
    }

    const resend_otp = () => {

        if(!token || !otpType) return;

        resend_mutate({ token, otpType })
    }

    useEffect(() => {

        if(!tokenQuery || (!otpTypeQuery || !otpQueryTypes.includes(otpTypeQuery))) {
            router.replace("/")
            return
        }

        switch (otpTypeQuery) {
            case "mail-verify":
                setOtpType(OtpTypeEnum.VERIFY_ACCOUNT)
                break;
            case "two-factor":
                setOtpType(OtpTypeEnum.TWO_FACTOR)
                break;
            case "email-change":
                setOtpType(OtpTypeEnum.EMAIL_CHANGE)
                break;
            case "username-change":
                setOtpType(OtpTypeEnum.USERNAME_CHANGE)
                break;
            default:
                setOtpType(OtpTypeEnum.VERIFY_ACCOUNT)
        }

        setToken(tokenQuery)

    }, [otpTypeQuery, tokenQuery, router])

    return (
        <AuthContainerHeader headerTitle="OTP Verification" headerDesc="Enter the 6-digit code sent to your email address.">
            {/* OTP INPUTS */}

            <div className="otp-inputs flex flex-col gap-3">
                <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)}>
                        <FormField name={"code" as string} render={({field}) => (
                            <FormItem>
                                <FormLabel style={{fontWeight: "900"}} className="text-zinc-600 text-xs tracking-wide">OTP Code*</FormLabel>
                                <FormControl>
                                    <OTPInput maxLength={6} {...field}>
                                        <InputOTPGroup className="flex gap-5 justify-center">
                                            <InputOTPSlot className="otp-custom-input rounded-xl border last:rounded-xl first:rounded-xl w-[50px] h-[50px] font-bold text-black bg-white !focus:!outline-none custom-otp-input" index={0} />
                                            <InputOTPSlot className="otp-custom-input rounded-xl border last:rounded-xl first:rounded-xl w-[50px] h-[50px] font-bold text-black bg-white !focus:!outline-none custom-otp-input" index={1} />
                                            <InputOTPSlot className="otp-custom-input rounded-xl border last:rounded-xl first:rounded-xl w-[50px] h-[50px] font-bold text-black bg-white !focus:!outline-none custom-otp-input" index={2} />
                                            <InputOTPSlot className="otp-custom-input rounded-xl border last:rounded-xl first:rounded-xl w-[50px] h-[50px] font-bold text-black bg-white !focus:!outline-none custom-otp-input" index={3} />
                                            <InputOTPSlot className="otp-custom-input rounded-xl border last:rounded-xl first:rounded-xl w-[50px] h-[50px] font-bold text-black bg-white !focus:!outline-none custom-otp-input" index={4} />
                                            <InputOTPSlot className="otp-custom-input rounded-xl border last:rounded-xl first:rounded-xl w-[50px] h-[50px] font-bold text-black bg-white !focus:!outline-none custom-otp-input" index={5} />
                                        </InputOTPGroup>
                                    </OTPInput>
                                </FormControl>
                                <FormMessage className="text-xs font-semibold" />
                            </FormItem>
                        )} />

                        <AuthButton loading={verify_pending || resend_pending} disabled={verify_pending || resend_pending}>Verify OTP</AuthButton>
                    </form>
                </FormProvider>
            </div>

            {/* SEND OTP AGAIN BUTTON */}

            <div className="flex flex-col gap-5 items-center">
                <Separator className="bg-gray-500" />
                <p className="flex gap-2 text-[13px] justify-center">
                    <span className="font-semibold text-zinc-400">Didn&apos;t receive the code?</span>
                    <button onClick={resend_otp} className="cursor-pointer text-text-color font-bold">Send Again</button>
                </p>
            </div>
        </AuthContainerHeader>
    );
}

