


export const News = ({className}: {className?: string}) => {

    const news = [
        { id: 1, timestamp: new Date(), type: 'Earnings Report', description:'Company XYZ reported better-than-expected earnings for Q1.' },
        { id: 2, timestamp: new Date(), type: 'Market Shock', description:'Unexpected geopolitical event causes market volatility.' },
        { id: 3, timestamp: new Date(), type: 'Product Launch', description:'Tech giant ABC launches a revolutionary new product.' },
    ];

    return ( <div className={`card bg-base-200 ${className}`}>
            <div className="card-body">
              <h2 className="card-title">News</h2>
              <div className="overflow-x-auto">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  {news.length === 0 && <tbody><tr><td colSpan={2} className="text-center">No news available</td></tr></tbody>}
                  <tbody>
                    {news.map((order) => (
                      <tr key={order.id}>
                        <td>{order.timestamp.toLocaleTimeString()}</td>
                        <td>{order.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>)
}