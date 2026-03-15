/**
 * AQI Calculation based on US EPA standards
 * AQI = 0-50: Good
 * AQI = 51-100: Fair
 * AQI = 101-150: Moderate
 * AQI = 151-200: Poor
 * AQI = 201-300: Very Poor
 * AQI = 301+: Hazardous
 */

const AQI_BREAKPOINTS = {
  pm25: [
    { aqi_min: 0, aqi_max: 50, pm25_min: 0, pm25_max: 12 },
    { aqi_min: 51, aqi_max: 100, pm25_min: 12.1, pm25_max: 35.4 },
    { aqi_min: 101, aqi_max: 150, pm25_min: 35.5, pm25_max: 55.4 },
    { aqi_min: 151, aqi_max: 200, pm25_min: 55.5, pm25_max: 150.4 },
    { aqi_min: 201, aqi_max: 300, pm25_min: 150.5, pm25_max: 250.4 },
    { aqi_min: 301, aqi_max: 500, pm25_min: 250.5, pm25_max: 500 }
  ],
  pm10: [
    { aqi_min: 0, aqi_max: 50, pm10_min: 0, pm10_max: 54 },
    { aqi_min: 51, aqi_max: 100, pm10_min: 54.1, pm10_max: 154 },
    { aqi_min: 101, aqi_max: 150, pm10_min: 154.1, pm10_max: 254 },
    { aqi_min: 151, aqi_max: 200, pm10_min: 254.1, pm10_max: 354 },
    { aqi_min: 201, aqi_max: 300, pm10_min: 354.1, pm10_max: 424 },
    { aqi_min: 301, aqi_max: 500, pm10_min: 424.1, pm10_max: 604 }
  ],
  o3: [
    { aqi_min: 0, aqi_max: 50, o3_min: 0, o3_max: 54 },
    { aqi_min: 51, aqi_max: 100, o3_min: 55, o3_max: 70 },
    { aqi_min: 101, aqi_max: 150, o3_min: 71, o3_max: 85 },
    { aqi_min: 151, aqi_max: 200, o3_min: 86, o3_max: 105 },
    { aqi_min: 201, aqi_max: 300, o3_min: 106, o3_max: 200 },
    { aqi_min: 301, aqi_max: 500, o3_min: 201, o3_max: 604 }
  ]
};

export const calculatePM25AQI = (pm25) => {
  if (pm25 < 0) return 0;
  
  for (let bracket of AQI_BREAKPOINTS.pm25) {
    if (pm25 >= bracket.pm25_min && pm25 <= bracket.pm25_max) {
      const aqi = ((bracket.aqi_max - bracket.aqi_min) / (bracket.pm25_max - bracket.pm25_min)) * (pm25 - bracket.pm25_min) + bracket.aqi_min;
      return Math.round(aqi);
    }
  }
  return 500;
};

export const calculatePM10AQI = (pm10) => {
  if (pm10 < 0) return 0;
  
  for (let bracket of AQI_BREAKPOINTS.pm10) {
    if (pm10 >= bracket.pm10_min && pm10 <= bracket.pm10_max) {
      const aqi = ((bracket.aqi_max - bracket.aqi_min) / (bracket.pm10_max - bracket.pm10_min)) * (pm10 - bracket.pm10_min) + bracket.aqi_min;
      return Math.round(aqi);
    }
  }
  return 500;
};

export const calculateO3AQI = (o3) => {
  if (o3 < 0) return 0;
  
  for (let bracket of AQI_BREAKPOINTS.o3) {
    if (o3 >= bracket.o3_min && o3 <= bracket.o3_max) {
      const aqi = ((bracket.aqi_max - bracket.aqi_min) / (bracket.o3_max - bracket.o3_min)) * (o3 - bracket.o3_min) + bracket.aqi_min;
      return Math.round(aqi);
    }
  }
  return 500;
};

export const getAQICategory = (aqi) => {
  if (aqi <= 50) return { category: 'Good', color: '#4caf50', bgColor: '#e8f5e9' };
  if (aqi <= 100) return { category: 'Fair', color: '#8bc34a', bgColor: '#f1f8e9' };
  if (aqi <= 150) return { category: 'Moderate', color: '#ffc107', bgColor: '#fffde7' };
  if (aqi <= 200) return { category: 'Poor', color: '#ff9800', bgColor: '#fff3e0' };
  if (aqi <= 300) return { category: 'Very Poor', color: '#f44336', bgColor: '#ffebee' };
  return { category: 'Hazardous', color: '#9c27b0', bgColor: '#f3e5f5' };
};

export const getAQIAdvice = (aqi) => {
  if (aqi <= 50) {
    return 'Air quality is good. No health effects expected.';
  }
  if (aqi <= 100) {
    return 'Air quality is fair. Sensitive groups may experience minor symptoms.';
  }
  if (aqi <= 150) {
    return 'Air quality is moderate. Sensitive groups may experience health effects. The public is less likely to be affected.';
  }
  if (aqi <= 200) {
    return 'Air quality is poor. General public may experience health effects. Sensitive groups will likely experience more serious effects.';
  }
  if (aqi <= 300) {
    return 'Air quality is very poor. General public is more likely to experience health effects. Sensitive groups are at high risk.';
  }
  return 'Air quality is hazardous. Everyone is likely to experience serious health effects. Avoid outdoor activities.';
};

export const calculateOverallAQI = (pm25, pm10, o3) => {
  const pm25AQI = calculatePM25AQI(pm25);
  const pm10AQI = calculatePM10AQI(pm10);
  const o3AQI = calculateO3AQI(o3);
  
  return Math.max(pm25AQI, pm10AQI, o3AQI);
};

export default {
  calculatePM25AQI,
  calculatePM10AQI,
  calculateO3AQI,
  getAQICategory,
  getAQIAdvice,
  calculateOverallAQI
};
