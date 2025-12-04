import type React from "react";
import type { PowerDescription } from "../../types/types";
import { cn } from "../../utils/cn";
import { powerCardIcons } from "./card.icons";

export const PowerCard = (props: React.ComponentProps<'div'>&{mini?:boolean, power: Pick<PowerDescription,'id'|'type'|'isInstant'|'description'|'title'|'iconSlug'>}) => {
    const {power, ...rest} = props;

    const imageURL = powerCardIcons[power.iconSlug as keyof typeof powerCardIcons] ? `/powers/${power.iconSlug}.svg` : `/powers/${power.iconSlug}.svg`;

    const color = power.type === 'all' ? 'all' : power.type === 'client' ? 'client' : 'market';

    return (<div className={cn("power-card",{
        "mini": props.mini,
        [color]: true
    })} {...rest}>
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
                <h2 className="power-card-title">{power.title}</h2>
                <div className="power-card-icon">
                    <img src={imageURL} alt={power.title} />
                </div>
                <div className="power-card-footer">{power.description}</div>
            </div>
            <div className="corner top-left"></div>
            <div className="corner top-right"></div>
            <div className="corner bottom-left"></div>
            <div className="corner bottom-right"></div>
        </div>)

}