import { z } from "zod";

export const supplierCategorySchema = z.enum([
    "stainless_steel",
    "aluminum",
    "chemicals",
    "logistics",
    "other",
]);

export const questionnaireTypeSchema = z.enum([
    "carbon_disclosure",
    "pcf",
    "energy_usage",
]);

export const createSupplierSchema = z
    .object({
        name: z.string().min(1, "Supplier name is required"),
        country: z.string().optional(),
        contactEmail: z.string().email().optional().or(z.literal("")),
        categories: z.array(supplierCategorySchema).default([]),
        otherCategoryType: z.string().optional(),
    })
    .superRefine((data, ctx) => {
        if (data.categories.includes("other") && !data.otherCategoryType?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Please specify the other supplier type",
                path: ["otherCategoryType"],
            });
        }
    });

export const createInviteSchema = z.object({
    questionnaireTypes: z
        .array(questionnaireTypeSchema)
        .min(1, "Select at least one questionnaire type"),
    expiresInDays: z.number().int().min(1).max(365).default(90),
});

export const carbonDisclosureSchema = z.object({
    reportingYear: z.coerce.number().int().min(2000).max(2100).optional(),
    scope1Emissions: z.coerce.number().min(0).optional(),
    scope2Emissions: z.coerce.number().min(0).optional(),
    scope3Emissions: z.coerce.number().min(0).optional(),
    hasSbtiCommitment: z.boolean().optional(),
    cdpDisclosure: z.boolean().optional(),
    thirdPartyVerified: z.boolean().optional(),
    reductionTargetPercent: z.coerce.number().min(0).max(100).optional(),
    comments: z.string().optional(),
});

export const pcfSchema = z.object({
    productName: z.string().optional(),
    productUnit: z.string().optional(),
    cradleToGateEmissions: z.coerce.number().min(0).optional(),
    systemBoundary: z.string().optional(),
    dataQuality: z.enum(["primary", "secondary", "mixed"]).optional(),
    methodology: z.string().optional(),
    allocationMethod: z.string().optional(),
    comments: z.string().optional(),
});

export const energyUsageSchema = z.object({
    annualElectricityKwh: z.coerce.number().min(0).optional(),
    annualNaturalGas: z.coerce.number().min(0).optional(),
    naturalGasUnit: z.string().optional(),
    annualDieselLiters: z.coerce.number().min(0).optional(),
    renewableEnergyPercent: z.coerce.number().min(0).max(100).optional(),
    energyIntensity: z.coerce.number().min(0).optional(),
    energyIntensityUnit: z.string().optional(),
    comments: z.string().optional(),
});

export const submitQuestionnaireSchema = z.object({
    token: z.string().min(1),
    respondentName: z.string().min(1, "Your name is required"),
    respondentEmail: z.string().email("Valid email is required"),
    respondentTitle: z.string().optional(),
    carbonDisclosure: carbonDisclosureSchema.optional(),
    pcf: pcfSchema.optional(),
    energyUsage: energyUsageSchema.optional(),
});
