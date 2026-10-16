import type React from "react";
import { cn } from "../../utils/cn";
import { powerColor, type PowerCardData } from "../../utils/powerIcon";
import { PowerIcon } from "./power-icon";

export const PowerCard = (props: React.ComponentProps<'div'>&{mini?:boolean, power: PowerCardData}) => {
    const {power, mini, className, ...rest} = props;

    return (<div className={cn("power-card", powerColor(power.type), {mini}, className)} {...rest}>
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