
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"

export interface RestrictionData {
    enabled: boolean
    ipRestriction: string
    schedule: {
        active: boolean
        days: {
            day: string
            active: boolean
            start: string
            end: string
        }[]
    }
}

export const DEFAULT_SCHEDULE = [
    { day: "Bazar ertəsi", active: true, start: "09:00", end: "18:00" },
    { day: "Çərşənbə axşamı", active: true, start: "09:00", end: "18:00" },
    { day: "Çərşənbə", active: true, start: "09:00", end: "18:00" },
    { day: "Cümə axşamı", active: true, start: "09:00", end: "18:00" },
    { day: "Cümə", active: true, start: "09:00", end: "18:00" },
    { day: "Şənbə", active: false, start: "10:00", end: "14:00" },
    { day: "Bazar", active: false, start: "00:00", end: "00:00" },
]

export const DEFAULT_RESTRICTIONS: RestrictionData = {
    enabled: false,
    ipRestriction: "",
    schedule: {
        active: false,
        days: DEFAULT_SCHEDULE
    }
}

interface RestrictionsFormProps {
    value: RestrictionData
    onChange: (data: RestrictionData) => void
}

const DAYS_OF_WEEK = [
    { id: 0, label: "Bazar ertəsi" }, // Index 0 in value.schedule.days
    { id: 1, label: "Çərşənbə axşamı" },
    { id: 2, label: "Çərşənbə" },
    { id: 3, label: "Cümə axşamı" },
    { id: 4, label: "Cümə" },
    { id: 5, label: "Şənbə" },
    { id: 6, label: "Bazar" },
];

export function RestrictionsForm({ value, onChange }: RestrictionsFormProps) {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const update = (field: keyof RestrictionData, val: any) => {
        onChange({ ...value, [field]: val })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateSchedule = (idx: number, field: string, val: any) => {
        const newDays = [...value.schedule.days]
        newDays[idx] = { ...newDays[idx], [field]: val }
        update("schedule", { ...value.schedule, days: newDays })
    }

    const generateScheduleSummary = () => {
        const activeDays = value.schedule.days.filter(d => d.active);
        if (activeDays.length === 0) return "Təyin edilməyib";
        if (activeDays.length === 7) return "Hər gün";
        const firstTime = activeDays[0];
        const sameTime = activeDays.every(d => d.start === firstTime.start && d.end === firstTime.end);
        if (sameTime) {
            return `${activeDays.length} gün (${firstTime.start}-${firstTime.end})`;
        }
        return "Fərdi Qrafik";
    };

    return (
        <div className="space-y-4">
            <Tabs defaultValue="schedule" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="schedule">İş Rejimi (Schedule)</TabsTrigger>
                    <TabsTrigger value="ip">IP Məhdudiyyətləri</TabsTrigger>
                </TabsList>

                {/* Schedule Tab */}
                <TabsContent value="schedule" className="space-y-4 py-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Həftəlik Cədvəl</Label>
                            <div className="border rounded-md p-2 space-y-2 text-sm">
                                {/* Header Row */}
                                <div className="grid grid-cols-12 gap-2 font-medium text-muted-foreground px-2">
                                    <div className="col-span-4">Gün</div>
                                    <div className="col-span-8">Saat Aralığı</div>
                                </div>

                                {DAYS_OF_WEEK.map((day, idx) => (
                                    <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-muted/20 p-2 rounded-sm hover:bg-muted/40 transition-colors">
                                        <div className="col-span-4 flex items-center space-x-2">
                                            <Checkbox
                                                id={`day-${idx}`}
                                                checked={value.schedule.days[idx]?.active}
                                                onCheckedChange={(checked) => updateSchedule(idx, 'active', !!checked)}
                                            />
                                            <Label htmlFor={`day-${idx}`} className="cursor-pointer truncate">{day.label}</Label>
                                        </div>
                                        <div className="col-span-8 flex items-center gap-2">
                                            <Input
                                                type="time"
                                                value={value.schedule.days[idx]?.start}
                                                onChange={(e) => updateSchedule(idx, 'start', e.target.value)}
                                                disabled={!value.schedule.days[idx]?.active}
                                                className="h-8 text-xs w-24"
                                            />
                                            <span className="text-muted-foreground">-</span>
                                            <Input
                                                type="time"
                                                value={value.schedule.days[idx]?.end}
                                                onChange={(e) => updateSchedule(idx, 'end', e.target.value)}
                                                disabled={!value.schedule.days[idx]?.active}
                                                className="h-8 text-xs w-24"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-800 rounded-md text-sm border border-blue-100 flex items-center gap-2">
                            <span className="font-semibold">Xülasə: </span>
                            {generateScheduleSummary()}
                        </div>
                    </div>
                </TabsContent>

                {/* IP Tab */}
                <TabsContent value="ip" className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>İcazə Verilən IP Ünvanları</Label>
                        <Textarea
                            placeholder="192.168.1.0/24&#10;10.0.0.1"
                            rows={5}
                            value={value.ipRestriction}
                            onChange={(e) => update("ipRestriction", e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">Hər sətirdə bir IP və ya CIDR qeyd edin. Boş saxlasanız məhdudiyyət tətbiq olunmur.</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
