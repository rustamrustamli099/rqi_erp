import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { NotificationChannel } from "@/domains/settings/constants/notification-types";

interface ChannelSelectorProps {
    value: NotificationChannel[];
    onChange: (channels: NotificationChannel[]) => void;
}

export const ChannelSelector = ({ value, onChange }: ChannelSelectorProps) => {

    const handleToggle = (channel: NotificationChannel) => {
        if (value.includes(channel)) {
            onChange(value.filter(c => c !== channel));
        } else {
            onChange([...value, channel]);
        }
    };

    return (
        <div className="space-y-3">
            <Label className="text-base font-semibold">Bildiriş Kanalları</Label>
            <div className="flex flex-col gap-2 border p-4 rounded-md bg-muted/20">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="ch-email"
                        checked={value.includes('EMAIL')}
                        onCheckedChange={() => handleToggle('EMAIL')}
                    />
                    <Label htmlFor="ch-email" className="font-normal cursor-pointer flex items-center gap-2">
                        Email (SMTP)
                    </Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="ch-sms"
                        checked={value.includes('SMS')}
                        onCheckedChange={() => handleToggle('SMS')}
                    />
                    <Label htmlFor="ch-sms" className="font-normal cursor-pointer flex items-center gap-2">
                        SMS (Gateway)
                    </Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="ch-system"
                        checked={value.includes('SYSTEM')}
                        onCheckedChange={() => handleToggle('SYSTEM')}
                    />
                    <Label htmlFor="ch-system" className="font-normal cursor-pointer flex items-center gap-2">
                        System (Daxili Bildiriş)
                    </Label>
                </div>
            </div>
        </div>
    );
};
