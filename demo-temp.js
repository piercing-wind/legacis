const monthMap = {
  Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
  Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12"
};

export const chartDataForServiceCard =[
  {
    "date": "31-10-2023",
    "main": 101.04,
    "comparison": 97.16
  },
  {
    "date": "30-11-2023",
    "main": 111.29,
    "comparison": 104.02
  },
  {
    "date": "31-12-2023",
    "main": 119.36,
    "comparison": 112.36
  },
  {
    "date": "31-01-2024",
    "main": 127.89,
    "comparison": 114.51
  },
  {
    "date": "29-02-2024",
    "main": 124.83,
    "comparison": 116.18
  },
  {
    "date": "31-03-2024",
    "main": 129.05,
    "comparison": 117.13
  },
  {
    "date": "30-04-2024",
    "main": 129.31,
    "comparison": 121.42
  },
  {
    "date": "31-05-2024",
    "main": 134.73,
    "comparison": 122.04
  },
  {
    "date": "30-06-2024",
    "main": 150.19,
    "comparison": 130.46
  },
  {
    "date": "31-07-2024",
    "main": 156.85,
    "comparison": 136.07
  },
  {
    "date": "31-08-2024",
    "main": 159.87,
    "comparison": 137.25
  },
  {
    "date": "30-09-2024",
    "main": 164.59,
    "comparison": 140.21
  },
  {
    "date": "31-10-2024",
    "main": 172.29,
    "comparison": 131.21
  },
  {
    "date": "30-11-2024",
    "main": 186.49,
    "comparison": 131.19
  },
  {
    "date": "31-12-2024",
    "main": 197.04,
    "comparison": 129.39
  },
  {
    "date": "31-01-2025",
    "main": 195.82,
    "comparison": 124.8
  },
  {
    "date": "28-02-2025",
    "main": 194.39,
    "comparison": 114.97
  },
  {
    "date": "31-03-2025",
    "main": 207.2,
    "comparison": 123.4
  },
  {
    "date": "30-04-2025",
    "main": 200.99,
    "comparison": 127.4
  },
  {
    "date": "31-05-2025",
    "main": 213.13,
    "comparison": 131.86
  }
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
