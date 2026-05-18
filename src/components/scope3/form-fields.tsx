import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UseFormRegister, UseFormWatch, UseFormSetValue } from "react-hook-form"

interface InputFieldProps {
    label: string
    placeholder?: string
    type?: "text" | "number"
    step?: string
    register: UseFormRegister<any>
    name: string
    valueAsNumber?: boolean
}

export function InputField({ label, placeholder, type = "text", step, register, name, valueAsNumber }: InputFieldProps) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <Input
                type={type}
                step={step}
                placeholder={placeholder}
                {...register(name, valueAsNumber ? { valueAsNumber: true } : {})}
            />
        </div>
    )
}

interface SelectFieldProps {
    label: string
    value: string
    onValueChange: (value: string) => void
    options: { value: string; label: string }[]
}

export function SelectField({ label, value, onValueChange, options }: SelectFieldProps) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <Select value={value} onValueChange={onValueChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                    {options.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}

interface NumberFieldProps {
    label: string
    register: UseFormRegister<any>
    name: string
    step?: string
    placeholder?: string
}

export function NumberField({ label, register, name, step, placeholder }: NumberFieldProps) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <Input type="number" step={step} placeholder={placeholder} {...register(name, { valueAsNumber: true })} />
        </div>
    )
}

interface UnitSelectFieldProps {
    label: string
    value: string
    onValueChange: (value: string) => void
    options: { value: string; label: string }[]
}

export function UnitSelectField({ label, value, onValueChange, options }: UnitSelectFieldProps) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <Select value={value} onValueChange={onValueChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                    {options.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}