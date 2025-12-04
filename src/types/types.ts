

export type PowerDescription = {
    id: string
    /**
     * Rarity of the power for briefcase generation (lower is more rare)
     * 0 = never used for briefcases
     */
    rarity: number
    /**
     * Type of power - 'all' = affects all players, 'market' = affects market only, 'client' = affects only the client who used it
     * Default: 'market'
     */
    type?: 'client' | 'all' | 'market';
    /**
     * Optional icon slug for the power (for UI display purposes only)
     */
    iconSlug?: string;
    /**
     * Is the power instant - Instant means it's consumed on selection, otherwise it is kept in "inventory" until consumed
     */
    isInstant?: boolean;
    /**
     * Title of the power
     */
    title: string
    /**
     * Description of the power
     */
    description: string 
    /**
     * Price of the power in the shop (no price = never in the shop)
     */
    price?: number;
    /**
     * Duration of the power in Clock ticks (generally 1 tick = 1 second)
     */
    durationTicks: number;
}