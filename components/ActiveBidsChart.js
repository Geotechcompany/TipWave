import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ActiveBidsChart = ({ activeBids }) => {
  const data = {
    labels: activeBids.map(bid => bid.song.title),
    datasets: [
      {
        label: 'Bid Amount',
        data: activeBids.map(bid => bid.amount),
        fill: false,
        backgroundColor: 'rgb(75, 192, 192)',
        borderColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Active Bids',
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default ActiveBidsChart;