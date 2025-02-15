"use client";

import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const SemiCircleProgress = ({ percentage }) => {
  return (
      <CircularProgressbar
        value={percentage}
        maxValue={50}
        text={`${percentage}%`}
        styles={buildStyles({
          rotation: 0.75,
          strokeLinecap: "round",
          textSize: "16px",
          pathColor: `#02b732`,
          textColor: "#000",
          trailColor: "#eee",
          backgroundColor: "#fff",
        })}
      />
  );
};

export default SemiCircleProgress;
