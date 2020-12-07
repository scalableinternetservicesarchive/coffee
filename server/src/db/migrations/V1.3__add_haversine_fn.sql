DROP FUNCTION IF EXISTS haversineMiles;
CREATE FUNCTION haversineMiles(
        lat1 FLOAT, lon1 FLOAT,
        lat2 FLOAT, lon2 FLOAT
     ) RETURNS FLOAT
    NO SQL DETERMINISTIC
    COMMENT 'Returns the distance in miles on the Earth
             between two known points of latitude and longitude'
    RETURN (3958.8 * ACOS(
              COS(RADIANS(lat1)) *
              COS(RADIANS(lat2)) *
              COS(RADIANS(lon2) - RADIANS(lon1)) +
              SIN(RADIANS(lat1)) * SIN(RADIANS(lat2))
            ));
 
