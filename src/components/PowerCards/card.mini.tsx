import type { PowerDescription } from "../../types/types"
import { cn } from "../../utils/cn";
import { powerCardIcons } from "./card.icons";


export const PowerMiniCard = (props: React.ComponentProps<'div'>&{ power: Pick<PowerDescription,'id'|'type'|'isInstant'|'description'|'title'|'iconSlug'>}) => {
    const {power, className,...rest} = props;
    
    const imageURL = powerCardIcons[power.iconSlug as keyof typeof powerCardIcons] ? `/powers/${power.iconSlug}.svg` : `/powers/${power.iconSlug}.svg`;

    const color = power.type === 'all' ? 'all' : power.type === 'client' ? 'client' : 'market';

    return <div className={cn("mini-power-card", color, className)} {...rest}>
            <div className="power-card-content">
                <div className="power-card-icon">
                    <img src={imageURL} alt={power.title} />
                </div>
            </div>
        </div>
}