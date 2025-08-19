'use client'
import AuthButton from "@/components/ui/AuthButton";
import React, {ChangeEvent, useRef, useState} from "react";
import {Button} from "@/components/ui/button";
import {useAuth} from "@/providers/AuthProvider";
import {Input} from "@/components/ui/input";
import {useMutation} from "@tanstack/react-query";
import {apiRequest} from "@/libs/apiRequest";
import toast from "react-hot-toast";
import {useRouter} from "next/navigation";
import {AxiosError} from "axios";

type EditingModTypes = {
    isAvatarEditing: boolean;
    isUsernameEditing: boolean;
    isEmailEditing: boolean;
    isPasswordEditing: boolean;
}

export default function ProfileBody() {

    const [editingMod, setEditingMod] = useState<EditingModTypes>({
        isAvatarEditing: false,
        isUsernameEditing: false,
        isEmailEditing: false,
        isPasswordEditing: false,
    })
    const [values, setValues] = useState({
        username: "",
        email: "",
        password_mail: "",
    })

    const [currChangeType, setCurrChangeType] = useState<"email-change" | "username-change" | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [formError, setFormError] = useState<{
        username: null | string;
        email: null | string;
        password_mail: null | string;
        avatar: null | string;
    }>({
        username: null,
        email: null,
        password_mail: null,
        avatar: null
    })
    const fileInputRef = useRef<null | HTMLInputElement>(null)
    const {user, setUser} = useAuth()
    const router = useRouter()

    const changeUsernameOrEmail = (changeType: "USERNAME_CHANGE" | "EMAIL_CHANGE") => {
        if(changeType === "USERNAME_CHANGE") {
            if(values.username.trim() === ""){
                setFormError(prev => ({...prev, username: "Username required!"}))
            }else {
                setFormError(prevState => ({...prevState, username: null}))
                const sendData = {
                    changeType,
                    username: values.username
                }
                setCurrChangeType('username-change')
                usernameEmailChangeMutation(sendData)
            }
        }else if(changeType === "EMAIL_CHANGE") {
            if(values.email.trim() === ""){
                setFormError(prev => ({...prev, email: "Email required!"}))
            } else {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if(!emailRegex.test(values.email)) {
                    setFormError(prev => ({...prev, email: "Invalid email format!"}))
                } else {
                    setFormError(prev => ({...prev, email: null}))
                    const sendData = { changeType, email: values.email }
                    setCurrChangeType('email-change')
                    usernameEmailChangeMutation(sendData)
                }
            }
        } else {
            alert("Invalid change type")
        }


    }

    const changePassword = () => {
        if(values.password_mail.trim() === "") {
            setFormError(prev => ({...prev, password_mail: "Your current mail is required!"}))
        }else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if(!emailRegex.test(values.password_mail)) {
                setFormError(prev => ({...prev, password_mail: "Invalid email format!"}))
            }else if(values.password_mail !== user?.email) {
                setFormError(prev => ({...prev, password_mail: "Email incorrect!"}))
            }else {
                setFormError(prev => ({...prev, password_mail: null}))
                const data = {
                    email: values.password_mail
                }

                passwordChangeMutation(data)
            }
        }
    }

    const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
        if(!event.target.files) {
            return;
        }
        const file = event.target.files[0]
        if(file) {
            if(!file.type.startsWith("image/")) {
                setFormError(prev => ({...prev, avatar: "You must choose image file type"}))
                return;
            }

            if(file.size > 1024 * 1024 * 5) {
                setFormError(prev => ({...prev, avatar: "The file size must be less than 5 MB"}))
                return;
            }

            setSelectedFile(file)
            setFormError(prev => ({...prev, avatar: null}))

            const reader = new FileReader();
            reader.onload = (e: ProgressEvent<FileReader>) => {
                const result = e.target?.result
                if(typeof result === "string") {
                    setPreviewUrl(result)
                }
            }
            reader.readAsDataURL(file)
        }
    }

    const { mutate: avatarUpdateMutation, isPending: avatarUpdatePending } = useMutation({
        mutationFn: async (formData: FormData) => {
            const res = await apiRequest.patch("/users/change-user-infos", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            })

            return res.data
        },
        onSuccess: (data: { success: boolean; message: string }) => {
            if(data.success) {
                toast.success(data.message)
                setEditingMod(prev => ({...prev, isAvatarEditing: false}))
                setFormError(prev => ({...prev, avatar: null}))
                router.refresh()
                if(user) {
                    setUser({
                        ...user,
                        avatar: {
                            ...user.avatar!,
                            url: previewUrl!
                        }
                    })
                }
                setSelectedFile(null)
                setPreviewUrl(null)
            }
        },
        onError: (err: AxiosError<{ success: false, error: string }>) => {
            if(err.response && err.response.status === 404 && !err.response.data.success) {
                toast.error(err.response.data.error)
            }
        }
    })

    const { mutate: usernameEmailChangeMutation, isPending: usernameEmailChangePending } = useMutation({
        mutationFn: async (data: { changeType: string; email?:string; username?:string }) => {
            const res = await apiRequest.patch("/users/change-mail-or-username", data)
            return res.data
        },
        onSuccess: (data: { success: boolean; message: string; token: string }) => {
            if(data.success && data.token) {
                toast.success(data.message)
                router.push(`/auth/verify-otp?token=${data.token}&otpType=${currChangeType}`)
            }
        },
        onError: (err: AxiosError) => {
            if(err.response) {
                console.log(err.response.data)
            }
         }
    })

    const { mutate: passwordChangeMutation, isPending: passwordChangePending } = useMutation({
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

    const { mutate: enableTwoFactorMutation, isPending: enableTwoFactorPending } = useMutation({
        mutationFn: async () => {
            const response = await apiRequest.patch("/users/enable-two-factor")
            return response.data
        },
        onSuccess: (data: { message: string; success: boolean, token: string }) => {
            if(data.success) {
                router.push(`/auth/verify-otp?token=${data.token}&otpType=two-factor`)
            }
        },
        onError: (err: AxiosError<{ success: boolean; error: string; }>) => {
            const allowedStatusCodes = [404, 429]
            if(err.response && allowedStatusCodes.includes(err.response.status)) {
                toast.error(err.response.data.error)
            }
        }
    })

    const handle2fa = () => {
        if(user?.isTwoFactorEnabled) return;
        enableTwoFactorMutation()
    }


    const handleSaveAvatar = () => {
        if(!selectedFile) return
        const formData = new FormData()
        formData.append('avatar', selectedFile)
        avatarUpdateMutation(formData)
    }

    return (
        <div className="w-full min-h-screen px-[5%] flex items-center justify-center" style={{background: "var(--gradient-bg)"}}>
            <div className="p-10 max-w-[1000px] my-10 w-full h-max bg-container-color-2 rounded-lg flex flex-col gap-5">
                <div>
                    <h1 className="text-text-color text-2xl font-bold text-center">Account Settings</h1>
                </div>

                <div className="sections flex flex-col gap-3">

                    {/* AVATAR CHANGE */}
                    <div className="section bg-[#25293F] p-[18px] border-2 border-[#f8fafc] rounded-[16px] relative overflow-hidden hover:border-text-color transition-all duration-300 transform hover:-translate-y-[3px] flex flex-col gap-[12px]">
                        {/* TOP SECTION */}

                        <div className="top-section flex items-center justify-between">
                            <span className="section-name text-zinc-400 relative inline-flex font-semibold gap-[10px] items-center flex-row-reverse">Avatar</span>

                            <div className="py-[8px] px-[16px] bg-[rgba(55,65,81,0.8)] rounded-lg border border-[#4b5563]">
                                <span className="text-[#6b7280] text-sm">Avatar</span>
                            </div>
                        </div>

                        {editingMod.isAvatarEditing && (
                            <div className="relative">
                                <input className="opacity-0 w-0 h-0 absolute" id="avatar-change-input" type="file" ref={fileInputRef} name="avatar" accept="image/*" onChange={handleFileSelect} />
                                <label htmlFor="avatar-change-input" className="cursor-pointer flex flex-col items-center justify-center py-[50px] px-[40px] bg-[rgba(255,255,255,0.5)] border border-dashed rounded-xl text-center transition-all duration-300 hover:bg-transparent hover:border-text-color gap-2">
                                    <div className="text-[32px]">📁</div>
                                    <span className="font-semibold text-[#374151]">Choose a Image File</span>
                                    <small className="text-xs text-gray-500">PNG, JPG, GIF (Max 5MB)</small>
                                </label>
                            </div>
                        )}

                        {formError.avatar && (
                            <span className="text-red-600 text-xs font-bold">{formError.avatar}</span>
                        )}

                        {selectedFile && previewUrl && (
                            <div className="p-5 flex items-center justify-center border border-zinc-400 rounded-xl">
                                <div className="w-[150px] h-[150px] rounded-full relative overflow-hidden">
                                    <img src={previewUrl} alt="selected-avatar" className="w-full h-full object-cover" />
                                </div>
                            </div>
                        )}

                        {/* BOTTOM SECTION */}

                        <div className="bottom-section flex gap-3 items-center">
                            {editingMod.isAvatarEditing ? (
                                <>
                                    <Button disabled={avatarUpdatePending} onClick={handleSaveAvatar} variant="success">Save</Button>
                                    <Button variant="cancel" onClick={() => setEditingMod(prev => ({...prev, isAvatarEditing: false}))}>Cancel</Button>
                                </>
                            ) : (
                                <AuthButton onClick={() => setEditingMod(prev => ({...prev, isAvatarEditing: true}))} className="!w-max hover:-translate-y-0 hover:opacity-85">Change Avatar</AuthButton>
                            )}
                        </div>
                    </div>

                    {/* USERNAME CHANGE */}
                    <div className="section bg-[#25293F] p-[18px] border-2 border-[#f8fafc] rounded-[16px] relative overflow-hidden hover:border-text-color transition-all duration-300 transform hover:-translate-y-[3px] flex flex-col gap-[12px]">
                        {/* TOP SECTION */}

                        <div className="top-section flex items-center justify-between">
                            <span className="section-name text-zinc-400 relative inline-flex font-semibold gap-[10px] items-center flex-row-reverse">Username</span>

                            <div className="py-[8px] px-[16px] bg-[rgba(55,65,81,0.8)] rounded-lg border border-[#4b5563]">
                                <span className="text-[#6b7280] text-sm">{user?.username}</span>
                            </div>
                        </div>

                        {editingMod.isUsernameEditing && (
                            <div className="flex flex-col gap-2">
                                <Input className="text-white" placeholder="Enter your NEW USERNAME" onChange={(e) => setValues(prev => ({...prev, username: e.target.value}))} />
                                {formError.username && (
                                    <span className="text-red-600 text-xs font-bold">{formError.username}</span>
                                )}
                            </div>
                        )}

                        {/* BOTTOM SECTION */}

                        <div className="bottom-section flex gap-3 items-center">
                            {editingMod.isUsernameEditing ? (
                                <>
                                    <Button disabled={usernameEmailChangePending} variant="success" onClick={() => changeUsernameOrEmail("USERNAME_CHANGE")}>Change Username</Button>
                                    <Button variant="cancel" onClick={() => {
                                        setFormError(prevState => ({...prevState, username: null}))
                                        setEditingMod(prev => ({...prev, isUsernameEditing: false}))
                                    }}>Cancel</Button>
                                </>
                            ) : (
                                <AuthButton onClick={() => setEditingMod(prev => ({...prev, isUsernameEditing: true}))} className="!w-max hover:-translate-y-0 hover:opacity-85">Change Username</AuthButton>
                            )}
                        </div>
                    </div>

                    {/*  EMAIL CHANGE  */}
                    <div className="section bg-[#25293F] p-[18px] border-2 border-[#f8fafc] rounded-[16px] relative overflow-hidden hover:border-text-color transition-all duration-300 transform hover:-translate-y-[3px] flex flex-col gap-[12px]">
                        {/* TOP SECTION */}

                        <div className="top-section flex items-center justify-between">
                            <span className="section-name text-zinc-400 relative inline-flex font-semibold gap-[10px] items-center flex-row-reverse">Email</span>

                            <div className="py-[8px] px-[16px] bg-[rgba(55,65,81,0.8)] rounded-lg border border-[#4b5563]">
                                <span className="text-[#6b7280] text-sm">{user?.email}</span>
                            </div>
                        </div>

                        {editingMod.isEmailEditing && (
                            <div className="flex flex-col gap-2">
                                <Input className="text-white" placeholder="Enter your NEW EMAIL!" onChange={(e) => {
                                    setFormError(prevState => ({...prevState, email: null}))
                                    setValues(prev => ({...prev, email: e.target.value}))
                                }} />
                                {formError.email && (
                                    <span className="text-red-600 text-xs font-bold">{formError.email}</span>
                                )}
                            </div>
                        )}

                        {/* BOTTOM SECTION */}

                        <div className="bottom-section flex gap-3 items-center">
                            {editingMod.isEmailEditing ? (
                                <>
                                    <Button disabled={usernameEmailChangePending} variant="success" onClick={() => changeUsernameOrEmail("EMAIL_CHANGE")}>Change Email</Button>
                                    <Button variant="cancel" onClick={() => {
                                        setFormError(prevState => ({...prevState, email: null}))
                                        setEditingMod(prev => ({...prev, isEmailEditing: false}))
                                    }}>Cancel</Button>
                                </>
                            ) : (
                                <AuthButton onClick={() => setEditingMod(prev => ({...prev, isEmailEditing: true}))} className="!w-max hover:-translate-y-0 hover:opacity-85">Change Email</AuthButton>
                            )}
                        </div>
                    </div>

                    {/* PASSWORD CHANGE */}
                    <div className="section bg-[#25293F] p-[18px] border-2 border-[#f8fafc] rounded-[16px] relative overflow-hidden hover:border-text-color transition-all duration-300 transform hover:-translate-y-[3px] flex flex-col gap-[12px]">
                        {/* TOP SECTION */}

                        <div className="top-section flex items-center justify-between">
                            <span className="section-name text-zinc-400 relative inline-flex font-semibold gap-[10px] items-center flex-row-reverse">Password</span>

                            <div className="py-[8px] px-[16px] bg-[rgba(55,65,81,0.8)] rounded-lg border border-[#4b5563]">
                                <span className="text-[#6b7280] text-sm">*************</span>
                            </div>
                        </div>

                        {editingMod.isPasswordEditing && (
                            <div className="flex flex-col gap-2">
                                <Input className="text-white" placeholder="Enter your CURRENT EMAIL!" onChange={(e) => {
                                    setFormError(prevState => ({...prevState, email: null}))
                                    setValues(prev => ({...prev, password_mail: e.target.value}))
                                }} />
                                {formError.password_mail && (
                                    <span className="text-red-600 text-xs font-bold">{formError.password_mail}</span>
                                )}
                            </div>
                        )}

                        {/* BOTTOM SECTION */}

                        <div className="bottom-section flex gap-3 items-center">
                            {editingMod.isPasswordEditing ? (
                                <>
                                    <Button disabled={passwordChangePending} variant="success" onClick={changePassword}>Send Reset Password Mail</Button>
                                    <Button variant="cancel" onClick={() => {
                                        setFormError(prevState => ({...prevState, password_mail: null}))
                                        setEditingMod(prev => ({...prev, isPasswordEditing: false}))
                                    }}>Cancel</Button>
                                </>
                            ) : (
                                <AuthButton onClick={() => setEditingMod(prev => ({...prev, isPasswordEditing: true}))} className="!w-max hover:-translate-y-0 hover:opacity-85">Change Password</AuthButton>
                            )}
                        </div>
                    </div>

                    {/* 2FA CHANGE */}
                    <div className="section bg-[#25293F] p-[18px] border-2 border-[#f8fafc] rounded-[16px] relative overflow-hidden hover:border-text-color transition-all duration-300 transform hover:-translate-y-[3px] flex flex-col gap-[12px]">
                        {/* TOP SECTION */}

                        <div className="top-section flex items-center justify-between">
                            <span className="section-name text-zinc-400 relative inline-flex font-semibold gap-[10px] items-center flex-row-reverse">2FA</span>

                            <div className="py-[8px] px-[16px] bg-[rgba(55,65,81,0.8)] rounded-lg border border-[#4b5563]">
                                <span className="text-[#6b7280] text-sm">{user?.isTwoFactorEnabled ? "Enable": "Disable"}</span>
                            </div>
                        </div>
                        {/* BOTTOM SECTION */}

                        {!user?.isTwoFactorEnabled && (
                            <div className="bottom-section flex gap-3 items-center">
                                <AuthButton loading={enableTwoFactorPending} disabled={enableTwoFactorPending} onClick={handle2fa} className="!w-max hover:-translate-y-0 hover:opacity-85">Enable 2FA</AuthButton>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}

