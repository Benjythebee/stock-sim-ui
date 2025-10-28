


export const fetchJSON = async (url: string, options: RequestInit = {}) => {
    const response = await fetch(url, options);
    if (!response.ok) {
        return { status: response.status,error:((await response.text()) || `Fetch error:${url}`) };
    }
    return await response.json();
}