import { cn } from "../../utils/cn";
import { powerColor, type PowerCardData } from "../../utils/powerIcon";
import { PowerIcon } from "./power-icon";


export const PowerMiniCard = (props: React.ComponentProps<'div'>&{ power: PowerCardData}) => {
    const {power, className, ...rest} = props;

    return <div className={cn("mini-power-card", powerColor(power.type), className)} {...rest}>
            <div className="power-card-content">
                <div className="power-card-icon">
                    <PowerIcon power={power} />
                </div>
            </div>
        </div>
}