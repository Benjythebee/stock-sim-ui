import type React from "react";
import type { PowerDescription } from "../../types/types";

const powerCardIcons= {
    "talk":{
        attribution:'https://game-icons.net/1x1/skoll/talk.html',
        author:'Skoll'
    },
    "default":{
        attribution:'https://game-icons.net/1x1/seregacthtuf/pouch-with-beads.html',
        author:'Seregacthtuf'
    }
}

export const PowerCard = (props: React.ComponentProps<'div'>&{power: Pick<PowerDescription,'description'|'title'|'iconSlug'>}) => {
    const {power, ...rest} = props;
    const imageURL = powerCardIcons[power.iconSlug as keyof typeof powerCardIcons] ? `/powers/${power.iconSlug}.svg` : `/powers/${power.iconSlug}.svg`;
    return (<div className="power-card" {...rest}>
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