const CaptainDashboard = () => {
  return (
   <div>
      <div className="dashboard">
        
        <div className="left">
          <div className="voyage">
            <h2>CURRENT VESSELS</h2>
            <div className="button">
            <a href=" " className="btn">click here</a>
            </div>
            <div className="info">
              <ul>
                <li><a href="">one</a></li>
                <li><a href="">two</a></li>
                <li><a href="">three</a></li>
                <li><a href="">four</a></li>
                <li><a href="">five</a></li>
                </ul>
            </div>
        </div>

          <div className="voyage">
            <h2>CURRENT VOYAGE</h2>
            <div className="button">
            <a href=" " className="btn">click here</a>
            </div>
            <div className="info">
              <ul>
                <li><a href="">one</a></li>
                <li><a href="">two</a></li>
                <li><a href="">three</a></li>
                <li><a href="">four</a></li>
                <li><a href="">five</a></li>
                </ul>
            </div>
        </div>
      </div>

        <div className="map">
            <div className="img">
              <img src="http://3.bp.blogspot.com/-yq1k8GHxkS8/VFu7kLRAlzI/AAAAAAAABxM/nCBpBttLDeI/w1200-h630-p-k-no-nu/Mediterranean%2BSea.png" alt="voyage-traker image"></img>
            </div>
            <div className="outer">
              <div className="inner">
                  <div className="label">Total Distance</div>
                  <div className="row">
                  <div className="icon">🚢</div>
                  <div className="value">2,500 nm</div>
              </div>
              </div>
              <div className="inner">
                  <div className="label">Total Fuel Cost</div>
                  <div className="row">
                  <div className="icon">⛴️</div>
                  <div className="value">$ 150,000</div>
              </div>
              </div>
              <div className="inner">
                  <div className="label">Average Consumption</div>
                  <div className="row">
                  <div className="icon">⛽</div>
                  <div className="value">25 MT/day</div>
              </div>
              </div>
            </div>
        </div>

  <div className="alerts">
    <h2>Fuel Consumption per Voyage Leg</h2>
    <div className="container">

  <div className="graph">
    <img src="https://img.freepik.com/premium-vector/graph-with-graph-that-says-graph-it_1292944-11624.jpg" alt="Performance Graph" />
  </div>


  <div className="insights">
    <h3>Leg Performance Insights</h3>
    <table>
      <tr>
        <th>Leg</th>
        <th>Fuel Used</th>
        <th>Efficiency Rating</th>
      </tr>
      <tr>
        <td>Distance</td>
        <td>060.01</td>
        <td>150.300</td>
      </tr>
      <tr>
        <td>Fuel Used</td>
        <td>040.23</td>
        <td>22.00</td>
      </tr>
      <tr>
        <td>Average Speed</td>
        <td>10.00</td>
        <td>10.00</td>
      </tr>
      <tr>
        <td>Efficiency Rating</td>
        <td>10.00</td>
        <td>1%</td>
      </tr>
    </table>
  </div>
</div>

</div>

        

        </div>

    </div>
  )
}

export default CaptainDashboard