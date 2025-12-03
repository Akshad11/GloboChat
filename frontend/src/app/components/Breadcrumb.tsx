"use client";

import { usePathname, useRouter } from "next/navigation";
import { ChevronRightIcon, HomeIcon } from "@heroicons/react/24/outline";

export default function Breadcrumb() {
    const pathname = usePathname();
    const router = useRouter();

    // /profile → ["profile"]
    // /chat/123 → ["chat","123"]
    const parts = pathname.split("/").filter(Boolean);

    // Convert URL part → Nice Title
    const format = (str: string) => {
        if (!str) return "";
        if (!isNaN(Number(str))) return "Conversation";
        return str
            .replace(/-/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());
    };

    return (
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6 select-none">

            {/* Home */}
            <button
                onClick={() => router.push("/")}
                className="flex items-center gap-1 hover:text-gray-800"
            >
                <HomeIcon className="w-4 h-4" />
                Home
            </button>

            {parts.map((part, index) => {
                const href = "/" + parts.slice(0, index + 1).join("/");
                const isLast = index === parts.length - 1;

                return (
                    <span key={href} className="flex items-center gap-2">
                        <ChevronRightIcon className="w-4 h-4 text-gray-400" />

                        {isLast ? (
                            <span className="font-medium text-gray-800">
                                {format(part)}
                            </span>
                        ) : (
                            <button
                                onClick={() => router.push(href)}
                                className="hover:underline hover:text-gray-800"
                            >
                                {format(part)}
                            </button>
                        )}
                    </span>
                );
            })}
        </div>
    );
}
