import React from 'react';
import './Dashboard.scss';
import DashboardTest from "../../assets/test_dashboard.png";

const Dashboard = () => {
    return (
        <div className="dashboard">
            <img src={DashboardTest} alt="Dashboard" />
        </div>
    );
}

export default Dashboard;

