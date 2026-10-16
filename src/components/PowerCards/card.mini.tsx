import type { PowerDescription } from "../../types/types"
import { cn } from "../../utils/cn";
import { PowerIcon } from "./power-icon";


export const PowerMiniCard = (props: React.ComponentProps<'div'>&{ power: Pick<PowerDescription,'id'|'type'|'isInstant'|'description'|'title'|'iconSlug'|'iconUrl'|'iconCredit'>}) => {
    const {power, className,...rest} = props;
    

    const color = power.type === 'all' ? 'all' : power.type === 'client' ? 'client' : 'market';

    return <div className={cn("mini-power-card", color, className)} {...rest}>
            <div className="power-card-content">
                <div className="power-card-icon">
                    <PowerIcon power={power} />
                </div>
            </div>
        </div>
}