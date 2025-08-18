'use client'
import AuthContainerHeader from "@/components/ui/AuthContainerHeader";
import AuthButton from "@/components/ui/AuthButton";
import {useRouter} from "next/navigation";
import {useAuth} from "@/providers/AuthProvider";

export default function EmailSentSuccessPage() {

    const { user: isAuthUser } = useAuth()
    const router = useRouter()

    return (
        <AuthContainerHeader isSuccessPage headerTitle="Email Sent Successfully!" headerDesc="Password reset link has been sent to your email address.">
            <div className="form-alert p-4 flex flex-col gap-3 bg-[#F0FDF4] rounded-lg text-[#166534] border border-[#bbf7d0]">
                <p className="text-sm">If you entered a valid email address, we have sent a password reset link to your email address. Please check your email address.</p>
                <p className="text-sm leading-[1.6]">
                    <strong>Important: </strong>
                    <span>The link is valid for 5 minutes. You must reset your password within this period.</span>
                </p>
                <p className="text-sm leading-[1.6]">
                    Didn&apos;t receive the email? Check your spam folder or try again by clicking the button below.
                </p>
            </div>

            <div className="flex flex-col w-full gap-5">
                <AuthButton onClick={() => router.push("/auth/reset-password")} className="!mt-[unset]">Send Again!</AuthButton>
                <AuthButton onClick={() => router.push(isAuthUser ? "/" : "/auth/login")} className="!bg-transparent !mt-[unset] !bg-none border text-zinc-400">{isAuthUser ? "Go back profile" : "Login"}</AuthButton>
            </div>
        </AuthContainerHeader>
    );
}

