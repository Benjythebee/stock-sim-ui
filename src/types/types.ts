

export type PowerDescription = {
    /**
     * Rarity of the power for briefcase generation (lower is more rare)
     * 0 = never used for briefcases
     */
    rarity: number
    /**
     * Unused for now, but could be used to target specific users or all users or the market
     */
    targetUserId?: string | 'all' | 'market';
    /**
     * Optional icon slug for the power (for UI display purposes only)
     */
    iconSlug?: string;
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