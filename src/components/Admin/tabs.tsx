
export type AdminSettingsTab = 'general' | 'bots' | 'powers';

const ADMIN_SETTINGS_TABS: {label: string, value: AdminSettingsTab}[] = [{
    label: 'General',
    value: 'general'
},{
    label: 'Bots',
    value: 'bots'
},{
    label: 'Powers',
    value: 'powers'
}]


export const SettingTabs = ({tab,setTab}:{tab: AdminSettingsTab, setTab: React.Dispatch<React.SetStateAction<AdminSettingsTab>>})=>{
    return (
        <div className="tabs tabs-box w-full">
            {/* name of each tab group should be unique */}
            {ADMIN_SETTINGS_TABS.map((t)=>(
                <input key={t.label} type="radio" name={`${t.label}`} className="tab" aria-label={`${t.label}`} checked={tab === t.value} onChange={() => setTab(t.value)} />
            ))}
    </div>
    )
}