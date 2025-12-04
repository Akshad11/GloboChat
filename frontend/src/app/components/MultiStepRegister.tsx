"use client";

import { useState } from "react";
import StepAccount from "./StepAccount";
import StepUserDetails from "./StepUserDetails";
import StepComplete from "./StepComplete";

export default function MultiStepRegister() {
    const [step, setStep] = useState(1);

    const [form, setForm] = useState({
        email: "",
        password: "",
        googleIdToken: "",
        username: "",
        firstname: "",
        lastname: "",
    });

    function update(data: any) {
        setForm((prev) => ({ ...prev, ...data }));
    }

    return (
        <div className="w-full max-w-lg mx-auto bg-white rounded-xl shadow-xl p-8 relative">

            {/* STEP INDICATOR */}
            <div className="flex justify-between mb-6">
                {[1, 2, 3].map(n => (
                    <div
                        key={n}
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold
                            ${step === n ? "bg-blue-600 text-white" : step > n ? "bg-green-600 text-white" : "bg-gray-300"}
                        `}
                    >
                        {n}
                    </div>
                ))}
            </div>

            {/* RENDER STEPS */}
            {step === 1 && <StepAccount next={() => setStep(2)} update={update} form={form} />}
            {step === 2 && <StepUserDetails next={() => setStep(3)} prev={() => setStep(1)} update={update} form={form} />}
            {step === 3 && <StepComplete form={form} />}
        </div>
    );
}
