const monthMap = {
  Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
  Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12"
};

const data =[
  { main: 101.04, date: '31-Oct-23', comparison: 97.16 },
  { main: 111.29, date: '31-Nov-23', comparison: 104.02 },
  { main: 119.36, date: '31-Dec-23', comparison: 112.36 },
  { main: 127.89, date: '31-Jan-24', comparison: 114.51 },
  { main: 124.83, date: '31-Feb-24', comparison: 116.18 },
  { main: 129.05, date: '31-Mar-24', comparison: 117.13 },
  { main: 129.31, date: '31-Apr-24', comparison: 121.42 },
  { main: 134.73, date: '31-May-24', comparison: 122.04 },
  { main: 150.19, date: '31-Jun-24', comparison: 130.46 },
  { main: 156.85, date: '31-Jul-24', comparison: 136.07 },
  { main: 159.87, date: '31-Aug-24', comparison: 137.25 },
  { main: 164.59, date: '31-Sep-24', comparison: 140.21 },
  { main: 172.29, date: '31-Oct-24', comparison: 131.21 },
  { main: 186.49, date: '31-Nov-24', comparison: 131.19 },
  { main: 197.04, date: '31-Dec-24', comparison: 129.39 },
  { main: 195.82, date: '31-Jan-25', comparison: 124.8 },
  { main: 194.39, date: '31-Feb-25', comparison: 114.97 },
  { main: 207.2, date: '31-Mar-25', comparison: 123.4 },
  { main: 200.99, date: '31-Apr-25', comparison: 127.4 },
  { main: 213.13, date: '31-May-25', comparison: 131.86 }
]

const formattedData = data.map(item => {
  const [day, monStr, yearShort] = item.date.split('-');
  const month = monthMap[monStr];
  const year = yearShort.length === 2 ? '20' + yearShort : yearShort;
  return {
    ...item,
    date: `${day}-${month}-${year}`
  };
});

console.log(formattedData);