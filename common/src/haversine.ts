
function toRad(deg: number) {
  return deg * Math.PI / 180
}

export function getHaversineDistanceMiles(lat1:number, lon1: number, lat2: number, lon2: number) {
  var R = 6371 * 0.6213712; // miles
  //has a problem with the .toRad() method below.
  var x1 = lat2-lat1;
  var dLat = toRad(x1);
  var x2 = lon2-lon1;
  var dLon = toRad(x2);
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; 
  return d;
}
