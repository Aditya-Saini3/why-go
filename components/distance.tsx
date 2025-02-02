const commutesPerYear = 260 * 2;
const litresPerKM = 8.6 / 100;
const gasLitreCost = 1.5;
const litreCostKM = litresPerKM * gasLitreCost;
const secondsPerDay = 60 * 60 * 24;
const peakHoursTrafficTime = 30;
const averageMonthlyParkingCost = 300;


type DistanceProps = {
  leg: google.maps.DirectionsLeg;
};

export default function Distance({ leg }: DistanceProps) {
  if(!leg.distance || !leg.duration) return null;

  const days = Math.floor(commutesPerYear * leg.duration.value / secondsPerDay);
  const cost = Math.floor((leg.distance.value / 1000) * litreCostKM * commutesPerYear);
  const totalCost = cost + (averageMonthlyParkingCost * 12);

  return <div className="distance">
    <h2>
      Daily Commute
    </h2>
    <p>
      This is a daily commute of <span className="highlight">{leg.distance.text} </span> 
      and it will take you around <span className="highlight">{leg.duration.text} </span> 
      to <span className="highlight">{Math.floor((peakHoursTrafficTime + Math.floor(leg.duration.value / 60)) / 60)} hours and {(peakHoursTrafficTime + Math.floor(leg.duration.value / 60)) % 60} minutes</span> each day.
    </p>
    <p>
      In a year, you will drive approximately <span className="highlight">{days}</span> days and it will cost you <span className="highlight">{cost}</span> CAD.
    </p>
    <p>
      In a year, you will also spend <span className="highlight">{averageMonthlyParkingCost * 12}</span> CAD on parking.
    </p>
    <p>
      In a year, you will spend approximately <span className="highlight">{totalCost}</span> CAD on your commute.
    </p>
    <h1 
    className="modal-content">${totalCost}
    </h1>
    <a 
      href="https://www.gotransit.com/en/plan-your-trip"
      className="button"
      target="_blank"
      rel="noopener noreferrer"
    >
      Save and Travel with GO.
    </a>
  </div>;
}
