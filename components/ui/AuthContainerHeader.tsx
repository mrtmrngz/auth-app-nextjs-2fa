import {ReactNode} from "react";

export default function AuthContainerHeader({children, headerTitle, headerDesc, isSuccessPage = false}: {
    children: ReactNode;
    headerTitle: string;
    headerDesc: string;
    isSuccessPage?: boolean
}) {
    return (
        <div className="w-full h-screen flex items-center justify-center" style={{background: "var(--gradient-bg)"}}>
            <div
                className="flex flex-col gap-7 justify-center bg-container-color-1 p-10 rounded-2xl w-full max-w-[500px] text-text-color">
                <div className="flex flex-col gap-2 items-center">
                    {isSuccessPage && (
                        <div className="h-15 w-15 rounded-full bg-green-500 text-2xl text-white flex items-center justify-center">✓</div>
                    )}
                    <h1 className="text-text-color text-2xl font-bold tracking-wide">{headerTitle}</h1>
                    <p className="text-zinc-400 text-sm">{headerDesc}</p>
                </div>
                {children}
            </div>
        </div>
    );
}

