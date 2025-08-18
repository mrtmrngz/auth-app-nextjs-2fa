import {Loader2Icon} from "lucide-react";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import React, {ReactNode} from "react";

interface AuthButtonProps {
    disabled?:boolean;
    loading?:boolean;
    className?: string;
    children: ReactNode;
    onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export default function AuthButton({disabled, loading, className, children, onClick}: AuthButtonProps) {
    return (
        <Button onClick={onClick} disabled={disabled} type="submit" variant="auth" className={cn("mt-7 text-white transform hover:-translate-y-[2px] transition-all", className)}>
            {loading ? (
                "Please Wait"
            ) : (
                children
            )}
            {loading && (
                <Loader2Icon className="animate-spin" />
            )}
        </Button>
    );
}

