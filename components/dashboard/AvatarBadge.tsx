import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

interface AvatarBadgeProps {
    name: string | null;
    avatar_url?: string | null;
}

export const AvatarBadge = ({ name, avatar_url }: AvatarBadgeProps) => {

    const getInitials = (name: string | null) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (

        <Badge
            variant="default"
            className="h-auto min-h-0 gap-1.5 py-0.5 pl-0.5 pr-2.5"
        >
            <Avatar size="default">
                <AvatarImage src={avatar_url || ''} />
                <AvatarFallback className="text-neutral-500">{getInitials(name)}</AvatarFallback>
            </Avatar>
            <span className="max-w-[10rem] truncate text-sm font-medium">
                {name}
            </span>
        </Badge>

    )
}
