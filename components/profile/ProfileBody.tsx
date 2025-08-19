'use client'
import AuthButton from "@/components/ui/AuthButton";
import {useState} from "react";
import {Button} from "@/components/ui/button";
import {useAuth} from "@/providers/AuthProvider";
import {Input} from "@/components/ui/input";

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
        password_mail: ""
    })
    const [formError, setFormError] = useState<{
        username: null | string;
        email: null | string;
        password_mail: null | string
    }>({
        username: null,
        email: null,
        password_mail: null
    })
    const {user} = useAuth()

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

                console.log(sendData)
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
                    console.log(sendData)
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

                console.log(data)
            }
        }
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
                            <div className="text-5xl text-red-600">
                                update here
                            </div>
                        )}

                        {/* BOTTOM SECTION */}

                        <div className="bottom-section flex gap-3 items-center">
                            {editingMod.isAvatarEditing ? (
                                <>
                                    <Button variant="success">Save</Button>
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
                                    <Button variant="success" onClick={() => changeUsernameOrEmail("USERNAME_CHANGE")}>Change Username</Button>
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
                                    <Button variant="success" onClick={() => changeUsernameOrEmail("EMAIL_CHANGE")}>Change Email</Button>
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
                                    <Button variant="success" onClick={changePassword}>Send Reset Password Mail</Button>
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

                </div>
            </div>
        </div>
    );
}

