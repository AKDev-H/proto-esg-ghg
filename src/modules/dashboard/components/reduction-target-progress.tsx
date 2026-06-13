"use client"

// Custom progress bar implementation used below

interface TargetScopeData {
    actual: number // e.g. -18
    target: number // e.g. -30
}

interface ReductionTargetProgressProps {
    baseYear: number
    scope1: TargetScopeData
    scope2: TargetScopeData
    scope3: TargetScopeData
}

export function ReductionTargetProgress({
    baseYear,
    scope1,
    scope2,
    scope3,
}: ReductionTargetProgressProps) {
    
    const calculateAchievement = (actual: number, target: number) => {
        if (target === 0) return 0
        // Reduction is negative (e.g. -18 vs -30). If we increase emissions (actual is positive, e.g. 5%), progress is 0.
        if (actual > 0) return 0
        const percent = (actual / target) * 100
        return Math.min(100, Math.max(0, Math.round(percent)))
    }

    const s1Progress = calculateAchievement(scope1.actual, scope1.target)
    const s2Progress = calculateAchievement(scope2.actual, scope2.target)
    const s3Progress = calculateAchievement(scope3.actual, scope3.target)

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                {/* Scope 1 */}
                <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                        <span className="font-semibold text-foreground">
                            Scope 1 <span className="text-xs font-normal text-muted-foreground">(vs {baseYear})</span>
                        </span>
                        <span className="font-medium">
                            {scope1.actual > 0 ? `+${scope1.actual}%` : `${scope1.actual}%`} / {scope1.target}% target
                        </span>
                    </div>
                    <div className="h-3.5 w-full rounded-full bg-muted overflow-hidden">
                        <div 
                            className="h-full rounded-full bg-orange-500 transition-all duration-500" 
                            style={{ width: `${s1Progress}%` }}
                        />
                    </div>
                </div>

                {/* Scope 2 */}
                <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                        <span className="font-semibold text-foreground">
                            Scope 2 <span className="text-xs font-normal text-muted-foreground">(vs {baseYear})</span>
                        </span>
                        <span className="font-medium">
                            {scope2.actual > 0 ? `+${scope2.actual}%` : `${scope2.actual}%`} / {scope2.target}% target
                        </span>
                    </div>
                    <div className="h-3.5 w-full rounded-full bg-muted overflow-hidden">
                        <div 
                            className="h-full rounded-full bg-blue-500 transition-all duration-500" 
                            style={{ width: `${s2Progress}%` }}
                        />
                    </div>
                </div>

                {/* Scope 3 */}
                <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                        <span className="font-semibold text-foreground">
                            Scope 3 <span className="text-xs font-normal text-muted-foreground">(vs {baseYear})</span>
                        </span>
                        <span className="font-medium">
                            {scope3.actual > 0 ? `+${scope3.actual}%` : `${scope3.actual}%`} / {scope3.target}% target
                        </span>
                    </div>
                    <div className="h-3.5 w-full rounded-full bg-muted overflow-hidden">
                        <div 
                            className="h-full rounded-full bg-emerald-500 transition-all duration-500" 
                            style={{ width: `${s3Progress}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="text-[11px] text-muted-foreground border-t pt-3 flex flex-col gap-0.5">
                <p>Bar = % of reduction target achieved</p>
                <p>Target year: 2030 · Base year: {baseYear}</p>
            </div>
        </div>
    )
}
