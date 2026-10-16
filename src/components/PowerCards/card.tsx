import type React from "react";
import type { PowerDescription } from "../../types/types";
import { cn } from "../../utils/cn";
import { PowerIcon } from "./power-icon";

export const PowerCard = (props: React.ComponentProps<'div'>&{mini?:boolean, power: Pick<PowerDescription,'id'|'type'|'isInstant'|'description'|'title'|'iconSlug'|'iconUrl'|'iconCredit'>}) => {
    const {power,className, ...rest} = props;


    const color = power.type === 'all' ? 'all' : power.type === 'client' ? 'client' : 'market';

    return (<div className={cn("power-card",{
        "mini": props.mini,
        [color]: true
    }, className)} {...rest}>
            <div className="pattern">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="star"></div>
                <div className="star"></div>
                <div className="star"></div>
            </div>
            <div className="power-card-content">
                {power.isInstant ? <div className="instant-banner">Instant</div> : null}
                <p className="power-card-title">{power.title}</p>
                <div className="power-card-icon">
                    <PowerIcon power={power} />
                </div>
                <div className="power-card-footer">{power.description}</div>
            </div>
            <div className="corner top-left"></div>
            <div className="corner top-right"></div>
            <div className="corner bottom-left"></div>
            <div className="corner bottom-right"></div>
        </div>)

}