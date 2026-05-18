"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { COUNTRY_CONFIG, INDUSTRY_TYPES } from "@/lib/constants"
import { generateYearOptions } from "@/lib/utils"

const onboardingSchema = z.object({
    name: z.string().min(2, "Organization name is required"),
    country: z.enum(["US", "MY"]),
    reportingYear: z.number().int().min(2020),
    industryType: z.string().min(1),
    adminEmail: z.string().email("Valid email is required"),
    adminPassword: z.string().min(6, "Password must be at least 6 characters"),
    adminName: z.string().min(2, "Admin name is required"),
})

type OnboardingInput = z.infer<typeof onboardingSchema>

export function OnboardingForm() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<OnboardingInput>({
        resolver: zodResolver(onboardingSchema),
        defaultValues: {
            country: "US",
            reportingYear: new Date().getFullYear(),
        },
    })

    const country = watch("country")
    const countryConfig = COUNTRY_CONFIG[country as keyof typeof COUNTRY_CONFIG]
    const years = generateYearOptions()

    const onSubmit = async (data: OnboardingInput) => {
        setIsSubmitting(true)
        setError(null)

        try {
            const response = await fetch("/api/organizations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const result = await response.json()
                throw new Error(result.error || "Failed to create organization")
            }

            router.push("/login?created=true")
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl">Create Your Organization</CardTitle>
                <CardDescription>Set up your organization to start tracking carbon emissions</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-6">
                    <div className="flex justify-between items-center">
                        {[1, 2].map((s) => (
                            <div key={s} className="flex items-center">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                        step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                    }`}
                                >
                                    {s}
                                </div>
                                <span className={`ml-2 text-sm ${step >= s ? "text-foreground" : "text-muted-foreground"}`}>
                                    {s === 1 ? "Organization" : "Admin Account"}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-2 h-1 bg-muted rounded">
                        <div className="h-full bg-primary rounded transition-all" style={{ width: `${step * 50}%` }} />
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {step === 1 && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="name">Organization Name</Label>
                                <Input id="name" placeholder="Acme Manufacturing" {...register("name")} />
                                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Country</Label>
                                    <Select defaultValue={country} onValueChange={(v) => setValue("country", v as "US" | "MY")}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select country" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="US">United States</SelectItem>
                                            <SelectItem value="MY">Malaysia</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Industry Type</Label>
                                    <Select onValueChange={(v) => setValue("industryType", v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select industry" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {INDUSTRY_TYPES.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Reporting Year</Label>
                                <Select defaultValue={String(new Date().getFullYear())} onValueChange={(v) => setValue("reportingYear", parseInt(v))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {years.map((y) => (
                                            <SelectItem key={y.value} value={String(y.value)}>{y.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="p-4 bg-muted rounded-lg">
                                <h4 className="font-medium mb-2">Country Configuration</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <span>Currency:</span>
                                    <span className="font-medium">{countryConfig?.currency || 'USD'}</span>
                                    <span>Distance Unit:</span>
                                    <span className="font-medium">{countryConfig?.units?.distance || 'mile'}</span>
                                    <span>Weight Unit:</span>
                                    <span className="font-medium">{countryConfig?.units?.weight || 'lb'}</span>
                                    <span>Fuel Unit:</span>
                                    <span className="font-medium">{countryConfig?.units?.fuel || 'gallon'}</span>
                                </div>
                            </div>

                            <Button type="button" onClick={() => setStep(2)} className="w-full">
                                Continue
                            </Button>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="adminName">Admin Name</Label>
                                <Input id="adminName" placeholder="John Doe" {...register("adminName")} />
                                {errors.adminName && <p className="text-sm text-destructive">{errors.adminName.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="adminEmail">Admin Email</Label>
                                <Input id="adminEmail" type="email" placeholder="admin@company.com" {...register("adminEmail")} />
                                {errors.adminEmail && <p className="text-sm text-destructive">{errors.adminEmail.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="adminPassword">Password</Label>
                                <Input id="adminPassword" type="password" placeholder="Min 6 characters" {...register("adminPassword")} />
                                {errors.adminPassword && <p className="text-sm text-destructive">{errors.adminPassword.message}</p>}
                            </div>

                            <div className="flex gap-4">
                                <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                                    Back
                                </Button>
                                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                                    {isSubmitting ? "Creating..." : "Create Organization"}
                                </Button>
                            </div>
                        </>
                    )}
                </form>
            </CardContent>
        </Card>
    )
}