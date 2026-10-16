
export type AdminSettingsTab = 'general' | 'bots' | 'powers' | 'cast';

const ADMIN_SETTINGS_TABS: {label: string, value: AdminSettingsTab}[] = [{
    label: 'General',
    value: 'general'
},{
    label: 'Bots',
    value: 'bots'
},{
    label: 'Powers',
    value: 'powers'
},{
    label: 'Cast to TV',
    value: 'cast'
}]


export const SettingTabs = ({tab,setTab}:{tab: AdminSettingsTab, setTab: React.Dispatch<React.SetStateAction<AdminSettingsTab>>})=>{
    return (
        <div className="tabs tabs-box w-full">
            {/* name of each tab group should be unique */}
            {ADMIN_SETTINGS_TABS.map((t)=>(
                <input key={t.label} type="radio" name={`${t.label}`} className="tab px-3 sm:px-4 whitespace-nowrap" aria-label={`${t.label}`} checked={tab === t.value} onChange={() => setTab(t.value)} />
            ))}
    </div>
    )
}